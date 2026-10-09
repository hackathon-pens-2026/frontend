import React from "react";
import {
  MapPinIcon,
  ClockIcon,
  SendIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  EyeIcon,
  UploadIcon,
  CheckIcon,
} from "./icons";

interface AttentionSectionProps {
  onOpenTracking: (letterNo: string) => void;
  onSendNudge: (letterNo: string) => void;
  onViewNotes: (letterNo: string) => void;
  onUploadRevision: (letterNo: string) => void;
  isNudgeSent?: boolean;
}

export function AttentionSection({
  onOpenTracking,
  onSendNudge,
  onViewNotes,
  onUploadRevision,
  isNudgeSent = false,
}: AttentionSectionProps) {
  return (
    <section aria-labelledby="attention-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="attention-heading" className="text-lg font-semibold text-slate-900">
          Pengajuan Aktif yang Butuh Perhatian
        </h2>
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
          2 pengajuan prioritas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Card 1: Pengajuan Sedang Berjalan (col-span-7) */}
        <article className="col-span-1 lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-slate-400">SGN/25/0612</span>
                <span className="text-slate-300">·</span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <MapPinIcon size={13} className="text-slate-400" />
                  Peminjaman Fasilitas
                </span>
              </div>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
                Peminjaman Gedung D4 &amp; Sound System (Dies Natalis PENS)
              </h3>
            </div>

            {/* Status Pill: Ditinjau */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
              <span className="size-1.5 rounded-full bg-blue-600" />
              Ditinjau
            </span>
          </div>

          {/* Progress Tracker */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">
                Tahap 5 dari 8 <span className="text-slate-500">(BEM PENS)</span>
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">62%</span>
            </div>
            <div className="mt-2 flex gap-1" role="progressbar" aria-valuenow={62} aria-valuemin={0} aria-valuemax={100}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => {
                const isCompleted = step <= 4;
                const isCurrent = step === 5;
                return (
                  <span
                    key={step}
                    className={`h-2 flex-1 rounded-full transition-colors ${
                      isCompleted
                        ? "bg-[#1e3a8a]"
                        : isCurrent
                        ? "bg-amber-500 animate-pulse"
                        : "bg-slate-100"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Footer: SLA & Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
              <ClockIcon size={13} />
              <span>
                Sisa SLA: <strong className="font-semibold text-amber-900">14 Jam</strong> sebelum auto-reminder
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSendNudge("SGN/25/0612")}
                disabled={isNudgeSent}
                className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition cursor-pointer ${
                  isNudgeSent
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {isNudgeSent ? (
                  <>
                    <CheckIcon size={13} />
                    <span>Nudge Terkirim</span>
                  </>
                ) : (
                  <>
                    <SendIcon size={13} />
                    <span>Kirim Nudge</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onOpenTracking("SGN/25/0612")}
                className="inline-flex h-8 items-center gap-1 rounded-lg bg-[#1e3a8a] px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#172554] transition cursor-pointer"
              >
                <span>Detail Alur</span>
                <ArrowRightIcon size={13} />
              </button>
            </div>
          </div>
        </article>

        {/* Card 2: Pengajuan Perlu Revisi (col-span-5) */}
        <article className="col-span-1 lg:col-span-5 rounded-xl border border-red-200 bg-white p-5 shadow-xs hover:border-red-300 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-mono text-slate-400">SGN/25/0598</span>
                <span className="text-slate-300">·</span>
                <span className="font-medium text-slate-600">Dispensasi Lomba</span>
              </div>
              <h3 className="mt-1.5 text-sm font-semibold text-slate-900 leading-snug">
                Hackathon Nasional &amp; Forum Teknologi 2026
              </h3>
            </div>

            {/* Status Pill: Perlu Revisi */}
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 whitespace-nowrap">
              <AlertCircleIcon size={13} />
              Perlu Revisi
            </span>
          </div>

          {/* Reviewer Note Callout */}
          <div className="mt-3.5 rounded-lg border border-red-100 bg-red-50/60 p-3 text-xs">
            <div className="font-medium text-red-950">
              Catatan Pembina (Dr. Ferry Astika):
            </div>
            <p className="mt-1 text-red-900/90 leading-relaxed italic">
              “Lampirkan surat undangan resmi panitia &amp; daftar anggota tim.”
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => onViewNotes("SGN/25/0598")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
            >
              <EyeIcon size={13} />
              <span>Lihat Catatan</span>
            </button>

            <button
              type="button"
              onClick={() => onUploadRevision("SGN/25/0598")}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white shadow-xs hover:bg-red-800 transition cursor-pointer"
            >
              <UploadIcon size={13} />
              <span>Unggah Revisi</span>
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
