import type { PdfPage } from "@/lib/pdf";

export interface Chunk {
  content: string;
  section: string | null;
  page: number;
  chunk_index: number;
}

const MAX_CHARS = 1200;
const OVERLAP_CHARS = 150;

// Heuristic: is this line a section heading? Compliance docs use numbered
// headings ("3.2 Lockout/Tagout"), ALL-CAPS titles, or short title-case lines.
function detectHeading(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 90) return null;
  if (/[.!?,:;]$/.test(trimmed)) return null;

  const wordCount = trimmed.split(/\s+/).length;
  const numbered = /^(\d+(\.\d+)*)[.)]?\s+\S/.test(trimmed);
  const allCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  // Short Title-Case lines (e.g. "Personal Protective Equipment").
  const titleCase =
    wordCount <= 8 && /^[A-Z][A-Za-z]+(\s+[A-Z0-9][A-Za-z0-9/&-]*)*$/.test(trimmed);

  if (numbered || allCaps || titleCase) {
    return trimmed.replace(/\s+/g, " ");
  }
  return null;
}

// Splits parsed pages into overlapping chunks, carrying the current section
// heading forward across pages so every chunk knows its document/section/page.
export function chunkPages(pages: PdfPage[]): Chunk[] {
  const chunks: Chunk[] = [];
  let currentSection: string | null = null;
  let chunkIndex = 0;

  for (const { page, text } of pages) {
    if (!text.trim()) continue;

    const lines = text.split("\n");
    let buffer = "";
    let bufferSection = currentSection;

    const flush = () => {
      const content = buffer.trim();
      if (content.length === 0) return;
      chunks.push({
        content,
        section: bufferSection,
        page,
        chunk_index: chunkIndex++,
      });
      // Start the next buffer with a small overlap for retrieval continuity.
      buffer =
        content.length > OVERLAP_CHARS
          ? content.slice(content.length - OVERLAP_CHARS)
          : "";
      bufferSection = currentSection;
    };

    for (const line of lines) {
      const heading = detectHeading(line);
      if (heading) {
        // Heading marks a boundary: flush what we have, then switch section.
        flush();
        currentSection = heading;
        bufferSection = heading;
        continue;
      }

      const candidate = buffer ? `${buffer}\n${line}` : line;
      if (candidate.length > MAX_CHARS) {
        flush();
        buffer = buffer ? `${buffer}\n${line}`.slice(-MAX_CHARS) : line;
      } else {
        buffer = candidate;
      }
    }

    flush();
  }

  return chunks.filter((c) => c.content.length > 20);
}
