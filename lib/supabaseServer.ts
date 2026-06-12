import { createClient } from "@supabase/supabase-js";

export type SupabaseMemoryRow = {
  id: string;
  title: string;
  recipient: string | null;
  message_text: string;
  selected_questions: string[];
  answers: string[];
  audio_url: string | null;
  created_at: string;
  email: string;
  access_token: string;
};

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase 환경변수가 설정되지 않았습니다.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}
