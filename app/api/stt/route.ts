import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type OpenAITranscriptionResponse = {
  text?: string;
  error?: {
    message?: string;
  };
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY가 설정되어 있지 않습니다. .env.local에 API 키를 추가해주세요." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");
  const language = String(formData.get("language") || "ko");

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "변환할 음성 파일이 없습니다." }, { status: 400 });
  }

  const openAiForm = new FormData();
  const extension = getAudioExtension(audio.type);
  openAiForm.append("file", audio, `memory-room-audio.${extension}`);
  openAiForm.append("model", "whisper-1");
  openAiForm.append("language", language);
  openAiForm.append("response_format", "json");

  try {
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: openAiForm,
    });

    const data = (await response.json()) as OpenAITranscriptionResponse;
    if (!response.ok || !data.text) {
      return NextResponse.json(
        { error: data.error?.message || "OpenAI 음성 변환에 실패했습니다." },
        { status: response.status || 500 },
      );
    }

    return NextResponse.json({
      provider: "openai-whisper",
      text: data.text,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "OpenAI 음성 변환 요청에 실패했습니다." },
      { status: 500 },
    );
  }
}

function getAudioExtension(mimeType: string) {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}
