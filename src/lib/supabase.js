import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "asujqyqcjpsgqwrgyrjx";
const supabaseAnonKey = "sb_publishable_3huhP6xU4Xk27W2-u8WluQ_UJm034jJ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
