import { Suspense } from "react";
import StaffPortal from "@/features/shell/components/staff-portal";

export const metadata = {
  title: "Portal Staf & Manajemen · SignIt! PENS",
  description: "Pusat persetujuan dan otorisasi dokumen resmi Politeknik Elektronika Negeri Surabaya",
};

export default function StaffPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <StaffPortal />
    </Suspense>
  );
}
