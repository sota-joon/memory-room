import { createClient } from "@supabase/supabase-js";

export type SupabaseMemoryRow = {
  access_token: string;
  answers: string[];
  audio_url: string | null;
  created_at: string;
  email: string;
  id: string;
  message_text: string;
  recipient: string | null;
  selected_questions: string[];
  title: string;
};

export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 환경변수가 설정되어 있지 않습니다. SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY를 .env.local에 추가해주세요.",
    );
  }

  if (isPlaceholder(url) || isPlaceholder(key)) {
    throw new Error(
      ".env.local의 Supabase 값이 아직 예시값입니다. 실제 SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY로 교체해주세요.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
}

function isPlaceholder(value: string) {
  return /your-|your_|example|project/i.test(value);
}
