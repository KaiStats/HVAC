import { createAdminClient } from "@/lib/supabase/admin";
import { extractPdfPages } from "@/lib/pdf";
import { chunkPages } from "@/lib/chunk";
import { embed } from "@/lib/voyage";

const EMBED_BATCH = 96;

interface IngestArgs {
  orgId: string;
  documentId: string;
  bytes: Uint8Array;
}

// Parse PDF -> chunk (with page/section) -> embed (Voyage) -> store chunks.
// Runs with the service role but always scopes writes to the document's org.
export async function ingestDocument({
  orgId,
  documentId,
  bytes,
}: IngestArgs): Promise<void> {
  const admin = createAdminClient();

  try {
    const pages = await extractPdfPages(bytes);
    const chunks = chunkPages(pages);

    if (chunks.length === 0) {
      throw new Error(
        "No readable text found. Scanned/image-only PDFs aren't supported yet.",
      );
    }

    // Replace any prior chunks for idempotent re-ingestion.
    await admin.from("document_chunks").delete().eq("document_id", documentId);

    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH);
      const vectors = await embed(
        batch.map((c) => c.content),
        "document",
      );

      const rows = batch.map((c, j) => ({
        org_id: orgId,
        document_id: documentId,
        content: c.content,
        section: c.section,
        page: c.page,
        chunk_index: c.chunk_index,
        // pgvector accepts the JSON-array string form "[0.1,0.2,...]".
        embedding: JSON.stringify(vectors[j]),
      }));

      const { error } = await admin.from("document_chunks").insert(rows);
      if (error) throw error;
    }

    const { error: updateError } = await admin
      .from("documents")
      .update({ status: "ready", page_count: pages.length, error: null })
      .eq("id", documentId);
    if (updateError) throw updateError;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed.";
    await admin
      .from("documents")
      .update({ status: "error", error: message })
      .eq("id", documentId);
    throw err;
  }
}
