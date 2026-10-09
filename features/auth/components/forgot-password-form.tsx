"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { initialAuthFormState } from "@/lib/auth/form-state";
import { forgotPasswordAction } from "@/lib/auth/actions";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-body text-midnight placeholder:text-slate-400 focus:border-navy focus:outline-2 focus:outline-offset-1 focus:outline-gold";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    forgotPasswordAction,
    initialAuthFormState,
  );

  if (state.status === "success") {
    return (
      <div className="space-y-5">
        <p className="rounded-lg border border-approved-border bg-approved-bg px-3 py-3 text-body text-approved">
          {state.message}
        </p>
        <Link
          href="/login"
          className="inline-flex text-body font-semibold text-navy hover:underline"
        >
          Kembali ke halaman login
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
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Mengirim…" : "Kirim instruksi reset"}
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
