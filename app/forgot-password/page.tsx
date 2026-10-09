import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = { title: "Lupa Password — SignIt!" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Lupa password?"
      subtitle="Masukkan email kampus Anda. Instruksi reset akan dikirim bila akun terdaftar."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
