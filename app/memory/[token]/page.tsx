"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartHandshake, ShieldCheck } from "lucide-react";

type MemoryResult = {
  answers: string[];
  audioUrl: string | null;
  createdAt: string;
  email: string;
  id: string;
  messageText: string;
  recipient: string | null;
  selectedQuestions: string[];
  title: string;
};

export default function MemoryResultPage() {
  const params = useParams<{ token: string }>();
  const [memory, setMemory] = useState<MemoryResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMemory() {
      try {
        const response = await fetch(`/api/memories/${params.token}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "결과물을 찾을 수 없습니다.");
        }
        setMemory(data as MemoryResult);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "결과물을 찾을 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMemory();
  }, [params.token]);

  return (
    <main className="app-shell">
      <section className="mx-auto w-full max-w-[920px] rounded-[32px] border border-white/70 bg-[#fffaf0]/80 p-6 shadow-[0_28px_110px_rgba(62,47,33,0.16)] backdrop-blur-2xl sm:p-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-[#2f3526]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2f3526] text-[#f9f3e8]">
              <HeartHandshake size={17} aria-hidden="true" />
            </span>
            Memory Room
          </div>
          <Link className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-[#4f463b]" href="/">
            메인으로 돌아가기
          </Link>
        </div>

        {isLoading && (
          <div className="py-24 text-center">
            <p className="text-sm font-bold text-[#9d5f46]">Private Memory</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#2f2a24]">결과물을 불러오는 중입니다.</h1>
          </div>
        )}

        {!isLoading && error && (
          <div className="py-24 text-center">
            <ShieldCheck className="mx-auto text-[#6d7d68]" size={36} aria-hidden="true" />
            <p className="mt-5 text-sm font-bold text-[#9d5f46]">Private Memory</p>
            <h1 className="mt-3 text-3xl font-semibold text-[#2f2a24]">결과물을 찾을 수 없습니다.</h1>
            <p className="mx-auto mt-4 max-w-[520px] text-sm leading-7 text-[#746a5d]">
              링크가 잘못되었거나, 접근 토큰이 일치하지 않습니다.
            </p>
          </div>
        )}

        {!isLoading && memory && (
          <article className="mt-10 grid gap-8">
            <div>
              <p className="text-sm font-bold text-[#9d5f46]">Private Memory</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#2f2a24]">{memory.title}</h1>
              <p className="mt-3 text-sm text-[#746a5d]">
                {new Date(memory.createdAt).toLocaleDateString("ko-KR")} 저장
                {memory.recipient ? ` · ${memory.recipient}` : ""}
              </p>
            </div>

            <section className="rounded-[24px] bg-white/65 p-6 shadow-[0_16px_45px_rgba(78,58,39,0.08)]">
              <h2 className="text-xl font-semibold text-[#2f2a24]">남겨진 이야기</h2>
              <div className="mt-5 whitespace-pre-line text-base leading-8 text-[#4f463b]">
                {memory.messageText || "저장된 메시지가 없습니다."}
              </div>
            </section>

            <section className="grid gap-4">
              <h2 className="text-xl font-semibold text-[#2f2a24]">인터뷰 기록</h2>
              {memory.selectedQuestions.map((question, index) => (
                <div className="rounded-[18px] bg-white/50 p-5" key={`${question}-${index}`}>
                  <p className="text-sm font-bold text-[#9d5f46]">Q{index + 1}. {question}</p>
                  <p className="mt-3 text-sm leading-7 text-[#746a5d]">{memory.answers[index] || ""}</p>
                </div>
              ))}
            </section>

            {memory.audioUrl && (
              <section className="rounded-[24px] bg-white/65 p-6">
                <h2 className="text-xl font-semibold text-[#2f2a24]">음성 기록</h2>
                <audio className="mt-4 w-full" controls src={memory.audioUrl} />
              </section>
            )}
          </article>
        )}
      </section>
    </main>
  );
}
