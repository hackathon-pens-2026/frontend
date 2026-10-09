"use client";

import { useActionState, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/form-state";
import { resetPasswordAction } from "@/lib/auth/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-body text-midnight placeholder:text-slate-400 focus:border-navy focus:outline-2 focus:outline-offset-1 focus:outline-gold";

function readHashToken(): string {
  const hash = window.location.hash;
  return hash.startsWith("#token=")
    ? decodeURIComponent(hash.slice("#token=".length))
    : "";
}

export function ResetPasswordForm() {
  const hashToken = useSyncExternalStore(
    () => () => {},
    readHashToken,
    () => "",
  );
  const [manualToken, setManualToken] = useState("");
  const token = hashToken || manualToken;
  const [state, action, pending] = useActionState(
    resetPasswordAction,
    initialAuthFormState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <p className="rounded-lg border border-approved-border bg-approved-bg px-3 py-3 text-body text-approved">
          {state.message}
        </p>
        <Link
          href="/login?reset=1"
          className="inline-flex text-body font-semibold text-navy hover:underline"
        >
          Masuk dengan password baru
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision"
        >
          {state.message}
        </p>
      )}

      <input type="hidden" name="token" value={token} />

      {!hashToken && (
        <div className="space-y-1.5">
          <label htmlFor="token" className="text-body font-medium text-midnight">
            Kode reset
          </label>
          <input
            id="token"
            value={manualToken}
            onChange={(event) => setManualToken(event.target.value)}
            placeholder="Tempel kode dari email"
            className={inputClass}
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="newPassword" className="text-body font-medium text-midnight">
          Password baru
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="Minimal 12 karakter"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmation" className="text-body font-medium text-midnight">
          Ulangi password baru
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          autoComplete="new-password"
          required
          minLength={12}
          placeholder="Minimal 12 karakter"
          className={inputClass}
        />
      </div>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Menyimpan…" : "Simpan password"}
      </Button>
      <Link
        href="/login"
        className="block text-center text-micro font-semibold text-navy hover:underline"
      >
        Kembali ke halaman login
      </Link>
    </form>
  );
}
