"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Archive, ShieldCheck } from "lucide-react";
import { LockedVault } from "../../../components/LockedVault";
import { VaultView } from "../../../components/VaultView";
import type { MemoryVault } from "../../../lib/types";
import { getInitialLocale, getMessages } from "../../../lib/i18n";
import { canOpenVault, manuallyUnlockVault } from "../../../lib/unlockRules";
import { getVaultUrl, loadMemoryVault } from "../../../lib/vaultStorage";

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>();
  const searchParams = useSearchParams();
  const [vaultId, setVaultId] = useState("");
  const [vault, setVault] = useState<MemoryVault | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const token = searchParams.get("token");
  const locale = vault?.locale ?? getInitialLocale();
  const t = getMessages(locale);

  useEffect(() => {
    const nextVaultId = params.vaultId;
    setVaultId(nextVaultId);
    setVault(token ? loadMemoryVault(nextVaultId) : null);
    setIsLoaded(true);
  }, [params.vaultId, token]);

  function unlockForTest() {
    if (!vaultId) return;
    manuallyUnlockVault(vaultId);
    setVault(loadMemoryVault(vaultId));
    setRequestMessage("테스트 승인으로 기록을 열었습니다.");
  }

  if (!isLoaded) {
    return (
      <main className="app-shell">
        <Link className="main-return-button" href="/">
          메인으로 돌아가기
        </Link>
        <section className="memory-panel">
          <p className="eyebrow">Private Memory Room</p>
          <h1>기록 확인 준비 중입니다.</h1>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="app-shell">
        <Link className="main-return-button" href="/">
          메인으로 돌아가기
        </Link>
        <section className="vault-state-screen">
          <ShieldCheck size={32} aria-hidden="true" />
          <p className="eyebrow">Private Memory Room</p>
          <h1>인증이 필요한 기록입니다.</h1>
          <p>
            이 결과물은 공용 기기에 저장되지 않습니다. 이메일 또는 휴대폰 인증 후 발급된 보안 링크로만 열람할 수 있습니다.
          </p>
        </section>
      </main>
    );
  }

  if (!vault) {
    return (
      <main className="app-shell">
        <Link className="main-return-button" href="/">
          메인으로 돌아가기
        </Link>
        <section className="vault-state-screen">
          <Archive size={30} aria-hidden="true" />
          <p className="eyebrow">Private Memory Room</p>
          <h1>서버 인증 저장소가 필요합니다.</h1>
          <p>
            MVP 키오스크 모드에서는 결과물을 이 브라우저에 남기지 않습니다. 실제 열람은 서버 저장 및 이메일/휴대폰 인증 연결 후 제공됩니다.
          </p>
        </section>
      </main>
    );
  }

  const openable = canOpenVault(vault);

  return (
    <main className="app-shell">
      <Link className="main-return-button" href="/">
        메인으로 돌아가기
      </Link>
      <section className="memory-panel">
        {requestMessage && <p className="result-toast no-print">{requestMessage}</p>}
        {openable ? (
          <VaultView t={t} vault={vault} vaultUrl={getVaultUrl(vault.vaultId)} />
        ) : (
          <LockedVault
            vault={vault}
            t={t}
            onRequestOpen={() => setRequestMessage("열람 요청이 접수된 것으로 표시했습니다.")}
            onTestUnlock={unlockForTest}
          />
        )}
      </section>
    </main>
  );
}
