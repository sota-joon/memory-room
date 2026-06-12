"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { StudioExperience } from "../../../components/StudioExperience";
import { getInitialLocale, getMessages, saveStoredLocale } from "../../../lib/i18n";
import type { ContentType, Locale } from "../../../lib/types";

const contentTypes: ContentType[] = [
  "family_memory",
  "future_self",
  "parent_life_book",
  "couple_time_capsule",
  "kpop_recording",
  "live_performance",
  "artist_interview",
  "founder_story",
  "korea_trip",
  "kpop_experience",
  "kdrama_message",
  "seoul_night_letter",
];

export default function StudioProductPage() {
  const params = useParams<{ product: string }>();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("ko");
  const product = contentTypes.includes(params.product as ContentType)
    ? (params.product as ContentType)
    : "family_memory";
  const t = getMessages(locale);

  useEffect(() => {
    setLocale(getInitialLocale());
  }, []);

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    saveStoredLocale(nextLocale);
  }

  return (
    <main className="app-shell">
      <section className="memory-panel">
        <div className="brand-row">
          <span className="brand-mark">
            <Heart size={18} aria-hidden="true" />
          </span>
          <span>{t.brand}</span>
        </div>
        <LanguageSwitcher locale={locale} onChange={changeLocale} />
        <StudioExperience contentType={product} locale={locale} onBack={() => router.push("/")} />
      </section>
    </main>
  );
}
