"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { getContentConfig } from "../lib/contentConfig";
import type { I18nMessages } from "../lib/i18n/types";
import type { ContentType, Locale, PreInterviewInfo, Purpose } from "../lib/storage";

type Props = {
  contentType: ContentType;
  initialInfo: PreInterviewInfo;
  locale: Locale;
  t: I18nMessages;
  onSubmit: (info: PreInterviewInfo) => void;
};

const purposes: Purpose[] = ["감사", "사과", "추억", "미래편지", "가족기록"];

const formCopy = {
  ko: {
    entryEyebrow: "기억의 방",
    entryBody: "완벽히 정리하지 않아도 괜찮습니다. 지금 가장 먼저 떠오르는 단어 하나에서 기록을 시작해도 좋습니다.",
    detailsEyebrow: "마음 기록 준비",
    detailsTitle: "기록을 시작할 작은 단서들을 남겨주세요",
    detailsBody: "긴 설명은 필요 없습니다. 지금 마음에 먼저 닿는 말만 적어도, 질문과 마지막 결과물이 그 흐름을 따라가겠습니다.",
    next: "다음으로",
    enter: "입장하기",
    recordMode: "기록 방식",
    living: "현재의 이야기",
    remembered: "오래 보관할 이야기",
    purpose: "기록의 방향",
    purposeLabels: { 감사: "감사", 사과: "사과", 추억: "추억", 미래편지: "미래편지", 가족기록: "가족기록" },
    fields: {
      creator: "이야기를 남기는 사람",
      firstScene: "가장 먼저 떠오르는 장면",
      message: "아직 마음에 남아 있는 말",
      relationship: "그 사람은 나에게",
      subject: "오늘 떠올리고 싶은 사람",
    },
  },
  en: {
    entryEyebrow: "Memory Room",
    entryBody: "You do not need the perfect words. Start with the first name, scene, or feeling that comes to mind.",
    detailsEyebrow: "Prepare the Record",
    detailsTitle: "Leave a few details to begin",
    detailsBody: "Short answers are enough. The interview and final record will follow the feeling you leave here.",
    next: "Next",
    enter: "Enter",
    recordMode: "Record type",
    living: "A present-day story",
    remembered: "A story to keep for later",
    purpose: "Direction",
    purposeLabels: { 감사: "Gratitude", 사과: "Apology", 추억: "Memory", 미래편지: "Future letter", 가족기록: "Family record" },
    fields: {
      creator: "Person leaving the story",
      firstScene: "First scene that comes to mind",
      message: "Words still on your mind",
      relationship: "Relationship",
      subject: "Person you want to remember today",
    },
  },
  ja: {
    entryEyebrow: "記憶の部屋",
    entryBody: "うまく言葉にしようとしなくても大丈夫です。最初に浮かんだ名前や場面から始められます。",
    detailsEyebrow: "記録の準備",
    detailsTitle: "記録を始める小さな手がかりを残してください",
    detailsBody: "長く書く必要はありません。今心に浮かぶ言葉だけで、質問と最後の記録がその流れをたどります。",
    next: "次へ",
    enter: "入室する",
    recordMode: "記録の種類",
    living: "今の物語",
    remembered: "未来に残す物語",
    purpose: "記録の方向",
    purposeLabels: { 감사: "感謝", 사과: "謝りたいこと", 추억: "思い出", 미래편지: "未来への手紙", 가족기록: "家族の記録" },
    fields: {
      creator: "物語を残す人",
      firstScene: "最初に浮かぶ場面",
      message: "まだ心に残っている言葉",
      relationship: "その人との関係",
      subject: "今日思い浮かべたい人",
    },
  },
  zh: {
    entryEyebrow: "记忆房间",
    entryBody: "不需要马上整理得很完整。可以从第一个想到的人、画面或感受开始。",
    detailsEyebrow: "记录准备",
    detailsTitle: "留下几个开始记录的小线索",
    detailsBody: "不用写得很长。只要写下此刻先浮现的话，接下来的提问和结果会顺着它展开。",
    next: "下一步",
    enter: "进入",
    recordMode: "记录类型",
    living: "现在的故事",
    remembered: "想长期保存的故事",
    purpose: "记录方向",
    purposeLabels: { 감사: "感谢", 사과: "道歉", 추억: "回忆", 미래편지: "未来信", 가족기록: "家庭记录" },
    fields: {
      creator: "留下故事的人",
      firstScene: "最先浮现的画面",
      message: "还留在心里的话",
      relationship: "关系",
      subject: "今天想起的人",
    },
  },
} satisfies Record<Locale, {
  detailsBody: string;
  detailsEyebrow: string;
  detailsTitle: string;
  enter: string;
  entryBody: string;
  entryEyebrow: string;
  living: string;
  next: string;
  purpose: string;
  purposeLabels: Record<Purpose, string>;
  fields: {
    creator: string;
    firstScene: string;
    message: string;
    relationship: string;
    subject: string;
  };
  recordMode: string;
  remembered: string;
}>;

export function PreInterviewForm({ contentType, initialInfo, locale, onSubmit, t }: Props) {
  const config = getContentConfig(contentType);
  const copy = formCopy[locale];
  const content = t.content[contentType];
  const [info, setInfo] = useState<PreInterviewInfo>(initialInfo);
  const [entryStep, setEntryStep] = useState<"person" | "details">(
    initialInfo.subjectName ? "details" : "person",
  );

  useEffect(() => {
    setInfo(initialInfo);
    setEntryStep(initialInfo.subjectName ? "details" : "person");
  }, [initialInfo]);

  function updateInfo(field: keyof PreInterviewInfo, value: string) {
    setInfo((previous) => ({ ...previous, [field]: value }));
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(info);
  }

  function submitPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!info.subjectName.trim()) return;
    setEntryStep("details");
  }

  if (entryStep === "person") {
    return (
      <form className="entry-question-screen" onSubmit={submitPerson}>
        <div className="intro-copy entry-copy">
          <p className="eyebrow">{copy.entryEyebrow}</p>
          <h1>{locale === "ko" ? config.primaryQuestion : content.title}</h1>
          <p>{copy.entryBody}</p>
        </div>

        <label className="entry-input-label">
          {locale === "ko" ? config.iconLabel : content.title}
          <input
            autoFocus
            required
            value={info.subjectName}
            onChange={(event) => updateInfo("subjectName", event.target.value)}
            placeholder={config.primaryPlaceholder}
          />
        </label>

        <button className="primary-button compact" type="submit">
          {copy.next}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    <form className="screen-grid" onSubmit={submitForm}>
      <div className="intro-copy">
        <p className="eyebrow">{copy.detailsEyebrow}</p>
        <h1>{copy.detailsTitle}</h1>
        <p>{copy.detailsBody}</p>
      </div>

      <div className="form-grid">
        <label>
          {locale === "ko" ? config.detailLabel : copy.fields.creator}
          <input
            required
            value={info.customerName}
            onChange={(event) => updateInfo("customerName", event.target.value)}
            placeholder={config.detailPlaceholder}
          />
        </label>
        <label>
          {locale === "ko" ? config.iconLabel : copy.fields.subject}
          <input
            required
            value={info.subjectName}
            onChange={(event) => updateInfo("subjectName", event.target.value)}
            placeholder={config.primaryPlaceholder}
          />
        </label>
        <label>
          {locale === "ko" ? config.relationshipLabel : copy.fields.relationship}
          <input
            required
            value={info.relationship}
            onChange={(event) => updateInfo("relationship", event.target.value)}
            placeholder={config.relationshipPlaceholder}
          />
        </label>
        <label>
          {copy.recordMode}
          <select
            value={info.lifeStatus}
            onChange={(event) => updateInfo("lifeStatus", event.target.value)}
          >
            <option value="living">{copy.living}</option>
            <option value="remembered">{copy.remembered}</option>
          </select>
        </label>
        <fieldset className="choice-field wide-field">
          <legend>{copy.purpose}</legend>
          <div className="choice-row">
            {purposes.map((purpose) => (
              <label className="choice-pill" key={purpose}>
                <input
                  type="radio"
                  name="purpose"
                  checked={info.purpose === purpose}
                  onChange={() => updateInfo("purpose", purpose)}
                />
                <span>{copy.purposeLabels[purpose]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="wide-field">
          {locale === "ko" ? config.firstSceneLabel : copy.fields.firstScene}
          <textarea
            required
            value={info.firstMemory}
            onChange={(event) => updateInfo("firstMemory", event.target.value)}
            placeholder={config.firstScenePlaceholder}
          />
        </label>
        <label className="wide-field">
          {locale === "ko" ? config.messageLabel : copy.fields.message}
          <textarea
            value={info.messageToday}
            onChange={(event) => updateInfo("messageToday", event.target.value)}
            placeholder={config.messagePlaceholder}
          />
        </label>
      </div>

      <button className="primary-button" type="submit">
        {copy.enter}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
