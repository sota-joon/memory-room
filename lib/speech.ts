type SpeakOptions = {
  onEnd?: () => void;
  onError?: (message: string) => void;
  onStart?: () => void;
};

function findKoreanVoice() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;

  const voices = window.speechSynthesis.getVoices();
  const scoredVoices = voices
    .filter((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      return lang.includes("ko") || name.includes("korean") || name.includes("ko-kr");
    })
    .map((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();
      let score = 0;
      if (lang === "ko-kr") score += 5;
      if (name.includes("korean")) score += 3;
      if (name.includes("ko-kr")) score += 3;
      if (name.includes("natural")) score += 1;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scoredVoices[0]?.voice;
}

export function speakKorean(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onError?.("현재 브라우저에서는 질문 음성 재생을 지원하지 않습니다.");
    return false;
  }

  const cleanText = text.trim();
  if (!cleanText) {
    options.onError?.("재생할 질문이 없습니다.");
    return false;
  }

  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();

  const sentences = splitSentences(cleanText);
  const voice = findKoreanVoice();
  options.onStart?.();
  playSentenceQueue(sentences, voice, options);

  return true;
}

export function cancelSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

function playSentenceQueue(sentences: string[], voice: SpeechSynthesisVoice | undefined, options: SpeakOptions) {
  const [current, ...rest] = sentences;
  if (!current) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(current);
  if (voice) utterance.voice = voice;
  utterance.lang = "ko-KR";
  utterance.rate = 0.86;
  utterance.pitch = 0.92;
  utterance.volume = 0.95;

  utterance.onend = () => {
    window.setTimeout(() => playSentenceQueue(rest, voice, options), 180);
  };
  utterance.onerror = () => {
    options.onError?.("질문 음성을 재생하지 못했습니다. 기기의 음량과 브라우저 설정을 확인해주세요.");
    options.onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

function splitSentences(text: string) {
  const normalized = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  const matches = normalized.match(/[^.!?。！？]+[.!?。！？]?/g);
  return (matches?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalized]).slice(0, 5);
}
