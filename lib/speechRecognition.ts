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
  onResult: (text: string) => void;
};

export type SpeechRecognitionController = {
  start: () => void;
  stop: () => void;
};

const unsupportedMessage =
  "현재 브라우저에서는 음성인식이 지원되지 않습니다. Chrome 사용을 권장합니다.";

export function isSpeechRecognitionSupported() {
  if (typeof window === "undefined") return false;
  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
}

export function createKoreanSpeechRecognition({
  onEnd,
  onError,
  onResult,
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
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const phrases: string[] = [];
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      if (result?.isFinal && result[0]?.transcript) {
        phrases.push(result[0].transcript.trim());
      }
    }
    if (phrases.length > 0) onResult(phrases.join(" "));
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

function getRecognitionErrorMessage(error: SpeechRecognitionErrorCode) {
  if (error === "not-allowed" || error === "service-not-allowed") {
    return "마이크 사용 권한이 허용되지 않았습니다. 브라우저의 마이크 권한을 확인해 주세요.";
  }
  if (error === "audio-capture") {
    return "마이크를 찾을 수 없습니다. 기기의 마이크 연결 상태를 확인해 주세요.";
  }
  if (error === "no-speech") {
    return "음성이 들리지 않았습니다. 조금 더 가까이에서 다시 말해보세요.";
  }
  if (error === "network") {
    return "음성인식 연결이 원활하지 않습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.";
  }
  if (error === "language-not-supported") {
    return "현재 브라우저에서 한국어 음성인식을 사용할 수 없습니다.";
  }
  return "음성인식을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
