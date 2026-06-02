import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AskBox } from "@/components/AskBox";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireSession();
  const supabase = createClient();

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("status", "ready");

  return <AskBox hasDocuments={(count ?? 0) > 0} />;
}
