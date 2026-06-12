"use client";

import { locales, getMessages } from "../lib/i18n";
import type { Locale } from "../lib/types";

type Props = {
  locale: Locale;
  onChange: (locale: Locale) => void;
};

export function LanguageSwitcher({ locale, onChange }: Props) {
  const t = getMessages(locale);

  return (
    <div className="language-switcher" aria-label="Language">
      {locales.map((item) => (
        <button
          className={item === locale ? "is-active" : ""}
          type="button"
          key={item}
          onClick={() => onChange(item)}
        >
          {t.languageLabels[item]}
        </button>
      ))}
    </div>
  );
}
