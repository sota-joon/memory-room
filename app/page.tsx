"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { ContentTypeSelector } from "../components/ContentTypeSelector";
import { FinalOutputs } from "../components/FinalOutputs";
import { InterviewRoom } from "../components/InterviewRoom";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { PreInterviewForm } from "../components/PreInterviewForm";
import { StudioExperience } from "../components/StudioExperience";
import { WelcomeRoom } from "../components/WelcomeRoom";
import {
  createFinalLetter,
  createFirstQuestion,
  createNextQuestion,
  createWelcomeMessage,
  DEFAULT_QUESTION_LIMIT,
  QUESTION_LIMIT,
} from "../lib/interviewPrompt";
import { createFutureMessage, createMemoryCard, createVaultSummary } from "../lib/outputPrompt";
import { cancelSpeech, speakKorean } from "../lib/speech";
import { getInitialLocale, getMessages, saveStoredLocale } from "../lib/i18n";
import {
  clearStoredInterview,
  loadStoredInterview,
  saveStoredInterview,
  type ContentType,
  type Guardian,
  type InterviewRecord,
  type LetterLength,
  type LetterRevision,
  type LetterRevisionAction,
  type LetterTone,
  type Locale,
  type PreInterviewInfo,
  type Recipient,
  type UnlockType,
} from "../lib/storage";
import { createAccessCode, createVaultId, getVaultUrl, saveMemoryVault } from "../lib/vaultStorage";
import { createVideoFileName } from "../lib/videoRecorder";

type Step = "contentType" | "studio" | "preInterview" | "welcome" | "interview" | "closing" | "outputs";

const emptyInfo: PreInterviewInfo = {
  customerName: "",
  subjectName: "",
  relationship: "",
  lifeStatus: "living",
  purpose: "감사",
  firstMemory: "",
  messageToday: "",
};

const letterTones: LetterTone[] = [
  "담담하게",
  "따뜻하게",
  "조금 더 감성적으로",
  "아이에게 남기는 말처럼",
  "부모님께 드리는 말처럼",
];
const letterLengths: LetterLength[] = ["짧게", "보통", "길게"];

const letterToneLabels = {
  ko: {
    "담담하게": "담담하게",
    "따뜻하게": "따뜻하게",
    "조금 더 감성적으로": "조금 더 감성적으로",
    "아이에게 남기는 말처럼": "아이에게 남기는 말처럼",
    "부모님께 드리는 말처럼": "부모님께 드리는 말처럼",
  },
  en: {
    "담담하게": "Simple and sincere",
    "따뜻하게": "Warm",
    "조금 더 감성적으로": "A little more emotional",
    "아이에게 남기는 말처럼": "Like words for a child",
    "부모님께 드리는 말처럼": "Like words for a parent",
  },
  ja: {
    "담담하게": "落ち着いた文体",
    "따뜻하게": "あたたかく",
    "조금 더 감성적으로": "少し感情を込めて",
    "아이에게 남기는 말처럼": "子どもへ残す言葉のように",
    "부모님께 드리는 말처럼": "親へ伝える言葉のように",
  },
  zh: {
    "담담하게": "朴素真诚",
    "따뜻하게": "温暖",
    "조금 더 감성적으로": "稍微更有感情",
    "아이에게 남기는 말처럼": "像写给孩子的话",
    "부모님께 드리는 말처럼": "像写给父母的话",
  },
} satisfies Record<Locale, Record<LetterTone, string>>;

const letterLengthLabels = {
  ko: { 짧게: "짧게", 보통: "보통", 길게: "길게" },
  en: { 짧게: "Short", 보통: "Medium", 길게: "Long" },
  ja: { 짧게: "短め", 보통: "標準", 길게: "長め" },
  zh: { 짧게: "短", 보통: "适中", 길게: "长" },
} satisfies Record<Locale, Record<LetterLength, string>>;

const closingCopy = {
  ko: {
    body: "더 떠오르는 장면이 있다면 조금만 더 이어갈 수 있습니다. 지금 마무리해도 편지, 기억 카드, 저장소 요약을 만들 수 있습니다.",
    continue: "조금 더 이어가기",
    eyebrow: "기록 마무리",
    length: "편지 길이",
    make: "기록 저장소 결과 만들기",
    title: "지금 남겨주신 이야기로 기록 저장소를 만들 수 있습니다.",
    tone: "편지 톤",
  },
  en: {
    body: "If another scene comes to mind, you can continue a little longer. You can also finish now and create a letter, memory card, and vault summary.",
    continue: "Continue a little longer",
    eyebrow: "Finish the record",
    length: "Letter length",
    make: "Create vault results",
    title: "Your story is ready to become a Memory Vault.",
    tone: "Letter tone",
  },
  ja: {
    body: "ほかに浮かぶ場面があれば、もう少し続けられます。ここで終えても、手紙、記憶カード、保存用の要約を作成できます。",
    continue: "もう少し続ける",
    eyebrow: "記録の仕上げ",
    length: "手紙の長さ",
    make: "保存する記録を作成",
    title: "今残していただいた物語を、Memory Vaultとしてまとめられます。",
    tone: "手紙のトーン",
  },
  zh: {
    body: "如果还想起其他画面，可以再继续一点。现在结束也可以生成信件、记忆卡和记录摘要。",
    continue: "再继续一点",
    eyebrow: "完成记录",
    length: "信件长度",
    make: "生成保存结果",
    title: "你留下的故事已经可以整理成 Memory Vault。",
    tone: "信件语气",
  },
} satisfies Record<Locale, Record<string, string>>;

export default function Home() {
  const [step, setStep] = useState<Step>("contentType");
  const [locale, setLocale] = useState<Locale>("ko");
  const [contentType, setContentType] = useState<ContentType>("family_memory");
  const [preInterviewInfo, setPreInterviewInfo] = useState<PreInterviewInfo>(emptyInfo);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [finalLetter, setFinalLetter] = useState("");
  const [memoryCard, setMemoryCard] = useState("");
  const [summary, setSummary] = useState("");
  const [futureMessage, setFutureMessage] = useState("");
  const [vaultUrl, setVaultUrl] = useState("");
  const [selectedLetterTone, setSelectedLetterTone] = useState<LetterTone>("담담하게");
  const [selectedLetterLength, setSelectedLetterLength] = useState<LetterLength>("보통");
  const [letterRevisionHistory, setLetterRevisionHistory] = useState<LetterRevision[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [targetQuestionCount, setTargetQuestionCount] = useState(DEFAULT_QUESTION_LIMIT);
  const [unlockType, setUnlockType] = useState<UnlockType>("now");
  const [unlockDate, setUnlockDate] = useState("");
  const [recipient, setRecipient] = useState<Recipient>({ name: "", phone: "", email: "" });
  const [guardian, setGuardian] = useState<Guardian>({ name: "", phone: "", email: "" });
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [createdAt, setCreatedAt] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  const currentQuestionText = questions[currentQuestion] ?? "";
  const t = getMessages(locale);
  const spokenText = useMemo(() => (step === "interview" ? currentQuestionText : ""), [currentQuestionText, step]);

  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocale(initialLocale);
    const shouldResume = new URLSearchParams(window.location.search).get("resume") === "1";
    const stored = loadStoredInterview();
    if (stored && shouldResume) {
      setLocale(stored.locale ?? initialLocale);
      setPreInterviewInfo(stored.preInterviewInfo);
      setWelcomeMessage(stored.welcomeMessage);
      setQuestions(stored.questions);
      setAnswers(stored.answers);
      setFinalLetter(stored.finalLetter);
      setMemoryCard(stored.memoryCard ?? "");
      setSummary(stored.summary ?? "");
      setFutureMessage(stored.futureMessage ?? "");
      setSelectedLetterTone(stored.selectedLetterTone ?? "담담하게");
      setSelectedLetterLength(stored.selectedLetterLength ?? "보통");
      setLetterRevisionHistory(stored.letterRevisionHistory ?? []);
      setCreatedAt(stored.createdAt);
      setVoiceEnabled(stored.voiceEnabled);
      setCurrentQuestion(stored.currentQuestion);
      setTargetQuestionCount(
        Math.max(DEFAULT_QUESTION_LIMIT, Math.min(QUESTION_LIMIT, stored.questions.length || DEFAULT_QUESTION_LIMIT)),
      );
      setStep(stored.step === "preInterview" ? "contentType" : stored.step ?? "contentType");
    } else {
      setStep("contentType");
    }
    setIsLoaded(true);
  }, []);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    saveStoredLocale(nextLocale);
  }

  function returnToMain() {
    cancelSpeech();
    window.history.replaceState(null, "", "/");
    setStep("contentType");
  }

  useEffect(() => {
    if (!isLoaded) return;
    const record: InterviewRecord = {
      preInterviewInfo,
      welcomeMessage,
      questions,
      answers,
      finalLetter,
      futureMessage,
      locale,
      memoryCard,
      summary,
      createdAt,
      selectedLetterTone,
      selectedLetterLength,
      letterRevisionHistory,
      voiceEnabled,
      currentQuestion,
      step,
    };
    saveStoredInterview(record);
  }, [
    answers,
    createdAt,
    currentQuestion,
    finalLetter,
    futureMessage,
    isLoaded,
    locale,
    letterRevisionHistory,
    preInterviewInfo,
    questions,
    memoryCard,
    selectedLetterLength,
    selectedLetterTone,
    step,
    summary,
    voiceEnabled,
    welcomeMessage,
  ]);

  const speakWithGuide = useCallback((text: string) => {
    speakKorean(text, {
      onEnd: () => setIsSpeaking(false),
      onStart: () => setIsSpeaking(true),
    });
  }, []);

  useEffect(() => {
    if (!voiceEnabled || !spokenText) return;
    speakWithGuide(spokenText);
    return () => {
      cancelSpeech();
      setIsSpeaking(false);
    };
  }, [speakWithGuide, spokenText, voiceEnabled]);

  useEffect(() => {
    return () => {
      if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    };
  }, [recordedVideoUrl]);

  function selectContentType(nextType: ContentType) {
    setContentType(nextType);
    setPreInterviewInfo(emptyInfo);
    window.history.pushState(null, "", `/studio/${nextType}`);
    setStep("studio");
  }

  function enterWelcomeRoom(info: PreInterviewInfo) {
    const nextWelcomeMessage = createWelcomeMessage(info, locale);
    setPreInterviewInfo(info);
    setWelcomeMessage(nextWelcomeMessage);
    setQuestions([createFirstQuestion(info, contentType, locale)]);
    setAnswers([]);
    setCurrentQuestion(0);
    setTargetQuestionCount(DEFAULT_QUESTION_LIMIT);
    setFinalLetter("");
    setMemoryCard("");
    setSummary("");
    setFutureMessage("");
    setVaultUrl("");
    setLetterRevisionHistory([]);
    setCreatedAt(new Date().toISOString());
    setStep("welcome");
  }

  function saveAnswer(answer: string) {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) return;

    const nextAnswers = [...answers];
    nextAnswers[currentQuestion] = trimmedAnswer;
    const answeredCount = nextAnswers.filter(Boolean).length;
    setAnswers(nextAnswers);

    if (answeredCount >= targetQuestionCount || answeredCount >= QUESTION_LIMIT) {
      setStep("closing");
      cancelSpeech();
      return;
    }

    const nextQuestions = [...questions];
    nextQuestions[answeredCount] = createNextQuestion({
      preInterviewInfo,
      answer: trimmedAnswer,
      contentType,
      locale,
      questionIndex: answeredCount,
    });
    setQuestions(nextQuestions);
    setCurrentQuestion(answeredCount);
  }

  function continueInterview() {
    const answeredCount = answers.filter(Boolean).length;
    if (!answeredCount || answeredCount >= QUESTION_LIMIT) return;

    const nextQuestions = [...questions];
    nextQuestions[answeredCount] = createNextQuestion({
      preInterviewInfo,
      answer: answers[answeredCount - 1] ?? "",
      contentType,
      locale,
      questionIndex: answeredCount,
    });
    setQuestions(nextQuestions);
    setTargetQuestionCount(Math.min(answeredCount + 1, QUESTION_LIMIT));
    setCurrentQuestion(answeredCount);
    setStep("interview");
  }

  function makeOutputs() {
    const nextLetter = createFinalLetter({
      preInterviewInfo,
      questions,
      answers,
      tone: selectedLetterTone,
      length: selectedLetterLength,
      locale,
      });
    const nextCard = createMemoryCard({ answers, contentType, locale, preInterviewInfo, unlockDate, unlockType });
    const nextSummary = createVaultSummary({ answers, contentType, locale, preInterviewInfo, unlockDate, unlockType });
    const nextFutureMessage = createFutureMessage({ answers, contentType, locale, preInterviewInfo, unlockDate, unlockType });

    setFinalLetter(nextLetter);
    setMemoryCard(nextCard);
    setSummary(nextSummary);
    setFutureMessage(nextFutureMessage);
    setStep("outputs");
    cancelSpeech();
  }

  function reviseLetter(action: LetterRevisionAction) {
    const revisedLetter = createFinalLetter({
      preInterviewInfo,
      questions,
      answers,
      tone: mapRevisionToTone(action, selectedLetterTone),
      length: action === "짧게 줄이기" ? "짧게" : selectedLetterLength,
      locale,
      revisionAction: action,
      previousLetter: finalLetter,
    });
    setLetterRevisionHistory((history) => [
      ...history,
      { action, createdAt: new Date().toISOString(), letter: finalLetter },
    ]);
    setFinalLetter(revisedLetter);
  }

  function createVault() {
    if (!consentAccepted) {
      window.alert(t.errors.privacyRequired);
      return;
    }
    if (!recipient.phone?.trim() && !recipient.email?.trim()) {
      window.alert(t.errors.contactRequired);
      return;
    }
    if ((unlockType === "specific_date" || unlockType === "yearly_reminder") && !unlockDate) {
      window.alert(t.errors.dateRequired);
      return;
    }

    const now = new Date().toISOString();
    const computedUnlockDate = getComputedUnlockDate(unlockType, unlockDate);
    const vaultId = createVaultId();
    saveMemoryVault({
      vaultId,
      contentType,
      locale,
      status: unlockType === "now" || unlockType === "yearly_reminder" ? "unlocked" : "locked",
      creatorName: preInterviewInfo.customerName || "나",
      subjectName: preInterviewInfo.subjectName,
      relationship: preInterviewInfo.relationship,
      preInterviewInfo: { ...preInterviewInfo },
      interview: { answers, createdAt: createdAt || now, questions },
      outputs: { letter: finalLetter, memoryCard, summary, futureMessage },
      unlock: {
        type: unlockType,
        date: computedUnlockDate,
        conditionLabel: getConditionLabel(unlockType),
        yearlyMonthDay: unlockType === "yearly_reminder" ? unlockDate.slice(5) : undefined,
        isManuallyUnlocked: false,
      },
      recipients: [recipient],
      guardians: guardian.name || guardian.phone || guardian.email ? [guardian] : [],
      share: {
        publicSlug: vaultId,
        accessCode: createAccessCode(),
        allowLinkPreview: false,
      },
      privacy: {
        consentAccepted,
        consentAcceptedAt: now,
        deletionRequested: false,
        retentionPolicy: "temporary",
      },
      createdAt: now,
      updatedAt: now,
    });
    setVaultUrl(getVaultUrl(vaultId));
  }

  function saveRecordedVideo(blob: Blob) {
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl(URL.createObjectURL(blob));
  }

  function resetInterview() {
    clearStoredInterview();
    cancelSpeech();
    setStep("contentType");
    setPreInterviewInfo(emptyInfo);
    setWelcomeMessage("");
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestion(0);
    setTargetQuestionCount(DEFAULT_QUESTION_LIMIT);
    setFinalLetter("");
    setMemoryCard("");
    setSummary("");
    setFutureMessage("");
    setVaultUrl("");
    setSelectedLetterTone("담담하게");
    setSelectedLetterLength("보통");
    setLetterRevisionHistory([]);
    setUnlockType("now");
    setUnlockDate("");
    setRecipient({ name: "", phone: "", email: "" });
    setGuardian({ name: "", phone: "", email: "" });
    setConsentAccepted(false);
    if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
    setRecordedVideoUrl("");
    setCreatedAt("");
    setVoiceEnabled(true);
    setIsSpeaking(false);
  }

  function toggleVoice() {
    if (voiceEnabled) {
      cancelSpeech();
      setIsSpeaking(false);
    }
    setVoiceEnabled((enabled) => !enabled);
  }

  return (
    <main className="app-shell">
      <section className="memory-panel">
        {step !== "contentType" && (
          <button className="main-return-button" type="button" onClick={returnToMain}>
            메인으로 돌아가기
          </button>
        )}
        {step !== "contentType" && (
          <>
            <div className="brand-row">
              <span className="brand-mark">
                <Heart size={18} aria-hidden="true" />
              </span>
              <span>Memory Room</span>
            </div>
            <LanguageSwitcher locale={locale} onChange={changeLocale} />
          </>
        )}

        {step === "contentType" && <ContentTypeSelector locale={locale} onSelect={selectContentType} t={t} />}

        {step === "studio" && (
          <StudioExperience
            contentType={contentType}
            locale={locale}
            onBack={() => {
              window.history.replaceState(null, "", "/");
              setStep("contentType");
            }}
          />
        )}

        {step === "preInterview" && (
          <PreInterviewForm
            contentType={contentType}
            initialInfo={preInterviewInfo}
            locale={locale}
            t={t}
            onSubmit={enterWelcomeRoom}
          />
        )}

        {step === "welcome" && (
          <WelcomeRoom
            isSpeaking={isSpeaking}
            locale={locale}
            welcomeMessage={welcomeMessage}
            voiceEnabled={voiceEnabled}
            onEnter={() => setStep("interview")}
            onReplay={() => speakWithGuide(welcomeMessage)}
            onToggleVoice={toggleVoice}
          />
        )}

        {step === "interview" && (
          <InterviewRoom
            question={currentQuestionText}
            questionNumber={currentQuestion + 1}
            totalQuestions={targetQuestionCount}
            isSpeaking={isSpeaking}
            locale={locale}
            voiceEnabled={voiceEnabled}
            recordedVideoUrl={recordedVideoUrl}
            videoFileName={createVideoFileName(preInterviewInfo.customerName)}
            onBack={() => setStep("preInterview")}
            onReplay={() => speakWithGuide(currentQuestionText)}
            onVideoRecorded={saveRecordedVideo}
            onSaveAnswer={saveAnswer}
            onToggleVoice={toggleVoice}
          />
        )}

        {step === "closing" && (
          <section className="closing-screen">
            <p className="eyebrow">{closingCopy[locale].eyebrow}</p>
            <h1>{closingCopy[locale].title}</h1>
            <p>{closingCopy[locale].body}</p>

            <div className="letter-options">
              <fieldset className="choice-field">
                <legend>{closingCopy[locale].tone}</legend>
                <div className="choice-row">
                  {letterTones.map((tone) => (
                    <label className="choice-pill" key={tone}>
                      <input
                        type="radio"
                        name="letterTone"
                        checked={selectedLetterTone === tone}
                        onChange={() => setSelectedLetterTone(tone)}
                      />
                      <span>{letterToneLabels[locale][tone]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="choice-field">
                <legend>{closingCopy[locale].length}</legend>
                <div className="choice-row">
                  {letterLengths.map((length) => (
                    <label className="choice-pill" key={length}>
                      <input
                        type="radio"
                        name="letterLength"
                        checked={selectedLetterLength === length}
                        onChange={() => setSelectedLetterLength(length)}
                      />
                      <span>{letterLengthLabels[locale][length]}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="button-row soft-center">
              {answers.filter(Boolean).length < QUESTION_LIMIT && (
                <button className="secondary-button" type="button" onClick={continueInterview}>
                  {closingCopy[locale].continue}
                </button>
              )}
              <button className="primary-button compact" type="button" onClick={makeOutputs}>
                {closingCopy[locale].make}
              </button>
            </div>
          </section>
        )}

        {step === "outputs" && (
          <FinalOutputs
            consentAccepted={consentAccepted}
            finalLetter={finalLetter}
            guardian={guardian}
            memoryCard={memoryCard}
            recipient={recipient}
            summary={summary}
            futureMessage={futureMessage}
            unlockDate={unlockDate}
            unlockType={unlockType}
            vaultUrl={vaultUrl}
            t={t}
            locale={locale}
            onChangeConsent={setConsentAccepted}
            onChangeGuardian={setGuardian}
            onChangeRecipient={setRecipient}
            onChangeUnlockDate={setUnlockDate}
            onChangeUnlockType={setUnlockType}
            onCreateVault={createVault}
            onReset={resetInterview}
            onRevise={reviseLetter}
          />
        )}
      </section>
    </main>
  );
}

function mapRevisionToTone(action: LetterRevisionAction, currentTone: LetterTone): LetterTone {
  if (action === "더 부드럽게") return "따뜻하게";
  if (action === "더 담담하게") return "담담하게";
  if (action === "더 감성적으로") return "조금 더 감성적으로";
  if (action === "가족에게 말하듯 수정") return "따뜻하게";
  return currentTone;
}

function getConditionLabel(type: UnlockType) {
  if (type === "marriage") return "결혼하는 날";
  if (type === "birth_of_child") return "아이가 태어나는 날";
  if (type === "birth_of_grandchild") return "손주가 태어나는 날";
  if (type === "after_death") return "가족 관리자 확인";
  if (type === "guardian_approval") return "가족 관리자 승인";
  return undefined;
}

function getComputedUnlockDate(type: UnlockType, selectedDate: string) {
  if (type === "specific_date") return selectedDate;
  if (type === "one_year_later") return addYearsToToday(1);
  if (type === "five_years_later") return addYearsToToday(5);
  if (type === "ten_years_later") return addYearsToToday(10);
  return undefined;
}

function addYearsToToday(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(date);
}
