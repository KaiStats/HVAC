"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Send,
  FileText,
  Info,
  Mic,
  Square,
  Volume2,
  VolumeX,
  ChevronDown,
  BookOpen,
  Sparkles,
} from "lucide-react";

import type { AskAnswer, Citation } from "@/lib/types";
import { useDictation } from "@/hooks/use-dictation";
import { useSpeak } from "@/hooks/use-speak";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Phase = "idle" | "reading" | "streaming" | "done" | "error";

const DEFAULT_EXAMPLES = [
  "What PPE do I need for confined space entry?",
  "How do I lock out a machine before maintenance?",
  "What do I do if there's a chemical spill?",
  "When do I need a hot work permit?",
];

// Renders answer text, turning [n] markers into citation chips.
function AnswerBody({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap text-xl leading-relaxed">
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          return (
            <a
              key={i}
              href={`#cite-${match[1]}`}
              className="mx-0.5 inline-flex h-6 min-w-6 -translate-y-0.5 items-center justify-center rounded bg-primary/10 px-1.5 align-middle text-base font-bold text-primary"
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

export function AskClient({
  hasDocuments,
  examples = DEFAULT_EXAMPLES,
}: {
  hasDocuments: boolean;
  examples?: string[];
}) {
  const [question, setQuestion] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState<AskAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [asked, setAsked] = useState<string | null>(null);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const baseRef = useRef("");
  const dictation = useDictation((text) => {
    const base = baseRef.current;
    setQuestion(base ? `${base} ${text}` : text);
  });
  const speech = useSpeak();

  const loading = phase === "reading" || phase === "streaming";

  function toggleMic() {
    if (dictation.listening) {
      dictation.stop();
      return;
    }
    baseRef.current = question.trim();
    dictation.start();
  }

  async function runAsk(q: string) {
    dictation.stop();
    speech.stop();
    setError(null);
    setResult(null);
    setStreamText("");
    setSourcesOpen(false);
    setAsked(q);
    setPhase("reading");

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok || !res.body) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Something went wrong.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Stream answer token-by-token for an instant feel.
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          if (!raw.trim()) continue;
          const event = JSON.parse(raw);
          if (event.type === "delta") {
            setPhase("streaming");
            setStreamText((prev) => prev + event.text);
          } else if (event.type === "done") {
            setResult(event as AskAnswer);
            setPhase("done");
          } else if (event.type === "error") {
            throw new Error(event.message ?? "Something went wrong.");
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (q.length < 3) return;
    void runAsk(q);
  }

  function askExample(q: string) {
    setQuestion(q);
    void runAsk(q);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Ask anything about your procedures
        </h1>
        <p className="text-lg text-muted-foreground">
          Type or talk. Every answer shows where it comes from.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What PPE do I need for confined space entry?"
            className={cn(
              "min-h-[140px] pr-20 text-lg",
              dictation.listening && "ring-2 ring-primary",
            )}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
          />
          {dictation.supported && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={dictation.listening ? "Stop voice" : "Ask by voice"}
              className={cn(
                "absolute bottom-3 right-3 flex size-14 items-center justify-center rounded-full transition-colors",
                dictation.listening
                  ? "animate-pulse bg-destructive text-destructive-foreground"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {dictation.listening ? (
                <Square className="size-6" />
              ) : (
                <Mic className="size-7" />
              )}
            </button>
          )}
        </div>

        {dictation.listening && (
          <p className="text-center text-base font-semibold text-primary">
            Listening… speak your question, then tap stop.
          </p>
        )}
        {dictation.error && (
          <p className="rounded-md bg-destructive/10 p-3 text-base font-medium text-destructive">
            {dictation.error}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || question.trim().length < 3}
        >
          <Send className="size-6" />
          Get the answer
        </Button>
      </form>

      {/* Never a blank screen: tappable example questions before anything is asked. */}
      {phase === "idle" && (
        <div className="space-y-3">
          {!hasDocuments && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center justify-between gap-3 p-4 text-amber-900">
                <p className="font-semibold">
                  Add your first manual to get answers.
                </p>
                <Button asChild size="sm">
                  <Link href="/documents">Add</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          <p className="flex items-center gap-2 text-base font-semibold text-muted-foreground">
            <Sparkles className="size-5" /> Try one of these
          </p>
          <div className="grid gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => askExample(ex)}
                className="flex min-h-14 items-center rounded-xl border bg-card px-4 text-left text-lg font-medium transition-colors hover:border-primary/50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-base font-medium text-destructive">
          {error}
        </p>
      )}

      {/* "Reading your manuals…" — animated, never a frozen spinner. */}
      {phase === "reading" && (
        <Card className="border-2 border-primary/20">
          <CardContent className="flex items-center gap-3 p-5">
            <BookOpen className="size-6 animate-pulse text-primary" />
            <p className="text-lg font-semibold text-primary">
              Reading your manuals
              <span className="inline-flex w-6 justify-start">
                <span className="animate-pulse">…</span>
              </span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live streaming answer. */}
      {phase === "streaming" && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-5">
            <AnswerBody text={streamText} />
          </CardContent>
        </Card>
      )}

      {/* Final answer: answer first, detail (sources) second & collapsible. */}
      {phase === "done" && result && (
        <div className="space-y-4">
          {asked && (
            <p className="text-base font-semibold text-muted-foreground">
              You asked: {asked}
            </p>
          )}

          {result.refused ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="flex gap-3 p-5 text-amber-900">
                <Info className="mt-0.5 size-6 shrink-0" />
                <p className="text-lg">{result.answer}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="border-2 border-primary/20">
                <CardContent className="space-y-4 p-5">
                  <AnswerBody text={result.answer} />
                  {speech.supported && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => speech.toggle(result.answer)}
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

              <div>
                <button
                  type="button"
                  onClick={() => setSourcesOpen((o) => !o)}
                  className="flex min-h-14 w-full items-center justify-between rounded-xl border bg-card px-4 text-lg font-semibold"
                >
                  <span>Where this comes from</span>
                  <ChevronDown
                    className={cn(
                      "size-6 transition-transform",
                      sourcesOpen && "rotate-180",
                    )}
                  />
                </button>
                {sourcesOpen && (
                  <div className="mt-3 space-y-2">
                    {result.citations.map((c) => (
                      <CitationCard key={c.ref} c={c} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
