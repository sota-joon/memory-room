export type MemoryRecord = {
  accessToken: string;
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

type MemoryStoreGlobal = typeof globalThis & {
  __memoryRoomMockStore?: Map<string, MemoryRecord>;
};

function getStore() {
  const memoryGlobal = globalThis as MemoryStoreGlobal;
  if (!memoryGlobal.__memoryRoomMockStore) {
    memoryGlobal.__memoryRoomMockStore = new Map<string, MemoryRecord>();
  }
  return memoryGlobal.__memoryRoomMockStore;
}

export function shouldUseMockMemoryStore() {
  return !process.env.SUPABASE_URL || !(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
}

export function saveMockMemory(record: MemoryRecord) {
  getStore().set(record.accessToken, record);
  return record;
}

export function getMockMemory(accessToken: string) {
  return getStore().get(accessToken) ?? null;
}
