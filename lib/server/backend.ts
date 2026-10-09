import { toApiError } from "@/lib/api/errors";

const DEFAULT_BASE_URL = "http://localhost:5217";

export function backendBaseUrl(): string {
  const configured = process.env.SIGNIT_API_BASE_URL?.trim();
  const base = configured && configured.length > 0 ? configured : DEFAULT_BASE_URL;
  return base.replace(/\/+$/, "");
}

export interface BackendRequestOptions {
  method?: string;
  token?: string | null;
  body?: BodyInit | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function backendFetch(
  path: string,
  options: BackendRequestOptions = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);
  return await fetch(`${backendBaseUrl()}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ?? null,
    cache: "no-store",
    signal: options.signal ?? AbortSignal.timeout(options.timeoutMs ?? 30_000),
  });
}

export async function backendJson<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const response = await backendFetch(path, options);
  if (!response.ok) throw await toApiError(response);
  return (await response.json()) as T;
}
