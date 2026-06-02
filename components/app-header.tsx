import Link from "next/link";
import { ShieldCheck, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppHeader({ orgName }: { orgName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" />
          <span className="text-lg font-bold leading-none">
            Compliance Copilot
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {orgName}
          </span>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
              <LogOut className="size-5" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
