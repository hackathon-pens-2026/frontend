import { Suspense } from "react";
import LetterAssistant from "@/features/assistant/components/letter-assistant";

export const metadata = {
  title: "Buat Surat Baru · SignIt! PENS",
  description: "Susun draf surat resmi dari schema template backend Politeknik Elektronika Negeri Surabaya",
};

export default function SuratBaruPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LetterAssistant />
    </Suspense>
  );
}
