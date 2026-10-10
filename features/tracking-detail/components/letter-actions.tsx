"use client";

import Link from "next/link";
import { useState } from "react";
import { cancelLetter } from "@/lib/api/letters";
import { retryFinalization } from "@/lib/api/finalization";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import type { LetterWorkflowDto } from "@/lib/api/types";

export function LetterActions({ workflow, owner, onChanged }: { workflow: LetterWorkflowDto; owner: boolean; onChanged: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editable = owner && ["Draft", "NeedsRevision"].includes(workflow.status);
  const cancellable = owner && ["Draft", "NeedsRevision", "InProgress"].includes(workflow.status);
  async function act(retry: boolean) {
    if (busy) return;
    setBusy(true); setError("");
    const expected = { expectedVersion: workflow.version, expectedRevisionId: workflow.revisionId, expectedContentHash: workflow.contentHash };
    try {
      if (retry) await retryFinalization(workflow.letterId, expected, createIdempotencyKey());
      else await cancelLetter(workflow.letterId, { ...expected, reason }, createIdempotencyKey());
      onChanged();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Tindakan belum berhasil."); }
    finally { setBusy(false); }
  }
  if (!owner) return null;
  return <section className="space-y-3 rounded-xl border border-line bg-surface p-5 text-midnight">
    {editable && <Link className="inline-flex min-h-11 items-center text-navy underline" href={`/surat/baru?draftId=${workflow.letterId}`}>{workflow.status === "NeedsRevision" ? "Perbaiki dan Ajukan Revisi" : "Edit / Tinjau Draft"}</Link>}
    {workflow.status === "ProcessingFailed" && <button disabled={busy} onClick={() => void act(true)} className="min-h-11 rounded-lg bg-navy px-4 text-surface disabled:opacity-50">Coba Finalisasi PDF Kembali</button>}
    {workflow.status === "Completed" && <a className="inline-flex min-h-11 items-center text-navy underline" href={`/api/v1/letters/${workflow.letterId}/finalization/document`} target="_blank" rel="noreferrer">Unduh PDF Final</a>}
    {cancellable && <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => { event.preventDefault(); void act(false); }}>
      <label className="min-w-0 flex-1">Alasan pembatalan<input required maxLength={1000} disabled={busy} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-line bg-surface p-3" /></label>
      <button disabled={busy || !reason.trim()} className="min-h-11 rounded-lg border border-line px-4 text-danger disabled:opacity-50">Batalkan Surat</button>
    </form>}
    {error && <p role="alert" className="text-danger">{error}</p>}
  </section>;
}
