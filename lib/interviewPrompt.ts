import type {
  LetterLength,
  LetterRevisionAction,
  LetterTone,
  PreInterviewInfo,
} from "./storage";
import type { ContentType, Locale } from "./types";

export const DEFAULT_QUESTION_LIMIT = 3;
export const QUESTION_LIMIT = 7;

type NextQuestionInput = {
  contentType?: ContentType;
  preInterviewInfo: PreInterviewInfo;
  answer: string;
  locale?: Locale;
  questionIndex: number;
};

type FinalLetterInput = {
  preInterviewInfo: PreInterviewInfo;
  questions: string[];
  answers: string[];
  tone: LetterTone;
  length: LetterLength;
  locale?: Locale;
  revisionAction?: LetterRevisionAction;
  previousLetter?: string;
};

export function createWelcomeMessage(_info: PreInterviewInfo, locale: Locale = "ko") {
  if (locale !== "ko") return localizedPromptCopy[locale].welcome;
  return `환영합니다.
오늘은 마음속에 남아 있는 한 사람을 천천히 떠올려보는 시간입니다.
잠시 숨을 고르고, 가장 먼저 떠오르는 장면부터 함께 바라보겠습니다.`;
}

export function createFirstQuestion(info: PreInterviewInfo, contentType: ContentType = "family_memory", locale: Locale = "ko") {
  if (locale !== "ko") return createLocalizedFirstQuestion(info, contentType, locale);
  const customerName = cleanSentence(info.customerName) || "당신";
  const firstMemory = cleanSentence(info.firstMemory);

  if (contentType === "future_self") {
    return `${customerName}님, "${firstMemory}"을 지금 가장 중요하게 생각한다고 적어주셨어요.
미래의 나에게 이 마음을 어떤 장면으로 남기고 싶나요?`;
  }
  if (contentType === "kpop_recording") {
    return `${customerName}님, "${firstMemory}"을 기록하고 싶은 노래로 남겨주셨어요.
이 노래를 선택한 이유가 있다면 무엇인가요?`;
  }
  if (contentType === "korea_trip") {
    return `${customerName}님, "${firstMemory}"을 한국에서 기억하고 싶은 순간으로 남겨주셨어요.
이번 여행에서 그 장면이 특별하게 느껴진 이유는 무엇인가요?`;
  }
  if (contentType === "kpop_experience") {
    return `${customerName}님, "${firstMemory}"을 녹음하고 싶은 노래로 남겨주셨어요.
이 노래를 선택한 이유가 있다면 무엇인가요?`;
  }
  if (contentType === "kdrama_message") {
    return `${customerName}님, "${info.subjectName}"에게 남길 메시지를 준비하고 있어요.
이 장면에 가장 담고 싶은 마음은 무엇인가요?`;
  }
  if (contentType === "seoul_night_letter") {
    return `${customerName}님, "${firstMemory}"이 오늘 서울에서 남은 장면이군요.
오늘 밤의 감정을 어떤 말로 보관하고 싶나요?`;
  }
  if (contentType === "live_performance") {
    return `${customerName}님, "${firstMemory}" 공연을 기록하려고 합니다.
이 공연에서 가장 남기고 싶은 순간은 무엇인가요?`;
  }
  if (contentType === "artist_interview") {
    return `${customerName}님, "${firstMemory}" 이야기를 먼저 남겨주셨어요.
음악을 시작하게 만든 장면이나 마음이 있다면 무엇인가요?`;
  }
  if (contentType === "founder_story") {
    return `${customerName}님, "${firstMemory}"을 창업의 시작점으로 적어주셨어요.
그때 붙잡고 있었던 문제나 믿음은 무엇이었나요?`;
  }
  if (contentType === "parent_life_book") {
    return `${customerName}님, "${firstMemory}" 이야기를 먼저 듣고 싶다고 남겨주셨어요.
그 시절의 장소나 사람 중 가장 먼저 떠오르는 것은 무엇인가요?`;
  }
  if (contentType === "couple_time_capsule") {
    return `${customerName}님, "${firstMemory}" 순간이 먼저 떠올랐군요.
그날 두 사람 사이에 가장 오래 남은 장면은 무엇인가요?`;
  }

  return `${customerName}님, ${naturalName(info)}을 떠올리며 "${firstMemory}"을 적어주셨어요.
그 장면에서 지금도 선명하게 남아 있는 순간은 무엇인가요?`;
}

export function createNextQuestion({ contentType = "family_memory", preInterviewInfo, answer, questionIndex, locale = "ko" }: NextQuestionInput) {
  if (locale !== "ko") return createLocalizedNextQuestion({ answer, contentType, locale, preInterviewInfo, questionIndex });
  const bridge = createAnswerBridge(answer);
  const keyword = pickAnswerKeyword(answer, preInterviewInfo);
  const addressName = naturalName(preInterviewInfo);
  const place = pickPlaceLikeWord(answer);

  const themed = createThemedQuestion(contentType, keyword, preInterviewInfo, questionIndex);
  if (themed) {
    return `${bridge}
${themed}`;
  }

  const questions = [
    place
      ? `${place}에서의 분위기나 ${addressName}의 모습 중에 지금 먼저 떠오르는 것이 있을까요?`
      : `${keyword}이 마음에 남아 있다면, 그때 ${addressName}의 표정이나 말투는 어땠나요?`,
    `${addressName}에게 지금 다시 건넬 수 있다면, 어떤 한마디를 먼저 전하고 싶나요?`,
    `${keyword}을 가족들이 함께 기억한다면, 어떤 모습으로 남았으면 하나요?`,
    `그날 곁에 있던 사람이나 물건 중에 아직 떠오르는 것이 있을까요?`,
    `${addressName}와의 기억 중 오늘 더 남겨두고 싶은 장면이 하나 더 있나요?`,
    `마지막으로 가족에게 조용히 남기고 싶은 말을 한 문장으로 적어볼까요?`,
  ];

  return `${bridge}
${questions[questionIndex - 1] ?? `${addressName}와의 기억을 하나만 더 천천히 떠올려볼까요?`}`;
}

function createThemedQuestion(
  contentType: ContentType,
  keyword: string,
  info: PreInterviewInfo,
  questionIndex: number,
) {
  const banks: Partial<Record<ContentType, string[]>> = {
    artist_interview: [
      `${keyword}이 음악 안에 남아 있다면, 어떤 소리나 가사로 떠오르나요?`,
      `지금까지 만든 것 중 가장 의미 있는 곡은 무엇인가요?`,
      `앞으로 음악으로 남기고 싶은 이야기는 무엇인가요?`,
    ],
    couple_time_capsule: [
      `${keyword} 순간에 두 사람은 어떤 표정이었나요?`,
      `앞으로 꼭 지키고 싶은 약속이 있다면 무엇인가요?`,
      `기념일에 다시 열어볼 때 가장 먼저 떠올랐으면 하는 말은 무엇인가요?`,
    ],
    founder_story: [
      `${keyword} 순간에 가장 힘들었던 선택은 무엇이었나요?`,
      `그래도 계속 버티게 만든 사람이나 믿음이 있었나요?`,
      `후배 창업자에게 남기고 싶은 한마디는 무엇인가요?`,
    ],
    future_self: [
      `${keyword}이 미래에도 남아 있다면, 어떤 모습이면 좋겠나요?`,
      `지금의 고민을 미래의 나에게 어떻게 설명해주고 싶나요?`,
      `미래의 내가 꼭 잊지 않았으면 하는 꿈은 무엇인가요?`,
    ],
    kpop_recording: [
      `${keyword}이 이 노래와 이어져 있다면, 어떤 기억이 함께 떠오르나요?`,
      `이 노래를 들려주고 싶은 사람이 있다면 누구인가요?`,
      `커버 이미지에 담고 싶은 분위기는 무엇인가요?`,
    ],
    korea_trip: [
      `${keyword}이 여행 기억에 남아 있다면, 장소나 소리, 음식 중 무엇이 먼저 떠오르나요?`,
      `언젠가 이 여행을 누구와 함께 다시 나누고 싶나요?`,
      `한국에서의 오늘을 한 문장으로 남긴다면 어떤 말이 좋을까요?`,
    ],
    kpop_experience: [
      `${keyword}이 이 노래와 이어져 있다면, 어떤 기억이 함께 떠오르나요?`,
      `이 녹음 기록을 언젠가 누구에게 들려주고 싶나요?`,
      `커버 이미지에 담고 싶은 분위기는 무엇인가요?`,
    ],
    kdrama_message: [
      `${keyword} 마음을 영상 장면으로 남긴다면 어떤 분위기였으면 하나요?`,
      `이 메시지는 사랑, 감사, 사과, 이별, 응원 중 어디에 가장 가까운가요?`,
      `이 메시지는 언제 열렸으면 좋겠나요?`,
    ],
    seoul_night_letter: [
      `${keyword}이 오늘 서울의 밤에 남아 있다면, 어떤 풍경이 함께 떠오르나요?`,
      `이 편지를 미래의 나와 누군가 중 누구에게 먼저 전하고 싶나요?`,
      `언제 이 밤의 기록을 다시 열어보고 싶나요?`,
    ],
    live_performance: [
      `${keyword}이 공연에서 가장 살아나는 순간은 언제인가요?`,
      `관객에게 이 공연을 어떤 기억으로 남기고 싶나요?`,
      `공연이 끝난 뒤 꼭 남기고 싶은 말은 무엇인가요?`,
    ],
    parent_life_book: [
      `${keyword} 시절을 떠올리면 어떤 장소나 냄새가 먼저 생각나나요?`,
      `살면서 오래 기억에 남은 선택이나 후회가 있다면 무엇인가요?`,
      `${info.subjectName || "그분"}의 행복했던 순간을 하나만 더 남겨볼까요?`,
    ],
  };

  return banks[contentType]?.[questionIndex - 1];
}

export function createFinalLetter({
  preInterviewInfo,
  answers,
  locale = "ko",
  tone,
  length,
  revisionAction,
}: FinalLetterInput) {
  if (locale !== "ko") return createLocalizedFinalLetter({ answers, length, locale, preInterviewInfo });
  const addressName = naturalName(preInterviewInfo);
  const title = createLetterTitle(preInterviewInfo, tone);
  const memoryFragments = pickLetterFragments(preInterviewInfo, answers);
  const paragraphs = createLetterParagraphs({
    addressName,
    fragments: memoryFragments,
    info: preInterviewInfo,
    length,
    revisionAction,
    tone,
  });

  return `${title}

${paragraphs.join("\n\n")}

${signature(preInterviewInfo)}`;
}

function createLetterParagraphs({
  addressName,
  fragments,
  info,
  length,
  revisionAction,
  tone,
}: {
  addressName: string;
  fragments: string[];
  info: PreInterviewInfo;
  length: LetterLength;
  revisionAction?: LetterRevisionAction;
  tone: LetterTone;
}) {
  const softened = revisionAction === "더 부드럽게";
  const plain = revisionAction === "더 담담하게";
  const emotional = revisionAction === "더 감성적으로" || tone === "조금 더 감성적으로";
  const familyVoice = revisionAction === "가족에게 말하듯 수정";
  const short = length === "짧게" || revisionAction === "짧게 줄이기";
  const long = length === "길게";

  const firstMemory = fragments[0] ?? cleanSentence(info.firstMemory);
  const secondMemory = fragments[1] ?? cleanSentence(info.messageToday);
  const thirdMemory = fragments[2];
  const directMessage = makeDirectMessage(info.messageToday, addressName);

  const paragraphs = [
    `${addressName}, 오늘은 ${firstMemory}이 먼저 떠올랐어.
그 장면을 떠올리니 오래 지나도 마음에 남는 건 결국 아주 작은 순간들이라는 생각이 들어.`,
    `${secondMemory}도 같이 생각났어.
그때 내가 다 말하지 못했거나 그냥 지나쳤던 마음이 이제야 조금 선명해지는 것 같아.`,
  ];

  if (long && thirdMemory) {
    paragraphs.push(`${thirdMemory}도 잊고 싶지 않아.
크게 특별한 말로 꾸미지 않아도, 그 기억은 나에게 오래 남아 있는 장면이야.`);
  }

  if (containsAny(`${info.purpose} ${info.messageToday} ${fragments.join(" ")}`, ["고마", "감사", "믿어", "챙겨"])) {
    paragraphs.push(`${addressName}, ${directMessage}
그 말을 오늘은 꼭 남겨두고 싶었어.`);
  } else if (containsAny(`${info.purpose} ${info.messageToday} ${fragments.join(" ")}`, ["미안", "사과", "못해", "못 했"])) {
    paragraphs.push(`${addressName}, ${directMessage}
늦었더라도 이 말은 마음속에만 두고 싶지 않았어.`);
  } else {
    paragraphs.push(`${addressName}, ${directMessage}
잘 정리된 말은 아니어도 지금 내 마음에 가장 가까운 말이야.`);
  }

  if (!short) {
    paragraphs.push(createFamilyParagraph(info, addressName, familyVoice));
  }

  paragraphs.push(createClosingParagraph(addressName, { emotional, plain, softened, tone }));

  return short ? [paragraphs[0], paragraphs[2], paragraphs.at(-1) ?? ""] : paragraphs;
}

function createFamilyParagraph(info: PreInterviewInfo, addressName: string, familyVoice: boolean) {
  if (familyVoice) {
    return `우리 가족이 이 글을 읽을 때, ${addressName}의 이름을 조금 더 편하게 불러봤으면 좋겠어.
그리고 각자 마음속에 남아 있는 장면도 하나씩 꺼내볼 수 있으면 좋겠어.`;
  }

  return `가족들에게도 이 기억을 남기고 싶어.
${addressName}를 떠올릴 때 거창한 이야기가 아니라, ${cleanSentence(info.firstMemory)} 같은 장면부터 함께 기억했으면 해.`;
}

function createClosingParagraph(
  addressName: string,
  options: { emotional: boolean; plain: boolean; softened: boolean; tone: LetterTone },
) {
  if (options.plain || options.tone === "담담하게") {
    return `오늘은 여기까지 적어둘게.
${addressName}, 이 마음이 조용히 오래 남았으면 좋겠어.`;
  }
  if (options.softened || options.tone === "따뜻하게") {
    return `고맙고, 또 고마워.
${addressName}를 떠올리는 이 시간이 우리 가족에게 따뜻하게 남았으면 좋겠어.`;
  }
  if (options.emotional) {
    return `시간이 지나도 사라지지 않는 장면들이 있나 봐.
${addressName}, 오늘 꺼낸 이 마음을 오래 품고 지낼게.`;
  }
  if (options.tone === "아이에게 남기는 말처럼") {
    return `언젠가 이 글을 다시 읽을 때, 이 마음이 작은 힘이 되었으면 좋겠어.
나는 이 기억을 오래 간직할게.`;
  }
  if (options.tone === "부모님께 드리는 말처럼") {
    return `늦게라도 이렇게 마음을 드릴 수 있어서 다행이야.
이 말이 조용히 닿았으면 좋겠어.`;
  }

  return `오늘 적은 이 말들이 우리 가족 마음속에 조용히 남았으면 좋겠어.`;
}

function createLetterTitle(info: PreInterviewInfo, tone: LetterTone) {
  if (tone === "부모님께 드리는 말처럼") return `${naturalName(info)}께 드리는 말`;
  if (tone === "아이에게 남기는 말처럼") return `${naturalName(info)}에게 남기는 마음`;
  return `${naturalName(info)}에게 남기는 편지`;
}

function createAnswerBridge(answer: string) {
  const phrase = pickHumanPhrase(answer);
  if (containsAny(answer, ["고마", "감사", "믿어", "챙겨"])) {
    return `"${phrase}"라는 말이 마음에 조용히 남습니다.`;
  }
  if (containsAny(answer, ["미안", "사과", "못해", "못 했"])) {
    return `아직 마음에 남아 있던 말이 있었군요.`;
  }
  if (containsAny(answer, ["안아", "품", "손", "웃", "표정", "눈"])) {
    return `그 장면의 온도나 표정이 아직 남아 있는 것 같아요.`;
  }
  return `"${phrase}" 이 장면을 함께 붙잡아볼게요.`;
}

function pickLetterFragments(info: PreInterviewInfo, answers: string[]) {
  const candidates = [info.firstMemory, ...answers, info.messageToday]
    .map((text) => cleanSentence(text))
    .filter(Boolean);
  const unique = Array.from(new Set(candidates));

  while (unique.length < 3) {
    unique.push(cleanSentence(info.messageToday || info.firstMemory || naturalName(info)));
  }

  return unique.slice(0, 5);
}

function pickHumanPhrase(text: string) {
  const clean = cleanSentence(text);
  if (clean.length <= 34) return clean;

  const clauses = clean
    .split(/[,，.。!?！？\n]/)
    .map((part) => cleanSentence(part))
    .filter(Boolean);
  const meaningful = clauses.find((part) => part.length >= 6 && part.length <= 34);
  return meaningful ?? `${clean.slice(0, 32)}...`;
}

function pickAnswerKeyword(answer: string, info: PreInterviewInfo) {
  const words = extractKoreanWords(answer)
    .filter((word) => !["그리고", "그때", "정말", "너무", "조금", "오늘"].includes(word))
    .filter((word) => !word.includes("했") && !word.includes("있"));

  return words[0] ?? pickPlaceLikeWord(answer) ?? naturalName(info);
}

function pickPlaceLikeWord(answer: string) {
  const match = answer.match(/([가-힣A-Za-z0-9]{2,12}(?:집|방|길|학교|병원|부엌|마당|바다|공원|버스|차|식탁|시장|역|동네|골목))/);
  if (match) return match[1];

  const locationMatch = answer.match(/([가-힣A-Za-z0-9]{2,12})에서/);
  return locationMatch?.[1] ?? "";
}

function extractKoreanWords(text: string) {
  return cleanSentence(text)
    .replace(/[^\u3131-\u318E\uAC00-\uD7A3A-Za-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => word.replace(/(은|는|이|가|을|를|에|에서|에게|께|도|만|처럼|하고|였어|었어|했어|했어요|이에요|예요)$/g, ""))
    .filter((word) => word.length >= 2);
}

function makeDirectMessage(message: string, addressName: string) {
  const clean = cleanSentence(message);
  if (!clean) return `${addressName}에게 전하고 싶은 말이 있어`;
  if (clean.endsWith("다") || clean.endsWith("요") || clean.endsWith("어") || clean.endsWith("아")) return clean;
  return `${clean}라는 말을 전하고 싶어`;
}

function naturalName(info: PreInterviewInfo) {
  const relation = info.relationship.trim();
  const subjectName = cleanSentence(info.subjectName);
  if (relation.includes("어머니") || relation.includes("엄마")) return "엄마";
  if (relation.includes("아버지") || relation.includes("아빠")) return "아빠";
  if (relation.includes("할머니")) return "할머니";
  if (relation.includes("할아버지")) return "할아버지";
  if (relation.includes("아들")) return "아들";
  if (relation.includes("딸")) return "딸";
  return subjectName || "그 사람";
}

function signature(info: PreInterviewInfo) {
  const name = cleanSentence(info.customerName);
  if (!name || name === "나") return "나";
  return name;
}

function containsAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function cleanSentence(text: string) {
  return text.replace(/\s+/g, " ").trim().replace(/[.。]+$/, "");
}

function createLocalizedFirstQuestion(info: PreInterviewInfo, contentType: ContentType, locale: Exclude<Locale, "ko">) {
  const copy = localizedPromptCopy[locale];
  const name = cleanSentence(info.customerName) || copy.defaultUser;
  const scene = cleanSentence(info.firstMemory) || copy.defaultScene;

  if (contentType === "future_self") return copy.firstFuture(name, scene);
  if (contentType === "korea_trip") return copy.firstTrip(name, scene);
  if (contentType === "kpop_experience" || contentType === "kpop_recording") return copy.firstMusic(name, scene);
  return copy.firstGeneral(name, cleanSentence(info.subjectName) || copy.defaultSubject, scene);
}

function createLocalizedNextQuestion({
  answer,
  contentType,
  locale,
  preInterviewInfo,
  questionIndex,
}: NextQuestionInput & { locale: Exclude<Locale, "ko"> }) {
  const copy = localizedPromptCopy[locale];
  const phrase = pickHumanPhrase(answer);
  const subject = cleanSentence(preInterviewInfo.subjectName) || copy.defaultSubject;
  const type = contentType ?? "family_memory";
  const followUps = copy.followUps as Partial<Record<ContentType, Array<(subject: string, phrase: string) => string>>>;
  const questions = followUps[type] ?? followUps.family_memory ?? [];
  return `${copy.bridge(phrase)}
${questions[(questionIndex - 1) % questions.length]?.(subject, phrase) ?? copy.firstGeneral(copy.defaultUser, subject, phrase)}`;
}

function createLocalizedFinalLetter({
  answers,
  length,
  locale,
  preInterviewInfo,
}: {
  answers: string[];
  length: LetterLength;
  locale: Exclude<Locale, "ko">;
  preInterviewInfo: PreInterviewInfo;
}) {
  const copy = localizedPromptCopy[locale];
  const subject = cleanSentence(preInterviewInfo.subjectName) || copy.defaultSubject;
  const creator = cleanSentence(preInterviewInfo.customerName) || copy.defaultUser;
  const scene = cleanSentence(preInterviewInfo.firstMemory) || copy.defaultScene;
  const second = cleanSentence(answers[0] || preInterviewInfo.messageToday) || copy.defaultFeeling;
  const message = cleanSentence(preInterviewInfo.messageToday || answers[1] || second) || copy.defaultFeeling;
  const extra = length === "길게" && answers[1] ? `\n\n${copy.extra(subject, cleanSentence(answers[1]))}` : "";

  return `${copy.letterTitle(subject)}

${copy.letterOpening(subject, scene)}

${copy.letterMemory(second)}

${copy.letterMessage(subject, message)}${extra}

${copy.letterClosing(subject)}

${creator}`;
}

const localizedPromptCopy = {
  en: {
    bridge: (phrase: string) => `"${phrase}" feels like a scene worth keeping.`,
    defaultFeeling: "what I wanted to say",
    defaultScene: "the first scene that came to mind",
    defaultSubject: "someone important",
    defaultUser: "you",
    extra: (_subject: string, text: string) => `I also want to keep this: ${text}. It may be a small detail, but small details are often what remain.`,
    firstFuture: (name: string, scene: string) => `${name}, you wrote that "${scene}" matters to you right now.\nWhat scene would you like your future self to remember from this time?`,
    firstGeneral: (name: string, subject: string, scene: string) => `${name}, you wrote down "${scene}" while thinking of ${subject}.\nWhat part of that scene still feels clearest today?`,
    firstMusic: (name: string, scene: string) => `${name}, you chose "${scene}" as the song or sound to keep.\nWhat made you choose it today?`,
    firstTrip: (name: string, scene: string) => `${name}, you chose "${scene}" as a Korea memory to keep.\nWhat made that moment feel special on this trip?`,
    followUps: {
      family_memory: [
        (subject: string) => `When you picture ${subject}, what expression, voice, or small gesture comes back first?`,
        (subject: string) => `If you could say one sentence to ${subject} now, what would you want to say?`,
        () => `What small object, place, sound, or smell belongs with that memory?`,
      ],
      future_self: [
        () => `When your future self opens this, what do you hope they remember about this season?`,
        () => `What worry from today do you want to leave honestly, without dressing it up?`,
        () => `What promise would you like to keep for yourself?`,
      ],
      korea_trip: [
        () => `Which place, sound, food, or street from Korea comes back most clearly?`,
        () => `Who would you want to share this trip with someday?`,
        () => `If this trip became one sentence, what would it say?`,
      ],
    },
    letterClosing: (subject: string) => `I will leave it here for now. ${subject}, I hope this feeling stays quietly and truthfully.`,
    letterMemory: (memory: string) => `I also keep thinking about ${memory}. It is not a summary to me. It is part of what I actually felt.`,
    letterMessage: (subject: string, message: string) => `${subject}, ${message}. I wanted these words to remain as they are.`,
    letterOpening: (subject: string, scene: string) => `${subject}, today I first thought of ${scene}. I did not realize it then, but that moment stayed with me.`,
    letterTitle: (subject: string) => `A letter for ${subject}`,
    welcome: `Welcome.\nToday is a quiet time to bring one story back into view.\nYou do not need perfect words. We will begin with the first scene that comes to mind.`,
  },
  ja: {
    bridge: (phrase: string) => `「${phrase}」という言葉が、静かに残っています。`,
    defaultFeeling: "残しておきたい想い",
    defaultScene: "最初に浮かんだ場面",
    defaultSubject: "大切な人",
    defaultUser: "あなた",
    extra: (_subject: string, text: string) => `もうひとつ、「${text}」も残しておきたいです。小さなことでも、あとから大切な記憶になると思います。`,
    firstFuture: (name: string, scene: string) => `${name}さんは、今大切にしていることとして「${scene}」を残しました。\n未来の自分には、この時期をどんな場面として覚えていてほしいですか？`,
    firstGeneral: (name: string, subject: string, scene: string) => `${name}さんは、${subject}を思いながら「${scene}」を残しました。\nその場面の中で、今もいちばん鮮明に浮かぶものは何ですか？`,
    firstMusic: (name: string, scene: string) => `${name}さんは「${scene}」を残したい音として選びました。\n今日この曲を選んだ理由は何ですか？`,
    firstTrip: (name: string, scene: string) => `${name}さんは、韓国で残したい記憶として「${scene}」を選びました。\nその瞬間が特別に感じられた理由は何ですか？`,
    followUps: {
      family_memory: [
        (subject: string) => `${subject}を思い浮かべると、表情や声、しぐさの中で何が先に浮かびますか？`,
        (subject: string) => `今${subject}に一言だけ伝えられるなら、どんな言葉を残したいですか？`,
        () => `その記憶と一緒に残っている場所、音、匂い、物はありますか？`,
      ],
      future_self: [
        () => `未来の自分が開いた時、今のどんな気持ちを思い出してほしいですか？`,
        () => `今の悩みを、飾らずに残すならどんな言葉になりますか？`,
        () => `未来の自分に守ってほしい約束はありますか？`,
      ],
      korea_trip: [
        () => `韓国で見た場所、音、食べ物、道の中で、いちばん鮮明なものは何ですか？`,
        () => `いつかこの旅を誰と分かち合いたいですか？`,
        () => `この旅を一文にするなら、どんな言葉になりますか？`,
      ],
    },
    letterClosing: (subject: string) => `今日はここまで残しておきます。${subject}へのこの想いが、静かに長く残りますように。`,
    letterMemory: (memory: string) => `「${memory}」のことも思い出します。それはただの要約ではなく、私の中に残っている本当の気持ちです。`,
    letterMessage: (subject: string, message: string) => `${subject}、${message}。この言葉だけは、そのまま残しておきたかったです。`,
    letterOpening: (subject: string, scene: string) => `${subject}へ。今日はまず「${scene}」が浮かびました。その時は気づかなかったけれど、今も心に残っています。`,
    letterTitle: (subject: string) => `${subject}へ残す手紙`,
    welcome: `ようこそ。\n今日は、心に残っている物語をゆっくり思い出す時間です。\nうまく話そうとしなくても大丈夫です。最初に浮かぶ場面から始めましょう。`,
  },
  zh: {
    bridge: (phrase: string) => `“${phrase}”这句话，像一个值得保存的画面。`,
    defaultFeeling: "想留下的心情",
    defaultScene: "最先浮现的画面",
    defaultSubject: "重要的人",
    defaultUser: "你",
    extra: (_subject: string, text: string) => `我也想把“${text}”留下来。它也许只是一个小细节，但小细节常常最能留下来。`,
    firstFuture: (name: string, scene: string) => `${name}，你写下了此刻很重要的“${scene}”。\n你希望未来的自己记住现在的哪个画面？`,
    firstGeneral: (name: string, subject: string, scene: string) => `${name}，你在想起${subject}时写下了“${scene}”。\n这个画面里，现在最清晰留下来的是什么？`,
    firstMusic: (name: string, scene: string) => `${name}，你选择把“${scene}”作为想保存的声音。\n今天选择它的原因是什么？`,
    firstTrip: (name: string, scene: string) => `${name}，你选择把“${scene}”作为韩国旅行的记忆。\n这次旅行里，它为什么让你觉得特别？`,
    followUps: {
      family_memory: [
        (subject: string) => `想起${subject}时，表情、声音或小动作里，最先浮现的是什么？`,
        (subject: string) => `如果现在能对${subject}说一句话，你最想留下哪一句？`,
        () => `和这段记忆一起留下来的地方、声音、气味或物品是什么？`,
      ],
      future_self: [
        () => `未来的自己打开这份记录时，你希望他记住现在的哪种心情？`,
        () => `如果不修饰地留下今天的烦恼，会是哪句话？`,
        () => `你想让未来的自己守住什么约定？`,
      ],
      korea_trip: [
        () => `韩国旅行里，地点、声音、食物或街道中，最清晰的是哪一个？`,
        () => `未来你最想和谁分享这次旅行？`,
        () => `如果把这次旅行写成一句话，会是什么？`,
      ],
    },
    letterClosing: (subject: string) => `今天先写到这里。${subject}，希望这份心意能安静、真实地留下来。`,
    letterMemory: (memory: string) => `我也一直想到“${memory}”。它对我来说不是总结，而是真正留下来的感受。`,
    letterMessage: (subject: string, message: string) => `${subject}，${message}。我想把这句话原原本本地留下来。`,
    letterOpening: (subject: string, scene: string) => `${subject}，今天我最先想到的是“${scene}”。当时也许没有察觉，但这个画面一直留在心里。`,
    letterTitle: (subject: string) => `写给${subject}的信`,
    welcome: `欢迎。\n今天，我们会慢慢把心里留下的一个故事拿出来。\n不需要说得完美，从第一个浮现的画面开始就好。`,
  },
} satisfies Record<Exclude<Locale, "ko">, {
  bridge: (phrase: string) => string;
  defaultFeeling: string;
  defaultScene: string;
  defaultSubject: string;
  defaultUser: string;
  extra: (subject: string, text: string) => string;
  firstFuture: (name: string, scene: string) => string;
  firstGeneral: (name: string, subject: string, scene: string) => string;
  firstMusic: (name: string, scene: string) => string;
  firstTrip: (name: string, scene: string) => string;
  followUps: Partial<Record<ContentType, Array<(subject: string, phrase: string) => string>>>;
  letterClosing: (subject: string) => string;
  letterMemory: (memory: string) => string;
  letterMessage: (subject: string, message: string) => string;
  letterOpening: (subject: string, scene: string) => string;
  letterTitle: (subject: string) => string;
  welcome: string;
}>;
