import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON!,
  {
    auth: {
      persistSession: false,   // 🔥 KEY FIX
      autoRefreshToken: false,
    },
  }
);