"use client";

import type { Guardian, Locale, Recipient } from "../lib/types";

type Props = {
  guardian: Guardian;
  locale: Locale;
  recipient: Recipient;
  onChangeGuardian: (guardian: Guardian) => void;
  onChangeRecipient: (recipient: Recipient) => void;
};

export function RecipientForm({ guardian, locale, recipient, onChangeGuardian, onChangeRecipient }: Props) {
  const copy = recipientCopy[locale];
  return (
    <section className="settings-panel">
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>{copy.title}</h2>
        <p className="helper-message">{copy.body}</p>
      </div>

      <div className="form-grid">
        <label>
          {copy.name}
          <input
            value={recipient.name}
            onChange={(event) => onChangeRecipient({ ...recipient, name: event.target.value })}
            placeholder={copy.namePlaceholder}
          />
        </label>
        <label>
          {copy.phone}
          <input
            value={recipient.phone ?? ""}
            onChange={(event) => onChangeRecipient({ ...recipient, phone: event.target.value })}
            placeholder={copy.phonePlaceholder}
          />
        </label>
        <label>
          {copy.email}
          <input
            type="email"
            value={recipient.email ?? ""}
            onChange={(event) => onChangeRecipient({ ...recipient, email: event.target.value })}
            placeholder={copy.emailPlaceholder}
          />
        </label>
        <label>
          {copy.guardianName}
          <input
            value={guardian.name}
            onChange={(event) => onChangeGuardian({ ...guardian, name: event.target.value })}
            placeholder={copy.guardianNamePlaceholder}
          />
        </label>
        <label>
          {copy.guardianPhone}
          <input
            value={guardian.phone ?? ""}
            onChange={(event) => onChangeGuardian({ ...guardian, phone: event.target.value })}
            placeholder={copy.phonePlaceholder}
          />
        </label>
        <label>
          {copy.guardianEmail}
          <input
            type="email"
            value={guardian.email ?? ""}
            onChange={(event) => onChangeGuardian({ ...guardian, email: event.target.value })}
            placeholder={copy.guardianEmailPlaceholder}
          />
        </label>
      </div>
    </section>
  );
}

const recipientCopy = {
  ko: {
    body: "MVP 단계에서는 실제 이메일 발송은 하지 않고, 저장 완료 후 보안 링크를 화면에 표시합니다.",
    email: "이메일",
    emailPlaceholder: "결과물을 받을 이메일을 입력해주세요",
    eyebrow: "결과물 저장",
    guardianEmail: "보조 연락처 이메일",
    guardianEmailPlaceholder: "예: guardian@example.com",
    guardianName: "보조 연락처 이름",
    guardianNamePlaceholder: "예: 가족 관리자",
    guardianPhone: "보조 연락처 휴대폰",
    name: "받을 사람 이름",
    namePlaceholder: "예: 민서",
    phone: "휴대폰 번호",
    phonePlaceholder: "예: 010-0000-0000",
    title: "나중에 결과물을 다시 확인할 이메일을 입력해주세요.",
  },
  en: {
    body: "For this MVP, no email is sent. After saving, a private link appears on screen.",
    email: "Email",
    emailPlaceholder: "Enter the email to receive this result",
    eyebrow: "Save Result",
    guardianEmail: "Backup email",
    guardianEmailPlaceholder: "Example: guardian@example.com",
    guardianName: "Backup contact name",
    guardianNamePlaceholder: "Example: family manager",
    guardianPhone: "Backup phone",
    name: "Recipient name",
    namePlaceholder: "Example: Mina",
    phone: "Phone number",
    phonePlaceholder: "Example: +1 555 000 0000",
    title: "Enter an email to open this result later.",
  },
  ja: {
    body: "MVPでは実際のメール送信は行わず、保存後に専用リンクを画面に表示します。",
    email: "メール",
    emailPlaceholder: "結果を受け取るメールを入力してください",
    eyebrow: "結果を保存",
    guardianEmail: "予備連絡先メール",
    guardianEmailPlaceholder: "例: guardian@example.com",
    guardianName: "予備連絡先の名前",
    guardianNamePlaceholder: "例: 家族管理者",
    guardianPhone: "予備連絡先電話",
    name: "受け取る人の名前",
    namePlaceholder: "例: ミナ",
    phone: "電話番号",
    phonePlaceholder: "例: 090-0000-0000",
    title: "あとで結果を確認するためのメールを入力してください。",
  },
  zh: {
    body: "MVP阶段不会实际发送邮件，保存后会在页面显示私密链接。",
    email: "邮箱",
    emailPlaceholder: "请输入接收结果的邮箱",
    eyebrow: "保存结果",
    guardianEmail: "备用联系人邮箱",
    guardianEmailPlaceholder: "例: guardian@example.com",
    guardianName: "备用联系人姓名",
    guardianNamePlaceholder: "例: 家庭管理员",
    guardianPhone: "备用联系人手机",
    name: "接收人姓名",
    namePlaceholder: "例: Mina",
    phone: "手机号码",
    phonePlaceholder: "例: 138-0000-0000",
    title: "请输入之后查看结果所需的邮箱。",
  },
} satisfies Record<Locale, Record<string, string>>;
