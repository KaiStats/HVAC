"use client";

import { Mic, Square } from "lucide-react";

import { cn } from "@/lib/utils";

// Big, glove-friendly mic toggle for voice input. Presentational only.
export function VoiceButton({
  listening,
  onToggle,
  className,
}: {
  listening: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={listening ? "Stop voice" : "Ask by voice"}
      className={cn(
        "flex size-14 items-center justify-center rounded-full transition-colors",
        listening
          ? "animate-pulse bg-destructive text-destructive-foreground"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {listening ? <Square className="size-6" /> : <Mic className="size-7" />}
    </button>
  );
}
