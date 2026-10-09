"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/form-state";
import { loginAction } from "@/lib/auth/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-body text-midnight placeholder:text-slate-400 focus:border-navy focus:outline-2 focus:outline-offset-1 focus:outline-gold";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "";
  const reset = searchParams.get("reset") === "1";
  const [state, action, pending] = useActionState(loginAction, initialAuthFormState);

  return (
    <form action={action} className="space-y-5">
      {reset && state.status !== "success" && (
        <p className="rounded-lg border border-approved-border bg-approved-bg px-3 py-2 text-body text-approved">
          Password berhasil diubah. Silakan login dengan password baru.
        </p>
      )}
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision"
        >
          {state.message}
        </p>
      )}

      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="email" className="text-body font-medium text-midnight">
          Email kampus
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="nama@pens.ac.id"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-body font-medium text-midnight">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-micro font-semibold text-navy hover:underline"
          >
            Lupa password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Memproses…" : "Masuk"}
      </Button>

      <p className="text-micro text-slate-500">
        Akun disediakan oleh tim kampus. Hubungi bagian kemahasiswaan bila akses
        Anda belum aktif.
      </p>
    </form>
  );
}
