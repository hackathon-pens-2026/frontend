"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type SessionUser = { id: string; name: string; email: string; nimNip: string | null; uiSurface: string | number };

export function SessionGate({ children }: { children: (user: SessionUser) => ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    api<SessionUser>("me").then((value) => { if (active) setUser(value); }).catch(() => {}).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setLoading(true); setError("");
    try { setUser(await api<SessionUser>("auth/login", { email: form.get("email"), password: form.get("password") })); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Login gagal."); }
    finally { setLoading(false); }
  }
  if (user) return <><div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-6 py-3"><span>{user.name}</span><button onClick={async () => { try { await api("auth/logout", {}); setUser(null); } catch { setError("Keluar gagal. Coba lagi."); } }}>Keluar</button>{error && <p role="alert">{error}</p>}</div>{children(user)}</>;
  return <main className="flex min-h-screen items-center justify-center bg-canvas p-6"><form onSubmit={login} className="w-full max-w-md space-y-5 rounded-xl border border-line bg-surface p-8"><h1 className="text-title font-semibold">Masuk ke SignIt!</h1><p>Gunakan akun yang disediakan tim.</p><label className="block">Email<input name="email" type="email" autoComplete="username" required className="mt-2 block w-full rounded border border-line p-3" /></label><label className="block">Password<input name="password" type="password" autoComplete="current-password" required className="mt-2 block w-full rounded border border-line p-3" /></label>{error && <p role="alert" className="text-revision">{error}</p>}<button disabled={loading} className="w-full rounded bg-primary p-3 text-surface disabled:opacity-50">{loading ? "Memuat…" : "Masuk"}</button></form></main>;
}
