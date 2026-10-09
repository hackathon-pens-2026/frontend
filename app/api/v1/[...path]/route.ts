import type { NextRequest } from "next/server";
import { backendFetch } from "@/lib/server/backend";
import { getAccessToken, refreshAuthTokens } from "@/lib/server/session";

const FORWARDED_REQUEST_HEADERS = ["content-type", "accept", "idempotency-key"];
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-disposition",
  "cache-control",
  "etag",
  "retry-after",
  "www-authenticate",
];

async function handle(
  request: NextRequest,
  context: RouteContext<"/api/v1/[...path]">,
): Promise<Response> {
  const { path } = await context.params;
  const target = `/api/v1/${path.map((segment) => encodeURIComponent(segment)).join("/")}${request.nextUrl.search}`;

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

  const token = await getAccessToken();
  let upstream = await backendFetch(target, { method, headers, body, token });
  if (upstream.status === 401) {
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

  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
  handle as HEAD,
};
