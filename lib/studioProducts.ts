import type { ContentType } from "./types";

export type StudioKind = "family" | "future" | "kpop" | "performance" | "life" | "visitor";

export type StudioProductConfig = {
  archiveTitle: string;
  description: string;
  fields: Array<"name" | "age" | "target" | "relationship" | "occupation" | "topic" | "mood" | "visibility" | "output">;
  firstQuestion: (profile: StudioProfile) => string;
  kind: StudioKind;
  outputLabels: string[];
  producerRole: string;
  recordMode: "conversation" | "audio" | "video" | "mixed";
  sessionTitle: string;
  setupTitle: string;
  studioTitle: string;
};

export type StudioProfile = {
  age: string;
  mood: string;
  name: string;
  occupation: string;
  output: string;
  relationship: string;
  target: string;
  topic: string;
  visibility: string;
};

export function getStudioKind(type: ContentType): StudioKind {
  if (type === "future_self") return "future";
  if (type === "kpop_recording" || type === "kpop_experience") return "kpop";
  if (type === "live_performance") return "performance";
  if (type === "parent_life_book" || type === "artist_interview" || type === "founder_story") return "life";
  if (type === "korea_trip" || type === "kdrama_message" || type === "seoul_night_letter") return "visitor";
  return "family";
}

export function getStudioConfig(type: ContentType): StudioProductConfig {
  const kind = getStudioKind(type);
  return studioConfigs[kind];
}

export function createStudioQuestion(kind: StudioKind, profile: StudioProfile, answers: string[]) {
  if (!answers.length) return studioConfigs[kind].firstQuestion(profile);
  const last = answers.at(-1) || "";
  const keyword = pickKeyword(last) || profile.topic || profile.target || "그 장면";
  const bank = followUpBanks[kind];
  return bank[Math.min(answers.length - 1, bank.length - 1)](profile, keyword);
}

export function createStudioOutputs(kind: StudioKind, profile: StudioProfile, answers: string[]) {
  const config = studioConfigs[kind];
  const answerText = answers.filter(Boolean).join(" / ") || profile.topic || "아직 기록되지 않은 이야기";
  const emotion = inferEmotion(`${profile.topic} ${answerText}`);
  const coreSentence = pickCoreSentence(answers, profile);

  return {
    title: config.archiveTitle,
    coreSentence,
    emotionTags: [emotion, profile.mood || "calm", kindLabel[kind]],
    summary: createSummary(kind, profile, answerText),
    cards: config.outputLabels.map((label, index) => ({
      label,
      title: resultTitles[kind][index] ?? label,
      body: resultBodies[kind][index]?.(profile, coreSentence, emotion) ?? coreSentence,
    })),
  };
}

const studioConfigs: Record<StudioKind, StudioProductConfig> = {
  family: {
    archiveTitle: "Family Memory Vault",
    description: "가족관계, 기억, 고마움, 미안함, 꼭 전하고 싶은 말을 따라가는 감정 기록 스튜디오입니다.",
    fields: ["name", "age", "target", "relationship", "topic", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "고객"}님, 오늘은 ${profile.target || "소중한 사람"}에게 남길 기록을 준비했습니다. 먼저 가장 전하고 싶은 말부터 편하게 이야기해주실 수 있을까요?`,
    kind: "family",
    outputLabels: ["편지", "음성 메시지", "영상 메시지", "핵심 문장 카드"],
    producerRole: "따뜻한 기록 작가",
    recordMode: "mixed",
    sessionTitle: "가족 기억 인터뷰",
    setupTitle: "가족에게 남길 마음을 준비합니다",
    studioTitle: "가족에게 남기는 기록",
  },
  future: {
    archiveTitle: "Future Self Capsule",
    description: "현재의 고민, 목표, 약속을 미래의 나에게 보내는 타임캡슐 세션입니다.",
    fields: ["name", "age", "occupation", "topic", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "고객"}님, 미래의 나에게 남기고 싶은 주제가 "${profile.topic || "오늘의 마음"}"이군요. 미래의 내가 꼭 기억했으면 하는 지금의 마음은 무엇인가요?`,
    kind: "future",
    outputLabels: ["미래 편지", "목표 선언문", "감정 기록"],
    producerRole: "타임캡슐 에디터",
    recordMode: "conversation",
    sessionTitle: "미래의 나 인터뷰",
    setupTitle: "미래의 나에게 보낼 시간을 정리합니다",
    studioTitle: "미래의 나에게",
  },
  kpop: {
    archiveTitle: "K-POP Recording Vault",
    description: "곡 또는 MR을 선택하고 녹음한 뒤, 그 노래와 연결된 기억을 인터뷰합니다.",
    fields: ["name", "age", "topic", "target", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "고객"}님, 선택하신 노래는 "${profile.topic || "오늘의 노래"}"입니다. 이 노래를 고르신 이유부터 편하게 이야기해주실 수 있을까요?`,
    kind: "kpop",
    outputLabels: ["녹음 파일", "곡 선택 이유", "노래와 연결된 기억", "감정 카드", "공유용 앨범 페이지"],
    producerRole: "음악 프로듀서",
    recordMode: "audio",
    sessionTitle: "녹음 후 AI 인터뷰",
    setupTitle: "곡을 선택하고 녹음 세션을 준비합니다",
    studioTitle: "K-POP Recording Experience",
  },
  performance: {
    archiveTitle: "Live Performance Archive",
    description: "공연 콘셉트, 무대명, 곡명, 목적을 정하고 카메라/마이크로 공연을 기록합니다.",
    fields: ["name", "age", "occupation", "topic", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "공연자"}님, "${profile.topic || "오늘의 무대"}" 공연을 기록했습니다. 이 무대에서 관객에게 가장 남기고 싶었던 메시지는 무엇인가요?`,
    kind: "performance",
    outputLabels: ["공연 영상", "공연 소개글", "무대 의도", "관객에게 남기는 말"],
    producerRole: "기록 감독",
    recordMode: "video",
    sessionTitle: "공연 후 인터뷰",
    setupTitle: "무대와 녹화 환경을 준비합니다",
    studioTitle: "라이브 공연 기록",
  },
  life: {
    archiveTitle: "Life Interview Archive",
    description: "직업, 전공, 삶의 배경을 바탕으로 맞춤형 질문을 생성하는 인생 인터뷰입니다.",
    fields: ["name", "age", "occupation", "topic", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "고객"}님은 ${profile.occupation || "지금까지의 삶"}을 중심으로 기록을 남기려 합니다. 오늘 이야기의 시작점이 된 장면은 무엇인가요?`,
    kind: "life",
    outputLabels: ["인터뷰 전문", "인생 요약문", "챕터별 기록", "대표 문장"],
    producerRole: "다큐멘터리 인터뷰어",
    recordMode: "conversation",
    sessionTitle: "맞춤형 인생 인터뷰",
    setupTitle: "직업, 전공, 삶의 배경을 입력합니다",
    studioTitle: "인생 인터뷰",
  },
  visitor: {
    archiveTitle: "Visitor Memory Vault",
    description: "한국 여행, K-콘텐츠 체험, 서울의 밤을 외국인도 쉽게 기록하는 스튜디오입니다.",
    fields: ["name", "age", "target", "topic", "mood", "visibility", "output"],
    firstQuestion: (profile) =>
      `${profile.name || "고객"}님, 오늘 남기고 싶은 한국의 기억은 "${profile.topic || "이번 여행"}"입니다. 이 순간이 특별했던 이유는 무엇인가요?`,
    kind: "visitor",
    outputLabels: ["여행 기억 카드", "영상 메시지", "공유용 기록 페이지"],
    producerRole: "여행 기록 디렉터",
    recordMode: "mixed",
    sessionTitle: "여행 기억 인터뷰",
    setupTitle: "오늘 남기고 싶은 한국의 순간을 선택합니다",
    studioTitle: "외국인 전용 기록",
  },
};

const followUpBanks: Record<StudioKind, Array<(profile: StudioProfile, keyword: string) => string>> = {
  family: [
    (profile, keyword) => `"${keyword}"이라는 말이 남았습니다. ${profile.target || "그 사람"}의 표정이나 목소리 중 가장 먼저 떠오르는 것은 무엇인가요?`,
    (profile) => `${profile.target || "그 사람"}에게 고마움이나 미안함 중 하나를 꼭 남긴다면 어떤 말이 좋을까요?`,
    () => "가족들이 이 기록을 다시 볼 때, 어떤 마음으로 받아들이면 좋겠나요?",
  ],
  future: [
    (_profile, keyword) => `"${keyword}"이 미래에도 남아 있다면 어떤 모습이면 좋겠나요?`,
    () => "지금의 고민을 미래의 나에게 솔직히 설명한다면 어떤 문장이 될까요?",
    () => "미래의 나에게 꼭 지켜달라고 말하고 싶은 약속은 무엇인가요?",
  ],
  kpop: [
    (_profile, keyword) => `"${keyword}"이 이 노래와 연결되어 있군요. 이 노래를 들려주고 싶은 사람이 있나요?`,
    () => "이 노래를 녹음한 오늘의 감정을 색깔이나 장면으로 표현한다면 무엇인가요?",
    () => "공유용 앨범 페이지에 꼭 들어갔으면 하는 한 문장은 무엇인가요?",
  ],
  performance: [
    (_profile, keyword) => `"${keyword}"이 무대의 중심에 있었군요. 공연 중 가장 살아 있었다고 느낀 순간은 언제인가요?`,
    () => "관객이 이 영상을 볼 때 어떤 의도를 느꼈으면 하나요?",
    () => "공연 소개글의 첫 문장으로 남기고 싶은 말은 무엇인가요?",
  ],
  life: [
    (profile, keyword) => `${profile.occupation || "그 분야"} 안에서 "${keyword}"은 어떤 의미로 남아 있나요?`,
    () => "처음 시작하던 시절과 지금의 나를 비교하면 가장 달라진 것은 무엇인가요?",
    () => "당신의 삶을 한 챕터로 나눈다면 오늘 이야기는 어떤 제목이 어울릴까요?",
  ],
  visitor: [
    (_profile, keyword) => `"${keyword}"과 함께 떠오르는 장소, 소리, 음식, 사람은 무엇인가요?`,
    () => "이 기록을 언젠가 누구에게 보여주고 싶나요?",
    () => "오늘의 한국 기억을 한 문장으로 남긴다면 어떻게 쓰고 싶나요?",
  ],
};

const kindLabel: Record<StudioKind, string> = {
  family: "family",
  future: "future",
  kpop: "music",
  performance: "stage",
  life: "life",
  visitor: "travel",
};

const resultTitles: Record<StudioKind, string[]> = {
  family: ["가족에게 남기는 편지", "목소리로 남긴 마음", "영상 메시지", "핵심 문장"],
  future: ["미래 편지", "목표 선언문", "오늘의 감정"],
  kpop: ["녹음 파일", "선택한 이유", "노래와 기억", "감정 카드", "앨범 페이지"],
  performance: ["공연 영상", "공연 소개글", "무대 의도", "관객 메시지"],
  life: ["인터뷰 전문", "인생 요약문", "챕터 기록", "대표 문장"],
  visitor: ["여행 기억 카드", "영상 메시지", "공유 페이지"],
};

const resultBodies: Record<StudioKind, Array<(profile: StudioProfile, core: string, emotion: string) => string>> = {
  family: [
    (profile, core) => `${profile.target || "가족"}에게 직접 전하는 문장으로 정리됩니다. 핵심 문장: ${core}`,
    () => "마이크로 남긴 음성 기록이 이 세션에 함께 보관됩니다.",
    () => "원하면 얼굴과 목소리가 함께 담긴 영상 메시지를 저장합니다.",
    (_profile, core) => core,
  ],
  future: [
    (_profile, core) => `미래의 내가 다시 열어볼 편지입니다. ${core}`,
    (profile) => `${profile.topic || "오늘의 목표"}를 중심으로 선언문을 만듭니다.`,
    (_profile, _core, emotion) => `오늘의 감정 태그: ${emotion}`,
  ],
  kpop: [
    () => "녹음 파일은 브라우저 안에서 바로 재생하고 다운로드할 수 있습니다.",
    (profile) => `${profile.topic || "선택한 노래"}를 고른 이유를 인터뷰로 정리합니다.`,
    (_profile, core) => core,
    (_profile, _core, emotion) => `감정 태그: ${emotion}`,
    (profile) => `${profile.name || "Artist"}의 공유용 앨범 페이지 미리보기`,
  ],
  performance: [
    () => "공연 영상은 브라우저에서 녹화하고 미리 볼 수 있습니다.",
    (profile) => `${profile.topic || "오늘의 무대"} 소개글 초안`,
    (_profile, core) => `무대 의도: ${core}`,
    () => "관객에게 남기는 마지막 문장을 정리합니다.",
  ],
  life: [
    () => "대화 로그 전체를 인터뷰 전문으로 보관합니다.",
    (_profile, core) => `인생 요약의 시작점: ${core}`,
    (profile) => `${profile.occupation || "삶의 배경"}을 기준으로 챕터가 나뉩니다.`,
    (_profile, core) => core,
  ],
  visitor: [
    (_profile, core) => `여행 기억 카드: ${core}`,
    () => "여행 중 남긴 영상과 음성을 함께 보관합니다.",
    (profile) => `${profile.topic || "한국에서의 순간"}을 공유용 페이지로 정리합니다.`,
  ],
};

function createSummary(kind: StudioKind, profile: StudioProfile, answerText: string) {
  if (kind === "kpop") {
    return `${profile.name || "고객"}님의 녹음 세션입니다. 선택한 곡 또는 MR은 "${profile.topic || "미정"}"이며, 인터뷰에서는 ${answerText}이 핵심 기억으로 남았습니다.`;
  }
  if (kind === "performance") {
    return `${profile.topic || "공연"}을 영상으로 기록하고, 무대 의도와 관객에게 남길 메시지를 함께 정리했습니다.`;
  }
  if (kind === "life") {
    return `${profile.occupation || "삶의 배경"}을 바탕으로 한 맞춤형 인생 인터뷰입니다. 핵심 이야기는 ${answerText}입니다.`;
  }
  return `${profile.name || "고객"}님의 ${kindLabel[kind]} 기록입니다. 핵심 이야기는 ${answerText}입니다.`;
}

function inferEmotion(text: string) {
  if (/고마|감사|thank|ありが|谢谢/.test(text)) return "gratitude";
  if (/미안|sorry|죄송|遗憾|後悔/.test(text)) return "apology";
  if (/꿈|목표|future|미래/.test(text)) return "hope";
  if (/무대|공연|노래|music|song|춤/.test(text)) return "performance";
  return "memory";
}

function pickCoreSentence(answers: string[], profile: StudioProfile) {
  const source = answers.find((answer) => answer.trim().length > 8) || profile.topic || profile.target || "오늘 남긴 이야기";
  return source.trim().replace(/\s+/g, " ").slice(0, 90);
}

function pickKeyword(text: string) {
  return text
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .find((word) => word.length >= 2);
}
