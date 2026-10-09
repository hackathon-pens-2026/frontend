import { toApiError, toNetworkError } from "./errors";

export const API_PREFIX = "/api/v1";
export const UNAUTHORIZED_EVENT = "signit:unauthorized";

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "headers"> {
  json?: unknown;
  body?: BodyInit | null;
  headers?: HeadersInit;
  skipUnauthorizedEvent?: boolean;
}

function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { json, headers, skipUnauthorizedEvent, ...rest } = options;
  const requestHeaders = new Headers(headers);
  if (json !== undefined) requestHeaders.set("Content-Type", "application/json");
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: json !== undefined ? JSON.stringify(json) : options.body,
      cache: "no-store",
    });
  } catch (error) {
    throw toNetworkError(error);
  }
  if (!response.ok) {
    const error = await toApiError(response);
    if (error.status === 401 && !skipUnauthorizedEvent) notifyUnauthorized();
    throw error;
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function apiDownload(path: string): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, { cache: "no-store" });
  } catch (error) {
    throw toNetworkError(error);
  }
  if (!response.ok) {
    const error = await toApiError(response);
    if (error.status === 401) notifyUnauthorized();
    throw error;
  }
  return await response.blob();
}
