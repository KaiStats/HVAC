import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Citation } from "@/lib/types";
import { AnswerCard } from "@/components/AnswerCard";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface MsgRow {
  role: string;
  content: string;
  citations: Citation[] | null;
}

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  await requireSession();
  const supabase = createClient();

  // RLS scopes this to the caller's org; unknown/foreign ids return nothing.
  const { data } = await supabase
    .from("conversations")
    .select("id, messages(role, content, citations, created_at)")
    .eq("id", params.conversationId)
    .order("created_at", { referencedTable: "messages", ascending: true })
    .maybeSingle();

  if (!data) notFound();

  const messages = (data.messages ?? []) as MsgRow[];
  const question = messages.find((m) => m.role === "user")?.content ?? "";
  const assistant = messages.find((m) => m.role === "assistant");

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link
        href="/history"
        className="flex min-h-12 w-fit items-center gap-2 text-base font-semibold text-primary"
      >
        <ArrowLeft className="size-5" /> Back to your questions
      </Link>

      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-semibold uppercase text-muted-foreground">
            You asked
          </p>
          <p className="mt-1 text-xl font-bold">{question}</p>
        </CardContent>
      </Card>

      {assistant && (
        <AnswerCard
          answer={assistant.content}
          citations={assistant.citations ?? []}
          defaultSourcesOpen
        />
      )}
    </div>
  );
}
