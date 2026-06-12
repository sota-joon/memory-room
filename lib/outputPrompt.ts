import type { ContentType, Locale, PreInterviewInfo, UnlockType } from "./types";

type OutputInput = {
  contentType?: ContentType;
  preInterviewInfo: PreInterviewInfo;
  answers: string[];
  unlockType: UnlockType;
  unlockDate?: string;
  locale?: Locale;
};

export function createMemoryCard({
  contentType,
  preInterviewInfo,
  answers,
  unlockType,
  unlockDate,
  locale = "ko",
}: OutputInput) {
  const clearScene = pickClearScene(preInterviewInfo, answers, locale);
  const openLabel = getUnlockLabel(unlockType, unlockDate, locale);
  const copy = outputCopy[locale];

  return `${getCardTitle(contentType, locale)}

${copy.subject}: ${preInterviewInfo.subjectName || copy.defaultSubject}
${copy.scene}: ${clearScene}
${copy.message}: ${preInterviewInfo.messageToday || pickAnswer(answers, 1, locale)}
${copy.opens}: ${openLabel}`;
}

export function createVaultSummary({
  preInterviewInfo,
  answers,
  unlockType,
  unlockDate,
  locale = "ko",
}: OutputInput) {
  const scene = pickClearScene(preInterviewInfo, answers, locale);
  const secondScene = pickAnswer(answers, 1, locale);
  const openLabel = getUnlockLabel(unlockType, unlockDate, locale);
  const copy = outputCopy[locale];
  const creator = preInterviewInfo.customerName || copy.defaultCreator;
  const subject = preInterviewInfo.subjectName || copy.defaultSubject;

  if (locale === "en") {
    return `This vault was created by ${creator} while thinking of ${subject}.
The first scene saved here is ${scene}.
The interview also kept a concrete memory such as ${secondScene}.
This record is set to open by: "${openLabel}".`;
  }

  if (locale === "ja") {
    return `このVaultは、${creator}さんが${subject}を思い浮かべながら残した記録です。
最初に残した場面は「${scene}」です。
インタビューでは「${secondScene}」のような具体的な記憶も残りました。
この記録は「${openLabel}」で開くように設定されています。`;
  }

  if (locale === "zh") {
    return `这份Vault由${creator}在想起${subject}时留下。
最先保存的画面是“${scene}”。
访谈中也留下了“${secondScene}”这样的具体记忆。
这份记录设置为：“${openLabel}”时打开。`;
  }

  return `이 기록은 ${creator}님이 ${subject}을 떠올리며 남긴 기억 저장소입니다.
가장 먼저 떠올린 장면은 ${scene}입니다.
인터뷰 중에는 ${secondScene} 같은 구체적인 기억이 함께 남겨졌습니다.
이 기록은 "${openLabel}" 방식으로 열리도록 설정되었습니다.`;
}

export function createFutureMessage({
  preInterviewInfo,
  answers,
  unlockType,
  unlockDate,
  locale = "ko",
}: OutputInput) {
  const copy = outputCopy[locale];
  const subject = preInterviewInfo.subjectName || copy.futureRecipient;
  const openLabel = getUnlockLabel(unlockType, unlockDate, locale);
  const scene = pickClearScene(preInterviewInfo, answers, locale);
  const message = preInterviewInfo.messageToday || pickAnswer(answers, 2, locale);

  if (locale === "en") {
    return `For ${subject}, who will open this record on ${openLabel}.

Today, I first saved this scene: ${scene}.
When this record opens, I hope these words reach the right person quietly.

${message}`;
  }

  if (locale === "ja") {
    return `${openLabel}にこの記録を開く${subject}へ。

今日の私は、まず「${scene}」を残しました。
この記録が開く日に、この言葉が静かに届きますように。

${message}`;
  }

  if (locale === "zh") {
    return `写给将在${openLabel}打开这份记录的${subject}。

今天的我，先留下了这个画面：${scene}。
希望这份记录打开的那一天，这些话能安静地到达该到达的人。

${message}`;
  }

  return `${openLabel}에 이 기록을 열게 될 ${subject}에게.

오늘의 나는 ${scene}을 먼저 남겼습니다.
이 기록이 열리는 날, 이 말이 정확한 사람에게 조용히 닿았으면 합니다.

${message}`;
}

function pickClearScene(info: PreInterviewInfo, answers: string[], locale: Locale) {
  const candidates = [info.firstMemory, ...answers]
    .map((text) => text.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return candidates[0] ?? outputCopy[locale].defaultScene;
}

function pickAnswer(answers: string[], index: number, locale: Locale) {
  return answers[index]?.replace(/\s+/g, " ").trim() || answers[0] || outputCopy[locale].defaultMessage;
}

function getUnlockLabel(type: UnlockType, date?: string, locale: Locale = "ko") {
  const label = unlockLabels[locale][type];
  if (type === "specific_date") return date ? `${date} ${label}` : label;
  return label;
}

function getCardTitle(type: ContentType | undefined, locale: Locale) {
  const titles = cardTitles[locale];
  if (!type) return titles.default;
  return titles[type] ?? titles.default;
}

const outputCopy = {
  ko: {
    defaultCreator: "사용자",
    defaultMessage: "조용히 남겨둔 마음",
    defaultScene: "아직 이름 붙이지 못한 장면",
    defaultSubject: "마음속 한 사람",
    futureRecipient: "이 기록을 열 사람",
    message: "남기고 싶은 말",
    opens: "이 기록이 열리는 날",
    scene: "가장 선명한 장면",
    subject: "떠올린 사람",
  },
  en: {
    defaultCreator: "the creator",
    defaultMessage: "a quiet feeling saved here",
    defaultScene: "a scene not yet named",
    defaultSubject: "someone important",
    futureRecipient: "the person opening this record",
    message: "Words to keep",
    opens: "When this opens",
    scene: "Clearest scene",
    subject: "Person remembered",
  },
  ja: {
    defaultCreator: "記録した人",
    defaultMessage: "静かに残しておいた想い",
    defaultScene: "まだ名前のない場面",
    defaultSubject: "大切な人",
    futureRecipient: "この記録を開く人",
    message: "残したい言葉",
    opens: "この記録が開く日",
    scene: "いちばん鮮明な場面",
    subject: "思い浮かべた人",
  },
  zh: {
    defaultCreator: "记录者",
    defaultMessage: "安静保存下来的心情",
    defaultScene: "还没有命名的画面",
    defaultSubject: "重要的人",
    futureRecipient: "打开这份记录的人",
    message: "想留下的话",
    opens: "这份记录开启的日子",
    scene: "最清晰的画面",
    subject: "想起的人",
  },
} satisfies Record<Locale, Record<string, string>>;

const unlockLabels = {
  ko: {
    after_death: "내가 없을 때",
    birth_of_child: "아이가 태어나는 날",
    birth_of_grandchild: "손주가 태어나는 날",
    five_years_later: "5년 뒤",
    guardian_approval: "가족 관리자가 승인하면",
    marriage: "결혼하는 날",
    now: "지금 바로 공유",
    one_year_later: "1년 뒤",
    specific_date: "공개",
    ten_years_later: "10년 뒤",
    yearly_reminder: "매년 같은 날 다시 알림",
  },
  en: {
    after_death: "when family approval is given",
    birth_of_child: "when a child is born",
    birth_of_grandchild: "when a grandchild is born",
    five_years_later: "in 5 years",
    guardian_approval: "with family manager approval",
    marriage: "on a wedding day",
    now: "share now",
    one_year_later: "in 1 year",
    specific_date: "reveal",
    ten_years_later: "in 10 years",
    yearly_reminder: "remind every year",
  },
  ja: {
    after_death: "家族の確認後",
    birth_of_child: "子どもが生まれる日",
    birth_of_grandchild: "孫が生まれる日",
    five_years_later: "5年後",
    guardian_approval: "家族管理者の承認後",
    marriage: "結婚する日",
    now: "今すぐ共有",
    one_year_later: "1年後",
    specific_date: "公開",
    ten_years_later: "10年後",
    yearly_reminder: "毎年同じ日に通知",
  },
  zh: {
    after_death: "经过家人确认后",
    birth_of_child: "孩子出生那天",
    birth_of_grandchild: "孙辈出生那天",
    five_years_later: "5年后",
    guardian_approval: "经家庭管理员批准后",
    marriage: "结婚那天",
    now: "立即分享",
    one_year_later: "1年后",
    specific_date: "开启",
    ten_years_later: "10年后",
    yearly_reminder: "每年同一天提醒",
  },
} satisfies Record<Locale, Record<UnlockType, string>>;

const cardTitles = {
  ko: {
    artist_interview: "아티스트 기록 카드",
    couple_time_capsule: "커플 타임캡슐 카드",
    default: "오늘 남겨진 기억",
    family_memory: "오늘 남겨진 기억",
    founder_story: "창업자 기록 카드",
    future_self: "미래의 나에게",
    kdrama_message: "드라마 메시지 카드",
    korea_trip: "여행 기억 카드",
    kpop_experience: "K-POP 녹음 카드",
    kpop_recording: "K-POP 녹음 카드",
    live_performance: "공연 기록 카드",
    parent_life_book: "부모님의 인생책 카드",
    seoul_night_letter: "서울 밤 편지",
  },
  en: {
    artist_interview: "Artist Story Card",
    couple_time_capsule: "Couple Time Capsule Card",
    default: "A Memory Saved Today",
    family_memory: "A Memory Saved Today",
    founder_story: "Founder Legacy Card",
    future_self: "For My Future Self",
    kdrama_message: "K-Drama Message Card",
    korea_trip: "Travel Memory Card",
    kpop_experience: "K-POP Recording Card",
    kpop_recording: "K-POP Recording Card",
    live_performance: "Performance Archive Card",
    parent_life_book: "Parent Life Story Card",
    seoul_night_letter: "Seoul Night Letter",
  },
  ja: {
    artist_interview: "アーティスト記録カード",
    couple_time_capsule: "カップルタイムカプセルカード",
    default: "今日残した記憶",
    family_memory: "今日残した記憶",
    founder_story: "創業者記録カード",
    future_self: "未来の自分へ",
    kdrama_message: "韓国ドラマ風メッセージカード",
    korea_trip: "旅行メモリーカード",
    kpop_experience: "K-POP録音カード",
    kpop_recording: "K-POP録音カード",
    live_performance: "公演記録カード",
    parent_life_book: "親のライフストーリーカード",
    seoul_night_letter: "ソウルの夜の手紙",
  },
  zh: {
    artist_interview: "艺术家故事卡",
    couple_time_capsule: "情侣时间胶囊卡",
    default: "今天留下的记忆",
    family_memory: "今天留下的记忆",
    founder_story: "创始人故事卡",
    future_self: "写给未来的自己",
    kdrama_message: "韩剧感留言卡",
    korea_trip: "旅行记忆卡",
    kpop_experience: "K-POP录音卡",
    kpop_recording: "K-POP录音卡",
    live_performance: "演出记录卡",
    parent_life_book: "父母人生故事卡",
    seoul_night_letter: "首尔夜晚的信",
  },
} satisfies Record<Locale, Record<ContentType | "default", string>>;
