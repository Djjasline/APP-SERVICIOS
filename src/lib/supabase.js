import { createClient } from "@supabase/supabase-js";

// Prefer environment variables injected by Vite (VITE_SUPABASE_*).
// Fall back to the existing hardcoded values to keep backwards compatibility
// in environments that haven't been migrated yet.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://asujqyqcjpsgqwrgyrjx.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_3huhP6xU4Xk27W2-u8WluQ_UJm034jJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
