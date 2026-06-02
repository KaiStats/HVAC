import { requireSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader orgName={session.orgName} />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-28 pt-6">
        {children}
      </main>
      <AppNav />
    </div>
  );
}
