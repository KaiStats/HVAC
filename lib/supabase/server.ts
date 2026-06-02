import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { PUBLIC_ENV } from "@/lib/env";

// Request-scoped Supabase client that reads/writes the auth cookie.
// RLS is enforced because it uses the caller's session, not the service role.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    PUBLIC_ENV.supabaseUrl(),
    PUBLIC_ENV.supabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — safe to ignore; middleware
            // refreshes the session cookie on the next request.
          }
        },
      },
    },
  );
}
