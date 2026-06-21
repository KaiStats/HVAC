"use client";

import { useChat } from "ai/react";
import { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Mic, AlertCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { Button } from "@/components/ui/Button";
import { QUICK_QUESTIONS } from "@/lib/compliance-data";
import type { Industry } from "@/types";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  industry: Industry;
  sessionId: string;
}

export function ChatInterface({ industry, sessionId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setInput } =
    useChat({
      api: "/api/chat",
      body: { industry },
      id: sessionId,
      onFinish: () => {
        setShowSuggestions(false);
      },
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const filteredQuestions = QUICK_QUESTIONS.filter(
    (q) => q.industry.includes(industry) || industry === "general"
  ).slice(0, 4);

  const handleQuickQuestion = (question: string) => {
    setInput(question);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white text-2xl font-bold">OC</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              OSHA Compass Assistant
            </h2>
            <p className="text-gray-500 text-sm max-w-md mb-8">
              Ask me anything about OSHA regulations, safety standards, compliance requirements, or workplace safety procedures.
            </p>

            {showSuggestions && filteredQuestions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {filteredQuestions.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => handleQuickQuestion(q.text)}
                    className="text-left px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-brand-300 hover:bg-brand-50 transition-all duration-200 group shadow-sm"
                  >
                    <span className="text-xs font-medium text-brand-600 mb-1 block">
                      {q.category}
                    </span>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-snug">
                      {q.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Something went wrong. Please try again.</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3">
        {messages.length > 0 && showSuggestions && filteredQuestions.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {filteredQuestions.slice(0, 3).map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickQuestion(q.text)}
                className="flex-shrink-0 text-xs px-3 py-1.5 bg-gray-100 hover:bg-brand-50 hover:text-brand-700 text-gray-600 rounded-full transition-colors"
              >
                {q.text.slice(0, 40)}...
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about OSHA regulations, safety requirements, compliance procedures..."
              rows={1}
              className={cn(
                "w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12",
                "text-sm text-gray-800 placeholder-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent focus:bg-white",
                "transition-all duration-200",
                "max-h-[120px] overflow-y-auto"
              )}
            />
            <button
              type="button"
              className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach document"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            loading={isLoading}
            size="md"
            className="rounded-2xl h-[46px] w-[46px] p-0 flex-shrink-0"
          >
            {!isLoading && <Send className="w-4 h-4" />}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
