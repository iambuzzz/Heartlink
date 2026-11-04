import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

let client: SupabaseClient | null = null;

// Service-role client: bypasses row-level security, so it must never reach the browser.
// Every table has RLS on with no policies, which keeps the public anon key useless.
export function db(): SupabaseClient {
  if (!client) {
    if (!env.supabaseUrl || !env.supabaseServiceKey) throw new Error("Supabase is not configured");
    client = createClient(env.supabaseUrl, env.supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
