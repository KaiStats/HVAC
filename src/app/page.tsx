"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { DocumentsPanel } from "@/components/layout/DocumentsPanel";
import { AlertsPanel } from "@/components/layout/AlertsPanel";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { INDUSTRIES } from "@/lib/compliance-data";
import type { Industry } from "@/types";
import { cn } from "@/lib/utils";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "documents" | "alerts" | "settings">("chat");
  const [industry, setIndustry] = useState<Industry>("general");
  const [sessionId, setSessionId] = useState(() => uuidv4());

  const handleNewChat = () => {
    setSessionId(uuidv4());
    setActiveTab("chat");
  };

  const currentIndustry = INDUSTRIES.find((i) => i.id === industry);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        industry={industry}
        onIndustryChange={setIndustry}
        onNewChat={handleNewChat}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">
                {activeTab === "chat" && "Chat with OSHA Compass"}
                {activeTab === "documents" && "Document Library"}
                {activeTab === "alerts" && "Compliance Alerts"}
                {activeTab === "settings" && "Settings"}
              </h2>
              <p className="text-xs text-gray-400">
                {activeTab === "chat" && (
                  <>
                    <span className="mr-1">{currentIndustry?.icon}</span>
                    {currentIndustry?.label} industry
                  </>
                )}
                {activeTab === "documents" && "Manage your compliance documents"}
                {activeTab === "alerts" && "Stay current with regulatory changes"}
                {activeTab === "settings" && "Configure your assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium",
                "bg-green-50 text-green-700"
              )}
            >
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse-slow" />
              Active
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <ChatInterface key={sessionId} industry={industry} sessionId={sessionId} />
          )}
          {activeTab === "documents" && <DocumentsPanel industry={industry} />}
          {activeTab === "alerts" && <AlertsPanel />}
          {activeTab === "settings" && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}
