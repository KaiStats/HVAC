"use client";

import { useState, useRef, useEffect } from "react";

const PHONE = "(702) 555-0147";
const PHONE_HREF = "tel:7025550147";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  from: "bot",
  text: "Hi! I'm Maya, Desert Air's scheduling assistant. What can I help you with today?",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      from: "user",
      text: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTyping(true);

    try {
      // Convert current messages to Anthropic format
      const anthropicMessages = messages
        .filter((m) => m.id !== 1 || messages.length === 1) // Skip initial if more messages exist
        .map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        }));

      // Add the new user message
      anthropicMessages.push({
        role: "user" as const,
        content: userMsg.text,
      });

      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: anthropicMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      setTyping(false);

      if (data.booking) {
        // Booking successful
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: "bot",
            text: data.reply || "Perfect! Your appointment has been confirmed. A technician will text you shortly with a confirmation.",
          },
        ]);

        // Show booking summary after a delay
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 2,
              from: "bot",
              text: `📋 Booking confirmed:\n\nName: ${data.booking.customer_name}\nPhone: ${data.booking.phone}\nService: ${data.booking.service_type}\nTime: ${data.booking.slot}\n\nWe'll text you soon!`,
            },
          ]);
        }, 500);
      } else if (data.reply) {
        // Regular conversation
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: "bot",
            text: data.reply,
          },
        ]);
      }

      if (data.error) {
        console.error("Chat error:", data.error, data.detail);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            from: "bot",
            text: "Sorry, something went wrong. Please call us at " + PHONE + " instead.",
          },
        ]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "bot",
          text: "For the fastest help, call us at " + PHONE + " — we pick up every time.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim() && !loading) {
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-2xl shadow-2xl border border-stone-200 bg-white overflow-hidden flex flex-col"
          style={{ maxHeight: "min(520px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-pulse" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Maya — Desert Air</p>
                <p className="text-blue-200 text-xs leading-tight">Scheduling assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-blue-200 hover:text-white transition-colors p-1 -mr-1"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.from === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.from === "user"
                      ? "bg-blue-600 text-white font-medium rounded-br-sm"
                      : "bg-white text-slate-700 border border-stone-200 rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center mr-2 mt-0.5 shrink-0">
                  <span className="text-white text-xs font-bold">M</span>
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

          {/* Call CTA bar */}
          <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 shrink-0">
            <a
              href={PHONE_HREF}
              className="flex items-center justify-center gap-2 text-sm font-bold text-orange-800 hover:text-orange-900"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              Call {PHONE} — Live Answer, 24/7
            </a>
          </div>

          {/* Input */}
          <form
            className="flex items-center gap-2 px-3 py-3 border-t border-stone-200 bg-white shrink-0"
            onSubmit={handleSubmit}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type your message…"
              className="flex-1 text-sm bg-stone-100 rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-stone-400 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
              aria-label="Send message"
            >
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center group"
      >
        {open ? (
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        ) : (
          <>
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </>
        )}
      </button>
    </>
  );
}
