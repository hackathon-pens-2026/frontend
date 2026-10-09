import { Suspense } from "react";
import { LetterDetailPage } from "@/features/tracking-detail/components/letter-detail-page";

export const instant = false;

export const metadata = {
  title: "Detail Surat · SignIt! PENS",
  description: "Pelacakan tahap, bukti tanda tangan, dan dokumen final surat",
};

export default function SuratDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <LetterDetailPage />
    </Suspense>
  );
}
