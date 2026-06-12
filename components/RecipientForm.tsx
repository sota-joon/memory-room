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
            placeholder="예: family@example.com"
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
            placeholder="예: guardian@example.com"
          />
        </label>
      </div>
    </section>
  );
}

const recipientCopy = {
  ko: {
    body: "휴대폰 번호와 이메일 중 하나만 입력해도 됩니다. 현재 테스트 버전에서는 실제 발송하지 않습니다.",
    email: "이메일",
    eyebrow: "받을 사람",
    guardianEmail: "관리자 이메일",
    guardianName: "보조 연락처 이름",
    guardianNamePlaceholder: "예: 가족 관리자",
    guardianPhone: "보조 연락처",
    name: "받을 사람 이름",
    namePlaceholder: "예: 민서",
    phone: "휴대폰 번호",
    phonePlaceholder: "예: 010-0000-0000",
    title: "언젠가 이 기록을 받을 사람을 남겨주세요",
  },
  en: {
    body: "A phone number or email is enough. This test version does not send anything automatically.",
    email: "Email",
    eyebrow: "Recipient",
    guardianEmail: "Backup email",
    guardianName: "Backup contact name",
    guardianNamePlaceholder: "Example: family manager",
    guardianPhone: "Backup phone",
    name: "Recipient name",
    namePlaceholder: "Example: Mina",
    phone: "Phone number",
    phonePlaceholder: "Example: +1 555 000 0000",
    title: "Choose who may receive this record someday",
  },
  ja: {
    body: "電話番号またはメールのどちらかで構いません。テスト版では実際の送信は行いません。",
    email: "メール",
    eyebrow: "受け取る人",
    guardianEmail: "補助連絡先メール",
    guardianName: "補助連絡先の名前",
    guardianNamePlaceholder: "例：家族の管理者",
    guardianPhone: "補助連絡先",
    name: "受け取る人の名前",
    namePlaceholder: "例：美咲",
    phone: "電話番号",
    phonePlaceholder: "例：090-0000-0000",
    title: "いつかこの記録を受け取る人を残してください",
  },
  zh: {
    body: "手机号或邮箱填写其中一个即可。当前测试版本不会实际发送。",
    email: "邮箱",
    eyebrow: "接收人",
    guardianEmail: "备用邮箱",
    guardianName: "备用联系人姓名",
    guardianNamePlaceholder: "例如：家庭管理员",
    guardianPhone: "备用联系方式",
    name: "接收人姓名",
    namePlaceholder: "例如：敏书",
    phone: "手机号",
    phonePlaceholder: "例如：138-0000-0000",
    title: "留下将来可以接收这份记录的人",
  },
} satisfies Record<Locale, Record<string, string>>;
