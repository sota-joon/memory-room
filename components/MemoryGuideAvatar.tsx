"use client";

import { useState } from "react";
import type { Locale } from "../lib/types";

type Props = {
  isSpeaking: boolean;
  locale?: Locale;
};

export function MemoryGuideAvatar({ isSpeaking, locale = "ko" }: Props) {
  const [canUseImage, setCanUseImage] = useState(true);
  const copy = avatarCopy[locale];

  return (
    <aside className={`guide-avatar-card ${isSpeaking ? "is-speaking" : ""}`}>
      <div className="guide-avatar-wrap" aria-hidden="true">
        <span className="guide-avatar-pulse" />
        <span className="guide-avatar-pulse delay" />
        {canUseImage ? (
          <img
            className="guide-avatar-image"
            src="/avatar-guide.png"
            alt=""
            onError={() => setCanUseImage(false)}
          />
        ) : (
          <div className="guide-avatar-fallback">
            <span />
          </div>
        )}
        <span className="guide-avatar-mouth" />
      </div>
      <div className="guide-avatar-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <p>{copy.body}</p>
      </div>
    </aside>
  );
}

const avatarCopy = {
  ko: { body: "천천히 기억을 함께 꺼내볼게요.", eyebrow: "기억 진행자" },
  en: { body: "We will bring the memory out slowly.", eyebrow: "Memory Guide" },
  ja: { body: "ゆっくり記憶を一緒にたどります。", eyebrow: "記憶ガイド" },
  zh: { body: "我们会慢慢把记忆一起整理出来。", eyebrow: "记忆引导者" },
} satisfies Record<Locale, { body: string; eyebrow: string }>;
