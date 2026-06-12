"use client";

import { useState } from "react";
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

const steps = [
  {
    body: "AI가 던지는 질문에 천천히 답하며 내 안의 이야기를 꺼내보세요.",
    icon: MessageSquare,
    title: "질문에 답하기",
  },
  {
    body: "목소리, 영상, 편지, 사진 등 다양한 형태로 기록할 수 있어요.",
    icon: Mic2,
    title: "음성·영상·편지로 저장하기",
  },
  {
    body: "지정한 날짜에, 또는 소중한 사람에게 자동으로 공개됩니다.",
    icon: Gift,
    title: "원하는 날짜 또는 가족에게 공개하기",
  },
];

const featureCards = [
  {
    body: "부모님, 배우자, 자녀, 친구에게 전하고 싶은 마음을 조용히 남겨보세요.",
    image: "👨‍👩‍👧‍👦",
    title: "가족에게 남기는 이야기",
    type: "family_memory",
  },
  {
    body: "지금의 나에게서 미래의 나에게 보내는 작은 약속과 편지.",
    image: "✉️",
    title: "미래의 나에게 보내는 편지",
    type: "future_self",
  },
  {
    body: "여행의 순간, 공연의 떨림, 오늘의 분위기를 기록으로 보관하세요.",
    image: "🖼️",
    title: "여행과 공연의 기록",
    type: "korea_trip",
  },
  {
    body: "모든 기록은 안전하게 보관되고, 원하는 때에 다시 열어볼 수 있어요.",
    image: "🔐",
    title: "프라이빗 메모리 보관함",
    type: "parent_life_book",
  },
] satisfies Array<{ body: string; image: string; title: string; type: ContentType }>;

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

export function ContentTypeSelector({ onSelect, t }: Props) {
  const [activeView, setActiveView] = useState<"record" | "gallery">("record");
  const [showAll, setShowAll] = useState(false);

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
          {(["KR", "EN", "JP", "CN"] as const).map((label) => (
            <button
              className={`rounded-full px-3 py-1.5 transition ${label === "KR" ? "bg-[#2f3526] text-white" : "hover:bg-white/80"}`}
              key={label}
              type="button"
            >
              {label}
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
            ✶ AI 기반 기록 스튜디오
          </span>
          <h1 className="mt-4 max-w-[620px] text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.01em] text-[#2d281f] sm:text-6xl lg:text-[5.4rem]">
            오늘의 이야기를,
            <br />
            미래의 누군가에게
            <br />
            남기세요.
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-8 text-[#6f6558] sm:text-base">
            목소리, 영상, 편지로 인생의 순간을 기록하고 원하는 날에 다시 열어볼 수 있는 프라이빗 메모리 공간입니다.
          </p>
          <p className="mt-4 inline-flex max-w-[560px] rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#6f5b48] shadow-sm">
            이 기기는 공용 기기입니다. 기록 완료 후 입력 내용은 자동으로 삭제됩니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-[#303827] px-6 text-sm font-bold text-white shadow-[0_18px_38px_rgba(48,56,39,0.28)] transition hover:-translate-y-0.5 hover:bg-[#22291c]"
              type="button"
              onClick={() => onSelect("family_memory")}
            >
              <Mic2 size={18} aria-hidden="true" />
              기록 시작하기
              <ArrowRight className="transition group-hover:translate-x-1" size={17} aria-hidden="true" />
            </button>
            <button
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-white/75 px-6 text-sm font-bold text-[#3b352d] shadow-[0_14px_28px_rgba(80,60,40,0.1)] transition hover:-translate-y-0.5"
              type="button"
              onClick={() => setActiveView("gallery")}
            >
              <PlayCircle size={18} aria-hidden="true" />
              샘플 보기
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
            <h2 className="text-center text-xl font-semibold text-[#2d281f]">기록에서 공개까지, 3단계로 간단하게</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <motion.article
                  className="relative grid justify-items-center gap-3 text-center"
                  key={step.title}
                  transition={{ delay: 0.1 * index, duration: 0.7 }}
                  viewport={{ once: true }}
                  whileInView={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 18 }}
                >
                  <div className={`grid h-20 w-20 place-items-center rounded-full ${index === 0 ? "bg-[#eef3dd]" : index === 1 ? "bg-[#fff0d9]" : "bg-[#fde9df]"}`}>
                    <step.icon className={index === 0 ? "text-[#7b8d54]" : index === 1 ? "text-[#c98a35]" : "text-[#c8795b]"} size={28} aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold text-[#b8a68d]">0{index + 1}</span>
                  <h3 className="font-semibold text-[#2f2a24]">{step.title}</h3>
                  <p className="max-w-[260px] text-sm leading-7 text-[#7a7064]">{step.body}</p>
                </motion.article>
              ))}
            </div>
          </section>

          <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card, index) => (
              <motion.button
                className="group grid min-h-[220px] content-between rounded-[20px] border border-white/75 bg-white/58 p-5 text-left shadow-[0_16px_45px_rgba(78,58,39,0.08)] transition hover:-translate-y-1 hover:bg-white/78"
                key={card.title}
                type="button"
                onClick={() => onSelect(card.type)}
                transition={{ delay: 0.08 * index, duration: 0.7 }}
                viewport={{ once: true }}
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
              >
                <span className="text-5xl drop-shadow-sm">{card.image}</span>
                <div>
                  <h3 className="text-lg font-semibold leading-snug text-[#2f2a24]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#746a5d]">{card.body}</p>
                </div>
                <ArrowRight className="justify-self-end text-[#9d8b74] transition group-hover:translate-x-1" size={17} aria-hidden="true" />
              </motion.button>
            ))}
          </section>

          <section className="mt-4 grid gap-4 rounded-[18px] bg-[#fff8eb]/80 p-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f3dfbb] text-[#8b6534]">
                <Lock size={18} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-[#2f2a24]">소중한 기억, 안전하게 지켜드립니다</h2>
                <p className="text-sm leading-6 text-[#7b6f61]">기록은 비공개로 보관되며, 사용자가 정한 조건과 날짜에만 열람됩니다.</p>
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
              {showAll ? "기록 방식 접기" : "더 많은 기록 방식 보기"}
            </button>
          </div>

          {showAll && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ContentSection label="모든 기록 방식" items={mainContentOrder} onSelect={onSelect} t={t} />
              <ContentSection label="여행자 기록 체험" items={visitorContentOrder} onSelect={onSelect} t={t} />
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
