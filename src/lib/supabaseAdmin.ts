import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY service role client.
// Must ONLY be used inside server-side code (API routes / server components).
// NEVER import this into client components or expose the key.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const supabaseAdmin =
  url && serviceKey
    ? createClient(url, serviceKey, { auth: { persistSession: false } })
    : null;

export const isAdminConfigured = Boolean(url && serviceKey);
