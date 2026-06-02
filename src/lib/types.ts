export type DocumentStatus = "processing" | "ready" | "error";

export interface DocumentRow {
  id: string;
  org_id: string;
  title: string;
  storage_path: string;
  status: DocumentStatus;
  page_count: number | null;
  error: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// A source the model is allowed to cite, with everything needed to trace it.
export interface RetrievedChunk {
  id: string;
  document_id: string;
  document_title: string;
  content: string;
  section: string | null;
  page: number | null;
  similarity: number;
}

// A citation rendered in the UI. No citation => the answer is not shown.
export interface Citation {
  ref: number;
  document_id: string;
  document_title: string;
  section: string | null;
  page: number | null;
  snippet: string;
}

export interface AskAnswer {
  answer: string;
  citations: Citation[];
  // True when the assistant could not ground an answer in the documents.
  refused: boolean;
}
