import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { embedQuery } from "@/lib/voyage";
import { answerQuestion } from "@/lib/anthropic";
import type { RetrievedChunk } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MATCH_COUNT = 8;
const MIN_SIMILARITY = 0.25;

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let question = "";
  try {
    const body = await request.json();
    question = String(body.question ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (question.length < 3) {
    return NextResponse.json(
      { error: "Please type a longer question." },
      { status: 400 },
    );
  }

  const embedding = await embedQuery(question);

  const supabase = createClient();
  // RLS on document_chunks guarantees this only ever returns the caller's org.
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: JSON.stringify(embedding),
    match_count: MATCH_COUNT,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const chunks = ((data ?? []) as RetrievedChunk[]).filter(
    (c) => c.similarity >= MIN_SIMILARITY,
  );

  const result = await answerQuestion(question, chunks);
  return NextResponse.json(result);
}
