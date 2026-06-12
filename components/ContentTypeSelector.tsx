"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Briefcase,
  Clock,
  Gift,
  HeartHandshake,
  Lock,
  MessageSquare,
  Mic2,
  Music2,
  PlayCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { I18nMessages } from "../lib/i18n/types";
import type { ContentType, Locale } from "../lib/types";

type Props = {
  locale: Locale;
  onChangeLocale: (locale: Locale) => void;
  onSelect: (type: ContentType) => void;
  t: I18nMessages;
};

const mainContentOrder: ContentType[] = [
  "family_memory",
  "future_self",
  "parent_life_book",
  "couple_time_capsule",
  "kpop_recording",
  "live_performance",
  "artist_interview",
  "founder_story",
];

const visitorContentOrder: ContentType[] = [
  "korea_trip",
  "kpop_experience",
  "kdrama_message",
  "seoul_night_letter",
];

const iconMap = {
  artist_interview: Mic2,
  couple_time_capsule: HeartHandshake,
  family_memory: Users,
  founder_story: Briefcase,
  future_self: Clock,
  kdrama_message: Mic2,
  korea_trip: Archive,
  kpop_experience: Music2,
  kpop_recording: Music2,
  live_performance: Archive,
  parent_life_book: BookOpen,
  seoul_night_letter: HeartHandshake,
} satisfies Record<ContentType, typeof Users>;

const stepIcons = [MessageSquare, Mic2, Gift];
const featureTypes: Array<{ image: string; type: ContentType }> = [
  { image: "👨‍👩‍👧‍👦", type: "family_memory" },
  { image: "✉️", type: "future_self" },
  { image: "🖼️", type: "korea_trip" },
  { image: "🔐", type: "parent_life_book" },
];

const sampleCards = [
  {
    body: "“사랑하는 나의 가족에게, 언젠가 이 이야기가 작은 위로가 되기를.”",
    label: "2036년 6월 5일 공개",
    title: "Memory Card",
  },
  {
    body: "비 오는 날 우산을 씌워주던 모습. 그때의 마음이 아직 남아 있습니다.",
    label: "가족 기록",
    title: "편지 미리보기",
  },
  {
    body: "목소리, 영상, 편지로 남겨진 기록은 비공개 보관함에 저장됩니다.",
    label: "Private Vault",
    title: "보관함 화면",
  },
];

const languageButtons = [
  { label: "KR", locale: "ko" },
  { label: "EN", locale: "en" },
  { label: "JP", locale: "ja" },
  { label: "CN", locale: "zh" },
] satisfies Array<{ label: string; locale: Locale }>;

type LandingCopy = {
  allMethods: string;
  badge: string;
  cta: string;
  features: Array<{ body: string; title: string }>;
  gallery: string;
  hero: ReactNode;
  less: string;
  more: string;
  note: string;
  steps: Array<{ body: string; title: string }>;
  stepsTitle: string;
  subtitle: string;
  trustBody: string;
  trustTitle: string;
  visitorMethods: string;
};

const landingCopy: Record<Locale, LandingCopy> = {
  ko: {
    badge: "✶ AI 기반 기록 스튜디오",
    cta: "기록 시작하기",
    gallery: "샘플 보기",
    hero: <>오늘의 이야기를,<br />미래의 누군가에게<br />남기세요.</>,
    note: "이 기기는 공용 기기입니다. 기록 완료 후 입력 내용은 자동으로 삭제됩니다.",
    subtitle: "목소리, 영상, 편지로 인생의 순간을 기록하고 원하는 날에 다시 열어볼 수 있는 프라이빗 메모리 공간입니다.",
    stepsTitle: "기록에서 공개까지, 3단계로 간단하게",
    trustBody: "기록은 비공개로 보관되며, 사용자가 정한 조건과 날짜에만 열람됩니다.",
    trustTitle: "소중한 기억, 안전하게 지켜드립니다",
    more: "더 많은 기록 방식 보기",
    less: "기록 방식 접기",
    allMethods: "모든 기록 방식",
    visitorMethods: "여행자 기록 체험",
    steps: [
      { title: "질문에 답하기", body: "AI가 던지는 질문에 천천히 답하며 내 안의 이야기를 꺼내보세요." },
      { title: "음성·영상·편지로 저장하기", body: "목소리, 영상, 편지, 사진 등 다양한 형태로 기록할 수 있어요." },
      { title: "원하는 날짜 또는 가족에게 공개하기", body: "지정한 날짜에, 또는 소중한 사람에게 자동으로 공개됩니다." },
    ],
    features: [
      { title: "가족에게 남기는 이야기", body: "부모님, 배우자, 자녀, 친구에게 전하고 싶은 마음을 조용히 남겨보세요." },
      { title: "미래의 나에게 보내는 편지", body: "지금의 나에게서 미래의 나에게 보내는 작은 약속과 편지." },
      { title: "여행과 공연의 기록", body: "여행의 순간, 공연의 떨림, 오늘의 분위기를 기록으로 보관하세요." },
      { title: "프라이빗 메모리 보관함", body: "모든 기록은 안전하게 보관되고, 원하는 때에 다시 열어볼 수 있어요." },
    ],
  },
  en: {
    badge: "✶ AI Recording Studio",
    cta: "Start Recording",
    gallery: "View Samples",
    hero: <>Save today’s story<br />for someone<br />in the future.</>,
    note: "This is a shared device. Your input is deleted automatically after the session.",
    subtitle: "A private memory room where life moments can be saved as voice, video, and letters, then opened on the day you choose.",
    stepsTitle: "From recording to sharing, in three simple steps",
    trustBody: "Records stay private and open only on the date or condition you choose.",
    trustTitle: "Your memories stay protected",
    more: "View more record types",
    less: "Hide record types",
    allMethods: "All record types",
    visitorMethods: "Visitor experiences",
    steps: [
      { title: "Answer questions", body: "Take your time and answer gentle AI-guided questions." },
      { title: "Save as voice, video, and letter", body: "Keep your story in the format that feels right." },
      { title: "Open on a date or with family", body: "Share only with the person and timing you choose." },
    ],
    features: [
      { title: "A story for family", body: "Leave words for parents, partners, children, or friends." },
      { title: "A letter to future me", body: "Send today’s promise and thoughts to your future self." },
      { title: "Travel and performance records", body: "Keep trips, stages, and meaningful moments." },
      { title: "Private Memory Vault", body: "Store records safely and open them only when you choose." },
    ],
  },
  ja: {
    badge: "✶ AI記録スタジオ",
    cta: "記録を始める",
    gallery: "サンプルを見る",
    hero: <>今日の物語を、<br />未来の誰かへ<br />残しましょう。</>,
    note: "この端末は共用端末です。記録終了後、入力内容は自動的に削除されます。",
    subtitle: "声、映像、手紙で人生の瞬間を残し、選んだ日に開けるプライベートな記憶の部屋です。",
    stepsTitle: "記録から公開まで、3つのステップ",
    trustBody: "記録は非公開で保管され、指定した条件と日付でのみ閲覧できます。",
    trustTitle: "大切な記憶を安全に守ります",
    more: "ほかの記録方法を見る",
    less: "記録方法を閉じる",
    allMethods: "すべての記録方法",
    visitorMethods: "旅行者向け体験",
    steps: [
      { title: "質問に答える", body: "AIのやさしい質問に、自分のペースで答えます。" },
      { title: "音声・映像・手紙で保存", body: "声、映像、手紙など、自然な形で残せます。" },
      { title: "希望の日付や家族に公開", body: "選んだ相手とタイミングだけに公開されます。" },
    ],
    features: [
      { title: "家族へ残す物語", body: "大切な人へ伝えたい気持ちを静かに残します。" },
      { title: "未来の自分への手紙", body: "今の思いや約束を未来の自分へ送ります。" },
      { title: "旅と公演の記録", body: "旅の場面や舞台の空気を記録します。" },
      { title: "プライベート保管庫", body: "記録を安全に保管し、選んだ時に開けます。" },
    ],
  },
  zh: {
    badge: "✶ AI记录工作室",
    cta: "开始记录",
    gallery: "查看示例",
    hero: <>把今天的故事，<br />留给未来的<br />某个人。</>,
    note: "这是一台公共设备。记录结束后，输入内容会自动删除。",
    subtitle: "用声音、影像和信件保存人生瞬间，并在你选择的日期再次打开的私人记忆空间。",
    stepsTitle: "从记录到公开，只需三步",
    trustBody: "记录将以非公开方式保存，只有在你设定的条件和日期下才可查看。",
    trustTitle: "安全守护珍贵记忆",
    more: "查看更多记录方式",
    less: "收起记录方式",
    allMethods: "全部记录方式",
    visitorMethods: "旅行者记录体验",
    steps: [
      { title: "回答问题", body: "按照自己的节奏回答AI提出的温和问题。" },
      { title: "保存为声音、影像和信", body: "用适合你的形式留下故事。" },
      { title: "按日期或给家人公开", body: "只在你选择的时间和对象面前打开。" },
    ],
    features: [
      { title: "留给家人的故事", body: "把想对父母、伴侣、孩子或朋友说的话留下来。" },
      { title: "写给未来的自己", body: "把今天的想法和约定送给未来的自己。" },
      { title: "旅行与演出记录", body: "保存旅途、舞台和特别时刻。" },
      { title: "私人记忆保管箱", body: "安全保存记录，并在你选择的时候打开。" },
    ],
  },
};

export function ContentTypeSelector({ locale, onChangeLocale, onSelect, t }: Props) {
  const [activeView, setActiveView] = useState<"record" | "gallery">("record");
  const [showAll, setShowAll] = useState(false);
  const copy = landingCopy[locale];

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-[1180px] overflow-hidden rounded-[32px] border border-white/70 bg-[#fffaf0]/75 p-4 shadow-[0_28px_110px_rgba(62,47,33,0.16)] backdrop-blur-2xl sm:p-6 lg:p-8"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <nav className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-[#2f3526]">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f3526] text-[#f9f3e8]">
            <HeartHandshake size={17} aria-hidden="true" />
          </span>
          Memory Room
        </div>
        <div className="flex rounded-full bg-white/65 p-1 text-xs font-bold text-[#655c50] shadow-sm">
          {languageButtons.map((item) => (
            <button
              className={`rounded-full px-3 py-1.5 transition ${item.locale === locale ? "bg-[#2f3526] text-white" : "hover:bg-white/80"}`}
              key={item.locale}
              type="button"
              onClick={() => onChangeLocale(item.locale)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="px-1 sm:px-4 lg:px-6"
          initial={{ opacity: 0, x: -18 }}
          transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex rounded-full bg-[#fff0df] px-3 py-1.5 text-xs font-bold text-[#a86843]">
            {copy.badge}
          </span>
          <h1 className="mt-4 max-w-[620px] text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.01em] text-[#2d281f] sm:text-6xl lg:text-[5.4rem]">
            {copy.hero}
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-8 text-[#6f6558] sm:text-base">
            {copy.subtitle}
          </p>
          <p className="mt-4 inline-flex max-w-[560px] rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#6f5b48] shadow-sm">
            {copy.note}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-[#303827] px-6 text-sm font-bold text-white shadow-[0_18px_38px_rgba(48,56,39,0.28)] transition hover:-translate-y-0.5 hover:bg-[#22291c]"
              type="button"
              onClick={() => onSelect("family_memory")}
            >
              <Mic2 size={18} aria-hidden="true" />
              {copy.cta}
              <ArrowRight className="transition group-hover:translate-x-1" size={17} aria-hidden="true" />
            </button>
            <button
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white/75 px-6 text-sm font-bold text-[#3b352d] shadow-[0_14px_28px_rgba(80,60,40,0.1)] transition hover:-translate-y-0.5"
              type="button"
              onClick={() => setActiveView("gallery")}
            >
              <PlayCircle size={18} aria-hidden="true" />
              {copy.gallery}
            </button>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative min-h-[340px] rounded-[30px] bg-[radial-gradient(circle_at_30%_10%,rgba(255,255,255,0.8),transparent_30%),linear-gradient(135deg,#f6ebd9,#fdf8ee_48%,#e8ddc9)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_30px_80px_rgba(70,50,32,0.12)]"
          initial={{ opacity: 0, scale: 0.98 }}
          transition={{ delay: 0.22, duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            className="absolute right-6 top-5 h-28 w-28 rounded-full bg-white/40 blur-sm"
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute right-8 top-8 h-48 w-24 rounded-t-full bg-[#f9f5ea] shadow-[0_22px_45px_rgba(70,50,32,0.13)]" />
          <div className="absolute bottom-8 right-7 h-14 w-20 rounded-full bg-[#c9954f] shadow-[0_14px_30px_rgba(108,69,34,0.25)]" />
          <div className="absolute bottom-20 right-14 h-16 w-9 rounded-full bg-[#fff8d7] opacity-80 blur-md" />
          <div className="absolute left-10 top-12 h-44 w-32 rotate-[-8deg] rounded-[10px] border-[10px] border-[#ead8b8] bg-[linear-gradient(180deg,#f8c97e,#80633d)] p-2 shadow-[0_22px_50px_rgba(78,51,28,0.18)]">
            <div className="h-full rounded-md bg-[linear-gradient(180deg,#eec27a,#d38c45_55%,#5c4631)]" />
          </div>
          <div className="absolute bottom-12 left-[44%] w-44 rotate-[-5deg] rounded-[12px] bg-[#fffaf0] p-5 text-center text-sm leading-7 text-[#4f463b] shadow-[0_18px_45px_rgba(79,58,42,0.14)]">
            사랑하는 우리 가족에게,
            <br />
            언젠가 이 이야기가
            <br />
            따뜻한 기억이 되기를
          </div>
        </motion.div>
      </div>

      {activeView === "gallery" ? (
        <MemoryGallery />
      ) : (
        <>
          <section className="mt-8 rounded-[24px] border border-[#eadfcd] bg-white/70 p-6 shadow-[0_18px_52px_rgba(72,52,33,0.08)] sm:p-8">
            <h2 className="text-center text-xl font-semibold text-[#2d281f]">{copy.stepsTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {copy.steps.map((step, index) => {
                const StepIcon = stepIcons[index];
                return (
                <motion.article
                  className="relative grid justify-items-center gap-3 text-center"
                  key={step.title}
                  transition={{ delay: 0.1 * index, duration: 0.7 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 18 }}
                >
                  <div className={`grid h-20 w-20 place-items-center rounded-full ${index === 0 ? "bg-[#eef3dd]" : index === 1 ? "bg-[#fff0d9]" : "bg-[#fde9df]"}`}>
                    <StepIcon className={index === 0 ? "text-[#7b8d54]" : index === 1 ? "text-[#c98a35]" : "text-[#c8795b]"} size={28} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-[#b8a68d]">0{index + 1}</span>
                  <h3 className="font-semibold text-[#2f2a24]">{step.title}</h3>
                  <p className="max-w-[260px] text-sm leading-7 text-[#7a7064]">{step.body}</p>
                </motion.article>
              );})}
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {copy.features.map((card, index) => {
              const feature = featureTypes[index];
              return (
              <motion.button
                className="group grid min-h-[220px] content-between rounded-[20px] border border-white/75 bg-white/58 p-5 text-left shadow-[0_16px_45px_rgba(78,58,39,0.08)] transition hover:-translate-y-1 hover:bg-white/78"
                key={card.title}
                type="button"
                onClick={() => onSelect(feature.type)}
                transition={{ delay: 0.08 * index, duration: 0.7 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
              >
                <span className="text-5xl drop-shadow-sm">{feature.image}</span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-[#2f2a24]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#746a5d]">{card.body}</p>
                </div>
                <ArrowRight className="justify-self-end text-[#9d8b74] transition group-hover:translate-x-1" size={17} aria-hidden="true" />
              </motion.button>
            );})}
          </section>

          <section className="mt-4 grid gap-4 rounded-[18px] bg-[#fff8eb]/80 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3dfbb] text-[#8b6534]">
                <Lock size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-[#2f2a24]">{copy.trustTitle}</h2>
                <p className="text-sm leading-6 text-[#7b6f61]">{copy.trustBody}</p>
              </div>
            </div>
            <TrustBadge label="암호화 저장" value="AES-256" />
            <TrustBadge label="비공개 보관" value="오직 나만" />
            <TrustBadge label="조건부 공개" value="날짜·대상 지정" />
          </section>

          <section className="mt-4 grid gap-4 md:grid-cols-3">
            {sampleCards.map((sample) => (
              <article className="rounded-[20px] border border-white/70 bg-white/55 p-5 shadow-[0_16px_44px_rgba(78,58,39,0.08)]" key={sample.title}>
                <p className="text-xs font-bold text-[#b58251]">{sample.label}</p>
                <h3 className="mt-3 text-xl font-semibold text-[#2f2a24]">{sample.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#756a5f]">{sample.body}</p>
              </article>
            ))}
          </section>

          <div className="mt-5 flex justify-center">
            <button
              className="rounded-full bg-white/65 px-5 py-3 text-sm font-bold text-[#5d544a] shadow-sm transition hover:bg-white"
              type="button"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? copy.less : copy.more}
            </button>
          </div>

          {showAll && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ContentSection label={copy.allMethods} items={mainContentOrder} onSelect={onSelect} t={t} />
              <ContentSection label={copy.visitorMethods} items={visitorContentOrder} onSelect={onSelect} t={t} />
            </div>
          )}
        </>
      )}
    </motion.section>
  );
}

function TrustBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-2">
      <ShieldCheck size={16} className="text-[#6d7d68]" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold text-[#8c8174]">{label}</p>
        <p className="text-xs font-semibold text-[#4f463b]">{value}</p>
      </div>
    </div>
  );
}

function ContentCard({
  onSelect,
  t,
  type,
}: {
  onSelect: (type: ContentType) => void;
  t: I18nMessages;
  type: ContentType;
}) {
  const item = t.content[type];
  const Icon = iconMap[type];

  return (
    <button
      className="group grid gap-3 rounded-[18px] border border-white/70 bg-white/50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:bg-white/80"
      type="button"
      onClick={() => onSelect(type)}
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f3ecdd] text-[#6d7d68]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <strong className="text-base text-[#2f2a24]">{item.title}</strong>
      <span className="text-sm leading-6 text-[#756a5f]">{item.description}</span>
      <em className="not-italic text-xs font-bold text-[#9d5f46]">{item.resultLabel}</em>
    </button>
  );
}

function ContentSection({
  items,
  label,
  onSelect,
  t,
}: {
  items: ContentType[];
  label: string;
  onSelect: (type: ContentType) => void;
  t: I18nMessages;
}) {
  return (
    <section className="grid gap-3 rounded-[22px] bg-white/35 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9d5f46]">{label}</p>
      <div className="grid gap-3">
        {items.map((type) => (
          <ContentCard key={type} onSelect={onSelect} t={t} type={type} />
        ))}
      </div>
    </section>
  );
}

function MemoryGallery() {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 grid gap-4 md:grid-cols-2"
      initial={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.7 }}
    >
      {sampleCards.map((sample, index) => (
        <article
          className={`${index === 0 ? "md:col-span-2" : ""} rounded-[24px] border border-white/70 bg-white/60 p-7 shadow-[0_18px_52px_rgba(72,52,33,0.1)]`}
          key={sample.title}
        >
          <p className="text-xs font-bold text-[#b58251]">{sample.label}</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#2f2a24]">{sample.title}</h2>
          <p className="mt-4 max-w-[620px] text-base leading-8 text-[#756a5f]">{sample.body}</p>
        </article>
      ))}
    </motion.section>
  );
}
