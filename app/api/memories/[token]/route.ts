import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient, type SupabaseMemoryRow } from "../../../../lib/supabaseServer";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await context.params;
    if (!token) {
      return NextResponse.json({ error: "결과물을 찾을 수 없습니다." }, { status: 404 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from("memories")
      .select("id,title,recipient,message_text,selected_questions,answers,audio_url,created_at,email,access_token")
      .eq("access_token", token)
      .single<SupabaseMemoryRow>();

    if (error || !data) {
      return NextResponse.json({ error: "결과물을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      recipient: data.recipient,
      messageText: data.message_text,
      selectedQuestions: data.selected_questions,
      answers: data.answers,
      audioUrl: data.audio_url,
      createdAt: data.created_at,
      email: data.email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "결과물을 찾을 수 없습니다." },
      { status: 500 },
    );
  }
}
