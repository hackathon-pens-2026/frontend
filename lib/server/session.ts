import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/constants";
import type { AuthTokensDto } from "@/lib/api/types";
import { backendFetch } from "./backend";

function cookieOptions(expiresAt: string) {
  const expires = new Date(expiresAt);
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: Number.isNaN(expires.getTime()) ? undefined : expires,
  };
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null;
}

export async function setAuthCookies(tokens: AuthTokensDto): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, tokens.accessToken, cookieOptions(tokens.accessTokenExpiresAt));
  store.set(REFRESH_COOKIE, tokens.refreshToken, cookieOptions(tokens.refreshTokenExpiresAt));
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

// Refresh token backend bersifat single-use; refresh serentak dengan token yang
// sama dianggap "reuse" dan mencabut seluruh sesi. Semua permintaan yang gagal
// 401 pada saat yang sama harus berbagi satu proses refresh (single-flight).
let inFlightRefresh: Promise<AuthTokensDto | null> | null = null;

export function refreshAuthTokens(): Promise<AuthTokensDto | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

async function performRefresh(): Promise<AuthTokensDto | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  let response: Response;
  try {
    response = await backendFetch("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      timeoutMs: 10_000,
    });
  } catch {
    return null;
  }
  if (!response.ok) {
    await clearAuthCookies();
    return null;
  }
  const tokens = (await response.json()) as AuthTokensDto;
  await setAuthCookies(tokens);
  return tokens;
}
