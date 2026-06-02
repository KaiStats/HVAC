"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DocumentUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    setSuccess(null);
    setBusy(true);
    setFileName(file.name);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      if (json.status === "error") {
        setError(json.error ?? "We couldn't read that file.");
      } else {
        setSuccess("✅ Your manual is ready — ask it anything.");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
      setFileName(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          {busy ? (
            <Loader2 className="size-7 animate-spin" />
          ) : (
            <UploadCloud className="size-7" />
          )}
        </div>
        <div>
          <p className="text-lg font-bold">
            {busy ? `Reading "${fileName}"…` : "Upload a manual or SOP"}
          </p>
          <p className="text-muted-foreground">
            {busy
              ? "This can take a moment for big files."
              : "PDF files only. Max 25 MB."}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
        <Button
          type="button"
          size="lg"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? "Working…" : "Choose PDF"}
        </Button>

        {error && (
          <p className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded-md bg-green-100 p-3 text-base font-semibold text-green-800">
            {success}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
