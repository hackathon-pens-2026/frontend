import { Suspense } from "react";
import StaffPortal from "@/features/shell/components/staff-portal";

export const metadata = { title: "Persetujuan Saya · SignIt!" };

export default function PersetujuanPage() {
  return <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
    <StaffPortal studentInbox />
  </Suspense>;
}
