import { extractText, getDocumentProxy } from "unpdf";

export interface PdfPage {
  page: number; // 1-indexed
  text: string;
}

// Extracts text page-by-page so we can attach exact page numbers to chunks.
export async function extractPdfPages(data: Uint8Array): Promise<PdfPage[]> {
  const pdf = await getDocumentProxy(data);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = Array.isArray(text) ? text : [text];

  return pages.map((t, i) => ({
    page: i + 1,
    text: normalizeWhitespace(t ?? ""),
  }));
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
