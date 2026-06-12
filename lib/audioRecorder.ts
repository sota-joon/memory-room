export type AudioRecorderSession = {
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  stop: () => Promise<Blob>;
};

const permissionMessage = "마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.";
const unsupportedMessage =
  "현재 브라우저에서는 음성 녹음이 지원되지 않습니다. 최신 Chrome 또는 Safari를 사용해주세요.";

export async function startAudioRecorder(): Promise<AudioRecorderSession> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new Error("마이크는 HTTPS 또는 localhost 환경에서만 사용할 수 있습니다. 모바일에서는 HTTPS 주소로 접속해주세요.");
  }

  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error(unsupportedMessage);
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(unsupportedMessage);
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return createAudioSession(stream);
  } catch (error) {
    throw new Error(getAudioRecorderErrorMessage(error));
  }
}

export function stopAudioStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function createAudioFileName(name: string, createdAt = new Date()) {
  const safeName = (name || "guest").replace(/[\\/:*?"<>|]/g, "").trim() || "guest";
  const date = createdAt.toISOString().slice(0, 10);
  return `memory-room-audio-${safeName}-${date}.webm`;
}

function createAudioSession(stream: MediaStream): AudioRecorderSession {
  const chunks: BlobPart[] = [];
  const mimeType = getSupportedMimeType();
  const mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };

  mediaRecorder.start();

  return {
    mediaRecorder,
    stream,
    stop: () =>
      new Promise((resolve, reject) => {
        mediaRecorder.onerror = () => reject(new Error("녹음 중 오류가 발생했습니다."));
        mediaRecorder.onstop = () => {
          stopAudioStream(stream);
          resolve(new Blob(chunks, { type: mimeType || "audio/webm" }));
        };
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }),
  };
}

function getSupportedMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function getAudioRecorderErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return error instanceof Error ? error.message : "음성 녹음을 시작하지 못했습니다.";
  }

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return permissionMessage;
  }
  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return "마이크를 찾을 수 없습니다. 기기의 마이크 연결 상태를 확인해주세요.";
  }
  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "마이크를 사용할 수 없습니다. 다른 앱에서 마이크를 사용 중인지 확인해주세요.";
  }
  if (error.name === "AbortError") {
    return "마이크 연결이 중단되었습니다. 다시 시도해주세요.";
  }

  return permissionMessage;
}
