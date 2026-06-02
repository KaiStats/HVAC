import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  HistoryList,
  type HistoryConversation,
} from "@/components/history-client";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await requireSession();
  const supabase = createClient();

  // RLS scopes to the org; we additionally filter to this user's conversations.
  const { data } = await supabase
    .from("conversations")
    .select("id, title, created_at, messages(role, content, created_at)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .order("created_at", { referencedTable: "messages", ascending: true })
    .limit(50);

  const conversations = (data ?? []) as unknown as HistoryConversation[];

  return <HistoryList conversations={conversations} />;
}
