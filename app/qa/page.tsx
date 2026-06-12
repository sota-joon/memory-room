import Link from "next/link";
import { CheckCircle2, ClipboardCheck } from "lucide-react";

const automaticChecks = [
  "POST /api/memories가 Supabase memories 테이블에 저장한다",
  "GET /api/memories/[token]이 Supabase access_token으로 조회한다",
  "mockMemoryStore 임시 저장소를 사용하지 않는다",
  "잘못된 이메일 형식은 저장되지 않는다",
  "잘못된 token은 결과물을 찾을 수 없다고 표시한다",
  "npm run build가 통과한다",
];

const manualChecks = [
  "Supabase memories 테이블 SQL을 실행했다",
  ".env.local에 SUPABASE_URL을 설정했다",
  ".env.local에 SUPABASE_SERVICE_ROLE_KEY를 설정했다",
  "기록 완료 후 이메일 입력 필드가 결과물 아래에 표시된다",
  "test@test.com 입력 후 결과물 저장하기를 누를 수 있다",
  "저장 성공 후 고유 링크와 결과물 다시 보기 버튼이 보인다",
  "링크 클릭 시 /memory/[token]에서 방금 결과물이 보인다",
  "개발 서버를 재시작한 뒤 같은 /memory/[token] 링크가 다시 열린다",
  "메인으로 돌아가기 클릭 시 현재 세션 입력값이 초기화된다",
  "모바일 Chrome/Safari에서 녹음 기반 STT가 동작한다",
];

export default function QaPage() {
  return (
    <main className="app-shell">
      <section className="mx-auto w-full max-w-[880px] rounded-[32px] border border-white/70 bg-[#fffaf0]/85 p-6 shadow-[0_28px_110px_rgba(62,47,33,0.14)] backdrop-blur-2xl sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#9d5f46]">Memory Room QA</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#2f2a24]">
              Supabase 영구 저장 체크리스트
            </h1>
          </div>
          <Link className="rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-[#4f463b]" href="/">
            메인으로 돌아가기
          </Link>
        </div>

        <p className="mt-5 text-sm leading-7 text-[#746a5d]">
          이제 결과물은 브라우저나 개발 서버 메모리가 아니라 Supabase에만 저장됩니다.
          서버를 재시작해도 `/memory/[token]` 링크가 유지되는지 반드시 확인해주세요.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-[24px] bg-white/65 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#2f3526]">
              <CheckCircle2 size={18} aria-hidden="true" />
              코드 확인 완료
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
            Supabase 환경값이 없으면 저장은 실패합니다. 이는 임시 저장으로 착각하지 않도록 하기 위한 의도된 동작입니다.
          </p>
        </div>
      </section>
    </main>
  );
}
