import Link from "next/link";
import { MessageCircleQuestion, FileUp, ArrowRight } from "lucide-react";

import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function HomePage() {
  const session = await requireSession();
  const supabase = createClient();

  const { count } = await supabase
    .from("documents")
    .select("id", { count: "exact", head: true })
    .eq("status", "ready");

  const hasDocs = (count ?? 0) > 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Hi 👋 What do you need?
        </h1>
        <p className="text-lg text-muted-foreground">
          Ask your safety manuals anything. Every answer shows the exact source.
        </p>
      </div>

      {/* One primary action per screen: Ask is the main job. */}
      <Link href="/ask" className="block">
        <Card className="border-2 border-primary/20 transition-colors hover:border-primary/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircleQuestion className="size-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Ask a question</h2>
              <p className="text-muted-foreground">
                {hasDocs
                  ? "Get the exact answer in seconds."
                  : "Upload a document first, then ask away."}
              </p>
            </div>
            <ArrowRight className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <Link href="/documents" className="block">
        <Card className="transition-colors hover:border-primary/40">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
              <FileUp className="size-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Upload a document</h2>
              <p className="text-muted-foreground">
                Add a manual or SOP (PDF).
              </p>
            </div>
            <ArrowRight className="size-6 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {!hasDocs && (
        <div className="rounded-xl bg-amber-50 p-4 text-amber-900">
          <p className="font-semibold">No documents yet.</p>
          <p>Upload your first manual to start getting cited answers.</p>
          <Button asChild className="mt-3" variant="default">
            <Link href="/documents">Upload now</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
