import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        {
          "bg-gray-100 text-gray-700 border-gray-200": variant === "default",
          "bg-transparent border-current": variant === "outline",
          "bg-green-50 text-green-700 border-green-200": variant === "success",
          "bg-yellow-50 text-yellow-700 border-yellow-200": variant === "warning",
          "bg-red-50 text-red-700 border-red-200": variant === "danger",
          "bg-blue-50 text-blue-700 border-blue-200": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
