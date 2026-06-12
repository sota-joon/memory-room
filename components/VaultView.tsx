"use client";

import { Copy, Download, Share2 } from "lucide-react";
import type { MemoryVault } from "../lib/types";
import type { I18nMessages } from "../lib/i18n/types";
import { copyText, shareUrl } from "../lib/share";
import { MemoryCard } from "./MemoryCard";

type Props = {
  vault: MemoryVault;
  vaultUrl: string;
  t: I18nMessages;
};

export function VaultView({ t, vault, vaultUrl }: Props) {
  const copy = vaultViewCopy[vault.locale];
  async function copyLink() {
    const copied = await copyText(vaultUrl);
    window.alert(copied ? copy.copied : copy.copyFailed);
  }

  async function shareVault() {
    const shared = await shareUrl(t.brand, vaultUrl);
    if (!shared) await copyLink();
  }

  return (
    <section className="vault-view">
      <div className="result-actions no-print">
        <button className="secondary-button" type="button" onClick={copyLink}>
          <Copy size={17} aria-hidden="true" />
          {copy.copyLink}
        </button>
        <button className="secondary-button" type="button" onClick={() => window.print()}>
          <Download size={17} aria-hidden="true" />
          PDF
        </button>
        <button className="primary-button compact" type="button" onClick={shareVault}>
          <Share2 size={17} aria-hidden="true" />
          {copy.share}
        </button>
      </div>

      <div>
        <p className="eyebrow">{t.brand}</p>
        <h1>{copy.title}</h1>
        <p className="letter-note">{copy.body(vault.creatorName)}</p>
      </div>

      {vault.outputs.letter && (
        <article className="letter-paper">
          {vault.outputs.letter.split("\n").map((line, index) =>
            line ? <p key={index}>{line}</p> : <br key={index} />,
          )}
        </article>
      )}

      {vault.outputs.memoryCard && <MemoryCard locale={vault.locale} memoryCard={vault.outputs.memoryCard} />}

      {vault.outputs.summary && (
        <section className="summary-panel">
          <p className="eyebrow">{copy.summary}</p>
          {vault.outputs.summary.split("\n").map((line) => (
            <p key={line}>{line}</p>
          ))}
        </section>
      )}

      {vault.outputs.futureMessage && (
        <section className="summary-panel future-message-panel">
          <p className="eyebrow">Future Message</p>
          {vault.outputs.futureMessage.split("\n").map((line, index) =>
            line ? <p key={`${line}-${index}`}>{line}</p> : <br key={index} />,
          )}
        </section>
      )}
    </section>
  );
}

const vaultViewCopy = {
  ko: {
    body: (name: string) => `${name}님이 남긴 기록입니다. 이 페이지에는 편지, 기억 카드, 저장소 요약이 함께 보관됩니다.`,
    copied: "링크를 복사했습니다.",
    copyFailed: "브라우저에서 복사를 허용하지 않았습니다.",
    copyLink: "링크 복사",
    share: "공유",
    summary: "기억 저장소 요약",
    title: "오늘 남겨진 이야기",
  },
  en: {
    body: (name: string) => `A record left by ${name}. This page keeps the letter, memory card, and vault summary together.`,
    copied: "The link has been copied.",
    copyFailed: "This browser did not allow copying.",
    copyLink: "Copy link",
    share: "Share",
    summary: "Vault summary",
    title: "The Story Saved Today",
  },
  ja: {
    body: (name: string) => `${name}さんが残した記録です。このページには手紙、記憶カード、Vaultの要約が一緒に保存されています。`,
    copied: "リンクをコピーしました。",
    copyFailed: "ブラウザでコピーが許可されませんでした。",
    copyLink: "リンクをコピー",
    share: "共有",
    summary: "Vaultの要約",
    title: "今日残された物語",
  },
  zh: {
    body: (name: string) => `这是${name}留下的记录。本页面会一起保存信件、记忆卡和Vault摘要。`,
    copied: "链接已复制。",
    copyFailed: "浏览器不允许复制。",
    copyLink: "复制链接",
    share: "分享",
    summary: "Vault摘要",
    title: "今天留下的故事",
  },
} satisfies Record<MemoryVault["locale"], {
  body: (name: string) => string;
  copied: string;
  copyFailed: string;
  copyLink: string;
  share: string;
  summary: string;
  title: string;
}>;
