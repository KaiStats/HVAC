"use client";

import { useState } from "react";
import { Key, Bell, Palette, HelpCircle, ExternalLink, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SettingsPanel() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    regulatoryUpdates: true,
    weeklyDigest: false,
    criticalAlerts: true,
  });

  const handleSaveApiKey = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure your compliance assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* API Configuration */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Key className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">AI Configuration</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Anthropic API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Saved
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Or set <code className="bg-gray-100 px-1 rounded">ANTHROPIC_API_KEY</code> in your{" "}
                <code className="bg-gray-100 px-1 rounded">.env.local</code> file.{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Get API key
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">AI Model</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                <option value="claude-sonnet-4-5">Claude Sonnet 4.5 (Recommended)</option>
                <option value="claude-opus-4-5">Claude Opus 4.5 (Most Capable)</option>
                <option value="claude-haiku-3-5">Claude Haiku 3.5 (Fast)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">Notifications</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {[
              {
                key: "regulatoryUpdates",
                label: "Regulatory Updates",
                desc: "New OSHA standards and amendments",
              },
              {
                key: "criticalAlerts",
                label: "Critical Compliance Alerts",
                desc: "Urgent safety and compliance notices",
              },
              {
                key: "weeklyDigest",
                label: "Weekly Digest",
                desc: "Summary of compliance news and tips",
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev],
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                    notifications[key as keyof typeof notifications]
                      ? "bg-brand-500"
                      : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                      notifications[key as keyof typeof notifications]
                        ? "translate-x-4"
                        : "translate-x-1"
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-700 text-sm">About</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-2 text-xs text-gray-500">
            <p><span className="font-medium text-gray-600">OSHA Compass</span> v0.1.0</p>
            <p>AI-powered compliance assistant for regulated industries.</p>
            <p className="text-gray-400">
              This tool provides general compliance guidance and should not be used as a substitute for professional legal or safety advice.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="https://www.osha.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline flex items-center gap-0.5"
              >
                OSHA.gov <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a
                href="https://www.osha.gov/laws-regs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-600 hover:underline flex items-center gap-0.5"
              >
                Regulations <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
