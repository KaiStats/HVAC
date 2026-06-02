import Anthropic from "@anthropic-ai/sdk";

import { SERVER_ENV } from "@/lib/env";
import type { AskAnswer, Citation, RetrievedChunk } from "@/lib/types";

function client() {
  return new Anthropic({ apiKey: SERVER_ENV.anthropicApiKey() });
}

const REFUSAL_TEXT =
  "I couldn't find this in your documents. Try rephrasing, or upload the manual that covers it.";

const SYSTEM_PROMPT = `You are Compliance Copilot, an assistant for workers in regulated industries.

You answer ONLY using the numbered SOURCES provided. Rules:
- Use plain language a 5th grader can understand. Short sentences. No jargon.
- Every factual statement MUST end with a citation like [1] or [2][3] pointing to the source it came from.
- NEVER state anything that is not supported by a source. Do not use outside knowledge.
- If the sources do not contain the answer, reply with EXACTLY: "${REFUSAL_TEXT}" and nothing else.
- Be direct and actionable. Give the worker the steps they need.`;

function buildSourcesBlock(chunks: RetrievedChunk[]): string {
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

export async function answerQuestion(
  question: string,
  chunks: RetrievedChunk[],
): Promise<AskAnswer> {
  // Product law: no sources => no answer. Never invent.
  if (chunks.length === 0) {
    return { answer: REFUSAL_TEXT, citations: [], refused: true };
  }

  const sources = buildSourcesBlock(chunks);

  const message = await client().messages.create({
    model: SERVER_ENV.anthropicQaModel(),
    max_tokens: 700,
    temperature: 0,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `SOURCES:\n${sources}\n\nQUESTION: ${question}`,
      },
    ],
  });

  const answer = message.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const refs = extractRefs(answer);

  // Enforce the product law in code: an answer with no valid citation is
  // never shown. We refuse rather than display an untraceable claim.
  const validRefs = refs.filter((r) => r >= 1 && r <= chunks.length);
  if (answer === REFUSAL_TEXT || validRefs.length === 0) {
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

  return { answer, citations, refused: false };
}
