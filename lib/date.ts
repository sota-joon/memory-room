export function getKoreanTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date());
}

export function getKoreanDateLabel(value?: string) {
  if (!value) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "long",
    timeZone: "Asia/Seoul",
  }).format(new Date(`${value}T00:00:00+09:00`));
}

export function daysBetweenKoreanDates(fromDate: string, toDate: string) {
  const from = Date.parse(`${fromDate}T00:00:00+09:00`);
  const to = Date.parse(`${toDate}T00:00:00+09:00`);
  return Math.ceil((to - from) / 86_400_000);
}
