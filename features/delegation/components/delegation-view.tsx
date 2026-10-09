"use client";

import React, { useState } from "react";
import { DelegationCandidate } from "../types";
import {
  Button,
  Card,
  CardHeader,
  CheckCircle2Icon,
  CheckIcon,
  ExternalDutyIcon,
} from "@/components/ui";

interface DelegationViewProps {
  candidates: DelegationCandidate[];
  scopes: string[];
}

export function DelegationView({ candidates, scopes }: DelegationViewProps) {
  const [isActive, setIsActive] = useState(true);
  const [selectedCandidateIdx, setSelectedCandidateIdx] = useState(0);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    "Surat Rekomendasi",
    "Peminjaman Fasilitas",
  ]);
  const [isSaved, setIsSaved] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const currentCandidate = candidates[selectedCandidateIdx] ?? candidates[0];

  return (
    <div className="animate-rise space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-display font-bold text-midnight">
          Delegasi & Dinas Luar
        </h1>
        <p className="mt-1 text-body text-slate-500">
          Alihkan wewenang tanda tangan sementara agar pelayanan tetap berjalan saat Anda bertugas di luar kampus.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Configuration Card */}
        <Card className="lg:col-span-8 p-6 space-y-6">
          {/* Mode Dinas Luar Toggle Header */}
          <div className="flex items-center justify-between rounded-xl bg-delegate-bg p-4 border border-violet-100">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-delegate text-white shadow-card">
                <ExternalDutyIcon className="size-5" />
              </span>
              <div>
                <div className="text-body font-semibold text-midnight">
                  Mode Dinas Luar
                </div>
                <div className="text-micro text-violet-700">
                  Dokumen baru otomatis dialihkan ke penerima kuasa
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                isActive ? "bg-delegate" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Active Status Badge summary if active */}
          {isActive && (
            <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
              <div className="flex items-center gap-2 text-micro font-semibold text-emerald-700">
                <span className="size-2 rounded-full bg-ok" />
                <span>Delegasi Saat Ini Sedang Aktif</span>
              </div>
              <div className="text-body text-slate-700">
                Wewenang dialihkan kepada{" "}
                <b className="text-midnight">{currentCandidate.name}</b> (
                {currentCandidate.role}) untuk periode{" "}
                <b>19 Juni – 24 Juni 2025</b>.
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedScopes.map((sc) => (
                  <span
                    key={sc}
                    className="rounded-full bg-white px-2.5 py-0.5 text-micro font-medium text-slate-600 border border-line"
                  >
                    {sc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Penerima Kuasa Form */}
          <div className="space-y-3">
            <label className="text-body font-semibold text-midnight block">
              1. Pilih Penerima Kuasa (Pejabat Pengganti)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {candidates.map((cand, idx) => {
                const isSelected = selectedCandidateIdx === idx;
                return (
                  <button
                    key={cand.name}
                    type="button"
                    onClick={() => setSelectedCandidateIdx(idx)}
                    className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-delegate bg-delegate-bg/40 ring-1 ring-delegate"
                        : "border-line bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="text-body font-semibold text-midnight truncate">
                      {cand.name}
                    </div>
                    <div className="mt-1 text-micro text-slate-500">
                      {cand.role}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scope of Authority */}
          <div className="space-y-3">
            <label className="text-body font-semibold text-midnight block">
              2. Batasan Dokumen yang Didelegasikan
            </label>
            <div className="flex flex-wrap gap-2">
              {scopes.map((scope) => {
                const isChecked = selectedScopes.includes(scope);
                return (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => toggleScope(scope)}
                    className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-body font-medium transition-colors cursor-pointer ${
                      isChecked
                        ? "border-delegate bg-delegate-bg text-violet-800"
                        : "border-line bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex size-4 items-center justify-center rounded border ${
                        isChecked
                          ? "border-delegate bg-delegate text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <CheckIcon className="size-3" />}
                    </span>
                    <span>{scope}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex items-center gap-3">
            <Button onClick={handleSave}>
              <span>Simpan Pengaturan Delegasi</span>
            </Button>
            {isSaved && (
              <span className="flex items-center gap-1.5 text-micro font-medium text-emerald-600">
                <CheckCircle2Icon className="size-4" />
                <span>Pengaturan berhasil diperbarui</span>
              </span>
            )}
          </div>
        </Card>

        {/* Side Rules & Policy Box */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <CardHeader title="Ketentuan Delegasi PENS" />
            <ul className="mt-4 space-y-3 text-body text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="size-1.5 mt-2 rounded-full bg-navy shrink-0" />
                <span>
                  Penerima delegasi bertindak atas nama jabatan Kepala Departemen untuk dokumen terpilih.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-1.5 mt-2 rounded-full bg-navy shrink-0" />
                <span>
                  Sistem SignIt! membubuhkan QR tanda tangan elektronik berlabel <b>[Plt./Kuasa]</b> secara otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-1.5 mt-2 rounded-full bg-navy shrink-0" />
                <span>
                  Rekap surat yang disetujui selama dinas luar otomatis diteruskan ke email resmi Anda.
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default DelegationView;
