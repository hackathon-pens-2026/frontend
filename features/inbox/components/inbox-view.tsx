"use client";

import React, { useMemo, useState } from "react";
import { ApprovalStatus, InboxLetter } from "../types";
import { DocumentSheet } from "./document-sheet";
import { DecisionModal } from "./decision-modal";
import {
  Avatar,
  Button,
  Card,
  CheckIcon,
  FileTextIcon,
  InboxIcon,
  PenToolIcon,
  SlaBadge,
  StatusBadge,
  Timeline,
} from "@/components/ui";

interface InboxViewProps {
  letters: InboxLetter[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpdateLetterStatus: (
    id: string,
    status: ApprovalStatus,
    note?: string
  ) => void;
}

const filterTabs = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu Aksi" },
  { id: "review", label: "Ditinjau" },
  { id: "delegated", label: "Didelegasikan" },
];

export function InboxView({
  letters,
  selectedId,
  onSelect,
  onUpdateLetterStatus,
}: InboxViewProps) {
  const [filter, setFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"revisi" | "tolak" | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLetters = useMemo(() => {
    return letters.filter((item) => filter === "all" || item.status === filter);
  }, [letters, filter]);

  const selectedLetter =
    letters.find((l) => l.id === selectedId) ?? filteredLetters[0] ?? letters[0];

  const getFilterCount = (catId: string) => {
    return letters.filter((l) => catId === "all" || l.status === catId).length;
  };

  const handleSign = () => {
    if (!selectedLetter) return;
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      onUpdateLetterStatus(selectedLetter.id, "approved");
      showToast("Disetujui · QR tanda tangan dibubuhkan otomatis oleh server");
    }, 700);
  };

  const handleActionConfirm = (noteText: string) => {
    if (!selectedLetter || !modalMode) return;
    const finalStatus: ApprovalStatus = "rejected";
    const prefix = modalMode === "tolak" ? `[DITOLAK] ${noteText}` : noteText;
    onUpdateLetterStatus(selectedLetter.id, finalStatus, prefix);
    setModalMode(null);
    showToast(
      modalMode === "tolak"
        ? "Surat ditolak · alasan dikirim ke pemohon via email"
        : "Permintaan revisi dikirim ke pemohon via email"
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const canAct =
    selectedLetter?.status === "pending" || selectedLetter?.status === "review";

  return (
    <div className="animate-rise space-y-6">
      {/* Title */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-display font-bold text-midnight">
            Kotak Persetujuan
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Tinjau, tanda tangani, atau kembalikan dokumen yang membutuhkan otorisasi Anda.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-lg border border-line bg-white p-1 shadow-card w-fit">
        {filterTabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex h-11 items-center gap-2 rounded-md px-4 text-body font-medium cursor-pointer transition-colors ${
                isActive
                  ? "bg-midnight text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-micro tabular-nums ${
                  isActive ? "text-gold" : "text-slate-400"
                }`}
              >
                {getFilterCount(tab.id)}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3-Column Layout: List, Document Viewer, Details & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Letter List */}
        <Card className="lg:col-span-4 flex max-h-[calc(100vh-260px)] flex-col overflow-hidden">
          <div className="scroll-thin flex-1 overflow-y-auto p-2">
            {filteredLetters.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <InboxIcon className="size-8 text-slate-300" />
                <p className="mt-2 text-body text-slate-500">
                  Tidak ada dokumen di kategori ini
                </p>
              </div>
            ) : (
              filteredLetters.map((item) => {
                const isSelected = item.id === selectedLetter?.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`relative mb-1 w-full rounded-lg p-3 text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-review-bg ring-1 ring-navy/15"
                        : "hover:bg-canvas"
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-navy" />
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-micro font-medium text-slate-400 tabular-nums">
                        {item.id}
                      </span>
                      <span className="text-micro text-slate-400">
                        {item.submitted}
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-body font-semibold text-midnight">
                      {item.title}
                    </div>
                    <div className="mt-1 text-micro text-slate-500">
                      {item.applicant} · {item.unit}
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <StatusBadge status={item.status} />
                      <SlaBadge hours={item.slaHours} total={item.slaTotal} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Middle Column: Paper/PDF Simulation Viewer */}
        {selectedLetter && (
          <Card className="lg:col-span-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-white">
              <div className="flex items-center gap-2 text-micro font-medium text-slate-500">
                <FileTextIcon className="size-3.5" />
                <span>
                  {selectedLetter.id}.pdf · {selectedLetter.pages} halaman
                </span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {selectedLetter.status === "approved"
                  ? "Final"
                  : "Draf · tidak dapat diunduh"}
              </span>
            </div>
            <div className="flex-1 bg-slate-100 p-6 overflow-y-auto max-h-[calc(100vh-320px)] flex items-center justify-center">
              <DocumentSheet doc={selectedLetter} />
            </div>
          </Card>
        )}

        {/* Right Column: Applicant details, Workflow Timeline & Decision Panel */}
        {selectedLetter && (
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5">
              {/* Applicant Header */}
              <div className="flex items-center gap-3">
                <Avatar name={selectedLetter.applicant} size={40} />
                <div className="min-w-0">
                  <div className="truncate text-body font-semibold">
                    {selectedLetter.applicant}
                  </div>
                  <div className="text-micro text-slate-500 tabular-nums">
                    NRP {selectedLetter.nrp}
                  </div>
                </div>
              </div>

              {/* Meta items */}
              <dl className="mt-4 space-y-2.5 text-body">
                {[
                  ["Jenis", selectedLetter.type],
                  ["Unit", selectedLetter.unit],
                  ["Diajukan", selectedLetter.submitted],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="text-right font-medium text-midnight truncate">
                      {val}
                    </dd>
                  </div>
                ))}
              </dl>

              {/* Approval Timeline */}
              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  Alur Persetujuan
                </div>
                <Timeline steps={selectedLetter.steps} />
              </div>

              {/* Decision Action Buttons */}
              <div className="mt-6 border-t border-line pt-4">
                {canAct ? (
                  <div className="space-y-2">
                    <Button
                      variant="approve"
                      className="w-full"
                      disabled={isSigning}
                      onClick={handleSign}
                    >
                      <PenToolIcon className="size-4" />
                      <span>
                        {isSigning ? "Membubuhkan QR…" : "Tanda Tangani Dokumen"}
                      </span>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setModalMode("revisi")}
                      >
                        Minta Revisi
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setModalMode("tolak")}
                      >
                        Tolak Surat
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-micro text-slate-500">
                    {selectedLetter.status === "approved"
                      ? "Dokumen ini telah selesai ditandatangani."
                      : selectedLetter.status === "delegated"
                      ? "Wewenang tanda tangan dialihkan ke delegasi."
                      : "Tidak ada tindakan yang diperlukan."}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Decision Modal (Revisi / Tolak) */}
      {modalMode && (
        <DecisionModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onConfirm={handleActionConfirm}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-rise fixed right-8 bottom-8 z-50 flex items-center gap-3 rounded-xl bg-midnight px-4 py-3 text-body font-medium text-white shadow-modal">
          <span className="flex size-6 items-center justify-center rounded-full bg-ok text-white">
            <CheckIcon className="size-3.5" strokeWidth={3} />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
export default InboxView;
