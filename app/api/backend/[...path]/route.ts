import { NextRequest, NextResponse } from "next/server";

type Context = { params: Promise<{ path: string[] }> };

async function forward(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (path.some((part) => !/^[a-zA-Z0-9_-]+$/.test(part)) || !["auth", "me", "templates", "letters", "routing", "workflow", "tasks", "rooms"].includes(path[0])) {
    return NextResponse.json({ detail: "Endpoint tidak tersedia." }, { status: 404 });
  }
  if (request.method !== "GET" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ detail: "Asal permintaan tidak valid." }, { status: 403 });
  }
  const login = path.join("/") === "auth/login";
  const logout = path.join("/") === "auth/logout";
  if (path[0] === "auth" && !login && !logout) return NextResponse.json({ detail: "Endpoint tidak tersedia." }, { status: 404 });
  const token = request.cookies.get("signit-access")?.value;
  if (!login && !token) return NextResponse.json({ detail: "Silakan masuk kembali." }, { status: 401 });
  const base = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!base) return NextResponse.json({ detail: "BACKEND_URL belum dikonfigurasi pada frontend." }, { status: 503 });
  const headers = new Headers();
  if (token && !login) headers.set("Authorization", `Bearer ${token}`);
  for (const name of ["content-type", "idempotency-key"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const upstream = await fetch(`${base.replace(/\/$/, "")}/api/v1/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method, headers, cache: "no-store", redirect: "error",
      body: request.method === "GET" ? undefined : await request.arrayBuffer(),
      signal: AbortSignal.timeout(30000),
    });
    if (login && upstream.ok) {
      const data = await upstream.json();
      if (typeof data.accessToken !== "string" || !Number.isFinite(Date.parse(data.accessTokenExpiresAt)) || !data.user) {
        return NextResponse.json({ detail: "Respons login backend tidak valid." }, { status: 502 });
      }
      const response = NextResponse.json(data.user, { headers: { "Cache-Control": "no-store" } });
      response.cookies.set("signit-access", data.accessToken, { httpOnly: true, secure: request.nextUrl.protocol === "https:", sameSite: "lax", path: "/", expires: new Date(data.accessTokenExpiresAt) });
      return response;
    }
    const response = new NextResponse(upstream.body, { status: upstream.status, headers: { "Cache-Control": "no-store", "Content-Type": upstream.headers.get("content-type") ?? "application/json", "X-Content-Type-Options": "nosniff" } });
    if (logout && upstream.ok || upstream.status === 401 && !login) response.cookies.delete("signit-access");
    return response;
  } catch {
    return NextResponse.json({ detail: "Backend belum dapat dihubungi. Input kamu tetap tersimpan di halaman ini." }, { status: 502 });
  }
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
