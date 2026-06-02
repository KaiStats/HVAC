"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Send, Info, BookOpen, Sparkles } from "lucide-react";

import type { AskAnswer } from "@/lib/types";
import { useDictation } from "@/hooks/use-dictation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceButton } from "@/components/VoiceButton";
import { AnswerCard, AnswerText } from "@/components/AnswerCard";

type Phase = "idle" | "reading" | "streaming" | "done" | "error";

// Wire protocol for the /api/ask NDJSON stream.
type StreamEvent =
  | { type: "delta"; text: string }
  | ({ type: "done" } & AskAnswer)
  | { type: "error"; message: string };

const DEFAULT_EXAMPLES = [
  "What PPE do I need for confined space entry?",
  "How do I lock out a machine before maintenance?",
  "What do I do if there's a chemical spill?",
  "When do I need a hot work permit?",
];

export function AskBox({
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

  const baseRef = useRef("");
  const dictation = useDictation((text) => {
    const base = baseRef.current;
    setQuestion(base ? `${base} ${text}` : text);
  });

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
    setError(null);
    setResult(null);
    setStreamText("");
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

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const raw of lines) {
          if (!raw.trim()) continue;
          const event = JSON.parse(raw) as StreamEvent;
          if (event.type === "delta") {
            setPhase("streaming");
            setStreamText((prev) => prev + event.text);
          } else if (event.type === "done") {
            setResult({
              answer: event.answer,
              citations: event.citations,
              refused: event.refused,
            });
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
            <VoiceButton
              listening={dictation.listening}
              onToggle={toggleMic}
              className="absolute bottom-3 right-3"
            />
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
                onClick={() => runAsk(ex)}
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
              Reading your manuals…
            </p>
          </CardContent>
        </Card>
      )}

      {/* Live streaming answer. */}
      {phase === "streaming" && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-5">
            <AnswerText text={streamText} />
          </CardContent>
        </Card>
      )}

      {/* Final answer. */}
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
            <AnswerCard answer={result.answer} citations={result.citations} />
          )}
        </div>
      )}
    </div>
  );
}
