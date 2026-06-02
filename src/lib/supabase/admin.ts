import { createClient } from "@supabase/supabase-js";

import { PUBLIC_ENV, SERVER_ENV } from "@/lib/env";

// SERVER ONLY. Bypasses RLS via the service role key.
// Use exclusively for the ingestion pipeline, and always set org_id explicitly.
export function createAdminClient() {
  return createClient(
    PUBLIC_ENV.supabaseUrl(),
    SERVER_ENV.supabaseServiceRoleKey(),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
