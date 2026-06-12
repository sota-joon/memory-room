import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";
import { zh } from "./zh";
import type { I18nMessages } from "./types";
import type { Locale } from "../types";
import { isKioskMode } from "../kioskMode";

export const locales: Locale[] = ["ko", "en", "ja", "zh"];

export const messages: Record<Locale, I18nMessages> = {
  en,
  ja,
  ko,
  zh,
};

const LOCALE_STORAGE_KEY = "memory-vault-locale";

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.ko;
}

export function detectBrowserLocale(language?: string): Locale {
  const value = (language ?? "").toLowerCase();
  if (value.startsWith("ko")) return "ko";
  if (value.startsWith("ja")) return "ja";
  if (value.startsWith("zh")) return "zh";
  if (value.startsWith("en")) return "en";
  return "ko";
}

export function loadStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  if (isKioskMode()) return null;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return stored && locales.includes(stored as Locale) ? (stored as Locale) : null;
  } catch {
    return null;
  }
}

export function saveStoredLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  if (isKioskMode()) return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export function getInitialLocale(): Locale {
  if (typeof window === "undefined") return "ko";
  const queryLocale = new URLSearchParams(window.location.search).get("lang");
  if (queryLocale && locales.includes(queryLocale as Locale)) return queryLocale as Locale;
  return "ko";
}
