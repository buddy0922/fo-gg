// app/lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ 서버에서만 import해서 쓰기 (Route Handler용)
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});