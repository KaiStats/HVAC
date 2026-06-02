import { createBrowserClient } from "@supabase/ssr";

import { PUBLIC_ENV } from "@/lib/env";

export function createClient() {
  return createBrowserClient(
    PUBLIC_ENV.supabaseUrl(),
    PUBLIC_ENV.supabaseAnonKey(),
  );
}
