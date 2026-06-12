"use client";

import { ExternalLink, RotateCcw, Vault } from "lucide-react";
import type { I18nMessages } from "../lib/i18n/types";
import type { Guardian, LetterRevisionAction, Locale, Recipient, UnlockType } from "../lib/types";
import { MemoryCard } from "./MemoryCard";
import { PrivacyConsent } from "./PrivacyConsent";
import { RecipientForm } from "./RecipientForm";
import { UnlockSettings } from "./UnlockSettings";

type Props = {
  consentAccepted: boolean;
  finalLetter: string;
  futureMessage: string;
  guardian: Guardian;
  isSaving: boolean;
  memoryCard: string;
  locale: Locale;
  recipient: Recipient;
  summary: string;
  t: I18nMessages;
  unlockDate: string;
  unlockType: UnlockType;
  vaultUrl: string;
  onChangeConsent: (checked: boolean) => void;
  onChangeGuardian: (guardian: Guardian) => void;
  onChangeRecipient: (recipient: Recipient) => void;
  onChangeUnlockDate: (date: string) => void;
  onChangeUnlockType: (type: UnlockType) => void;
  onCreateVault: () => void;
  onReset: () => void;
  onRevise: (action: LetterRevisionAction) => void;
};

const revisionActions: LetterRevisionAction[] = [
  "더 부드럽게",
  "더 담담하게",
  "더 감성적으로",
  "짧게 줄이기",
  "가족에게 말하듯 수정",
];

export function FinalOutputs({
  consentAccepted,
  finalLetter,
  futureMessage,
  guardian,
  isSaving,
  memoryCard,
  recipient,
  summary,
  t,
  locale,
  unlockDate,
  unlockType,
  vaultUrl,
  onChangeConsent,
  onChangeGuardian,
  onChangeRecipient,
  onChangeUnlockDate,
  onChangeUnlockType,
  onCreateVault,
  onReset,
  onRevise,
}: Props) {
  const copy = outputCopy[locale];
  const needsDate = unlockType === "specific_date" || unlockType === "yearly_reminder";
  const canCreateVault = consentAccepted && Boolean(recipient.email?.trim()) && (!needsDate || Boolean(unlockDate)) && !isSaving;

  return (
    <section className="letter-screen">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="letter-note">{copy.body}</p>
        <p className="helper-message">
          이 기기에는 기록이 저장되지 않습니다. 결과물은 인증 후 다시 확인할 수 있습니다.
        </p>
      </div>

      <article className="letter-paper">
        {finalLetter.split("\n").map((line, index) =>
          line ? <p key={index}>{line}</p> : <br key={index} />,
        )}
      </article>

      <MemoryCard locale={locale} memoryCard={memoryCard} />

      <section className="summary-panel">
        <p className="eyebrow">{copy.summary}</p>
        {summary.split("\n").map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <section className="summary-panel future-message-panel">
        <p className="eyebrow">Future Message</p>
        {futureMessage.split("\n").map((line, index) =>
          line ? <p key={`${line}-${index}`}>{line}</p> : <br key={index} />,
        )}
      </section>

      <div className="revision-panel">
        <p className="eyebrow">{copy.revise}</p>
        <div className="button-row soft-center">
          {revisionActions.map((action) => (
            <button className="secondary-button" type="button" key={action} onClick={() => onRevise(action)}>
              {revisionActionLabels[locale][action]}
            </button>
          ))}
        </div>
      </div>

      <UnlockSettings
        locale={locale}
        t={t}
        unlockDate={unlockDate}
        unlockType={unlockType}
        onChangeDate={onChangeUnlockDate}
        onChangeType={onChangeUnlockType}
      />
      <RecipientForm
        guardian={guardian}
        locale={locale}
        recipient={recipient}
        onChangeGuardian={onChangeGuardian}
        onChangeRecipient={onChangeRecipient}
      />
      <PrivacyConsent
        body={t.privacy.body}
        checkbox={t.privacy.checkbox}
        checked={consentAccepted}
        onChange={onChangeConsent}
      />

      <div className="button-row soft-center sticky-actions">
        <button className="secondary-button" type="button" onClick={onReset}>
          <RotateCcw size={17} aria-hidden="true" />
          {copy.reset}
        </button>
        <button className="primary-button compact" type="button" disabled={!canCreateVault} onClick={onCreateVault}>
          <Vault size={17} aria-hidden="true" />
          {isSaving ? "저장 중..." : copy.saveMemory}
        </button>
        {vaultUrl && (
          <a className="primary-button compact download-link" href={vaultUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            {copy.openVault}
          </a>
        )}
      </div>

      {!recipient.email?.trim() && (
        <p className="helper-message centered-message">결과물 저장과 재열람을 위해 이메일을 입력해주세요.</p>
      )}
      {needsDate && !unlockDate && (
        <p className="helper-message centered-message">{t.errors.dateRequired}</p>
      )}
    </section>
  );
}

const revisionActionLabels = {
  ko: {
    "더 부드럽게": "더 부드럽게",
    "더 담담하게": "더 담담하게",
    "더 감성적으로": "더 감성적으로",
    "짧게 줄이기": "짧게 줄이기",
    "가족에게 말하듯 수정": "가족에게 말하듯 수정",
  },
  en: {
    "더 부드럽게": "Make it softer",
    "더 담담하게": "Make it calmer",
    "더 감성적으로": "Make it more emotional",
    "짧게 줄이기": "Shorten it",
    "가족에게 말하듯 수정": "Make it sound like family",
  },
  ja: {
    "더 부드럽게": "もっとやわらかく",
    "더 담담하게": "より落ち着いた文体に",
    "더 감성적으로": "少し感情を込める",
    "짧게 줄이기": "短くする",
    "가족에게 말하듯 수정": "家族に話すように直す",
  },
  zh: {
    "더 부드럽게": "更柔和",
    "더 담담하게": "更朴素",
    "더 감성적으로": "更有感情",
    "짧게 줄이기": "缩短",
    "가족에게 말하듯 수정": "改得像对家人说话",
  },
} satisfies Record<Locale, Record<LetterRevisionAction, string>>;

const outputCopy = {
  ko: {
    body: "아래 결과물은 지금 화면에서만 임시로 확인할 수 있습니다. 공용 기기에는 저장하지 않으며, 결과 확인은 이메일 또는 휴대폰 인증 후 제공됩니다.",
    eyebrow: "임시 결과 확인",
    openVault: "보안 링크 확인",
    reset: "완료하고 메인으로",
    revise: "편지 다듬기",
    saveMemory: "결과물 저장하기",
    summary: "기억 저장소 요약",
    title: "편지가 아니라, 보관될 기록으로 정리했습니다.",
  },
  en: {
    body: "This result is temporary on this screen. Save it to the server to open it later with your private link.",
    eyebrow: "Vault Preview",
    openVault: "Open vault",
    reset: "Start a new record",
    revise: "Refine the letter",
    saveMemory: "Save result",
    summary: "Vault summary",
    title: "This is more than a letter. It is a record to keep.",
  },
  ja: {
    body: "結果の内容はURLに直接入りません。Vaultを作成すると、このブラウザに保存され、リンクには記録IDだけが入ります。",
    eyebrow: "保存前の確認",
    openVault: "Vaultを開く",
    reset: "新しい記録を始める",
    revise: "手紙を整える",
    saveMemory: "結果を保存する",
    summary: "Vaultの要約",
    title: "手紙ではなく、保管できる記録としてまとめました。",
  },
  zh: {
    body: "结果内容不会直接写进URL。创建Vault后，它会保存在这个浏览器中，链接里只包含记录ID。",
    eyebrow: "保存前预览",
    openVault: "打开Vault",
    reset: "开始新记录",
    revise: "修改信件",
    saveMemory: "保存结果",
    summary: "Vault摘要",
    title: "这不只是一封信，而是一份可以保存的记录。",
  },
} satisfies Record<Locale, Record<string, string>>;
