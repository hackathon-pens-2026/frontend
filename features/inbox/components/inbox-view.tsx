"use client";

import React, { useMemo, useState } from "react";
import { ApprovalStep, InboxLetter } from "../types";
import { DecisionModal } from "./decision-modal";
import { DelegateModal } from "./delegate-modal";
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
  steps,
  stepsLoading = false,
  onRefresh,
  loading = false,
  error = null,
}: InboxViewProps) {
  const [filter, setFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"revisi" | "tolak" | "tunda" | null>(
    null,
  );
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLetters = useMemo(
    () => letters.filter((item) => filter === "all" || item.status === filter),
    [letters, filter],
  );

  const selectedLetter =
    letters.find((l) => l.id === selectedId) ?? filteredLetters[0] ?? letters[0];

  const getFilterCount = (catId: string) =>
    letters.filter((l) => catId === "all" || l.status === catId).length;

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
    if (!selectedLetter || !primaryAction) return;
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
        showToast("Tugas berhasil diproses · tahap berikutnya diaktifkan");
        await onRefresh();
      } else {
        const msg = describeError(cause);
        if (msg) showToast(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMutation = async (
    action: "request-revision" | "reject" | "defer" | "delegate",
    reason: string,
    options: { until?: string; delegateUserId?: string } = {},
  ) => {
    if (!selectedLetter) return;
    const task = selectedLetter.task;
    const messages = {
      "request-revision": "Permintaan revisi dikirim ke pemohon via email",
      reject: "Surat ditolak · alasan dikirim ke pemohon via email",
      defer: "Tugas ditunda sesuai batas waktu baru",
      delegate: "Mandat delegasi aktif untuk tugas ini",
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
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 401) {
        showToast(messages[action]);
        setModalMode(null);
        setDelegateOpen(false);
        await onRefresh();
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
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-display font-bold text-midnight">
            Kotak Persetujuan
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Tinjau, tanda tangani, atau kembalikan dokumen yang membutuhkan
            otorisasi Anda.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-revision-border bg-revision-bg px-4 py-3 text-body text-revision">
          {error}
        </p>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-4 flex max-h-[calc(100vh-260px)] flex-col overflow-hidden">
          <div className="scroll-thin flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex flex-col items-center py-16 text-center">
                <p className="text-body text-slate-500">Memuat tugas…</p>
              </div>
            ) : filteredLetters.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <InboxIcon className="size-8 text-slate-300" />
                <p className="mt-2 text-body text-slate-500">
                  Tidak ada tugas aktif di kategori ini
                </p>
              </div>
            ) : (
              filteredLetters.map((item) => {
                const isSelected = item.id === selectedLetter?.id;
                return (
                  <button
                    key={item.task.id}
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
                      <span className="truncate text-micro font-medium text-slate-400 tabular-nums">
                        {item.number}
                      </span>
                      <span className="text-micro text-slate-400">
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

        {selectedLetter && (
          <Card className="lg:col-span-5 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-white">
              <div className="flex items-center gap-2 text-micro font-medium text-slate-500">
                <FileTextIcon className="size-3.5" />
                <span className="truncate">{selectedLetter.number}.pdf</span>
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {selectedLetter.task.documentUrl
                  ? "Dokumen tinjauan"
                  : "Dokumen belum tersedia"}
              </span>
            </div>
            <div className="flex-1 bg-slate-100 p-3">
              {selectedLetter.task.documentUrl ? (
                <iframe
                  title={`Dokumen ${selectedLetter.number}`}
                  src={`/api/v1/tasks/${selectedLetter.task.id}/document`}
                  className="h-[calc(100vh-320px)] w-full rounded-lg border border-line bg-white"
                />
              ) : (
                <div className="flex h-[calc(100vh-320px)] items-center justify-center rounded-lg border border-dashed border-line bg-white text-center">
                  <p className="max-w-xs text-body text-slate-500">
                    PDF tinjauan belum dihasilkan untuk revisi ini. Dokumen akan
                    tersedia setelah preview selesai diproses backend.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedLetter && (
          <div className="lg:col-span-3 space-y-6">
            <Card className="p-5">
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

              <dl className="mt-4 space-y-2.5 text-body">
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

              <div className="mt-5 border-t border-line pt-4">
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

              <div className="mt-6 border-t border-line pt-4">
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
                    {selectedLetter.allowedActions.includes("revoke-delegation") && (
                      <p className="rounded-lg bg-delegate-bg px-3 py-2 text-micro text-violet-800">
                        Mandat aktif pada tugas ini. Penerima mandat dapat
                        bertindak atas nama Anda hingga batas waktu.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-micro text-slate-500">
                    Tidak ada tindakan yang tersedia untuk tugas ini.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

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
