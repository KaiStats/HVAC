import type { ExtractedPage } from "@/lib/extract";

export interface Chunk {
  content: string;
  section: string | null;
  page: number | null;
  chunk_index: number;
}

// We size chunks in tokens (~800) with ~120 token overlap, per the pipeline
// spec. We approximate tokens as ~4 characters (no tokenizer dependency).
const CHARS_PER_TOKEN = 4;
const TARGET_CHARS = 800 * CHARS_PER_TOKEN; // ~3200
const OVERLAP_CHARS = 120 * CHARS_PER_TOKEN; // ~480
const MIN_CHUNK_CHARS = 20;

// Recursive splitter separators, most natural boundary first.
const SEPARATORS = ["\n\n", "\n", ". ", "? ", "! ", "; ", " "];

function splitByLength(text: string, max: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += max) {
    out.push(text.slice(i, i + max));
  }
  return out;
}

// Break text into atomic pieces that each fit within the target size,
// recursing through ever-finer separators.
function atomize(text: string, separators: string[], target: number): string[] {
  if (text.length <= target) return [text];
  for (let i = 0; i < separators.length; i += 1) {
    const sep = separators[i];
    if (text.includes(sep)) {
      const parts = text.split(sep).filter((p) => p.length > 0);
      const out: string[] = [];
      for (const part of parts) {
        if (part.length <= target) out.push(part);
        else out.push(...atomize(part, separators.slice(i + 1), target));
      }
      return out;
    }
  }
  return splitByLength(text, target);
}

// Greedily merge atomic pieces up to the target size, carrying a trailing
// overlap from the previous chunk into the next for retrieval continuity.
function mergeWithOverlap(
  pieces: string[],
  target: number,
  overlap: number,
): string[] {
  const chunks: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current} ${piece}` : piece;
    if (candidate.length <= target) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current.trim());
    const tail =
      current.length > overlap ? current.slice(current.length - overlap) : "";
    current = tail ? `${tail} ${piece}` : piece;
    while (current.length > target) {
      chunks.push(current.slice(0, target).trim());
      current = current.slice(target - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function recursiveSplit(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const pieces = atomize(trimmed, SEPARATORS, TARGET_CHARS);
  return mergeWithOverlap(pieces, TARGET_CHARS, OVERLAP_CHARS);
}

// Heuristic: is this line a section heading? Compliance docs use numbered
// headings ("3.2 Lockout/Tagout"), ALL-CAPS titles, or short title-case lines.
function detectHeading(line: string): string | null {
  const trimmed = line.trim();
  if (trimmed.length < 3 || trimmed.length > 90) return null;
  if (/[.!?,:;]$/.test(trimmed)) return null;

  const wordCount = trimmed.split(/\s+/).length;
  const numbered = /^(\d+(\.\d+)*)[.)]?\s+\S/.test(trimmed);
  const allCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
  const titleCase =
    wordCount <= 8 &&
    /^[A-Z][A-Za-z]+(\s+[A-Z0-9][A-Za-z0-9/&-]*)*$/.test(trimmed);

  if (numbered || allCaps || titleCase) {
    return trimmed.replace(/\s+/g, " ");
  }
  return null;
}

// Splits parsed pages into ~800-token chunks. Chunks never cross page
// boundaries (so page numbers stay exact), and carry the current section
// heading forward across pages. Every chunk knows document/section/page.
export function chunkPages(pages: ExtractedPage[]): Chunk[] {
  const chunks: Chunk[] = [];
  let currentSection: string | null = null;
  let chunkIndex = 0;

  const flushBlock = (
    text: string,
    section: string | null,
    page: number | null,
  ) => {
    for (const piece of recursiveSplit(text)) {
      if (piece.length < MIN_CHUNK_CHARS) continue;
      chunks.push({
        content: piece,
        section,
        page,
        chunk_index: chunkIndex++,
      });
    }
  };

  for (const { page, text } of pages) {
    if (!text.trim()) continue;
    const lines = text.split("\n");
    let buffer = "";

    for (const line of lines) {
      const heading = detectHeading(line);
      if (heading) {
        flushBlock(buffer, currentSection, page);
        buffer = "";
        currentSection = heading;
      } else {
        buffer += `${line}\n`;
      }
    }
    flushBlock(buffer, currentSection, page);
  }

  return chunks;
}
