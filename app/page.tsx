import { Suspense } from "react";
import StudentDashboard from "@/features/dashboard/components/student-dashboard";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <StudentDashboard />
    </Suspense>
  );
}
