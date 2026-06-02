"use client";

import { useState } from "react";
import { Volume2, VolumeX, ChevronDown, Quote } from "lucide-react";

import type { Citation } from "@/lib/types";
import { useSpeak } from "@/hooks/use-speak";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CitationChip, CitationList } from "@/components/CitationChip";

// Renders answer text, turning [n] markers into citation chips.
export function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap text-xl leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) return <CitationChip key={i} n={parseInt(match[1], 10)} />;
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

// Full answer: plain answer first, Listen (voice out), then a collapsible
// "Where this comes from" with the cited sources. Reused by Ask + history.
export function AnswerCard({
  answer,
  citations,
  defaultSourcesOpen = false,
}: {
  answer: string;
  citations: Citation[];
  defaultSourcesOpen?: boolean;
}) {
  const [sourcesOpen, setSourcesOpen] = useState(defaultSourcesOpen);
  const speech = useSpeak();

  return (
    <div className="space-y-4">
      <Card className="border-2 border-primary/20">
        <CardContent className="space-y-4 p-5">
          <AnswerText text={answer} />
          {speech.supported && (
            <Button
              type="button"
              variant="outline"
              onClick={() => speech.toggle(answer)}
            >
              {speech.speaking ? (
                <VolumeX className="size-6" />
              ) : (
                <Volume2 className="size-6" />
              )}
              {speech.speaking ? "Stop" : "Listen"}
            </Button>
          )}
        </CardContent>
      </Card>

      {citations.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setSourcesOpen((o) => !o)}
            className="flex min-h-14 w-full items-center justify-between rounded-xl border bg-card px-4 text-lg font-semibold"
          >
            <span className="flex items-center gap-2">
              <Quote className="size-5 text-primary" /> Where this comes from
            </span>
            <ChevronDown
              className={cn(
                "size-6 transition-transform",
                sourcesOpen && "rotate-180",
              )}
            />
          </button>
          {sourcesOpen && (
            <div className="mt-3">
              <CitationList citations={citations} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
