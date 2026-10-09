"use client";

import React, { useEffect, useState } from "react";
import { Button, XIcon } from "@/components/ui";
import { ApiError } from "@/lib/api/errors";
import { getDelegateCandidates } from "@/lib/api/workflow";
import type { DelegateCandidateDto } from "@/lib/api/types";

interface DelegateModalProps {
  taskId: string;
  onClose: () => void;
  onConfirm: (delegateUserId: string, reason: string) => void;
  submitting?: boolean;
}

export function DelegateModal({
  taskId,
  onClose,
  onConfirm,
  submitting = false,
}: DelegateModalProps) {
  const [candidates, setCandidates] = useState<DelegateCandidateDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    let active = true;
    getDelegateCandidates(taskId)
      .then((result) => {
        if (!active) return;
        setCandidates(result);
        setSelectedUserId(result[0]?.userId ?? "");
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "Kandidat delegasi tidak dapat dimuat.",
        );
      });
    return () => {
      active = false;
    };
  }, [taskId]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/40 p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Delegasikan tugas"
        className="animate-rise w-full max-w-[520px] rounded-xl bg-white shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <h3 className="text-title font-semibold">Delegasikan Tugas</h3>
            <p className="mt-1 text-body text-slate-500">
              Mandat hanya berlaku untuk tugas ini dan dicatat sebagai bukti
              audit.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          {error && (
            <p className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision">
              {error}
            </p>
          )}

          {!error && candidates === null && (
            <p className="text-body text-slate-500">Memuat kandidat…</p>
          )}

          {candidates !== null && candidates.length === 0 && (
            <p className="text-body text-slate-500">
              Tidak ada kandidat dengan posisi setara yang dapat menerima mandat.
            </p>
          )}

          {candidates !== null && candidates.length > 0 && (
            <div className="space-y-1.5">
              <label htmlFor="delegate" className="text-body font-medium text-midnight">
                Penerima mandat
              </label>
              <select
                id="delegate"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
              >
                {candidates.map((candidate) => (
                  <option key={candidate.userId} value={candidate.userId}>
                    {candidate.name} — {candidate.positionName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="delegate-reason" className="text-body font-medium text-midnight">
              Alasan delegasi
            </label>
            <textarea
              id="delegate-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Contoh: dinas luar hingga Jumat"
              className="w-full resize-none rounded-lg border border-line p-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-canvas px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            variant="primary"
            disabled={!selectedUserId || !reason.trim() || submitting}
            onClick={() => onConfirm(selectedUserId, reason.trim())}
          >
            {submitting ? "Mendelegasikan…" : "Delegasikan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
