import mammoth from "mammoth";

import { extractPdfPages } from "@/lib/pdf";

export type FileType = "pdf" | "docx" | "txt";

export interface ExtractedPage {
  page: number | null; // 1-indexed for PDFs; null when the format has no pages
  text: string;
}

export interface ExtractedDocument {
  pages: ExtractedPage[];
  pageCount: number | null;
}

export function fileTypeFromName(name: string): FileType | null {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".txt")) return "txt";
  return null;
}

function normalize(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Extracts text for any supported format. PDFs keep exact page numbers; DOCX
// and TXT have no fixed pages, so their chunks are tagged by section only.
export async function extractDocument(
  bytes: Uint8Array,
  fileType: FileType,
): Promise<ExtractedDocument> {
  if (fileType === "pdf") {
    const pages = await extractPdfPages(bytes);
    return { pages, pageCount: pages.length };
  }

  if (fileType === "docx") {
    const { value } = await mammoth.extractRawText({
      buffer: Buffer.from(bytes),
    });
    return { pages: [{ page: null, text: normalize(value) }], pageCount: null };
  }

  // txt
  const text = new TextDecoder().decode(bytes);
  return { pages: [{ page: null, text: normalize(text) }], pageCount: null };
}
