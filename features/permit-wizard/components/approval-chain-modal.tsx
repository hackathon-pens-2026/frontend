import React from "react";
import { ApprovalChainNode } from "../types";
import { CheckIcon, XIcon, ArrowRightIcon } from "./icons";

interface ApprovalChainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitLetter: () => void;
  isSubmitting?: boolean;
}

const defaultApprovalChain: ApprovalChainNode[] = [
  { step: 1, role: "Ketua Panitia Pelaksana (Ketupel)", name: "Ahmad Fauzi", department: "Panitia Pelaksana", status: "completed" },
  { step: 2, role: "Ketua Organisasi (Ketua HIMA)", name: "M. Fajrul", department: "HIMA Informatika", status: "completed" },
  { step: 3, role: "Pembina Organisasi", name: "Dr. Ferry Astika Saputra, S.T., M.Sc.", department: "Dosen Pembina HIMA", status: "current" },
  { step: 4, role: "Minat Bakat / Kemahasiswaan", name: "Dr. Hendra, S.ST., M.T.", department: "Unit Kemahasiswaan", status: "waiting" },
  { step: 5, role: "Dagri BEM PENS", name: "Kementerian Dalam Kampus", department: "BEM PENS", status: "waiting" },
  { step: 6, role: "BAAK (Kesekretariatan & Ruang)", name: "Pengelola Sarpras & Ruangan", department: "Bagian Akademik & Kemahasiswaan", status: "waiting" },
  { step: 7, role: "Wakil Direktur III", name: "Dr. Ir. Bima Sena, M.T.", department: "Pimpinan Kampus", status: "waiting" },
];

export function ApprovalChainModal({
  isOpen,
  onClose,
  onSubmitLetter,
  isSubmitting = false,
}: ApprovalChainModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approval-chain-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="animate-rise w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              Langkah 3 dari 3 · Verifikasi Alur
            </div>
            <h3 id="approval-chain-title" className="mt-2 text-base font-bold text-slate-900">
              Konfirmasi Rantai Approval &amp; Penandatangan
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Berdasarkan kebijakan PENS, peminjaman Auditorium Pascasarjana memerlukan 7 tahap persetujuan resmi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            aria-label="Tutup Dialog"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Chain List */}
        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-3 pr-1 scroll-thin">
          <ol className="space-y-3">
            {defaultApprovalChain.map((node) => {
              const isCompleted = node.status === "completed";
              const isCurrent = node.status === "current";

              return (
                <li
                  key={node.step}
                  className={`flex items-center gap-3.5 rounded-lg border p-3 transition-colors ${
                    isCurrent
                      ? "border-amber-200 bg-amber-50/50"
                      : isCompleted
                      ? "border-emerald-200 bg-emerald-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {/* Step circle */}
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-amber-500 text-white animate-pulse"
                        : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                    }`}
                  >
                    {isCompleted ? <CheckIcon size={12} /> : node.step}
                  </span>

                  {/* Detail */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {node.role}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {node.department}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{node.name}</div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Kembali ke Form
          </button>

          <button
            type="button"
            onClick={onSubmitLetter}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#172554] transition cursor-pointer"
          >
            <span>{isSubmitting ? "Mengirim Pengajuan..." : "Ajukan Surat Izin Sekarang"}</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
