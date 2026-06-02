import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export interface SessionContext {
  userId: string;
  email: string | null;
  orgId: string;
  orgName: string;
  orgVertical: string | null;
}

// Resolves the current user and their org. Returns null if not authenticated
// or not yet provisioned with a profile/org.
export async function getSessionContext(): Promise<SessionContext | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id, organizations(name, vertical)")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) return null;

  const org = profile.organizations as unknown as {
    name: string;
    vertical: string | null;
  } | null;

  return {
    userId: user.id,
    email: user.email ?? null,
    orgId: profile.org_id,
    orgName: org?.name ?? "Your workspace",
    orgVertical: org?.vertical ?? null,
  };
}

// For server components/routes that require a session.
export async function requireSession(): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/login");
  return ctx;
}
