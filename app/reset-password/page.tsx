import type { Metadata } from "next";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata: Metadata = { title: "Reset Password — SignIt!" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Atur password baru"
      subtitle="Tautan dari email berlaku 30 menit dan hanya dapat dipakai sekali."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
