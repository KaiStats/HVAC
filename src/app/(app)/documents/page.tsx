import { FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { DocumentRow } from "@/lib/types";
import { DocumentUploader } from "@/components/document-uploader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: DocumentRow["status"] }) {
  if (status === "ready") {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="size-4" /> Ready
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertCircle className="size-4" /> Failed
      </Badge>
    );
  }
  return (
    <Badge variant="warning" className="gap-1">
      <Loader2 className="size-4 animate-spin" /> Processing
    </Badge>
  );
}

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

      <DocumentUploader />

      <div className="space-y-3">
        {documents.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No documents yet.
          </p>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{doc.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.status === "error" && doc.error
                      ? doc.error
                      : doc.page_count
                        ? `${doc.page_count} pages`
                        : (doc.file_type ?? "file").toUpperCase()}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
