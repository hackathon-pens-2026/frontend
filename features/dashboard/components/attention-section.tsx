import React from "react";
import { DashboardLetter } from "../types";
import { AlertCircleIcon, ChevronRightIcon, ClockIcon } from "./icons";

interface AttentionSectionProps {
  letters: DashboardLetter[];
  onOpenLetter: (letter: DashboardLetter) => void;
}

export function AttentionSection({ letters, onOpenLetter }: AttentionSectionProps) {
  const needsRevision = letters.filter((letter) => letter.status === "rejected");
  const overdue = letters.filter(
    (letter) => letter.isOverdue && letter.status !== "approved",
  );
  const attention = [...needsRevision, ...overdue].slice(0, 2);

  if (attention.length === 0) {
    return null;
  }

  return (
    <section aria-label="Perlu perhatian" className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-900">
        Perlu Perhatian Anda
      </h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {attention.map((letter) => {
          const isRevision = letter.status === "rejected";
          return (
            <div
              key={letter.id}
              className={`rounded-xl border bg-white p-5 shadow-xs ${
                isRevision ? "border-red-200" : "border-amber-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                    isRevision
                      ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                      : "bg-amber-50 text-amber-600 ring-1 ring-amber-200"
                  }`}
                >
                  {isRevision ? <AlertCircleIcon size={18} /> : <ClockIcon size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {letter.no}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isRevision
                          ? "bg-red-50 text-red-700 ring-1 ring-red-200"
                          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                      }`}
                    >
                      {isRevision ? "Perlu Revisi" : "Lewat SLA"}
                    </span>
                  </div>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                    {letter.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {isRevision
                      ? "Perbaiki isi surat lalu ajukan ulang dari menu Surat Saya."
                      : `Tahap aktif: ${letter.stage}. Pantau melalui detail pelacakan.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenLetter(letter)}
                  className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:border-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white transition cursor-pointer"
                >
                  <span>Lihat</span>
                  <ChevronRightIcon size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
