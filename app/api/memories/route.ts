import { NextRequest, NextResponse } from "next/server";
import { createAccessToken } from "../../../lib/memoryToken";
import { getSupabaseServerClient } from "../../../lib/supabaseServer";

type CreateMemoryPayload = {
  answers?: string[];
  audioUrl?: string;
  email?: string;
  messageText?: string;
  recipient?: string;
  selectedQuestions?: string[];
  title?: string;
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateMemoryPayload;
    const email = payload.email?.trim();

    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
    }

    const accessToken = createAccessToken();
    const createdAt = new Date().toISOString();
    const supabase = getSupabaseServerClient();
    const row = {
      title: payload.title?.trim() || "Memory Room 기록",
      recipient: payload.recipient?.trim() || null,
      message_text: payload.messageText || "",
      selected_questions: payload.selectedQuestions ?? [],
      answers: payload.answers ?? [],
      audio_url: payload.audioUrl || null,
      created_at: createdAt,
      email,
      access_token: accessToken,
    };

    const { data, error } = await supabase
      .from("memories")
      .insert(row)
      .select("id, access_token")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      accessToken: data.access_token,
      url: `/memory/${data.access_token}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "결과물 저장에 실패했습니다." },
      { status: 500 },
    );
  }
}
