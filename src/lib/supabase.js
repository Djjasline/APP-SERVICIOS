import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://asujqyqcjpsqgwrgyrix.supabase.co";
const supabaseAnonKey = "sb_publishable_3huhP6xU4Xk27W2r-u8WluQ_UJm034jJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
