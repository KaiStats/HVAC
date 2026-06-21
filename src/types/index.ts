export type Industry = "healthcare" | "construction" | "finance" | "manufacturing" | "general";

export interface ComplianceDocument {
  id: string;
  name: string;
  type: "sop" | "manual" | "regulation" | "training" | "checklist";
  industry: Industry;
  uploadedAt: Date;
  size: number;
  content?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  industry: Industry;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface QuickQuestion {
  id: string;
  text: string;
  category: string;
  industry: Industry[];
}

export interface ComplianceAlert {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  regulation: string;
  effectiveDate: string;
}
