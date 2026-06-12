export type LifeStatus = "living" | "remembered";
export type Purpose = "감사" | "사과" | "추억" | "미래편지" | "가족기록";
export type Locale = "ko" | "en" | "ja" | "zh";
export type LetterTone =
  | "담담하게"
  | "따뜻하게"
  | "조금 더 감성적으로"
  | "아이에게 남기는 말처럼"
  | "부모님께 드리는 말처럼";
export type LetterLength = "짧게" | "보통" | "길게";
export type LetterRevisionAction =
  | "더 부드럽게"
  | "더 담담하게"
  | "더 감성적으로"
  | "짧게 줄이기"
  | "가족에게 말하듯 수정";

export type PreInterviewInfo = {
  customerName: string;
  subjectName: string;
  relationship: string;
  lifeStatus: LifeStatus;
  purpose: Purpose;
  firstMemory: string;
  messageToday: string;
};

export type LetterRevision = {
  action: LetterRevisionAction;
  createdAt: string;
  letter: string;
};

export type ContentType =
  | "family_memory"
  | "future_self"
  | "parent_life_book"
  | "couple_time_capsule"
  | "kpop_recording"
  | "live_performance"
  | "artist_interview"
  | "founder_story"
  | "korea_trip"
  | "kpop_experience"
  | "kdrama_message"
  | "seoul_night_letter";

export type OutputType =
  | "memoryLetter"
  | "memoryCard"
  | "memorySummary"
  | "futureMessage"
  | "travelCard"
  | "recordingCard"
  | "dramaMessageCard"
  | "nightLetter";

export type UnlockType =
  | "now"
  | "specific_date"
  | "yearly_reminder"
  | "marriage"
  | "birth_of_child"
  | "birth_of_grandchild"
  | "one_year_later"
  | "five_years_later"
  | "ten_years_later"
  | "after_death"
  | "guardian_approval";

export type VaultStatus = "draft" | "locked" | "unlocked" | "archived";

export type Recipient = {
  name: string;
  phone?: string;
  email?: string;
};

export type Guardian = {
  name: string;
  phone?: string;
  email?: string;
};

export type MemoryVault = {
  vaultId: string;
  contentType: ContentType;
  locale: Locale;
  status: VaultStatus;
  creatorName: string;
  subjectName?: string;
  relationship?: string;
  preInterviewInfo: Record<string, unknown>;
  interview: {
    questions: string[];
    answers: string[];
    createdAt: string;
  };
  outputs: {
    letter?: string;
    memoryCard?: string;
    summary?: string;
    futureMessage?: string;
  };
  unlock: {
    type: UnlockType;
    date?: string;
    conditionLabel?: string;
    yearlyMonthDay?: string;
    isManuallyUnlocked: boolean;
    openedAt?: string;
  };
  recipients: Recipient[];
  guardians: Guardian[];
  share: {
    publicSlug: string;
    accessCode: string;
    allowLinkPreview: boolean;
  };
  privacy: {
    consentAccepted: boolean;
    consentAcceptedAt?: string;
    retentionPolicy: "temporary" | "long_term";
    deletionRequested: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type InterviewRecord = {
  preInterviewInfo: PreInterviewInfo;
  welcomeMessage: string;
  questions: string[];
  answers: string[];
  finalLetter: string;
  futureMessage?: string;
  locale?: Locale;
  memoryCard?: string;
  summary?: string;
  createdAt: string;
  selectedLetterTone: LetterTone;
  selectedLetterLength: LetterLength;
  letterRevisionHistory: LetterRevision[];
  voiceEnabled: boolean;
  currentQuestion: number;
  step: "contentType" | "studio" | "preInterview" | "welcome" | "interview" | "closing" | "outputs";
};
