import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env, integrations } from "./config";

// Server-side client using the service role key. Only import from server code
// (route handlers, server components, server actions) — never ship this to the
// browser. Returns null when Supabase isn't configured yet.
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!integrations.supabase) return null;
  if (cached) return cached;
  cached = createClient(env.supabaseUrl!, env.supabaseServiceKey!, {
    auth: { persistSession: false },
  });
  return cached;
}
