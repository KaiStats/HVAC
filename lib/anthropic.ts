import Anthropic from "@anthropic-ai/sdk";

import { SERVER_ENV } from "@/lib/env";
import type { AskAnswer, Citation, RetrievedChunk } from "@/lib/types";

export function getQaClient() {
  return new Anthropic({ apiKey: SERVER_ENV.anthropicApiKey() });
}

export function getQaModel() {
  return SERVER_ENV.anthropicQaModel();
}

export const REFUSAL_TEXT =
  "I couldn't find that in your current documents — ask your safety manager.";

// Policy Q&A system prompt (prompt 7a). We keep inline [n] citations as the
// citation channel: each excerpt is numbered, and the server maps [n] back to
// the excerpt's exact document/section/page. This honours "never invent a
// number" more strictly than trusting a model-emitted page number, and the
// equivalent citation JSON is persisted to messages.citations.
export function buildSystemPrompt(
  orgName: string,
  vertical: string | null,
): string {
  const org = vertical ? `${orgName} (${vertical})` : orgName;
  return `You are Compliance Copilot, a safety & compliance assistant for ${org}.
Answer ONLY from the provided manual excerpts. If the answer isn't in them, say:
"${REFUSAL_TEXT}" and stop.

Rules:
- Lead with a 1–3 sentence plain-language answer a new hire would understand. No jargon.
- Then list the exact steps if the question is procedural.
- EVERY factual claim must map to a source excerpt. Never invent a regulation, number, or step.
- Cite by writing the excerpt number(s) in square brackets right after each claim, like [1] or [2][3].
- If excerpts conflict, say so and cite both.
- Output only the answer with its [n] citations — no extra preamble.`;
}

export function buildSourcesBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c, i) => {
      const loc = [
        c.document_title,
        c.section ? `section "${c.section}"` : null,
        c.page ? `page ${c.page}` : null,
      ]
        .filter(Boolean)
        .join(", ");
      return `[${i + 1}] (${loc})\n${c.content}`;
    })
    .join("\n\n");
}

export function buildUserPrompt(
  question: string,
  chunks: RetrievedChunk[],
): string {
  return `SOURCES:\n${buildSourcesBlock(chunks)}\n\nQUESTION: ${question}`;
}

// Pull out the citation refs the model actually used, e.g. [1], [2][3].
function extractRefs(answer: string): number[] {
  const refs = new Set<number>();
  const re = /\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(answer)) !== null) {
    refs.add(parseInt(m[1], 10));
  }
  return [...refs];
}

// Enforces the product law: an answer with no valid citation is never shown.
// Maps each [n] used to its document + section + page.
export function finalizeAnswer(
  answer: string,
  chunks: RetrievedChunk[],
): AskAnswer {
  const trimmed = answer.trim();
  const validRefs = extractRefs(trimmed).filter(
    (r) => r >= 1 && r <= chunks.length,
  );

  if (chunks.length === 0 || trimmed === REFUSAL_TEXT || validRefs.length === 0) {
    return { answer: REFUSAL_TEXT, citations: [], refused: true };
  }

  const citations: Citation[] = validRefs
    .sort((a, b) => a - b)
    .map((ref) => {
      const c = chunks[ref - 1];
      return {
        ref,
        document_id: c.document_id,
        document_title: c.document_title,
        section: c.section,
        page: c.page,
        snippet: c.content.slice(0, 500),
      };
    });

  return { answer: trimmed, citations, refused: false };
}
