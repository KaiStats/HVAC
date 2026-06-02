"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

import type { Citation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { AnswerBody, CitationList } from "@/components/answer-view";

export interface HistoryMessage {
  role: string;
  content: string;
  citations: Citation[] | null;
}

export interface HistoryConversation {
  id: string;
  title: string | null;
  created_at: string;
  messages: HistoryMessage[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ConversationItem({ convo }: { convo: HistoryConversation }) {
  const [open, setOpen] = useState(false);
  const question =
    convo.messages.find((m) => m.role === "user")?.content ??
    convo.title ??
    "Question";
  const assistant = convo.messages.find((m) => m.role === "assistant");

  return (
    <Card>
      <CardContent className="p-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-16 w-full items-center gap-3 p-4 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 text-lg font-semibold">
              {question}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(convo.created_at)}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-6 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {open && assistant && (
          <div className="space-y-3 border-t p-4">
            <AnswerBody text={assistant.content} />
            <CitationList citations={assistant.citations ?? []} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function HistoryClient({
  conversations,
}: {
  conversations: HistoryConversation[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Your questions</h1>
        <p className="text-muted-foreground">
          Everything you&apos;ve asked, with the sources.
        </p>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <MessageCircleQuestion className="size-8 text-muted-foreground" />
            <p className="text-lg font-semibold">No questions yet</p>
            <Link href="/" className="text-lg font-semibold text-primary">
              Ask your first question
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => (
            <ConversationItem key={c.id} convo={c} />
          ))}
        </div>
      )}
    </div>
  );
}
