import { EMBEDDING_DIMENSIONS, SERVER_ENV } from "@/lib/env";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";

type InputType = "query" | "document";

interface VoyageResponse {
  data: { embedding: number[]; index: number }[];
}

// Embeds one or more texts with Voyage AI. input_type improves retrieval:
// "document" for chunks, "query" for the user's question.
export async function embed(
  input: string | string[],
  inputType: InputType,
): Promise<number[][]> {
  const texts = Array.isArray(input) ? input : [input];
  if (texts.length === 0) return [];

  const res = await fetch(VOYAGE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVER_ENV.voyageApiKey()}`,
    },
    body: JSON.stringify({
      model: SERVER_ENV.voyageEmbedModel(),
      input: texts,
      input_type: inputType,
      output_dimension: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Voyage embedding failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as VoyageResponse;
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

export async function embedQuery(text: string): Promise<number[]> {
  const [vector] = await embed(text, "query");
  return vector;
}

const RERANK_URL = "https://api.voyageai.com/v1/rerank";

interface RerankResponse {
  data: { index: number; relevance_score: number }[];
}

// Reranks candidate documents against the query and returns the original
// indices, best first. Used to narrow the top-K cosine hits to the best few.
// Throws on failure so callers can fall back to cosine order.
export async function rerank(
  query: string,
  documents: string[],
  topK: number,
): Promise<number[]> {
  if (documents.length === 0) return [];

  const res = await fetch(RERANK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVER_ENV.voyageApiKey()}`,
    },
    body: JSON.stringify({
      model: SERVER_ENV.voyageRerankModel(),
      query,
      documents,
      top_k: Math.min(topK, documents.length),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Voyage rerank failed (${res.status}): ${detail}`);
  }

  const json = (await res.json()) as RerankResponse;
  return json.data
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .map((d) => d.index);
}
