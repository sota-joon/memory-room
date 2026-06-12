type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  0: SpeechRecognitionAlternative;
  length: number;
};

type SpeechRecognitionResultList = {
  [index: number]: SpeechRecognitionResult;
  length: number;
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionErrorEvent = {
  error: SpeechRecognitionErrorCode;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

type RecognitionCallbacks = {
  onEnd: () => void;
  onError: (message: string) => void;
  onResult: (text: string, isFinal: boolean) => void;
  onStart?: () => void;
};

export type SpeechRecognitionController = {
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionDiagnostics = {
  getUserMediaError?: string;
  getUserMediaState: "available" | "granted" | "denied" | "missing" | "not-requested";
  hasGetUserMedia: boolean;
  hasMediaDevices: boolean;
  hasNavigatorPermissions: boolean;
  hasSpeechRecognition: boolean;
  hasWebkitSpeechRecognition: boolean;
  isSecureContext: boolean;
  microphonePermission: "granted" | "denied" | "prompt" | "unknown" | "unsupported";
  selectedConstructor: "SpeechRecognition" | "webkitSpeechRecognition" | "none";
  userAgent: string;
};

const unsupportedMessage = "현재 브라우저는 음성인식을 지원하지 않습니다.";

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
}

export async function diagnoseSpeechRecognitionAccess(requestMicrophone = false): Promise<SpeechRecognitionDiagnostics> {
  const speechWindow = window as SpeechRecognitionWindow;
  const hasSpeechRecognition = Boolean(speechWindow.SpeechRecognition);
  const hasWebkitSpeechRecognition = Boolean(speechWindow.webkitSpeechRecognition);
  const hasMediaDevices = Boolean(navigator.mediaDevices);
  const hasGetUserMedia = Boolean(navigator.mediaDevices?.getUserMedia);
  const hasNavigatorPermissions = Boolean(navigator.permissions?.query);

  const diagnostics: SpeechRecognitionDiagnostics = {
    getUserMediaState: hasGetUserMedia ? "available" : "missing",
    hasGetUserMedia,
    hasMediaDevices,
    hasNavigatorPermissions,
    hasSpeechRecognition,
    hasWebkitSpeechRecognition,
    isSecureContext: window.isSecureContext,
    microphonePermission: hasNavigatorPermissions ? "unknown" : "unsupported",
    selectedConstructor: hasSpeechRecognition
      ? "SpeechRecognition"
      : hasWebkitSpeechRecognition
        ? "webkitSpeechRecognition"
        : "none",
    userAgent: navigator.userAgent,
  };

  if (hasNavigatorPermissions) {
    try {
      const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
      diagnostics.microphonePermission = status.state;
    } catch {
      diagnostics.microphonePermission = "unsupported";
    }
  }

  if (requestMicrophone && hasGetUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      diagnostics.getUserMediaState = "granted";
      diagnostics.microphonePermission = "granted";
    } catch (error) {
      diagnostics.getUserMediaState = "denied";
      diagnostics.getUserMediaError = error instanceof DOMException ? error.name : "UnknownError";
      if (diagnostics.getUserMediaError === "NotAllowedError") {
        diagnostics.microphonePermission = "denied";
      }
    }
  } else if (!requestMicrophone) {
    diagnostics.getUserMediaState = "not-requested";
  }

  console.info("[Memory Room] Speech recognition diagnostics", diagnostics);
  return diagnostics;
}

export function createKoreanSpeechRecognition({
  onEnd,
  onError,
  onResult,
  onStart,
}: RecognitionCallbacks): SpeechRecognitionController | null {
  if (typeof window === "undefined") return null;

  const speechWindow = window as SpeechRecognitionWindow;
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  if (!Recognition) {
    onError(unsupportedMessage);
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = onStart ?? null;

  recognition.onresult = (event) => {
    const finalPhrases: string[] = [];
    const interimPhrases: string[] = [];

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result?.[0]?.transcript?.trim();
      if (!transcript) continue;

      if (result.isFinal) {
        finalPhrases.push(transcript);
      } else {
        interimPhrases.push(transcript);
      }
    }

    if (finalPhrases.length > 0) {
      onResult(finalPhrases.join(" "), true);
      return;
    }

    if (interimPhrases.length > 0) {
      onResult(interimPhrases.join(" "), false);
    }
  };

  recognition.onerror = (event) => {
    onError(getRecognitionErrorMessage(event.error));
    onEnd();
  };

  recognition.onend = onEnd;

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}

export function getUnsupportedSpeechRecognitionMessage() {
  return unsupportedMessage;
}

export function getSpeechRecognitionStartErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 접근을 허용해주세요.";
    }
    if (error.name === "InvalidStateError") {
      return "음성인식이 이미 실행 중입니다. 잠시 후 다시 시도해주세요.";
    }
    if (error.name === "NotFoundError") {
      return "마이크를 찾을 수 없습니다. 기기의 마이크 연결 상태를 확인해주세요.";
    }
  }
  return "음성인식을 시작하지 못했습니다. 모바일에서는 브라우저 호환성 문제일 수 있어 마이크 녹음을 이용해주세요.";
}

export function getSpeechRecognitionFallbackMessage(diagnostics: SpeechRecognitionDiagnostics) {
  if (diagnostics.selectedConstructor === "none") {
    return "현재 브라우저는 음성인식을 지원하지 않습니다. 마이크 녹음으로 기록한 뒤 서버 STT로 변환하는 방식이 필요합니다.";
  }
  if (diagnostics.getUserMediaState === "denied") {
    return "마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.";
  }
  if (!diagnostics.isSecureContext) {
    return "마이크와 음성인식은 HTTPS 또는 localhost 환경에서만 안정적으로 동작합니다.";
  }
  return "";
}

function getRecognitionErrorMessage(error: SpeechRecognitionErrorCode) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "마이크 권한이 필요합니다. 브라우저 설정에서 마이크 접근을 허용해주세요.";
  }
  if (error === "audio-capture") {
    return "마이크를 찾을 수 없습니다. 기기의 마이크 연결 상태를 확인해주세요.";
  }
  if (error === "no-speech") {
    return "음성이 들리지 않았습니다. 조금 더 가까이에서 다시 말해보세요.";
  }
  if (error === "network") {
    return "음성인식 연결이 원활하지 않습니다. 네트워크 상태를 확인한 뒤 다시 시도해주세요.";
  }
  if (error === "language-not-supported") {
    return "현재 브라우저에서 한국어 음성인식을 사용할 수 없습니다.";
  }
  return "음성인식을 시작하지 못했습니다. 모바일에서는 마이크 녹음으로 진행해주세요.";
}
