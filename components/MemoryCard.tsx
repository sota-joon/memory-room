type Props = {
  locale?: "ko" | "en" | "ja" | "zh";
  memoryCard: string;
};

export function MemoryCard({ locale = "ko", memoryCard }: Props) {
  const [title, ...lines] = memoryCard.split("\n").filter((line) => line.trim());
  const copy = memoryCardCopy[locale];

  return (
    <article className="memory-card">
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2>{title || copy.fallbackTitle}</h2>
      <div>
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </article>
  );
}

const memoryCardCopy = {
  ko: { eyebrow: "기억 카드", fallbackTitle: "오늘 남겨진 기억" },
  en: { eyebrow: "Memory Card", fallbackTitle: "A Memory Saved Today" },
  ja: { eyebrow: "記憶カード", fallbackTitle: "今日残した記憶" },
  zh: { eyebrow: "记忆卡", fallbackTitle: "今天留下的记忆" },
};
