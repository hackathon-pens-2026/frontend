import { Suspense } from "react";
import { LettersPage } from "@/features/dashboard/components/letters-page";

export const metadata = {
  title: "Surat Saya · SignIt! PENS",
  description: "Daftar pengajuan surat dan status tahapannya",
};

export default function SuratPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LettersPage />
    </Suspense>
  );
}
