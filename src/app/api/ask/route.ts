import type { SupabaseClient } from "@supabase/supabase-js";

import { getSessionContext, type SessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { embedQuery, rerank } from "@/lib/voyage";
import {
  REFUSAL_TEXT,
  SYSTEM_PROMPT,
  buildUserPrompt,
  finalizeAnswer,
  getQaClient,
  getQaModel,
} from "@/lib/anthropic";
import type { AskAnswer, RetrievedChunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MATCH_COUNT = 8; // pgvector cosine top-K
const RERANK_TO = 4; // narrow to the best few before answering
const MIN_SIMILARITY = 0.25;

// Persist the turn as a conversation with a user + assistant message (the
// assistant message carries the citation JSON — audit evidence). Never let a
// save failure break the stream.
async function saveTurn(
  supabase: SupabaseClient,
  session: SessionContext,
  question: string,
  answer: AskAnswer,
) {
  try {
    const { data: convo } = await supabase
      .from("conversations")
      .insert({
        org_id: session.orgId,
        user_id: session.userId,
        title: question.slice(0, 80),
      })
      .select("id")
      .single();
    if (!convo) return;

    await supabase.from("messages").insert([
      { conversation_id: convo.id, role: "user", content: question },
      {
        conversation_id: convo.id,
        role: "assistant",
        content: answer.answer,
        citations: answer.citations,
      },
    ]);
  } catch {
    // Non-fatal: the worker still gets their answer.
  }
}

const encoder = new TextEncoder();
function line(obj: unknown) {
  return encoder.encode(`${JSON.stringify(obj)}\n`);
}

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let question = "";
  try {
    const body = await request.json();
    question = String(body.question ?? "").trim();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (question.length < 3) {
    return Response.json(
      { error: "Please ask a longer question." },
      { status: 400 },
    );
  }

  // Newline-delimited JSON stream: {type:"delta"} ... then {type:"done"}.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const embedding = await embedQuery(question);
        const supabase = createClient();
        // RLS guarantees this only ever returns the caller's org.
        const { data, error } = await supabase.rpc("match_chunks", {
          query_embedding: JSON.stringify(embedding),
          match_count: MATCH_COUNT,
        });
        if (error) throw new Error(error.message);

        const candidates = ((data ?? []) as RetrievedChunk[]).filter(
          (c) => c.similarity >= MIN_SIMILARITY,
        );

        if (candidates.length === 0) {
          const refusal: AskAnswer = {
            answer: REFUSAL_TEXT,
            citations: [],
            refused: true,
          };
          await saveTurn(supabase, session, question, refusal);
          controller.enqueue(line({ type: "done", ...refusal }));
          controller.close();
          return;
        }

        // Narrow the top cosine hits to the best few with Voyage rerank;
        // fall back to cosine order if rerank is unavailable.
        let chunks = candidates.slice(0, RERANK_TO);
        if (candidates.length > 1) {
          try {
            const order = await rerank(
              question,
              candidates.map((c) => c.content),
              RERANK_TO,
            );
            const reranked = order
              .map((i) => candidates[i])
              .filter((c): c is RetrievedChunk => Boolean(c));
            if (reranked.length > 0) chunks = reranked.slice(0, RERANK_TO);
          } catch {
            // keep cosine top-N
          }
        }

        const anthropic = getQaClient();
        const messageStream = await anthropic.messages.create({
          model: getQaModel(),
          max_tokens: 700,
          temperature: 0,
          system: SYSTEM_PROMPT,
          messages: [
            { role: "user", content: buildUserPrompt(question, chunks) },
          ],
          stream: true,
        });

        let full = "";
        for await (const event of messageStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            controller.enqueue(line({ type: "delta", text: event.delta.text }));
          }
        }

        // Enforce citations after the full answer is known.
        const finalAnswer = finalizeAnswer(full, chunks);
        await saveTurn(supabase, session, question, finalAnswer);
        controller.enqueue(line({ type: "done", ...finalAnswer }));
        controller.close();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        controller.enqueue(line({ type: "error", message }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
