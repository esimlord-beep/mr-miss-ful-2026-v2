import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";

// Browser-only client. This file must NEVER import or reference
// SUPABASE_SERVICE_ROLE_KEY — anything in this file can end up in the
// client-side JS bundle, and that key must never reach the browser.
//
// IMPORTANT: uses createBrowserSupabaseClient (not the plain createClient)
// specifically so the auth session is stored in cookies, not localStorage.
// The judge-route middleware check (src/middleware.ts) only ever looks at
// request cookies to decide if someone is logged in — a localStorage-only
// session is invisible to it, which was silently bouncing judges back to
// /judge/login right after a successful login with no error shown.
export const browserSupabase = createBrowserSupabaseClient();
