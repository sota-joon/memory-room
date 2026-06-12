export type {
  ContentType,
  Guardian,
  InterviewRecord,
  LetterLength,
  LetterRevision,
  LetterRevisionAction,
  LetterTone,
  LifeStatus,
  Locale,
  MemoryVault,
  PreInterviewInfo,
  Purpose,
  Recipient,
  UnlockType,
  VaultStatus,
} from "./types";

import type { InterviewRecord } from "./types";
import { isKioskMode } from "./kioskMode";

const STORAGE_KEY = "memory-interview-mvp-v5";

export function loadStoredInterview() {
  if (typeof window === "undefined") return null;
  if (isKioskMode()) return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as InterviewRecord;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveStoredInterview(record: InterviewRecord) {
  if (typeof window === "undefined") return;
  if (isKioskMode()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // MVP: 저장 공간 부족 등 브라우저 오류는 화면 흐름을 막지 않는다.
  }
}

export function clearStoredInterview() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
