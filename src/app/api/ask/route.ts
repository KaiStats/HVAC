import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { embedQuery } from "@/lib/voyage";
import {
  REFUSAL_TEXT,
  SYSTEM_PROMPT,
  buildUserPrompt,
  finalizeAnswer,
  getQaClient,
  getQaModel,
} from "@/lib/anthropic";
import type { RetrievedChunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MATCH_COUNT = 8;
const MIN_SIMILARITY = 0.25;

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

        const chunks = ((data ?? []) as RetrievedChunk[]).filter(
          (c) => c.similarity >= MIN_SIMILARITY,
        );

        if (chunks.length === 0) {
          controller.enqueue(
            line({
              type: "done",
              answer: REFUSAL_TEXT,
              citations: [],
              refused: true,
            }),
          );
          controller.close();
          return;
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
