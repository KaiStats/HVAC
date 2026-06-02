"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleQuestion, FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Ask", icon: MessageCircleQuestion },
  { href: "/documents", label: "Documents", icon: FileText },
];

// Mobile-first bottom navigation with large tap targets.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-sm font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-6" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
