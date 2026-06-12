"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function DeprecatedResultPage() {
  return (
    <main className="app-shell">
      <section className="vault-state-screen">
        <ShieldAlert size={30} aria-hidden="true" />
        <p className="eyebrow">이전 결과 링크</p>
        <h1>이제 결과 데이터는 URL에 담지 않습니다.</h1>
        <p>
          민감한 가족 이야기와 편지가 링크에 직접 노출되지 않도록,
          새 기록은 기억 저장소 URL만 사용합니다.
        </p>
        <Link className="primary-button compact download-link" href="/">
          새 기억 저장소 만들기
        </Link>
      </section>
    </main>
  );
}
