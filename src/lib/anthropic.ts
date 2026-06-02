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
  "I couldn't find this in your documents. Try asking a different way, or add the manual that covers it.";

export const SYSTEM_PROMPT = `You are Compliance Copilot, an assistant for workers in regulated industries.

You answer ONLY using the numbered SOURCES provided. Rules:
- Lead with the answer in 1 to 3 short sentences. Plain language a 5th grader understands. No jargon.
- Every factual statement MUST end with a citation like [1] or [2][3] pointing to the source it came from.
- NEVER state anything that is not supported by a source. Do not use outside knowledge.
- If the sources do not contain the answer, reply with EXACTLY: "${REFUSAL_TEXT}" and nothing else.
- Be direct and actionable. Give the worker the steps they need.`;

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
