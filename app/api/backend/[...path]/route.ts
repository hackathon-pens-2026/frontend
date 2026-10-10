import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import {
  clearAuthCookies,
  getAccessToken,
  refreshAuthTokens,
  setAuthCookies,
} from "@/lib/server/session";
import type { AuthTokensDto } from "@/lib/api/types";

// Alias kompatibilitas dari `/api/backend/*` ke BFF utama. Memakai cookie sesi
// dan refresh yang sama dengan `/api/v1/*`; tidak ada dokumen/HTML simulasi.
type Context = { params: Promise<{ path: string[] }> };

const ALLOWED_ENDPOINTS = ["auth", "me", "templates", "letters", "routing", "workflow", "tasks", "rooms"];

async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;

  if (path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part)) || !ALLOWED_ENDPOINTS.includes(path[0])) {
    return NextResponse.json({ detail: "Endpoint tidak tersedia." }, { status: 404 });
  }
  if (request.method !== "GET" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ detail: "Asal permintaan tidak valid." }, { status: 403 });
  }

  const endpoint = path.join("/");
  const login = endpoint === "auth/login";
  const logout = endpoint === "auth/logout";
  if (path[0] === "auth" && !login && !logout) {
    return NextResponse.json({ detail: "Endpoint tidak tersedia." }, { status: 404 });
  }

  const headers = new Headers();
  for (const name of ["content-type", "idempotency-key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const body = request.method === "GET" ? null : await request.arrayBuffer();
  const publicAuth = path[0] === "auth" && !logout;
  const target = `/api/v1/${endpoint}${request.nextUrl.search}`;

  const token = publicAuth ? null : await getAccessToken();
  let upstream = await backendFetch(target, { method: request.method, headers, body, token });
  if (upstream.status === 401 && !publicAuth) {
    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      upstream = await backendFetch(target, {
        method: request.method,
        headers,
        body,
        token: refreshed.accessToken,
      });
    }
  }

  if (login && upstream.ok) {
    const tokens = (await upstream.json()) as AuthTokensDto;
    await setAuthCookies(tokens);
    return NextResponse.json(tokens.user, { headers: { "Cache-Control": "no-store" } });
  }
  if (logout && upstream.ok) await clearAuthCookies();

  const responseHeaders = new Headers({
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  const contentType = upstream.headers.get("content-type");
  if (contentType) responseHeaders.set("Content-Type", contentType);
  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
