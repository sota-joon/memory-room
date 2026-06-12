export type AudioRecorderSession = {
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  stop: () => Promise<Blob>;
};

const permissionMessage = "마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.";
const unsupportedMessage =
  "현재 브라우저에서는 음성 녹음이 지원되지 않습니다. Chrome 사용을 권장합니다.";

export async function startAudioRecorder(): Promise<AudioRecorderSession> {
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
  return `memory-vault-audio-${safeName}-${date}.webm`;
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
      new Promise((resolve) => {
        mediaRecorder.onstop = () => {
          stopAudioStream(stream);
          resolve(new Blob(chunks, { type: mimeType || "audio/webm" }));
        };
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }),
  };
}

function getSupportedMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function getAudioRecorderErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return error instanceof Error ? error.message : "오디오 녹음을 시작하지 못했습니다.";
  }

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return permissionMessage;
  }
  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return "마이크를 찾을 수 없습니다. 기기 연결 상태를 확인해 주세요.";
  }
  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "마이크를 사용할 수 없습니다. 다른 앱에서 사용 중인지 확인해 주세요.";
  }

  return permissionMessage;
}
