// lib/supabase/admin.ts
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Bypasses RLS via the service_role key. Only for Route Handlers, Server
// Actions, and other server-only code (middleware.ts included) — the
// "server-only" import above makes an accidental Client Component import
// fail the build instead of shipping this key to the browser.
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
