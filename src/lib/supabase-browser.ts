import { createClient } from "@supabase/supabase-js";

// Browser-only client. This file must NEVER import or reference
// SUPABASE_SERVICE_ROLE_KEY — anything in this file can end up in the
// client-side JS bundle, and that key must never reach the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const browserSupabase = createClient(supabaseUrl, supabaseAnonKey);
