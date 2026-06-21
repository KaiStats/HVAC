import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { saveBooking, BookingInput } from "@/lib/bookings";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are Maya, the friendly front-desk intake agent for Desert Air HVAC, a licensed HVAC and plumbing company based in Henderson, NV.

Your job is to collect the following five pieces of information from the customer, one question at a time:
1. service_type — what they need help with (AC, heating, plumbing, or emergency)
2. urgency — how urgent the issue is (e.g., same day, within a week, not urgent)
3. customer_name — their full name
4. phone — a callback phone number
5. address — the service address in Henderson or the surrounding area

Rules:
- Greet the caller warmly on the very first message.
- Ask only ONE question per reply. Do not list multiple questions at once.
- Keep every reply short and conversational, the way a real dispatcher would speak on the phone.
- Once you have all five pieces of information, offer exactly two specific appointment time slots (e.g., "Tomorrow, Tuesday June 24 between 9–11 AM" and "Thursday June 26 between 2–4 PM").
- Wait for the customer to confirm one of the two slots before booking.
- When the customer confirms a slot, call the book_job tool with all collected details. Do NOT make up information — only use what the customer has provided.
- If a customer's answer is unclear, politely ask for clarification before moving on.`;

const BOOK_JOB_TOOL: Anthropic.Tool = {
  name: "book_job",
  description:
    "Book a service appointment once the customer has provided all required details and confirmed a time slot.",
  input_schema: {
    type: "object" as const,
    properties: {
      customer_name: {
        type: "string",
        description: "Full name of the customer",
      },
      phone: {
        type: "string",
        description: "Customer callback phone number",
      },
      service_type: {
        type: "string",
        enum: ["AC", "heating", "plumbing", "emergency"],
        description: "Type of service requested",
      },
      urgency: {
        type: "string",
        description:
          "How urgent the issue is, e.g. same day, within a week, not urgent",
      },
      address: {
        type: "string",
        description: "Service address",
      },
      slot: {
        type: "string",
        description:
          "The appointment time slot the customer confirmed, e.g. Tuesday June 24, 9–11 AM",
      },
      notes: {
        type: "string",
        description:
          "Any additional notes the customer mentioned about the issue (optional)",
      },
    },
    required: [
      "customer_name",
      "phone",
      "service_type",
      "urgency",
      "address",
      "slot",
    ],
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Anthropic.MessageParam[] = body.messages ?? [];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: [BOOK_JOB_TOOL],
      messages,
    });

    // Find tool_use block if present
    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (toolUseBlock && toolUseBlock.name === "book_job") {
      const bookingInput = toolUseBlock.input as BookingInput;
      const booking = await saveBooking(bookingInput);

      // Extract any accompanying text Maya sent alongside the tool call
      const textBlock = response.content.find(
        (block): block is Anthropic.TextBlock => block.type === "text"
      );
      const reply =
        textBlock?.text ??
        "Great, you're all set! I've confirmed your appointment. We'll see you then!";

      return NextResponse.json({ reply, booking });
    }

    // Normal conversational reply — no tool call yet
    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    if (!textBlock) {
      return NextResponse.json(
        { error: "No text content in model response", detail: response.content },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply: textBlock.text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: "Intake request failed", detail: message },
      { status: 500 }
    );
  }
}
