import type { MemoryVault } from "./types";
import { isKioskMode } from "./kioskMode";

const VAULT_INDEX_KEY = "memory-vault-index-v1";
const VAULT_PREFIX = "memory-vault:";

export function createVaultId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `vault-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createAccessCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function saveMemoryVault(vault: MemoryVault) {
  if (typeof window === "undefined") return;
  if (isKioskMode()) return;

  try {
    window.localStorage.setItem(`${VAULT_PREFIX}${vault.vaultId}`, JSON.stringify(vault));
    const ids = loadVaultIds();
    if (!ids.includes(vault.vaultId)) {
      window.localStorage.setItem(VAULT_INDEX_KEY, JSON.stringify([vault.vaultId, ...ids]));
    }
  } catch {
    throw new Error("기록 저장소를 저장하지 못했습니다. 브라우저 저장 공간을 확인해 주세요.");
  }
}

export function loadMemoryVault(vaultId: string) {
  if (typeof window === "undefined") return null;
  if (isKioskMode()) return null;

  try {
    const stored = window.localStorage.getItem(`${VAULT_PREFIX}${vaultId}`);
    if (!stored) return null;
    return JSON.parse(stored) as MemoryVault;
  } catch {
    return null;
  }
}

export function loadVaultIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(VAULT_INDEX_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
}

export function getVaultUrl(vaultId: string) {
  if (typeof window === "undefined") return `/vault/${vaultId}`;
  return `${window.location.origin}/vault/${vaultId}`;
}
