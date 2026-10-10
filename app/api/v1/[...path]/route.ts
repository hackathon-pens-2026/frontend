import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { clearAuthCookies, getAccessToken, refreshAuthTokens, setAuthCookies } from "@/lib/server/session";
import { toNetworkError } from "@/lib/api/errors";
import type { AuthTokensDto } from "@/lib/api/types";

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "idempotency-key"];
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "etag",
  "retry-after",
  "www-authenticate",
];

type Context = { params: Promise<{ path: string[] }> };

async function forward(
  request: NextRequest,
  context: Context,
): Promise<Response> {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const target = `/api/v1/${path.map((segment: string) => encodeURIComponent(segment)).join("/")}${request.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const method = request.method;
  let body: ArrayBuffer | null = null;
  if (method !== "GET" && method !== "HEAD") {
    const buffer = await request.arrayBuffer();
    body = buffer.byteLength > 0 ? buffer : null;
  }

  const login = endpoint === "auth/login";
  const publicAuth = path[0] === "auth" && endpoint !== "auth/logout";
  const token = publicAuth ? null : await getAccessToken();
  let upstream = await backendFetch(target, { method, headers, body, token });
  if (upstream.status === 401 && !publicAuth) {
    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      upstream = await backendFetch(target, {
        method,
        headers,
        body,
        token: refreshed.accessToken,
      });
    }
  }

  if (login && upstream.ok) {
    const tokens = (await upstream.json()) as AuthTokensDto;
    await setAuthCookies(tokens);
    return Response.json(tokens.user, { headers: { "Cache-Control": "no-store" } });
  }
  if (endpoint === "auth/logout" && upstream.ok) await clearAuthCookies();

  const responseHeaders = new Headers();
  responseHeaders.set("Cache-Control", "no-store");
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

async function handle(request: NextRequest, context: Context): Promise<Response> {
  try {
    return await forward(request, context);
  } catch (failure) {
    console.error("[api/v1 proxy error]", failure);
    const error = toNetworkError(failure);
    const detailMsg = failure instanceof Error && failure.message
      ? `${error.message} (${failure.message})`
      : error.message;
    return Response.json({ code: error.code, title: error.message, detail: detailMsg }, {
      status: error.status || 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
  handle as HEAD,
};
