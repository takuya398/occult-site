import { createClient } from "@supabase/supabase-js";

// service_role key を使うサーバー専用クライアント（RLS をスキップ）
// このファイルはサーバーサイドのみで使用すること（"use server" ファイル内のみ）
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL または SUPABASE_SERVICE_ROLE_KEY が未設定です"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
