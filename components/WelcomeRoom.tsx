"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "../lib/types";
import { MemoryGuideAvatar } from "./MemoryGuideAvatar";

type Props = {
  isSpeaking: boolean;
  locale: Locale;
  welcomeMessage: string;
  voiceEnabled: boolean;
  onEnter: () => void;
  onReplay: () => void;
  onToggleVoice: () => void;
};

export function WelcomeRoom({
  isSpeaking,
  locale,
  welcomeMessage,
  voiceEnabled,
  onEnter,
  onReplay,
  onToggleVoice,
}: Props) {
  const copy = welcomeCopy[locale];
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    setShowMessage(false);
    const timerId = window.setTimeout(() => setShowMessage(true), 3000);
    return () => window.clearTimeout(timerId);
  }, [welcomeMessage]);

  useEffect(() => {
    if (!showMessage || !voiceEnabled) return;
    onReplay();
  }, [onReplay, showMessage, voiceEnabled]);

  return (
    <section className="welcome-room">
      <div className="breathing-copy">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
      </div>

      {showMessage && (
        <div className="spoken-card">
          <MemoryGuideAvatar isSpeaking={isSpeaking} locale={locale} />
          <p>{welcomeMessage}</p>
          <div className="button-row soft-center">
            <button className="secondary-button" type="button" onClick={onReplay}>
              <Volume2 size={17} aria-hidden="true" />
              {copy.replay}
            </button>
            <button className="secondary-button" type="button" onClick={onToggleVoice}>
              {voiceEnabled ? <VolumeX size={17} aria-hidden="true" /> : <Volume2 size={17} aria-hidden="true" />}
              {voiceEnabled ? copy.voiceOff : copy.voiceOn}
            </button>
            <button className="primary-button compact" type="button" onClick={onEnter}>
              {copy.start}
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const welcomeCopy = {
  ko: {
    eyebrow: "기억의 방에 입장했습니다",
    replay: "다시 듣기",
    start: "인터뷰 시작",
    title: "잠시 숨을 고르고, 마음속에 남아 있는 장면을 천천히 떠올려 주세요.",
    voiceOff: "음성 끄기",
    voiceOn: "음성 켜기",
  },
  en: {
    eyebrow: "You have entered the Memory Room",
    replay: "Replay",
    start: "Start interview",
    title: "Take a slow breath and let one scene come gently to mind.",
    voiceOff: "Turn voice off",
    voiceOn: "Turn voice on",
  },
  ja: {
    eyebrow: "記憶の部屋に入りました",
    replay: "もう一度聞く",
    start: "インタビューを始める",
    title: "少し息を整えて、心に残っている場面をゆっくり思い浮かべてください。",
    voiceOff: "音声をオフ",
    voiceOn: "音声をオン",
  },
  zh: {
    eyebrow: "已进入记忆房间",
    replay: "再听一次",
    start: "开始访谈",
    title: "请慢慢呼吸，让心里留下的一个画面浮现出来。",
    voiceOff: "关闭语音",
    voiceOn: "开启语音",
  },
} satisfies Record<Locale, Record<string, string>>;
