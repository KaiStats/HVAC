"use client";

import { AlertTriangle, Info, AlertCircle, XCircle, ExternalLink, Calendar } from "lucide-react";
import { COMPLIANCE_ALERTS } from "@/lib/compliance-data";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const SEVERITY_CONFIG = {
  low: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", label: "Low" },
  medium: { icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "Medium" },
  high: { icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", label: "High" },
  critical: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Critical" },
};

export function AlertsPanel() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Compliance Alerts</h2>
        <p className="text-sm text-gray-500 mt-0.5">Recent regulatory updates and action items</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {COMPLIANCE_ALERTS.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={cn(
                "rounded-xl border p-4 transition-all hover:shadow-md cursor-default",
                config.bg,
                config.border
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex-shrink-0", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-gray-800 text-sm">{alert.title}</h3>
                    <Badge
                      className={cn("text-xs", config.color, config.bg, config.border)}
                    >
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {alert.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-mono bg-white/60 px-1.5 py-0.5 rounded border border-current/20">
                        {alert.regulation}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Effective: {alert.effectiveDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="text-center py-6">
          <p className="text-sm text-gray-400">
            Showing {COMPLIANCE_ALERTS.length} recent alerts.{" "}
            <a
              href="https://www.osha.gov/laws-regs/regulations/standardnumber"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              View all OSHA standards
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
