import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const audio = formData.get("audio");
  const provider = String(formData.get("provider") || "openai-whisper");

  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: "변환할 음성 파일이 없습니다." }, { status: 400 });
  }

  return NextResponse.json(
    {
      error:
        provider === "deepgram"
          ? "Deepgram STT 연결은 준비되어 있지만 아직 API 키가 설정되지 않았습니다."
          : "OpenAI Whisper STT 연결은 준비되어 있지만 아직 API 키가 설정되지 않았습니다.",
    },
    { status: 501 },
  );
}
