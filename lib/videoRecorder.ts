export type VideoRecorderSession = {
  mediaRecorder: MediaRecorder;
  stream: MediaStream;
  stop: () => Promise<Blob>;
};

const unsupportedMessage =
  "현재 브라우저에서는 영상 기록이 지원되지 않습니다. 최신 Chrome 사용을 권장합니다.";
const permissionMessage = "카메라와 마이크 권한이 필요합니다. 브라우저 설정에서 카메라와 마이크 접근을 허용해주세요.";

export async function startVideoRecorder(): Promise<VideoRecorderSession> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error(unsupportedMessage);
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error(unsupportedMessage);
  }

  try {
    const stream = await getCameraStream();
    return createVideoSession(stream);
  } catch (error) {
    throw new Error(getVideoRecorderErrorMessage(error));
  }
}

export function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

export function createVideoFileName(customerName: string, createdAt = new Date()) {
  const safeName = (customerName || "guest").replace(/[\\/:*?"<>|]/g, "").trim() || "guest";
  const date = createdAt.toISOString().slice(0, 10);
  return `memory-interview-${safeName}-${date}.webm`;
}

async function getCameraStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: "user",
        width: { ideal: 960 },
        height: { ideal: 540 },
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "OverconstrainedError") {
      return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    }
    throw error;
  }
}

function createVideoSession(stream: MediaStream): VideoRecorderSession {
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
          stopStream(stream);
          resolve(new Blob(chunks, { type: mimeType || "video/webm" }));
        };
        if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
      }),
  };
}

function getSupportedMimeType() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}

function getVideoRecorderErrorMessage(error: unknown) {
  if (!(error instanceof DOMException)) {
    return error instanceof Error ? error.message : "영상 기록을 시작하지 못했습니다.";
  }

  if (error.name === "NotAllowedError" || error.name === "SecurityError") {
    return permissionMessage;
  }
  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return "카메라 또는 마이크를 찾을 수 없습니다. 기기 연결 상태를 확인해 주세요.";
  }
  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "카메라 또는 마이크를 사용할 수 없습니다. 다른 앱에서 사용 중인지 확인해 주세요.";
  }
  if (error.name === "OverconstrainedError") {
    return "현재 기기에서 요청한 영상 설정을 사용할 수 없습니다.";
  }

  return permissionMessage;
}
