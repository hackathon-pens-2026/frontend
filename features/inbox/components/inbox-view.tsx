"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ApprovalStep, InboxLetter } from "../types";
import { DecisionModal } from "./decision-modal";
import { DelegateModal } from "./delegate-modal";
import { SubmissionSearch } from "@/features/shell/components/submission-search";
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
import { ApiError } from "@/lib/api/errors";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import { mutateTask, signTask } from "@/lib/api/workflow";
import { taskActionLabel } from "@/lib/display/letter";
import type { SignTaskResultDto } from "@/lib/api/types";

interface InboxViewProps {
  letters: InboxLetter[];
  selectedId: string;
  onSelect: (id: string) => void;
  steps: ApprovalStep[];
  stepsLoading?: boolean;
  onRefresh: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

const filterTabs = [
  { id: "all", label: "Semua" },
  { id: "pending", label: "Menunggu Aksi" },
  { id: "approved", label: "Disetujui" },
  { id: "delegated", label: "Didelegasikan" },
];

export function InboxView({
  letters,
  selectedId,
  onSelect,
  steps,
  stepsLoading = false,
  onRefresh,
  loading = false,
  error = null,
  searchQuery,
  onSearchChange,
}: InboxViewProps) {
  const [filter, setFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"revisi" | "tolak" | "tunda" | null>(
    null,
  );
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLetters = useMemo(
    () =>
      letters.filter((item) => {
        if (filter === "all") return true;
        if (filter === "pending") return item.status === "pending";
        if (filter === "approved") return item.status === "approved";
        if (filter === "delegated") return item.status === "delegated";
        if (filter === "review") return item.status === "review" || item.status === "waiting";
        return item.status === filter;
      }),
    [letters, filter],
  );

  const selectedLetter =
    letters.find(
      (l) =>
        l.id === selectedId ||
        l.task.id === selectedId ||
        l.task.letterId === selectedId,
    ) ??
    filteredLetters[0] ??
    letters[0];

  const getFilterCount = (catId: string) =>
    letters.filter((l) => {
      if (catId === "all") return true;
      if (catId === "pending") return l.status === "pending";
      if (catId === "approved") return l.status === "approved";
      if (catId === "delegated") return l.status === "delegated";
      if (catId === "review") return l.status === "review" || l.status === "waiting";
      return l.status === catId;
    }).length;

  const showToast = (message: string) => {
    if (
      !message ||
      message.toLowerCase().includes("login kembali") ||
      message.toLowerCase().includes("masuk kembali")
    ) {
      return;
    }
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 3600);
  };

  const describeError = (cause: unknown) => {
    if (cause instanceof ApiError) {
      if (
        cause.status === 401 ||
        cause.message.toLowerCase().includes("login kembali") ||
        cause.message.toLowerCase().includes("masuk kembali")
      ) {
        return "";
      }
      return cause.message;
    }
    return "Tindakan gagal diproses. Coba kembali.";
  };

  const primaryAction = selectedLetter?.allowedActions.find((action) =>
    ["approve", "sign", "acknowledge"].includes(action),
  );

  const handlePrimary = async () => {
    if (!selectedLetter || !primaryAction || submitting) return;
    const task = selectedLetter.task;
    setSubmitting(true);
    try {
      const result: SignTaskResultDto = await signTask(
        task.id,
        primaryAction as "sign" | "approve" | "acknowledge",
        {
          expectedRevisionId: task.revisionId,
          expectedContentHash: task.contentHash,
          comment: null,
          expectedTaskVersion: task.version,
        },
        createIdempotencyKey(),
      );
      showToast(
        result.isWorkflowCompleted
          ? `Tugas selesai · kode verifikasi ${result.verificationCode ?? "sedang difinalisasi"}`
          : "Tugas berhasil diproses · tahap berikutnya diaktifkan",
      );
      await onRefresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        showToast("Akses akun backend kedaluwarsa. Pilih ulang akun; tindakan belum berhasil.");
      } else {
        const msg = describeError(cause);
        if (msg) showToast(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMutation = async (
    action: "request-revision" | "reject" | "defer" | "delegate" | "resume" | "revoke-delegation",
    reason: string,
    options: { until?: string; delegateUserId?: string } = {},
  ) => {
    if (!selectedLetter || submitting) return;
    const task = selectedLetter.task;
    setSubmitting(true);
    const messages = {
      "request-revision": "Permintaan revisi tercatat; email diproses backend",
      reject: "Penolakan tercatat; email diproses backend",
      defer: "Tugas ditunda sesuai batas waktu baru",
      delegate: "Mandat delegasi aktif untuk tugas ini",
      resume: "Tugas dilanjutkan",
      "revoke-delegation": "Mandat delegasi dicabut",
    };
    try {
      await mutateTask(
        task.id,
        action,
        {
          expectedRevisionId: task.revisionId,
          expectedContentHash: task.contentHash,
          expectedTaskVersion: task.version,
          reason,
          delegateUserId: options.delegateUserId ?? null,
          until: options.until ? new Date(options.until).toISOString() : null,
        },
        createIdempotencyKey(),
      );
      showToast(messages[action]);
      setModalMode(null);
      setDelegateOpen(false);
      await onRefresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        showToast("Akses akun backend kedaluwarsa. Pilih ulang akun; tindakan belum berhasil.");
      } else {
        const msg = describeError(cause);
        if (msg) showToast(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canApprove =
    selectedLetter?.allowedActions.includes("request-revision") ?? false;

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-display font-bold text-midnight">
            Kotak Persetujuan
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Tinjau, tanda tangani, atau kembalikan dokumen yang membutuhkan
            otorisasi Anda.
          </p>
        </div>
        {onSearchChange && (
          <div className="w-full sm:w-80 md:w-96 shrink-0">
            <SubmissionSearch value={searchQuery ?? ""} onChange={onSearchChange} />
          </div>
        )}
      </div>

      {error && !error.toLowerCase().includes("login kembali") && (
        <p className="rounded-lg border border-revision-border bg-revision-bg px-4 py-3 text-body text-revision">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-white p-1 shadow-card w-fit">
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

      {filteredLetters.length === 0 ? (
        <Card className="flex min-h-[460px] w-full flex-col items-center justify-center p-8 text-center shadow-card bg-white border border-line rounded-2xl">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-8 ring-slate-50">
            <InboxIcon className="size-8" />
          </div>
          <h3 className="text-h3 font-bold text-midnight">
            {filter === "all"
              ? "Tidak Ada Tugas Persetujuan"
              : `Tidak Ada Tugas di Kategori "${filterTabs.find((t) => t.id === filter)?.label ?? filter}"`}
          </h3>
          <p className="mt-2 max-w-md text-body leading-relaxed text-slate-500">
            {filter === "all"
              ? "Semua dokumen yang membutuhkan tindakan atau tanda tangan Anda telah selesai diproses. Kotak masuk Anda saat ini bersih."
              : "Tidak ada surat yang cocok dengan filter yang dipilih. Silakan pilih tab kategori lain atau tampilkan semua tugas."}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {filter !== "all" && (
              <Button variant="secondary" onClick={() => setFilter("all")}>
                Tampilkan Semua Kategori
              </Button>
            )}
            {searchQuery && onSearchChange && (
              <Button variant="secondary" onClick={() => onSearchChange("")}>
                Hapus Pencarian
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => void onRefresh()}
              disabled={loading}
            >
              Segarkan Antrean
            </Button>
            <Link
              href="/surat"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-navy px-5 text-body font-semibold text-white shadow-lift transition-colors hover:bg-navy/90"
            >
              Lihat Surat Saya
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 items-start gap-5 xl:gap-6 lg:grid-cols-12">
          {/* Column 1: Task list (col-span-12 lg:col-span-4) */}
          <Card className="flex h-[calc(100vh-230px)] min-h-[580px] flex-col overflow-hidden shadow-card lg:col-span-4">
            <div className="flex items-center justify-between border-b border-line bg-slate-50 px-4 py-3 shrink-0">
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Daftar Antrean ({filteredLetters.length})
              </span>
              <span className="text-micro text-slate-400">
                Pilih surat untuk meninjau
              </span>
            </div>
            <div className="scroll-thin flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex flex-col items-center py-16 text-center">
                  <p className="text-body text-slate-500">Memuat tugas…</p>
                </div>
              ) : (
                filteredLetters.map((item) => {
                  const isSelected = item.task.id === selectedLetter?.task.id;
                  return (
                    <button
                      key={item.task.id}
                      onClick={() => onSelect(item.task.id)}
                      className={`relative mb-1.5 w-full rounded-lg p-3 text-left transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-review-bg ring-1 ring-navy/15"
                          : "hover:bg-canvas"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-navy" />
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-micro font-medium text-slate-400 tabular-nums">
                          {item.number}
                        </span>
                        <span className="text-micro text-slate-400 shrink-0">
                          {item.submitted}
                        </span>
                      </div>
                      <div className="mt-1 line-clamp-2 text-body font-semibold text-midnight">
                        {item.title}
                      </div>
                      <div className="mt-1 text-micro text-slate-500">
                        {item.applicant}
                        {item.unit ? ` · ${item.unit}` : ""}
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

          {/* Column 2: Document Preview (col-span-12 lg:col-span-5) */}
          {selectedLetter && (
            <Card className="flex h-[calc(100vh-230px)] min-h-[580px] flex-col overflow-hidden shadow-card lg:col-span-5">
              <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 shrink-0">
                <div className="flex items-center gap-2 text-micro font-medium text-slate-500 min-w-0">
                  <FileTextIcon className="size-4 shrink-0 text-navy" />
                  <span className="truncate font-semibold text-midnight">
                    {selectedLetter.number}.pdf
                  </span>
                </div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                  {selectedLetter.task.documentUrl
                    ? "Dokumen Tinjauan"
                    : "Draft Pratinjau"}
                </span>
              </div>
              <div className="flex-1 bg-slate-100/70 p-3 overflow-hidden flex flex-col">
                {selectedLetter.task.documentUrl ? (
                  <iframe
                    title={`Dokumen ${selectedLetter.number}`}
                    src={`/api/v1/tasks/${selectedLetter.task.id}/document`}
                    className="h-full w-full rounded-lg border border-line bg-white shadow-sm"
                  />
                ) : (
                  <p role="status" className="rounded-lg border border-line bg-surface p-5 text-midnight">PDF tinjauan belum tersedia. Tidak ada dokumen pengganti yang dibuat frontend.</p>
                )}
              </div>
            </Card>
          )}

          {/* Column 3: Timeline & Actions (col-span-12 lg:col-span-3) */}
          {selectedLetter && (
            <Card className="flex h-[calc(100vh-230px)] min-h-[580px] flex-col overflow-hidden p-5 shadow-card lg:col-span-3">
              <div className="scroll-thin flex-1 space-y-5 overflow-y-auto pr-1">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedLetter.applicant || "Pemohon"} size={40} />
                  <div className="min-w-0">
                    <div className="truncate text-body font-semibold">
                      {selectedLetter.applicant || "Pemohon"}
                    </div>
                    <div className="truncate text-micro text-slate-500">
                      {selectedLetter.unit || selectedLetter.type}
                    </div>
                  </div>
                </div>

                <dl className="space-y-2.5 text-body">
                  {[
                    ["Jenis", selectedLetter.type],
                    ["Tahap Anda", selectedLetter.stage],
                    [
                      "Kategori",
                      taskActionLabel(selectedLetter.task.actionType),
                    ],
                    ["Diajukan", selectedLetter.submitted],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="text-slate-500">{label}</dt>
                      <dd className="truncate text-right font-medium text-midnight">
                        {val}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="border-t border-line pt-4">
                  <div className="mb-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                    Alur Persetujuan
                  </div>
                  {stepsLoading ? (
                    <p className="text-micro text-slate-500">Memuat alur…</p>
                  ) : steps.length > 0 ? (
                    <Timeline steps={steps} />
                  ) : (
                    <p className="text-micro text-slate-500">
                      Alur revisi tidak tersedia.
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons pinned at bottom */}
              <div className="shrink-0 border-t border-line pt-4">
                {selectedLetter.allowedActions.length > 0 ? (
                  <div className="space-y-2">
                    {primaryAction && (
                      <Button
                        variant="approve"
                        className="w-full"
                        disabled={submitting}
                        onClick={handlePrimary}
                      >
                        <PenToolIcon className="size-4" />
                        <span>
                          {submitting
                            ? "Memproses…"
                            : taskActionLabel(
                                selectedLetter.task.actionType,
                                primaryAction,
                              )}
                        </span>
                      </Button>
                    )}
                    {canApprove && (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={submitting}
                          onClick={() => setModalMode("revisi")}
                        >
                          Minta Revisi
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          disabled={submitting}
                          onClick={() => setModalMode("tolak")}
                        >
                          Tolak Surat
                        </Button>
                      </div>
                    )}
                    {selectedLetter.allowedActions.includes("defer") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        disabled={submitting}
                        onClick={() => setModalMode("tunda")}
                      >
                        Tunda Tugas
                      </Button>
                    )}
                    {selectedLetter.allowedActions.includes("delegate") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full"
                        disabled={submitting}
                        onClick={() => setDelegateOpen(true)}
                      >
                        Delegasikan Tugas
                      </Button>
                    )}
                    {selectedLetter.allowedActions.includes("resume") && <Button disabled={submitting} onClick={() => void handleMutation("resume", "Melanjutkan tugas melalui aplikasi")}>Lanjutkan Tugas</Button>}
                    {selectedLetter.allowedActions.includes("revoke-delegation") && (
                      <Button disabled={submitting} onClick={() => void handleMutation("revoke-delegation", "Mencabut mandat melalui aplikasi")}>Cabut Delegasi</Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-micro text-slate-500">
                    Tidak ada tindakan yang tersedia untuk tugas ini.
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

      {modalMode && selectedLetter && (
        <DecisionModal
          mode={modalMode}
          submitting={submitting}
          onClose={() => setModalMode(null)}
          onConfirm={(reason, until) => {
            if (modalMode === "revisi") {
              void handleMutation("request-revision", reason);
            } else if (modalMode === "tolak") {
              void handleMutation("reject", reason);
            } else {
              void handleMutation("defer", reason, { until });
            }
          }}
        />
      )}

      {delegateOpen && selectedLetter && (
        <DelegateModal
          taskId={selectedLetter.task.id}
          submitting={submitting}
          onClose={() => setDelegateOpen(false)}
          onConfirm={(delegateUserId, reason) =>
            void handleMutation("delegate", reason, { delegateUserId })
          }
        />
      )}

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
