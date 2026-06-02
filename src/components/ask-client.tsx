"use client";

import { useRef, useState } from "react";
import {
  Loader2,
  Send,
  Quote,
  FileText,
  Info,
  Mic,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";

import type { AskAnswer, Citation } from "@/lib/types";
import { useDictation } from "@/hooks/use-dictation";
import { useSpeak } from "@/hooks/use-speak";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Renders the answer text, turning [n] markers into citation chips.
function AnswerBody({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap text-lg leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          return (
            <a
              key={i}
              href={`#cite-${match[1]}`}
              className="mx-0.5 inline-flex -translate-y-0.5 items-center rounded bg-primary/10 px-1.5 text-sm font-bold text-primary align-middle"
            >
              {match[1]}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function CitationCard({ c }: { c: Citation }) {
  const [open, setOpen] = useState(false);
  const location = [
    c.section ? `Section: ${c.section}` : null,
    c.page ? `Page ${c.page}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card id={`cite-${c.ref}`} className="scroll-mt-24">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Badge className="mt-0.5 shrink-0">{c.ref}</Badge>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 font-semibold">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{c.document_title}</span>
            </div>
            {location && (
              <p className="mt-0.5 text-sm text-muted-foreground">{location}</p>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="mt-2 text-sm font-semibold text-primary"
            >
              {open ? "Hide source text" : "Show source text"}
            </button>
            {open && (
              <blockquote className="mt-2 border-l-2 border-primary/40 pl-3 text-base text-muted-foreground">
                {c.snippet}
              </blockquote>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AskClient() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskAnswer | null>(null);
  const [asked, setAsked] = useState<string | null>(null);

  // Voice: dictate the question, and read the answer back hands-free.
  const baseRef = useRef("");
  const dictation = useDictation((text) => {
    const base = baseRef.current;
    setQuestion(base ? `${base} ${text}` : text);
  });
  const speech = useSpeak();

  function toggleMic() {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    baseRef.current = question.trim();
    dictation.start();
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3) return;
    dictation.stop();
    speech.stop();
    setLoading(true);
    setError(null);
    setResult(null);
    setAsked(q);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setResult(json as AskAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Ask a question
        </h1>
        <p className="text-muted-foreground">
          Plain language is fine. Every answer shows its source.
        </p>
      </div>

      <form onSubmit={ask} className="space-y-3">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What PPE do I need to operate the forklift?"
            className={cn(
              "pr-16",
              dictation.listening && "ring-2 ring-primary",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void ask(e);
            }}
          />
          {dictation.supported && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={dictation.listening ? "Stop voice" : "Ask by voice"}
              className={cn(
                "absolute bottom-3 right-3 flex size-12 items-center justify-center rounded-full transition-colors",
                dictation.listening
                  ? "animate-pulse bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {dictation.listening ? (
                <Square className="size-5" />
              ) : (
                <Mic className="size-6" />
              )}
            </button>
          )}
        </div>

        {dictation.listening && (
          <p className="text-center text-sm font-semibold text-primary">
            Listening… speak your question, then tap stop.
          </p>
        )}
        {dictation.error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {dictation.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || question.trim().length < 3}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
          {loading ? "Finding the answer…" : "Get the answer"}
        </Button>
      </form>

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 font-medium text-destructive">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          {asked && (
            <p className="text-sm font-semibold text-muted-foreground">
              You asked: {asked}
            </p>
          )}

          {result.refused ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex gap-3 p-5 text-amber-900">
                <Info className="mt-0.5 size-5 shrink-0" />
                <p className="text-lg">{result.answer}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-2 border-primary/20">
                <CardContent className="space-y-3 p-5">
                  <AnswerBody text={result.answer} />
                  {speech.supported && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => speech.toggle(result.answer)}
                    >
                      {speech.speaking ? (
                        <VolumeX className="size-5" />
                      ) : (
                        <Volume2 className="size-5" />
                      )}
                      {speech.speaking ? "Stop" : "Listen"}
                    </Button>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <h2 className="flex items-center gap-2 text-lg font-bold">
                  <Quote className="size-5 text-primary" /> Sources
                </h2>
                {result.citations.map((c) => (
                  <CitationCard key={c.ref} c={c} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
