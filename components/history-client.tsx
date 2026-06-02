import Link from "next/link";
import { ChevronRight, MessageCircleQuestion } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export interface HistoryConversation {
  id: string;
  title: string | null;
  created_at: string;
  messages: { role: string; content: string }[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HistoryList({
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
          {conversations.map((convo) => {
            const question =
              convo.messages.find((m) => m.role === "user")?.content ??
              convo.title ??
              "Question";
            return (
              <Link key={convo.id} href={`/ask/${convo.id}`} className="block">
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex min-h-16 items-center gap-3 p-4">
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-lg font-semibold">
                        {question}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(convo.created_at)}
                      </span>
                    </span>
                    <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
