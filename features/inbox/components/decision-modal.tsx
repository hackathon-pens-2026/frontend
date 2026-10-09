"use client";

import React, { useEffect, useState } from "react";
import { Button, XIcon } from "@/components/ui";

interface DecisionModalProps {
  mode: "revisi" | "tolak" | "tunda";
  onClose: () => void;
  onConfirm: (reason: string, until?: string) => void;
  submitting?: boolean;
}

const MODE_COPY = {
  revisi: {
    title: "Minta Revisi",
    description:
      "Catatan wajib diisi. Pemohon dapat memperbaiki dan mengajukan ulang.",
    confirm: "Kirim Permintaan Revisi",
    confirmVariant: "primary" as const,
    placeholder: "Jelaskan bagian yang perlu diperbaiki…",
    chips: [
      "Lampiran tidak lengkap",
      "Format surat tidak sesuai",
      "Anggaran perlu dirinci",
      "Jadwal perlu disesuaikan",
    ],
  },
  tolak: {
    title: "Tolak Surat",
    description:
      "Alasan wajib diisi. Surat yang ditolak tidak dapat diajukan ulang.",
    confirm: "Tolak Surat",
    confirmVariant: "danger" as const,
    placeholder: "Jelaskan alasan penolakan…",
    chips: [
      "Tidak sesuai ketentuan akademik",
      "Kegiatan tidak mendapat izin unit",
      "Duplikasi pengajuan",
    ],
  },
  tunda: {
    title: "Tunda Tugas",
    description:
      "Tentukan batas waktu baru dan alasan penundaan. Tugas kembali aktif sebelum batas waktu tersebut.",
    confirm: "Tunda Tugas",
    confirmVariant: "secondary" as const,
    placeholder: "Jelaskan alasan penundaan…",
    chips: ["Menunggu dokumen pendukung", "Perlu koordinasi pimpinan"],
  },
};

function defaultUntil(): string {
  const date = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function DecisionModal({
  mode,
  onClose,
  onConfirm,
  submitting = false,
}: DecisionModalProps) {
  const [note, setNote] = useState("");
  const [until, setUntil] = useState(defaultUntil());
  const copy = MODE_COPY[mode];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const disabled = !note.trim() || (mode === "tunda" && !until) || submitting;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/40 p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={copy.title}
        className="animate-rise w-full max-w-[520px] rounded-xl bg-white shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-line p-6">
          <div>
            <h3 className="text-title font-semibold">{copy.title}</h3>
            <p className="mt-1 text-body text-slate-500">{copy.description}</p>
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
          <div className="flex flex-wrap gap-2">
            {copy.chips.map((chip) => (
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

          {mode === "tunda" && (
            <div className="space-y-1.5">
              <label htmlFor="until" className="text-body font-medium text-midnight">
                Aktif kembali pada
              </label>
              <input
                id="until"
                type="datetime-local"
                value={until}
                min={defaultUntil().slice(0, 16)}
                onChange={(e) => setUntil(e.target.value)}
                className="h-11 w-full rounded-lg border border-line px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
              />
            </div>
          )}

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            required
            aria-required="true"
            placeholder={copy.placeholder}
            className="w-full resize-none rounded-lg border border-line p-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
          />
        </div>

        <div className="flex justify-end gap-2 rounded-b-xl border-t border-line bg-canvas px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Batal
          </Button>
          <Button
            variant={copy.confirmVariant}
            disabled={disabled}
            onClick={() =>
              onConfirm(note.trim(), mode === "tunda" ? until : undefined)
            }
          >
            {submitting ? "Memproses…" : copy.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}
