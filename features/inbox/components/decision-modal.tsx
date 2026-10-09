"use client";

import React, { useState, useEffect } from "react";
import { Button, XIcon } from "@/components/ui";

interface DecisionModalProps {
  mode: "revisi" | "tolak";
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function DecisionModal({
  mode,
  onClose,
  onConfirm,
}: DecisionModalProps) {
  const [note, setNote] = useState("");
  const isRevision = mode === "revisi";

  const quickChips = isRevision
    ? [
        "Lampiran tidak lengkap",
        "Format surat tidak sesuai",
        "Anggaran perlu dirinci",
        "Jadwal perlu disesuaikan",
      ]
    : [
        "Tidak sesuai ketentuan akademik",
        "Kegiatan tidak mendapat izin unit",
        "Duplikasi pengajuan",
      ];

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
        aria-label={isRevision ? "Minta revisi" : "Tolak surat"}
        className="animate-rise w-full max-w-[520px] rounded-xl bg-white shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <h3 className="text-title font-semibold">
              {isRevision ? "Minta Revisi" : "Tolak Surat"}
            </h3>
            <p className="mt-1 text-body text-slate-500">
              {isRevision
                ? "Catatan wajib diisi. Pemohon dapat memperbaiki dan mengajukan ulang."
                : "Alasan wajib diisi. Surat yang ditolak tidak dapat diajukan ulang."}
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
          {/* Quick chips */}
          <div className="flex flex-wrap gap-2">
            {quickChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setNote(chip)}
                className={`inline-flex h-11 items-center rounded-full border px-4 text-micro font-medium cursor-pointer transition-colors ${
                  note === chip
                    ? "border-reject bg-reject-bg text-red-600"
                    : "border-line text-slate-600 hover:bg-slate-50"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            required
            aria-required="true"
            placeholder={
              isRevision
                ? "Jelaskan bagian yang perlu diperbaiki…"
                : "Jelaskan alasan penolakan…"
            }
            className="w-full resize-none rounded-lg border border-line p-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
          />
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-canvas px-6 py-4">
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={isRevision ? "primary" : "danger"}
            disabled={!note.trim()}
            onClick={() => onConfirm(note.trim())}
          >
            {isRevision ? "Kirim Permintaan Revisi" : "Tolak Surat"}
          </Button>
        </div>
      </div>
    </div>
  );
}
