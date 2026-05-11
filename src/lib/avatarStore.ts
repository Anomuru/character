const KEY = "kasb-avatars-v1";

type Store = Record<string, string>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("avatars:change"));
}

export function getAvatarUrl(jobId: string): string | undefined {
  return read()[jobId];
}

export function setAvatarUrl(jobId: string, url: string) {
  const store = read();
  store[jobId] = url;
  write(store);
}

export function clearAvatarUrl(jobId: string) {
  const store = read();
  delete store[jobId];
  write(store);
}

export function getAllAvatars(): Store {
  return read();
}
