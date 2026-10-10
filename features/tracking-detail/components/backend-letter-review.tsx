"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { downloadLetterDocument, getLetter } from "@/lib/api/letters";

export function BackendLetterReview({ letterId, documentId }: { letterId: string; documentId: string }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("Tinjau Surat");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    let objectUrl = "";
    Promise.all([getLetter(letterId), downloadLetterDocument(letterId, documentId)])
      .then(([letter, blob]) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setTitle(letter.title);
        setUrl(objectUrl);
      }).catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Pratinjau tidak dapat dimuat.");
      });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [letterId, documentId]);
  return <main className="mx-auto max-w-6xl space-y-4 p-5 sm:p-8">
    <Link href="/surat" className="text-navy underline">Surat Saya</Link>
    <h1 className="text-title font-semibold text-midnight">{title}</h1>
    <p className="text-body text-midnight">PDF ini dihasilkan renderer backend sesuai versi template surat. Pengajuan dilakukan terpisah dari formulir surat.</p>
    <Link href={`/surat/baru?draftId=${letterId}`} className="inline-flex min-h-11 items-center rounded-lg bg-navy px-4 text-surface">Edit / Ajukan Surat</Link>
    {error ? <p role="alert" className="text-danger">{error}</p> : url ? <>
      <a href={url} download="pratinjau-surat.pdf" className="ml-3 text-navy underline">Unduh PDF</a>
      <iframe title="Pratinjau template surat" src={url} className="h-[75vh] w-full rounded-lg border border-line bg-surface" />
    </> : <p role="status">Memuat PDF template surat…</p>}
  </main>;
}
