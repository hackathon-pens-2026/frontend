"use client";

import { useEffect, useState } from "react";
import { apiDownload } from "@/lib/api/client";
import { Card } from "@/components/ui";

export function SignedLetterPreview({ letterId, refresh }: { letterId: string; refresh: number }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = "";
    apiDownload(`/letters/${letterId}/signed-document`, controller.signal).then((blob) => {
      if (controller.signal.aborted) return;
      objectUrl = URL.createObjectURL(blob);
      setError("");
      setUrl(objectUrl);
    }).catch((failure: unknown) => {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "PDF gagal dimuat.");
    });
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [letterId, refresh]);
  return <Card className="space-y-4 p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-title font-semibold">Surat & tanda tangan QR</h2>
      {url && <a href={url} target="_blank" rel="noreferrer" className="text-primary underline">Buka PDF surat</a>}
    </div>
    <p className="text-body">QR tampil pada slot peserta yang sudah menandatangani atau menyetujui surat. Slot lainnya tetap menunggu. PDF final tersedia setelah seluruh proses selesai.</p>
    {error ? <p role="alert" className="text-danger">{error}</p> : url
      ? <iframe title="Surat dengan QR persetujuan" src={url} className="h-[32rem] w-full rounded-lg border border-line bg-canvas" />
      : <p role="status">Memuat surat dan QR persetujuan…</p>}
  </Card>;
}
