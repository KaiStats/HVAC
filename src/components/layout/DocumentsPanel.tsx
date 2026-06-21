"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ComplianceDocument, Industry } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface DocumentsPanelProps {
  industry: Industry;
}

const DOCUMENT_TYPES = [
  { id: "sop", label: "Standard Operating Procedure" },
  { id: "manual", label: "Safety Manual" },
  { id: "regulation", label: "Regulation / Standard" },
  { id: "training", label: "Training Material" },
  { id: "checklist", label: "Safety Checklist" },
] as const;

export function DocumentsPanel({ industry }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      for (const file of acceptedFiles) {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
        const newDoc: ComplianceDocument = {
          id: uuidv4(),
          name: file.name,
          type: "manual",
          industry,
          uploadedAt: new Date(),
          size: file.size,
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }
      setUploading(false);
    },
    [industry]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Compliance Documents</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Upload your SOPs, manuals, and training materials for AI-powered analysis
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 mb-6",
            isDragActive
              ? "border-brand-400 bg-brand-50"
              : "border-gray-200 bg-gray-50 hover:border-brand-300 hover:bg-brand-50/50"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                isDragActive ? "bg-brand-100" : "bg-white shadow-sm"
              )}
            >
              <Upload
                className={cn(
                  "w-6 h-6 transition-colors",
                  isDragActive ? "text-brand-600" : "text-gray-400"
                )}
              />
            </div>
            {uploading ? (
              <div className="flex items-center gap-2 text-brand-600">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm font-medium">Processing document...</span>
              </div>
            ) : isDragActive ? (
              <p className="text-brand-600 font-medium text-sm">Drop files here</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-gray-400">
                  PDF, DOC, DOCX, TXT · Max 20MB per file
                </p>
              </>
            )}
          </div>
        </div>

        {/* Document List */}
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No documents uploaded yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Upload compliance documents to enable document-aware AI responses
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Uploaded Documents ({documents.length})
            </h3>
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-400">{formatFileSize(doc.size)}</span>
                    <span className="text-gray-200">·</span>
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-2.5 h-2.5 mr-1" />
                      Indexed
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(doc.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
