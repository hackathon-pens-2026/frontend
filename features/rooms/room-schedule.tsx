"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StudentSidebar } from "@/features/shell";
import { checkAvailability, getRoomSchedule, listRooms } from "@/lib/api/rooms";
import type { AvailabilityDto, RoomDto } from "@/lib/api/types";

const inputClass = "mt-2 block min-h-11 w-full rounded-lg border border-line bg-surface p-3 text-midnight";
const date = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));

export function RoomSchedule() {
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [roomId, setRoomId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<AvailabilityDto | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    listRooms().then((items) => { if (active) setRooms(items); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Ruangan belum dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function load(check: boolean) {
    if (!roomId || busy) return;
    if ((start || end || check) && (!start || !end || start >= end)) {
      setError("Isi waktu mulai dan selesai yang valid (WIB)."); return;
    }
    setBusy(true); setError(""); setResult(null);
    try {
      const from = start ? new Date(`${start}:00+07:00`).toISOString() : undefined;
      const to = end ? new Date(`${end}:00+07:00`).toISOString() : undefined;
      setResult(check && from && to ? await checkAvailability(roomId, from, to) : await getRoomSchedule(roomId, from, to));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Jadwal belum dapat dimuat."); }
    finally { setBusy(false); }
  }
  return <div className="min-h-screen bg-canvas"><StudentSidebar currentPath="/ruangan" />
    <main className="mx-auto max-w-6xl space-y-5 px-5 pb-8 pt-20 md:ml-[260px] md:pt-8">
      <h1 className="text-title font-semibold text-midnight">Jadwal & fasilitas</h1>
      <p className="text-body text-midnight">Data ruangan dan benturan jadwal berasal dari backend. Reservasi surat mengikuti proses persetujuan, bukan hasil cek ketersediaan saja.</p>
      <fieldset disabled={busy || loading} className="space-y-4 rounded-xl border border-line bg-surface p-5">
        <label className="block text-midnight">Ruangan / fasilitas<select className={inputClass} value={roomId} onChange={(event) => { setRoomId(event.target.value); setResult(null); }}><option value="">{loading ? "Memuat fasilitas…" : "Pilih fasilitas"}</option>{rooms.map((room) => <option key={room.id} value={room.id}>{room.facilityName} — {room.code}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-midnight">Mulai (WIB)<input className={inputClass} type="datetime-local" value={start} onChange={(event) => { setStart(event.target.value); setResult(null); }} /></label>
          <label className="block text-midnight">Selesai (WIB)<input className={inputClass} type="datetime-local" value={end} onChange={(event) => { setEnd(event.target.value); setResult(null); }} /></label>
        </div>
        <div className="flex flex-wrap gap-3"><button disabled={!roomId} onClick={() => void load(false)} className="min-h-11 rounded-lg bg-navy px-4 text-surface disabled:opacity-50">{busy ? "Memuat…" : "Lihat jadwal"}</button><button disabled={!roomId || !start || !end} onClick={() => void load(true)} className="min-h-11 rounded-lg border border-line px-4 text-midnight disabled:opacity-50">Cek ketersediaan</button></div>
      </fieldset>
      {error && <p role="alert" className="text-danger">{error}</p>}
      {result && <section className="space-y-4 rounded-xl border border-line bg-surface p-5 text-midnight">
        <p role="status">{result.isAvailable ? "Tidak ada benturan reservasi terkonfirmasi pada rentang ini." : "Ada benturan reservasi terkonfirmasi."}</p>
        {([['Terkonfirmasi', result.confirmedConflicts], ['Menunggu persetujuan', result.pendingConflicts]] as const).map(([label, items]) => <div key={label}><h2 className="font-semibold">{label}</h2>{items.length ? <ul className="mt-2 space-y-2">{items.map((item) => <li className="rounded-lg border border-line p-3" key={item.id}>{item.activityType}<br />{date(item.startsAt)} — {date(item.endsAt)}{item.letterRequestId && <Link className="ml-2 text-navy underline" href={`/surat/${item.letterRequestId}`}>Surat terkait</Link>}</li>)}</ul> : <p className="mt-2 text-body">Tidak ada jadwal pada rentang ini.</p>}</div>)}
      </section>}
      <Link href="/surat/baru" className="inline-flex min-h-11 items-center text-navy underline">Ajukan peminjaman melalui surat</Link>
    </main>
  </div>;
}
