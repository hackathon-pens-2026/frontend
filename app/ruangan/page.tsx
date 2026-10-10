import { Suspense } from "react";
import { RoomSchedule } from "@/features/rooms/room-schedule";

export default function Page() {
  return <Suspense fallback={<p>Memuat jadwal…</p>}><RoomSchedule /></Suspense>;
}
