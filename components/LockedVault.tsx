"use client";

import { LockKeyhole } from "lucide-react";
import type { MemoryVault } from "../lib/types";
import type { I18nMessages } from "../lib/i18n/types";
import { getDaysUntilUnlock, getUnlockMessage } from "../lib/unlockRules";

type Props = {
  vault: MemoryVault;
  t: I18nMessages;
  onRequestOpen: () => void;
  onTestUnlock: () => void;
};

export function LockedVault({ t, vault, onRequestOpen, onTestUnlock }: Props) {
  const days = getDaysUntilUnlock(vault);
  const copy = lockedCopy[vault.locale];

  return (
    <section className="vault-state-screen">
      <div className="vault-lock-mark">
        <LockKeyhole size={28} aria-hidden="true" />
      </div>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h1>{t.vault.lockedTitle}</h1>
      <p>{getUnlockMessage(vault)}</p>
      {days !== null && <p className="d-day-label">D-{days}</p>}
      <p className="helper-message">
        {copy.body}
      </p>
      <div className="button-row soft-center">
        <button className="secondary-button" type="button" onClick={onRequestOpen}>
          {t.vault.requestOpen}
        </button>
        {(vault.unlock.type === "guardian_approval" || vault.unlock.type === "after_death") && (
          <button className="secondary-button" type="button" onClick={onTestUnlock}>
            {t.vault.testUnlock}
          </button>
        )}
      </div>
    </section>
  );
}

const lockedCopy = {
  ko: { body: "이 기록은 정해진 조건이 되었을 때 열리도록 보관되어 있습니다.", eyebrow: "잠긴 기록" },
  en: { body: "This record is kept closed until the selected condition is met.", eyebrow: "Locked Record" },
  ja: { body: "この記録は、設定した条件が満たされた時に開くよう保管されています。", eyebrow: "閉じられた記録" },
  zh: { body: "这份记录会在设定条件满足时开启。", eyebrow: "已锁定的记录" },
} satisfies Record<MemoryVault["locale"], { body: string; eyebrow: string }>;
