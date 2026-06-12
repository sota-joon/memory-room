export type SttProvider = "openai-whisper" | "deepgram";

export type SttTranscriptionRequest = {
  audio: Blob;
  language?: string;
  provider?: SttProvider;
};

export type SttTranscriptionResult = {
  provider: SttProvider;
  text: string;
};

export async function transcribeAudioWithServer({
  audio,
  language = "ko",
  provider = "openai-whisper",
}: SttTranscriptionRequest): Promise<SttTranscriptionResult> {
  const formData = new FormData();
  formData.append("audio", audio, "memory-room-audio.webm");
  formData.append("language", language);
  formData.append("provider", provider);

  const response = await fetch("/api/stt", {
    method: "POST",
    body: formData,
  });
  const data = (await response.json()) as { error?: string; provider?: SttProvider; text?: string };

  if (!response.ok || !data.text || !data.provider) {
    throw new Error(data.error || "음성을 텍스트로 변환하지 못했습니다.");
  }

  return {
    provider: data.provider,
    text: data.text,
  };
}
