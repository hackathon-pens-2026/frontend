// Single-use refresh tokens must be coordinated per session, never across users.
export function createRefreshCoordinator<T>(reuseWindowMs = 10_000, maximumEntries = 256) {
  const requests = new Map<string, { result: Promise<T>; expires: number }>();
  return async function coordinate(key: string, execute: () => Promise<T>): Promise<T> {
    const now = Date.now();
    for (const [entryKey, entry] of requests) if (entry.expires <= now) requests.delete(entryKey);
    const existing = requests.get(key);
    if (existing) return existing.result;
    if (requests.size >= maximumEntries) throw new Error("Sesi sedang sibuk. Coba kembali.");
    const entry = { result: Promise.resolve().then(execute), expires: Number.POSITIVE_INFINITY };
    requests.set(key, entry);
    try {
      const result = await entry.result;
      entry.expires = Date.now() + reuseWindowMs;
      return result;
    } catch (cause) {
      requests.delete(key);
      throw cause;
    }
  };
}
