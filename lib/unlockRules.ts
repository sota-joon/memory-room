import { getKoreanTodayDate, daysBetweenKoreanDates } from "./date";
import { loadMemoryVault, saveMemoryVault } from "./vaultStorage";
import type { MemoryVault } from "./types";

export function canOpenVault(vault: MemoryVault) {
  if (vault.unlock.isManuallyUnlocked || vault.status === "unlocked") return true;

  if (vault.unlock.type === "now" || vault.unlock.type === "yearly_reminder") return true;

  if (isDateBasedUnlock(vault.unlock.type) && vault.unlock.date) {
    return getKoreanTodayDate() >= vault.unlock.date;
  }

  return false;
}

export function getUnlockMessage(vault: MemoryVault) {
  const copy = unlockMessageCopy[vault.locale];
  if (canOpenVault(vault)) {
    if (vault.unlock.type === "yearly_reminder" && vault.unlock.yearlyMonthDay) {
      return copy.yearly(vault.unlock.yearlyMonthDay);
    }
    return copy.openNow;
  }

  if (vault.unlock.type === "specific_date") {
    return copy.date(vault.unlock.date);
  }

  if (vault.unlock.type === "marriage") return copy.marriage;
  if (vault.unlock.type === "birth_of_child") return copy.birthOfChild;
  if (vault.unlock.type === "birth_of_grandchild") return copy.birthOfGrandchild;
  if (vault.unlock.type === "one_year_later") return copy.date(vault.unlock.date);
  if (vault.unlock.type === "five_years_later") return copy.date(vault.unlock.date);
  if (vault.unlock.type === "ten_years_later") return copy.date(vault.unlock.date);
  if (vault.unlock.type === "after_death") return copy.afterDeath;
  if (vault.unlock.type === "guardian_approval") return copy.guardianApproval;

  return copy.locked;
}

export function getDaysUntilUnlock(vault: MemoryVault) {
  if (!isDateBasedUnlock(vault.unlock.type) || !vault.unlock.date) return null;

  const days = daysBetweenKoreanDates(getKoreanTodayDate(), vault.unlock.date);
  return Math.max(days, 0);
}

function isDateBasedUnlock(type: MemoryVault["unlock"]["type"]) {
  return ["specific_date", "one_year_later", "five_years_later", "ten_years_later"].includes(type);
}

export function manuallyUnlockVault(vaultId: string) {
  const vault = loadMemoryVault(vaultId);
  if (!vault) return;

  // MVP 테스트용. 실제 운영에서는 가족 관리자 인증과 감사 로그가 필요하다.
  saveMemoryVault({
    ...vault,
    status: "unlocked",
    unlock: {
      ...vault.unlock,
      isManuallyUnlocked: true,
      openedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });
}

const unlockMessageCopy = {
  ko: {
    afterDeath: "이 기록은 가족 관리자의 확인이 필요합니다.",
    birthOfChild: "이 기록은 아이가 태어난 날 열 수 있습니다.",
    birthOfGrandchild: "이 기록은 손주가 태어난 날 열 수 있습니다.",
    date: (date?: string) => `${date ?? "정해진 날짜"}에 열 수 있는 기록입니다.`,
    guardianApproval: "이 기록은 가족 관리자의 승인이 필요합니다.",
    locked: "아직 열 수 없는 기록입니다.",
    marriage: "이 기록은 결혼하는 날 열 수 있습니다.",
    openNow: "지금 열 수 있는 기록입니다.",
    yearly: (day: string) => `열 수 있는 기록입니다. 매년 ${day}에 다시 떠올릴 수 있도록 설계되었습니다.`,
  },
  en: {
    afterDeath: "This record needs family manager confirmation.",
    birthOfChild: "This record can open when a child is born.",
    birthOfGrandchild: "This record can open when a grandchild is born.",
    date: (date?: string) => `This record can open on ${date ?? "the selected date"}.`,
    guardianApproval: "This record needs family manager approval.",
    locked: "This record is not open yet.",
    marriage: "This record can open on a wedding day.",
    openNow: "This record can be opened now.",
    yearly: (day: string) => `This record is open. It is designed to be revisited every year on ${day}.`,
  },
  ja: {
    afterDeath: "この記録は家族管理者の確認が必要です。",
    birthOfChild: "この記録は子どもが生まれる日に開けます。",
    birthOfGrandchild: "この記録は孫が生まれる日に開けます。",
    date: (date?: string) => `この記録は${date ?? "設定した日"}に開けます。`,
    guardianApproval: "この記録は家族管理者の承認が必要です。",
    locked: "この記録はまだ開けません。",
    marriage: "この記録は結婚する日に開けます。",
    openNow: "この記録は今開けます。",
    yearly: (day: string) => `この記録は開けます。毎年${day}に思い出せるよう設計されています。`,
  },
  zh: {
    afterDeath: "这份记录需要家庭管理员确认。",
    birthOfChild: "这份记录可以在孩子出生那天开启。",
    birthOfGrandchild: "这份记录可以在孙辈出生那天开启。",
    date: (date?: string) => `这份记录可以在${date ?? "设定日期"}开启。`,
    guardianApproval: "这份记录需要家庭管理员批准。",
    locked: "这份记录还不能打开。",
    marriage: "这份记录可以在结婚那天开启。",
    openNow: "这份记录现在可以打开。",
    yearly: (day: string) => `这份记录可以打开，并会在每年${day}提醒再次查看。`,
  },
} satisfies Record<MemoryVault["locale"], {
  afterDeath: string;
  birthOfChild: string;
  birthOfGrandchild: string;
  date: (date?: string) => string;
  guardianApproval: string;
  locked: string;
  marriage: string;
  openNow: string;
  yearly: (day: string) => string;
}>;
