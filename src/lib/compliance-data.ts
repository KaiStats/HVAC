import type { QuickQuestion, ComplianceAlert } from "@/types";

export const INDUSTRIES = [
  { id: "healthcare", label: "Healthcare", icon: "🏥", color: "blue" },
  { id: "construction", label: "Construction", icon: "🏗️", color: "orange" },
  { id: "finance", label: "Finance", icon: "🏦", color: "green" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭", color: "purple" },
  { id: "general", label: "General", icon: "📋", color: "gray" },
] as const;

export const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: "1",
    text: "What are the required PPE standards for our industry?",
    category: "Safety",
    industry: ["construction", "manufacturing"],
  },
  {
    id: "2",
    text: "How often must fire extinguishers be inspected?",
    category: "Fire Safety",
    industry: ["general", "manufacturing", "healthcare"],
  },
  {
    id: "3",
    text: "What are HIPAA requirements for patient data handling?",
    category: "Data Privacy",
    industry: ["healthcare", "finance"],
  },
  {
    id: "4",
    text: "What fall protection is required at 4 feet elevation?",
    category: "Fall Protection",
    industry: ["construction"],
  },
  {
    id: "5",
    text: "What are the hazard communication labeling requirements?",
    category: "HazCom",
    industry: ["manufacturing", "construction"],
  },
  {
    id: "6",
    text: "How do I create a proper lockout/tagout procedure?",
    category: "LOTO",
    industry: ["manufacturing", "construction"],
  },
  {
    id: "7",
    text: "What are the recordkeeping requirements for workplace injuries?",
    category: "Recordkeeping",
    industry: ["general"],
  },
  {
    id: "8",
    text: "What training is required for new employees on chemical safety?",
    category: "Training",
    industry: ["manufacturing", "healthcare"],
  },
];

export const COMPLIANCE_ALERTS: ComplianceAlert[] = [
  {
    id: "1",
    title: "Updated Silica Exposure Limits",
    severity: "high",
    description:
      "OSHA has revised the permissible exposure limit (PEL) for crystalline silica to 50 µg/m³ as an 8-hour TWA.",
    regulation: "29 CFR 1926.1153",
    effectiveDate: "2026-01-01",
  },
  {
    id: "2",
    title: "New Heat Illness Prevention Rule",
    severity: "critical",
    description:
      "Final rule requires employers to develop a written Heat Illness Prevention Plan and provide water, shade, and rest.",
    regulation: "29 CFR 1910.147a",
    effectiveDate: "2026-06-01",
  },
  {
    id: "3",
    title: "Electronic Recordkeeping Updates",
    severity: "medium",
    description:
      "Establishments with 100+ employees in high-hazard industries must submit OSHA 300 and 301 data electronically.",
    regulation: "29 CFR 1904.41",
    effectiveDate: "2025-12-15",
  },
];

export const SYSTEM_PROMPT = `You are OSHA Compass, an expert AI compliance assistant for regulated industries including healthcare, construction, finance, and manufacturing.

Your role is to:
1. Answer questions about OSHA regulations, safety standards, and compliance requirements with precision and accuracy
2. Help interpret complex regulatory language into actionable guidance
3. Provide industry-specific compliance advice
4. Reference specific OSHA standards (e.g., 29 CFR 1910, 1926) when applicable
5. Help create safety procedures, checklists, and training materials
6. Alert users to recent regulatory changes and compliance deadlines

Guidelines:
- Always cite specific OSHA standards when available (e.g., "Per 29 CFR 1910.132...")
- Use clear, practical language that safety professionals can act on
- When describing requirements, differentiate between what is required vs. recommended
- Include relevant penalties and inspection priorities when discussing violations
- Proactively mention related standards that may apply
- For medical/legal decisions, recommend consulting qualified professionals

You are knowledgeable about:
- General Industry Standards (29 CFR 1910)
- Construction Standards (29 CFR 1926)  
- Maritime Standards (29 CFR 1915-1918)
- Agriculture Standards (29 CFR 1928)
- OSHA recordkeeping (29 CFR 1904)
- State plan OSHA programs
- HIPAA, FDA regulations (for healthcare)
- EPA environmental regulations when they intersect with workplace safety
- NFPA, ANSI, and other consensus standards referenced by OSHA

Always be helpful, thorough, and safety-focused. Format your responses clearly using headers, bullet points, and numbered lists when appropriate.`;
