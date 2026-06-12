"use client";

import type { Locale, UnlockType } from "../lib/types";
import type { I18nMessages } from "../lib/i18n/types";

type Props = {
  locale: Locale;
  unlockDate: string;
  unlockType: UnlockType;
  t: I18nMessages;
  onChangeDate: (date: string) => void;
  onChangeType: (type: UnlockType) => void;
};

const unlockOptions: UnlockType[] = [
  "now",
  "specific_date",
  "yearly_reminder",
  "marriage",
  "birth_of_child",
  "birth_of_grandchild",
  "one_year_later",
  "five_years_later",
  "ten_years_later",
  "after_death",
  "guardian_approval",
];

export function UnlockSettings({ locale, t, unlockDate, unlockType, onChangeDate, onChangeType }: Props) {
  const copy = unlockCopy[locale];
  return (
    <section className="settings-panel">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
      </div>

      <div className="choice-row vertical-choice-row">
        {unlockOptions.map((option) => (
          <label className="choice-pill vault-choice" key={option}>
            <input
              type="radio"
              name="unlockType"
              checked={unlockType === option}
              onChange={() => onChangeType(option)}
            />
            <span>{t.unlock[option]}</span>
          </label>
        ))}
      </div>

      {(unlockType === "specific_date" || unlockType === "yearly_reminder") && (
        <label>
          {copy.date}
          <input
            type="date"
            value={unlockDate}
            onChange={(event) => onChangeDate(event.target.value)}
          />
        </label>
      )}
    </section>
  );
}

const unlockCopy = {
  ko: { date: "공개 또는 알림 날짜", eyebrow: "공개 방식", title: "이 기록은 언제 열리게 할까요?" },
  en: { date: "Reveal or reminder date", eyebrow: "Reveal setting", title: "When should this record open?" },
  ja: { date: "公開または通知の日付", eyebrow: "公開設定", title: "この記録はいつ開けるようにしますか？" },
  zh: { date: "开启或提醒日期", eyebrow: "开启设置", title: "这份记录什么时候可以打开？" },
} satisfies Record<Locale, { date: string; eyebrow: string; title: string }>;
