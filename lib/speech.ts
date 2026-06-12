type SpeakOptions = {
  onEnd?: () => void;
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
      if (name.includes("female")) score -= 1;
      if (name.includes("natural")) score += 1;
      return { voice, score };
    })
    .sort((a, b) => b.score - a.score);

  return scoredVoices[0]?.voice;
}

export function speakKorean(text: string, options: SpeakOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const play = () => {
    const sentences = splitSentences(text);
    const koreanVoice = findKoreanVoice();
    options.onStart?.();
    playSentenceQueue(sentences, koreanVoice, options.onEnd);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = play;
    return;
  }

  play();
}

export function cancelSpeech() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

function playSentenceQueue(
  sentences: string[],
  voice?: SpeechSynthesisVoice,
  onEnd?: () => void,
) {
  const [current, ...rest] = sentences;
  if (!current) {
    onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(current);
  if (voice) utterance.voice = voice;
  utterance.lang = "ko-KR";
  utterance.rate = 0.82;
  utterance.pitch = 0.9;
  utterance.volume = 0.9;
  utterance.onend = () => {
    window.setTimeout(() => playSentenceQueue(rest, voice, onEnd), 220);
  };
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
}

function splitSentences(text: string) {
  return text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?。]|[요다까죠군요네요어요])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
