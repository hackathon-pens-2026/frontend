export async function api<T>(path: string, body?: unknown, method = "POST", key?: string): Promise<T> {
  const response = await fetch(`/api/backend/${path}`, {
    method: body === undefined ? "GET" : method, cache: "no-store",
    headers: body === undefined ? undefined : { "Content-Type": "application/json", ...(key ? { "Idempotency-Key": key } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}));
    throw new Error(problem.detail ?? problem.title ?? `Permintaan gagal (${response.status}).`);
  }
  return response.status === 204 ? undefined as T : response.json();
}
