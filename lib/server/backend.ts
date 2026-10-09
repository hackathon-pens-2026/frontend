import { ApiError, toApiError } from "@/lib/api/errors";

export function backendBaseUrl(): string {
  const configured = (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL)?.trim();
  if (!configured) {
    throw new ApiError(503, "backend_configuration_missing", "BACKEND_URL belum dikonfigurasi pada frontend.", null);
  }
  try {
    const base = new URL(configured);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
      throw new Error("invalid_origin");
    }
    return base.origin;
  } catch {
    throw new ApiError(503, "backend_configuration_invalid", "BACKEND_URL harus berupa URL HTTP/HTTPS lengkap (contoh: http://signit.indonesiacentral.cloudapp.azure.com:8080).", null);
  }
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
