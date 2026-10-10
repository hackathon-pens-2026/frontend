import { createHash, timingSafeEqual } from "node:crypto";
import { DEMO_PERSONAS } from "@/lib/auth/personas";
import { backendFetch } from "@/lib/server/backend";
import { setAuthCookies } from "@/lib/server/session";
import type { AuthTokensDto } from "@/lib/api/types";

const reply = (detail: string, status: number) => Response.json({ detail }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (process.env.UAT_ACCOUNT_PICKER_ENABLED !== "true") return reply("Pilih akun backend belum diaktifkan pada lingkungan UAT ini.", 503);
  const key = process.env.UAT_ACCESS_KEY;
  const password = process.env.UAT_ACCOUNT_PASSWORD;
  if (!key || key.length < 32 || !password) return reply("Konfigurasi akses UAT belum lengkap.", 503);
  if (request.headers.get("origin") !== new URL(request.url).origin) return reply("Asal permintaan tidak diizinkan.", 403);
  let input: { personaId?: string; accessKey?: string };
  try { input = await request.json(); } catch { return reply("Permintaan tidak valid.", 400); }
  const hash = (value: string) => createHash("sha256").update(value).digest();
  if (typeof input.accessKey !== "string" || !timingSafeEqual(hash(input.accessKey), hash(key))) return reply("Kode akses UAT tidak valid.", 403);
  const persona = DEMO_PERSONAS.find((item) => item.id === input.personaId);
  if (!persona) return reply("Akun tidak tersedia untuk UAT.", 400);
  try {
    const upstream = await backendFetch("/api/v1/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: persona.email, password }),
    });
    if (!upstream.ok) return reply("Akun UAT belum dapat diakses. Periksa provisioning dan kredensial backend.", upstream.status);
    const tokens = await upstream.json() as AuthTokensDto;
    if (tokens.user.email.toLowerCase() !== persona.email.toLowerCase()) return reply("Identitas akun backend tidak sesuai.", 502);
    await setAuthCookies(tokens);
    return Response.json(tokens.user, { headers: { "Cache-Control": "no-store" } });
  } catch { return reply("Backend belum dapat dihubungi. Akun tidak diganti.", 502); }
}
