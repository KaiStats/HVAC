import { FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

import type { DocumentRow } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function DocStatusList({ documents }: { documents: DocumentRow[] }) {
  if (documents.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">No documents yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
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
      ))}
    </div>
  );
}
