import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT } from "@/lib/compliance-data";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, industry } = await req.json();

  const industryContext = industry && industry !== "general"
    ? `\n\nThe user is working in the ${industry} industry. Tailor your responses to be most relevant for ${industry} industry compliance requirements.`
    : "";

  try {
    const result = await streamText({
      model: anthropic("claude-sonnet-4-5"),
      system: SYSTEM_PROMPT + industryContext,
      messages,
      temperature: 0.3,
      maxTokens: 1500,
    });

    return result.toDataStreamResponse();
  } catch (error: unknown) {
    // If no API key is configured, return a demo response
    if (
      error instanceof Error &&
      (error.message.includes("API key") ||
        error.message.includes("ANTHROPIC_API_KEY") ||
        error.message.includes("401") ||
        error.message.includes("authentication") ||
        error.message.includes("x-api-key"))
    ) {
      return getDemoResponse(messages, industry);
    }
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process your request. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function getDemoResponse(messages: { role: string; content: string }[], industry: string) {
  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  let response = "";

  if (lastMessage.includes("ppe") || lastMessage.includes("personal protective")) {
    response = `## PPE Requirements Overview

Per **29 CFR 1910.132** (General Industry) and **29 CFR 1926.95** (Construction), employers must:

**Assessment Requirements:**
- Conduct a written workplace hazard assessment
- Certify the assessment was performed
- Identify hazards that necessitate PPE use

**Common PPE Requirements by Task:**

1. **Eye & Face Protection** (29 CFR 1910.133)
   - Safety glasses for flying particles, chemicals
   - Face shields when splash hazards exist

2. **Head Protection** (29 CFR 1910.135)
   - Hard hats required where overhead hazards exist
   - Class E hard hats in electrical work areas

3. **Hand Protection** (29 CFR 1910.138)
   - Gloves selected based on specific chemical/physical hazards
   - Chemical resistance charts must be consulted

4. **Foot Protection** (29 CFR 1910.136)
   - Safety-toed footwear where crushing/puncture hazards exist

**Training Required:** Employees must be trained on when PPE is necessary, what PPE is required, and how to don/doff properly.

> **Note:** Employer must provide PPE at no cost to employees (with limited exceptions for everyday items like safety-toed shoes).`;
  } else if (lastMessage.includes("fire") || lastMessage.includes("extinguisher")) {
    response = `## Fire Extinguisher Requirements

Per **29 CFR 1910.157**, here are the key requirements:

**Inspection Frequency:**
- **Monthly:** Visual inspection by a designated employee
- **Annual:** Maintenance check by a trained/certified individual  
- **6-Year:** Emptying and internal examination (stored pressure types)
- **Hydrostatic Testing:** Every 5-12 years depending on type

**Placement Requirements:**
- Travel distance to extinguisher: ≤75 feet for Class A hazards
- Travel distance: ≤50 feet for Class B hazards
- Mounted visible and accessible
- Installed in brackets or cabinets

**Employee Training:**
- Annual training for employees expected to use extinguishers
- If evacuation-only policy, training on when NOT to fight fires

**Documentation:**
- Maintain inspection tags on each extinguisher
- Keep records of all inspections and maintenance`;
  } else if (lastMessage.includes("hipaa") || lastMessage.includes("patient data")) {
    response = `## HIPAA Compliance for Workplace Safety

**Relevant HIPAA Rules for Healthcare Employers:**

**Privacy Rule (45 CFR Parts 160 & 164):**
- Protects Protected Health Information (PHI)
- Applies to medical records, occupational health files
- Employees have right to access their own health records

**Key Workplace Applications:**

1. **Occupational Health Records**
   - Keep separate from personnel files
   - Restrict access to those with need-to-know
   - Required retention: typically 30 years post-employment (OSHA 1910.1020)

2. **Return-to-Work Programs**
   - Medical information must be kept confidential
   - Supervisors may only be told work restrictions

3. **Drug Testing Records**
   - Treated as medical records under ADA
   - Strict confidentiality requirements apply

**Penalties:**
- Civil penalties: $100–$50,000 per violation
- Criminal penalties up to $250,000 and 10 years imprisonment

> **Consult a healthcare attorney** for your specific HIPAA compliance program needs.`;
  } else if (lastMessage.includes("fall") || lastMessage.includes("height")) {
    response = `## Fall Protection Requirements

**Trigger Heights by Industry:**

| Industry | Required Protection Height |
|----------|---------------------------|
| General Industry | 4 feet (29 CFR 1910.28) |
| Construction | 6 feet (29 CFR 1926.502) |
| Scaffolding | 10 feet (29 CFR 1926.451) |
| Aerial Lifts | Always required |

**Approved Fall Protection Methods (29 CFR 1926.502):**

1. **Guardrail Systems**
   - Top rail: 42 inches (±3") above walking surface
   - Mid-rail at 21 inches
   - Withstand 200 lbs outward/downward force

2. **Personal Fall Arrest Systems (PFAS)**
   - Full-body harness required (body belts prohibited for arrest)
   - Free fall limited to 6 feet
   - Deceleration distance ≤ 3.5 feet

3. **Safety Net Systems**
   - Installed 30 feet or less below work surface
   - Drop-tested before use and every 6 months

**Training Required:** Workers must be trained to recognize fall hazards and use fall protection before working at heights.`;
  } else if (lastMessage.includes("lockout") || lastMessage.includes("tagout") || lastMessage.includes("loto")) {
    response = `## Lockout/Tagout (LOTO) Program Requirements

Per **29 CFR 1910.147** — Control of Hazardous Energy:

**Written Program Must Include:**
- Scope and purpose
- Rules and techniques for energy control
- Enforcement provisions

**Machine-Specific Procedures Required For Each:**
Steps to shut down, isolate, block, and secure machines

**LOTO Procedure Steps:**
1. **Notify** affected employees
2. **Identify** all energy sources (electrical, hydraulic, pneumatic, gravity, thermal, chemical)
3. **Shut down** equipment using normal procedures
4. **Isolate** all energy sources with disconnects/valves
5. **Apply** lockout/tagout devices
6. **Release/restrain** stored energy
7. **Verify** isolation — attempt restart to confirm

**Device Requirements:**
- Locks must be individually keyed
- Tags must withstand 50 lbs pull force minimum
- Devices must be employee-specific

**Training:**
- Authorized employees (perform LOTO)
- Affected employees (work in area)
- Annual retraining if any procedural deviations

**Inspection:** Annual periodic inspection of each energy control procedure.`;
  } else {
    response = `## OSHA Compliance Assistant — Demo Mode

> **Note:** This response is a demonstration. Configure your **OPENAI_API_KEY** environment variable to enable full AI-powered responses.

I'm OSHA Compass, your intelligent compliance assistant. I can help you with:

**Common Compliance Topics:**
- 🦺 **Personal Protective Equipment (PPE)** requirements
- 🔒 **Lockout/Tagout (LOTO)** procedures  
- 🏗️ **Fall protection** standards
- 🧯 **Fire safety** regulations
- ☣️ **Hazard Communication (HazCom)** / GHS
- 📋 **OSHA recordkeeping** requirements
- 🏥 **Healthcare** — HIPAA, bloodborne pathogens
- 🏭 **Manufacturing** — machine guarding, electrical safety

**Try asking me:**
- "What PPE is required for welding operations?"
- "How do I write a confined space entry permit?"
- "What are the OSHA requirements for electrical panels?"
- "What training is required under 29 CFR 1910.1200?"

**To enable full AI responses:**
1. Get an OpenAI API key at [platform.openai.com](https://platform.openai.com)
2. Add \`OPENAI_API_KEY=your-key\` to your \`.env.local\` file
3. Restart the development server`;
  }

  // Simulate streaming with a readable stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Format as AI SDK data stream
      const words = response.split(" ");
      for (let i = 0; i < words.length; i++) {
        const chunk = i === 0 ? words[i] : " " + words[i];
        controller.enqueue(encoder.encode(`0:${JSON.stringify(chunk)}\n`));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Vercel-AI-Data-Stream": "v1",
    },
  });
}
