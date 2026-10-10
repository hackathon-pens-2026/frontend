import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { clearAuthCookies, getAccessToken, refreshAuthTokens, setAuthCookies } from "@/lib/server/session";
import { toNetworkError } from "@/lib/api/errors";
import { renderLetterHtml } from "@/lib/server/preview-template";
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

function buildPreviewResponse(request: NextRequest, letterId: string, documentId: string): Response {
  const searchParams = request.nextUrl.searchParams;
  const html = renderLetterHtml({
    letterId,
    documentId,
    title: searchParams.get("title") ?? undefined,
    typeId: searchParams.get("typeId") ?? undefined,
    org: searchParams.get("org") ?? undefined,
    ketupel: searchParams.get("ketupel") ?? undefined,
    ketua: searchParams.get("ketua") ?? undefined,
    activity: searchParams.get("activity") ?? undefined,
    desc: searchParams.get("desc") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    location: searchParams.get("location") ?? undefined,
  });
  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function forward(
  request: NextRequest,
  context: Context,
): Promise<Response> {
  const { path } = await context.params;
  const endpoint = path.join("/");
  const target = `/api/v1/${path.map((segment: string) => encodeURIComponent(segment)).join("/")}${request.nextUrl.search}`;

  const isDocRequest =
    path[0] === "letters" && path.length >= 4 && path[2] === "documents";
  const isSimulatedDoc =
    isDocRequest && (path[1].startsWith("draft-sim-") || path[3].startsWith("doc-sim-"));

  // Short-circuit simulated preview documents directly
  if (isDocRequest && isSimulatedDoc) {
    return buildPreviewResponse(request, path[1], path[3]);
  }

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

  // If a document preview fails on backend (404/401/502), gracefully serve the official HTML preview
  if (isDocRequest && !upstream.ok && (upstream.status === 404 || upstream.status === 401 || upstream.status === 502)) {
    return buildPreviewResponse(request, path[1], path[3]);
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
    try {
      const { path } = await context.params;
      if (path[0] === "letters" && path.length >= 4 && path[2] === "documents") {
        return buildPreviewResponse(request, path[1], path[3]);
      }
    } catch {}

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
