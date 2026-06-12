"use client";

import { useState } from "react";
import { Archive, BookOpen, Briefcase, Clock, HeartHandshake, Mic2, Music2, Users } from "lucide-react";
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

const popularContentOrder: ContentType[] = ["family_memory", "future_self", "korea_trip"];

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

export function ContentTypeSelector({ onSelect, t }: Props) {
  const [activeView, setActiveView] = useState<"record" | "gallery">("record");
  const [showAll, setShowAll] = useState(false);
  const hiddenMainItems = mainContentOrder.filter((type) => !popularContentOrder.includes(type));

  return (
    <section className="content-type-screen">
      <nav className="home-tab-row" aria-label="Memory Vault">
        <button className={activeView === "record" ? "is-active" : ""} type="button" onClick={() => setActiveView("record")}>
          {t.home.record}
        </button>
        <button className={activeView === "gallery" ? "is-active" : ""} type="button" onClick={() => setActiveView("gallery")}>
          {t.home.gallery}
        </button>
      </nav>

      <div className="intro-copy entry-copy vault-hero-copy">
        <p className="eyebrow">{t.brand}</p>
        <h1>{t.home.heroTitle}</h1>
        <p>{t.home.heroSubtitle}</p>
        <p className="urgency-copy">{t.home.urgencyLine}</p>
        <p className="hero-support-copy">
          {t.home.futureSupportCopy}
        </p>
        <div className="future-moment-row" aria-label={t.home.timeline}>
          {t.home.futureMoments.map((moment) => <span key={moment}>{moment}</span>)}
        </div>
      </div>

      {activeView === "gallery" ? (
        <MemoryGallery t={t} />
      ) : (
        <>
          <section className="popular-section">
            <p className="eyebrow content-section-label">{t.home.popular}</p>
            <div className="popular-card-grid">
              {popularContentOrder.map((type) => (
                <ContentCard isFeatured key={type} onSelect={onSelect} t={t} type={type} />
              ))}
            </div>
          </section>

          <section className="result-preview-section">
            <p className="eyebrow content-section-label">{t.home.resultPreview}</p>
            <ResultPreview t={t} />
          </section>

          <TimelinePreview t={t} />

          <div className="button-row soft-center">
            <button className="secondary-button" type="button" onClick={() => setShowAll((value) => !value)}>
              {showAll ? t.home.allMethods : t.home.moreMethods}
            </button>
          </div>

          {showAll && (
            <>
              <ContentSection label={t.home.allMethods} items={hiddenMainItems} onSelect={onSelect} t={t} />
              <ContentSection label={t.home.visitorExperiences} items={visitorContentOrder} onSelect={onSelect} t={t} />
            </>
          )}
        </>
      )}
    </section>
  );
}

function ContentCard({
  isFeatured = false,
  onSelect,
  t,
  type,
}: {
  isFeatured?: boolean;
  onSelect: (type: ContentType) => void;
  t: I18nMessages;
  type: ContentType;
}) {
  const item = t.content[type];
  const Icon = iconMap[type];
  const isKpop = type === "kpop_recording" || type === "kpop_experience";
  const isParent = type === "parent_life_book";

  return (
    <button
      className={`content-type-card ${isFeatured ? "featured-content-card" : ""} ${isKpop ? "kpop-content-card" : ""}`}
      type="button"
      onClick={() => onSelect(type)}
    >
      {isParent && <span className="recommend-badge">{t.home.recommendationBadge}</span>}
      {isKpop && <span className="recording-light" aria-hidden="true" />}
      <span className="content-icon">
        <Icon size={isFeatured ? 26 : 22} aria-hidden="true" />
      </span>
      <strong>{item.title}</strong>
      <small className="content-example">{t.home.cardExamples[type]}</small>
      <span>{item.description}</span>
      <em>{item.resultLabel}</em>
    </button>
  );
}

function ResultPreview({ t }: { t: I18nMessages }) {
  return (
    <div className="output-preview-grid" aria-label={t.home.resultPreview}>
      {t.home.resultSamples.map((sample, index) => (
        <article
          className={`output-sample-card ${index === 0 ? "memory-card-sample" : index === 1 ? "future-lock-sample" : "book-sample"}`}
          key={`${sample.eyebrow}-${sample.title}`}
        >
          <p className="eyebrow">{sample.eyebrow}</p>
          <h2>{sample.title}</h2>
          <p>{sample.body}</p>
          <span>{sample.tag}</span>
        </article>
      ))}
    </div>
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
    <section className="content-section">
      <p className="eyebrow content-section-label">{label}</p>
      <div className="content-card-grid expanded-content-grid">
        {items.map((type) => {
          return <ContentCard key={type} onSelect={onSelect} t={t} type={type} />;
        })}
      </div>
    </section>
  );
}

function TimelinePreview({ t }: { t: I18nMessages }) {
  return (
    <section className="timeline-preview">
      <p className="eyebrow content-section-label">{t.home.timeline}</p>
      <div className="timeline-line">
        {t.home.timelineItems.map((item, index) => (
          <div className="timeline-node" key={`${item}-${index}`}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MemoryGallery({ t }: { t: I18nMessages }) {
  return (
    <section className="memory-gallery">
      <p className="eyebrow content-section-label">{t.home.gallery}</p>
      <div className="gallery-grid">
        {t.home.gallerySamples.map((sample) => (
          <article className="gallery-sample-card" key={`${sample.eyebrow}-${sample.title}`}>
            <p className="eyebrow">{sample.eyebrow}</p>
            <h2>{sample.title}</h2>
            <p>{sample.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
