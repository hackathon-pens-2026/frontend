import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Masuk — SignIt!" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Masuk ke SignIt!"
      subtitle="Gunakan akun kampus yang telah disediakan tim untuk mengelola surat kegiatan."
    >
      <Suspense
        fallback={<p className="text-body text-slate-500">Menyiapkan formulir…</p>}
      >
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
