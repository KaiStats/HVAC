"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

import type { Citation } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Inline [n] citation chip rendered within answer text.
export function CitationChip({ n }: { n: number }) {
  return (
    <a
      href={`#cite-${n}`}
      className="mx-0.5 inline-flex h-6 min-w-6 -translate-y-0.5 items-center justify-center rounded bg-primary/10 px-1.5 align-middle text-base font-bold text-primary"
    >
      {n}
    </a>
  );
}

// A single source card: document title + p./§ + the exact words on demand.
export function CitationCard({ c }: { c: Citation }) {
  const [open, setOpen] = useState(false);
  const location = [
    c.page ? `p.${c.page}` : null,
    c.section ? `§${c.section}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card id={`cite-${c.ref}`} className="scroll-mt-24">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5 size-7 shrink-0 justify-center text-base">
            {c.ref}
          </Badge>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="size-5 shrink-0 text-muted-foreground" />
              <span className="truncate">{c.document_title}</span>
            </div>
            {location && (
              <p className="mt-0.5 text-base text-muted-foreground">
                {location}
              </p>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="mt-2 flex min-h-12 items-center text-base font-semibold text-primary"
            >
              {open ? "Hide the exact words" : "Show the exact words"}
            </button>
            {open && (
              <blockquote className="mt-1 border-l-2 border-primary/40 pl-3 text-base text-muted-foreground">
                {c.snippet}
              </blockquote>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CitationList({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) return null;
  return (
    <div className="space-y-2">
      {citations.map((c) => (
        <CitationCard key={c.ref} c={c} />
      ))}
    </div>
  );
}
