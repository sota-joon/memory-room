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
  const hasEmail = Boolean(recipient.email?.trim());
  const canCreateVault = consentAccepted && hasEmail && (!needsDate || Boolean(unlockDate)) && !isSaving;

  return (
    <section className="letter-screen">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
        <p className="letter-note">{copy.body}</p>
        <p className="helper-message">{copy.deviceNotice}</p>
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

      <section className="summary-panel">
        <p className="eyebrow">{copy.emailStep}</p>
        <p>{copy.emailGuide}</p>
      </section>

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
          {isSaving ? copy.saving : copy.saveMemory}
        </button>
        {vaultUrl && (
          <a className="primary-button compact download-link" href={vaultUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} aria-hidden="true" />
            {copy.openVault}
          </a>
        )}
      </div>

      {vaultUrl && <p className="helper-message centered-message">{copy.savedNotice}</p>}
      {!hasEmail && <p className="helper-message centered-message">{copy.emailRequired}</p>}
      {needsDate && !unlockDate && <p className="helper-message centered-message">{t.errors.dateRequired}</p>}
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
    "더 감성적으로": "Make it warmer",
    "짧게 줄이기": "Shorten it",
    "가족에게 말하듯 수정": "Make it sound like family",
  },
  ja: {
    "더 부드럽게": "よりやわらかく",
    "더 담담하게": "より落ち着いて",
    "더 감성적으로": "少し温かく",
    "짧게 줄이기": "短くする",
    "가족에게 말하듯 수정": "家族に話すように",
  },
  zh: {
    "더 부드럽게": "更柔和",
    "더 담담하게": "更平静",
    "더 감성적으로": "更温暖",
    "짧게 줄이기": "缩短",
    "가족에게 말하듯 수정": "像对家人说话",
  },
} satisfies Record<Locale, Record<LetterRevisionAction, string>>;

const outputCopy = {
  ko: {
    body: "아래 결과물은 지금 화면에서만 임시로 확인됩니다. 저장하려면 이메일을 입력하고 보안 링크를 생성해주세요.",
    deviceNotice: "이 기기에는 기록이 저장되지 않습니다. 결과물은 인증 후 다시 확인할 수 있습니다.",
    emailGuide: "결과물을 나중에 다시 열람하려면 이메일을 입력해주세요. MVP에서는 이메일 발송 없이 링크를 화면에 표시합니다.",
    emailRequired: "결과물 저장과 재열람을 위해 이메일을 입력해주세요.",
    emailStep: "결과물 받을 이메일",
    eyebrow: "임시 결과 확인",
    openVault: "보안 링크 열기",
    reset: "완료하고 메인으로",
    revise: "편지 다듬기",
    saveMemory: "결과물 저장하기",
    savedNotice: "기록이 저장되었습니다. 아래 링크로 나중에 다시 확인할 수 있습니다.",
    saving: "저장 중...",
    summary: "기억 저장소 요약",
    title: "보관할 기록이 준비되었습니다.",
  },
  en: {
    body: "This result is temporary on this screen. Enter an email to create a private link.",
    deviceNotice: "This shared device does not keep your record. You can open it later after verification.",
    emailGuide: "Enter an email to open this memory later. For this MVP, the link is shown on screen without email delivery.",
    emailRequired: "Enter an email to save and reopen this result.",
    emailStep: "Email for this result",
    eyebrow: "Vault Preview",
    openVault: "Open private link",
    reset: "Finish and return home",
    revise: "Refine the letter",
    saveMemory: "Save result",
    savedNotice: "Your record has been saved. You can reopen it later with the link below.",
    saving: "Saving...",
    summary: "Vault summary",
    title: "Your memory is ready to keep.",
  },
  ja: {
    body: "この結果は今の画面でのみ一時的に表示されます。保存するにはメールを入力して専用リンクを作成してください。",
    deviceNotice: "この端末には記録は保存されません。結果は認証後に再確認できます。",
    emailGuide: "あとで結果を見るためのメールを入力してください。MVPではメール送信はせず、リンクを画面に表示します。",
    emailRequired: "結果の保存と再閲覧のため、メールを入力してください。",
    emailStep: "結果を受け取るメール",
    eyebrow: "保存前の確認",
    openVault: "専用リンクを開く",
    reset: "完了してメインへ",
    revise: "手紙を整える",
    saveMemory: "結果を保存する",
    savedNotice: "記録が保存されました。下のリンクから後で再確認できます。",
    saving: "保存中...",
    summary: "Vaultの要約",
    title: "保存する記録が準備できました。",
  },
  zh: {
    body: "以下结果只会在当前页面临时显示。请输入邮箱并生成私密链接后再保存。",
    deviceNotice: "这台设备不会保存你的记录。结果之后可通过验证再次查看。",
    emailGuide: "请输入邮箱，方便之后再次查看结果。MVP阶段不会实际发送邮件，只在页面显示链接。",
    emailRequired: "请输入邮箱后再保存并重新查看结果。",
    emailStep: "接收结果的邮箱",
    eyebrow: "保存前预览",
    openVault: "打开私密链接",
    reset: "完成并返回首页",
    revise: "调整信件",
    saveMemory: "保存结果",
    savedNotice: "记录已保存。之后可以通过下方链接再次查看。",
    saving: "保存中...",
    summary: "Vault摘要",
    title: "可保存的记录已准备好。",
  },
} satisfies Record<Locale, Record<string, string>>;
