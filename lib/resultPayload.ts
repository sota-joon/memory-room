// Deprecated: 결과 데이터를 URL hash/query에 넣는 방식은 민감 정보 노출 위험이 있어 사용하지 않는다.
export function getResultTitle(finalLetter: string) {
  return finalLetter.split("\n").find((line) => line.trim())?.trim() || "오늘 남겨진 이야기";
}
