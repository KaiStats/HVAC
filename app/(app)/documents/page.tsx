import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRow } from "@/lib/types";
import { UploadDropzone } from "@/components/UploadDropzone";
import { DocStatusList } from "@/components/DocStatusList";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  await requireSession();
  const supabase = createClient();

  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  const documents = (data ?? []) as DocumentRow[];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Add the manuals and SOPs your team needs answers from.
        </p>
      </div>

      <UploadDropzone />
      <DocStatusList documents={documents} />
    </div>
  );
}
