import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AskClient } from "@/components/ask-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireSession();
  const supabase = createClient();

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("status", "ready");

  return <AskClient hasDocuments={(count ?? 0) > 0} />;
}
