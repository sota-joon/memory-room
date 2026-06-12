"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Archive } from "lucide-react";
import { LockedVault } from "../../../components/LockedVault";
import { VaultView } from "../../../components/VaultView";
import type { MemoryVault } from "../../../lib/types";
import { getInitialLocale, getMessages } from "../../../lib/i18n";
import { canOpenVault, manuallyUnlockVault } from "../../../lib/unlockRules";
import { getVaultUrl, loadMemoryVault } from "../../../lib/vaultStorage";

export default function VaultPage() {
  const params = useParams<{ vaultId: string }>();
  const [vaultId, setVaultId] = useState("");
  const [vault, setVault] = useState<MemoryVault | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const locale = vault?.locale ?? getInitialLocale();
  const t = getMessages(locale);

  useEffect(() => {
    const nextVaultId = params.vaultId;
    setVaultId(nextVaultId);
    setVault(loadMemoryVault(nextVaultId));
    setIsLoaded(true);
  }, [params.vaultId]);

  function unlockForTest() {
    if (!vaultId) return;
    manuallyUnlockVault(vaultId);
    setVault(loadMemoryVault(vaultId));
    setRequestMessage(vaultPageCopy[locale].testUnlocked);
  }

  if (!isLoaded) {
    return (
      <main className="app-shell">
        <Link className="main-return-button" href="/">
          메인으로 돌아가기
        </Link>
        <section className="memory-panel">
          <p className="eyebrow">Memory Vault</p>
          <h1>Loading Memory Vault</h1>
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
          <p className="eyebrow">Memory Vault</p>
          <h1>{t.vault.missingTitle}</h1>
          <p>{t.vault.missingBody}</p>
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
            onRequestOpen={() =>
              setRequestMessage(vaultPageCopy[locale].requestSent)
            }
            onTestUnlock={unlockForTest}
          />
        )}
      </section>
    </main>
  );
}

const vaultPageCopy = {
  ko: {
    requestSent: "열람 요청이 접수된 것처럼 표시했습니다. MVP에서는 실제 알림이 발송되지 않습니다.",
    testUnlocked: "테스트 승인으로 기록을 열었습니다. 실제 서비스에서는 가족 관리자 인증이 필요합니다.",
  },
  en: {
    requestSent: "Access request shown as received. This MVP does not send a real notification.",
    testUnlocked: "Opened with test approval. A real service would require family manager verification.",
  },
  ja: {
    requestSent: "閲覧リクエストを受け付けた表示にしました。MVPでは実際の通知は送信されません。",
    testUnlocked: "テスト承認で記録を開きました。実際のサービスでは家族管理者の認証が必要です。",
  },
  zh: {
    requestSent: "已显示为收到查看请求。MVP版本不会发送真实通知。",
    testUnlocked: "已通过测试批准打开记录。正式服务需要家庭管理员验证。",
  },
};
