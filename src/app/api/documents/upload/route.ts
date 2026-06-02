import { NextResponse } from "next/server";

import { getSessionContext } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ingestDocument } from "@/lib/ingest";
import { fileTypeFromName } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

const CONTENT_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

export async function POST(request: Request) {
  const session = await getSessionContext();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const fileType = fileTypeFromName(file.name);
  if (!fileType) {
    return NextResponse.json(
      { error: "Please upload a PDF, Word (.docx), or text (.txt) file." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Max 25 MB." },
      { status: 400 },
    );
  }

  const title = file.name.replace(/\.(pdf|docx|txt)$/i, "");
  const supabase = createClient();

  // Insert the document row through the user's session so RLS binds org_id.
  const { data: doc, error: insertError } = await supabase
    .from("documents")
    .insert({
      org_id: session.orgId,
      title,
      file_type: fileType,
      status: "processing",
      uploaded_by: session.userId,
    })
    .select("id")
    .single();

  if (insertError || !doc) {
    return NextResponse.json(
      { error: insertError?.message ?? "Could not create document." },
      { status: 500 },
    );
  }

  const filePath = `${session.orgId}/${doc.id}.${fileType}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const admin = createAdminClient();

  const { error: uploadError } = await admin.storage
    .from("documents")
    .upload(filePath, bytes, {
      contentType: CONTENT_TYPE[fileType],
      upsert: true,
    });

  if (uploadError) {
    await admin
      .from("documents")
      .update({ status: "error", error: uploadError.message })
      .eq("id", doc.id);
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  await admin
    .from("documents")
    .update({ file_path: filePath })
    .eq("id", doc.id);

  try {
    await ingestDocument({
      orgId: session.orgId,
      documentId: doc.id,
      bytes,
      fileType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ingestion failed.";
    return NextResponse.json(
      { id: doc.id, status: "error", error: message },
      { status: 200 },
    );
  }

  return NextResponse.json({ id: doc.id, status: "ready" });
}
