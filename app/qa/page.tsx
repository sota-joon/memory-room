import Link from "next/link";
import { CheckCircle2, ClipboardCheck } from "lucide-react";

const automaticChecks = [
  "POST /api/memories 저장 API가 존재한다",
  "잘못된 이메일 형식은 저장되지 않는다",
  "유효한 accessToken으로 /memory/[token] 결과 조회가 가능하다",
  "잘못된 token은 결과물을 찾을 수 없다고 표시한다",
  "kioskMode에서 사용자 답변과 결과물은 localStorage에 저장하지 않는다",
  "npm run build가 통과한다",
];

const manualChecks = [
  "첫 접속 시 이전 사용자 데이터가 보이지 않는다",
  "기록 시작하기 버튼을 누를 수 있다",
  "질문 답변 textarea에 직접 입력할 수 있다",
  "음성 입력 시작 버튼이 답변 영역에 보인다",
  "음성 입력 시작 시 마이크 권한 요청이 뜬다",
  "한국어 음성인식 결과가 textarea에 자동 입력된다",
  "음성인식 결과를 사용자가 직접 수정할 수 있다",
  "기록 완료 후 이메일 입력 필드가 결과물 아래에 표시된다",
  "test@test.com 입력 후 결과물 저장하기를 누를 수 있다",
  "저장 성공 후 고유 링크와 결과물 다시 보기 버튼이 보인다",
  "링크 클릭 시 /memory/[token]에서 방금 결과물이 보인다",
  "메인으로 돌아가기 클릭 시 초기화된다",
  "5분 무입력 시 자동으로 메인 화면으로 돌아간다",
  "모바일 Chrome에서 같은 흐름이 가능하다",
];

export default function QaPage() {
  return (
    <main className="app-shell">
      <section className="mx-auto w-full max-w-[880px] rounded-[32px] border border-white/70 bg-[#fffaf0]/85 p-6 shadow-[0_28px_110px_rgba(62,47,33,0.14)] backdrop-blur-2xl sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#9d5f46]">Memory Room QA</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#2f2a24]">
              실제 사용자 흐름 기준 체크리스트
            </h1>
          </div>
          <Link className="rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-[#4f463b]" href="/">
            메인으로 돌아가기
          </Link>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#746a5d]">
          API가 있는지만 보지 않고, 사용자가 실제 화면에서 보고 누를 수 있는지를 기준으로 확인합니다.
          마이크 권한과 음성인식은 PC Chrome과 모바일 Chrome에서 직접 확인해야 합니다.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-[24px] bg-white/65 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2f3526]">
              <CheckCircle2 size={18} aria-hidden="true" />
              자동 확인 완료
            </div>
            <div className="mt-4 grid gap-3">
              {automaticChecks.map((item) => (
                <label className="flex items-start gap-3 text-sm leading-6 text-[#4f463b]" key={item}>
                  <input className="mt-1 h-4 w-4 accent-[#6d7d68]" type="checkbox" defaultChecked readOnly />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] bg-white/65 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2f3526]">
              <ClipboardCheck size={18} aria-hidden="true" />
              수동 확인 필요
            </div>
            <div className="mt-4 grid gap-3">
              {manualChecks.map((item) => (
                <label className="flex items-start gap-3 text-sm leading-6 text-[#4f463b]" key={item}>
                  <input className="mt-1 h-4 w-4 accent-[#6d7d68]" type="checkbox" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-[22px] bg-[#2f3526] p-5 text-[#f9f3e8]">
          <div className="flex items-center gap-2 text-sm font-bold">
            <CheckCircle2 size={18} aria-hidden="true" />
            저장 방식 안내
          </div>
          <p className="mt-3 text-sm leading-7 text-[#eee4d4]">
            Supabase 환경값이 있으면 서버 DB에 저장합니다. 환경값이 없으면 개발 서버가 켜져 있는 동안만
            임시 mock DB에 저장되어 저장 링크 흐름을 테스트할 수 있습니다.
          </p>
        </div>
      </section>
    </main>
  );
}
