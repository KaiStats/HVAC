"use client";

import { useState } from "react";
import {
  MessageSquare,
  FileText,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shield,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Industry } from "@/types";
import { INDUSTRIES, COMPLIANCE_ALERTS } from "@/lib/compliance-data";
import { Badge } from "@/components/ui/Badge";
import { SEVERITY_COLORS } from "@/lib/utils";

interface SidebarProps {
  activeTab: "chat" | "documents" | "alerts" | "settings";
  onTabChange: (tab: "chat" | "documents" | "alerts" | "settings") => void;
  industry: Industry;
  onIndustryChange: (industry: Industry) => void;
  onNewChat: () => void;
}

export function Sidebar({
  activeTab,
  onTabChange,
  industry,
  onIndustryChange,
  onNewChat,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const criticalAlerts = COMPLIANCE_ALERTS.filter((a) => a.severity === "critical" || a.severity === "high").length;

  const navItems = [
    { id: "chat" as const, icon: MessageSquare, label: "Chat" },
    { id: "documents" as const, icon: FileText, label: "Documents" },
    { id: "alerts" as const, icon: Bell, label: "Alerts", badge: criticalAlerts },
    { id: "settings" as const, icon: Settings, label: "Settings" },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out relative",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center p-4 border-b border-slate-700", collapsed ? "justify-center" : "gap-3")}>
        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-bold text-sm leading-tight">OSHA Compass</h1>
            <p className="text-xs text-slate-400">Compliance Assistant</p>
          </div>
        )}
      </div>

      {/* Industry Selector */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 px-1">Industry</p>
          <div className="space-y-1">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                onClick={() => onIndustryChange(ind.id as Industry)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                  industry === ind.id
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <span className="text-base">{ind.icon}</span>
                <span className="font-medium">{ind.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative",
              activeTab === item.id
                ? "bg-brand-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
            {item.badge && item.badge > 0 && (
              <span
                className={cn(
                  "bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold",
                  collapsed
                    ? "absolute -top-1 -right-1 w-4 h-4"
                    : "ml-auto w-5 h-5"
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* New Chat Button */}
      <div className={cn("px-3 pb-4", collapsed && "flex justify-center")}>
        <button
          onClick={onNewChat}
          className={cn(
            "flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-2.5 transition-colors font-medium text-sm",
            collapsed ? "w-10 h-10 justify-center" : "w-full px-3"
          )}
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>New Conversation</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center transition-colors shadow-md z-10"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-white" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white" />
        )}
      </button>
    </aside>
  );
}
