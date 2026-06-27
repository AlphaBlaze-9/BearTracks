// supabase.js: Initializes and exports the shared Supabase client for BearTracks.
// This single instance is imported by AuthContext, ItemsContext, and any other module
// that needs to read from or write to the Supabase database, auth service, or storage bucket.
// Using one shared client prevents unnecessary duplicate connections.

import { createClient } from "@supabase/supabase-js";

// ── Project Credentials ──────────────────────────────────────────────────────
// The URL and anon key are both safe to expose in client-side code.
// The anon key grants only public, Row Level Security (RLS)-controlled access —
// no privileged operations can be performed with it.
const supabaseUrl = "https://ihqockeyvuemsvvzjzoy.supabase.co";
const supabaseAnonKey = "sb_publishable_l_NFDZ9DukoNBeqkjI7iog_VJOgMF_2";

// ── Client Export ────────────────────────────────────────────────────────────
// createClient sets up the connection to our Supabase project, handling auth
// session persistence (via localStorage), real-time subscriptions, and REST calls.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
