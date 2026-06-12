export const KIOSK_MODE = true;

const APP_STORAGE_PREFIXES = [
  "memory-",
  "memoryVault",
  "memoryVaultStudio",
  "memory-vault",
  "memory-room",
];

export function isKioskMode() {
  return KIOSK_MODE;
}

export async function purgeKioskBrowserData() {
  if (typeof window === "undefined" || !KIOSK_MODE) return;

  try {
    window.localStorage.clear();
  } catch {
    // ignore
  }

  try {
    window.sessionStorage.clear();
  } catch {
    // ignore
  }

  try {
    if ("caches" in window) {
      const names = await window.caches.keys();
      await Promise.all(names.map((name) => window.caches.delete(name)));
    }
  } catch {
    // ignore
  }

  try {
    if ("indexedDB" in window && "databases" in window.indexedDB) {
      const databases = await window.indexedDB.databases();
      databases.forEach((database) => {
        if (database.name && shouldDeleteDatabase(database.name)) {
          window.indexedDB.deleteDatabase(database.name);
        }
      });
    }
  } catch {
    // ignore
  }
}

export function clearKioskAppStorage() {
  if (typeof window === "undefined" || !KIOSK_MODE) return;
  clearMatchingStorage(window.localStorage);
  clearMatchingStorage(window.sessionStorage);
}

function clearMatchingStorage(storage: Storage) {
  try {
    Object.keys(storage).forEach((key) => {
      if (APP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
        storage.removeItem(key);
      }
    });
  } catch {
    // ignore
  }
}

function shouldDeleteDatabase(name: string) {
  return APP_STORAGE_PREFIXES.some((prefix) => name.startsWith(prefix));
}
