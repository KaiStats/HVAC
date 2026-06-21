"use client";

import { useState, useRef, useEffect } from "react";

const PHONE = "(702) 555-1234";
const PHONE_HREF = "tel:7025551234";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    from: "bot",
    text: "Hi! I'm the Desert Air assistant. Need emergency AC, heating, or plumbing help? Tell me what's going on and I'll connect you with a technician fast.",
  },
];

const QUICK_REPLIES = [
  "AC not cooling",
  "Heater not working",
  "Plumbing issue",
  "Get a quote",
];

const BOT_RESPONSES: Record<string, string> = {
  "AC not cooling":
    "That's a top-priority call in Henderson heat. A technician can be there within the hour. Call us at " +
    PHONE +
    " or we'll call you right back.",
  "Heater not working":
    "We handle all heating systems — gas, heat pump, you name it. Call " +
    PHONE +
    " for same-day service.",
  "Plumbing issue":
    "Our licensed plumbers are standing by. For emergencies like leaks or no water, call " +
    PHONE +
    " right now.",
  "Get a quote":
    "We offer free upfront pricing with no service-call fee. Call " +
    PHONE +
    " and we'll walk you through your options.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  function sendQuickReply(text: string) {
    addMessage("user", text);
    const reply =
      BOT_RESPONSES[text] ||
      "For the fastest help, call us at " +
        PHONE +
        " — a live tech answers 24/7.";
    simulateBotReply(reply);
  }

  function sendInput() {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    addMessage("user", trimmed);
    simulateBotReply(
      "Thanks for reaching out. For the fastest response, call " +
        PHONE +
        " — we pick up every time."
    );
  }

  function addMessage(from: "bot" | "user", text: string) {
    setMessages((prev) => [...prev, { id: Date.now(), from, text }]);
  }

  function simulateBotReply(text: string) {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addMessage("bot", text);
    }, 900);
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl border border-stone-200 bg-white overflow-hidden flex flex-col"
          style={{ maxHeight: "min(520px, calc(100dvh - 120px))" }}>

          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 pulse-dot" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Desert Air Support</p>
                <p className="text-slate-400 text-xs leading-tight">Technician available now</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-slate-400 hover:text-white transition-colors p-1 -mr-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-amber-500 text-slate-900 font-medium rounded-br-sm"
                      : "bg-white text-slate-700 border border-stone-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 bg-white border-t border-stone-100 flex flex-wrap gap-2 shrink-0">
              {QUICK_REPLIES.map((qr) => (
                <button
                  key={qr}
                  onClick={() => sendQuickReply(qr)}
                  className="text-xs font-medium border border-amber-400 text-amber-700 rounded-full px-3 py-1.5 hover:bg-amber-50 transition-colors"
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Call CTA bar */}
          <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 shrink-0">
            <a href={PHONE_HREF} className="flex items-center justify-center gap-2 text-sm font-bold text-amber-800 hover:text-amber-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              Call {PHONE} — Live Answer, 24/7
            </a>
          </div>

          {/* Input */}
          <form
            className="flex items-center gap-2 px-3 py-3 border-t border-stone-200 bg-white shrink-0"
            onSubmit={(e) => { e.preventDefault(); sendInput(); }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your question…"
              className="flex-1 text-sm bg-stone-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-stone-400"
            />
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-colors shrink-0"
              aria-label="Send message"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white pulse-dot" />
          </>
        )}
      </button>
    </>
  );
}
