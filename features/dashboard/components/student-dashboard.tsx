"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DashboardLetter, FilterStatus, SummaryMetric } from "../types";
import { SummaryCards } from "./summary-cards";
import { AttentionSection } from "./attention-section";
import { RecentLetters } from "./recent-letters";
import { StudentSidebar } from "@/features/shell/components/student-sidebar";
import { SubmissionSearch } from "@/features/shell/components/submission-search";
import {
  DownloadIcon,
  XIcon,
  CheckIcon,
} from "./icons";
import { ApiError } from "@/lib/api/errors";
import { listMyLetters, downloadFinalLetter } from "@/lib/api/letters";
import { getLetterWorkflow } from "@/lib/api/workflow";
import { formatDateTime, taskStatusToBadge } from "@/lib/display/letter";
import { saveBlob } from "@/lib/display/download";
import { useSession } from "@/lib/auth/session-provider";
import type { WorkflowTaskDto } from "@/lib/api/types";
import { toDashboardLetter } from "../adapters";

interface DrawerStep {
  role: string;
  name: string;
  status: string;
  at?: string;
  note?: string;
  hash?: string;
}

function toDrawerStep(task: WorkflowTaskDto): DrawerStep {
  const badge = taskStatusToBadge(task.status);
  return {
    role: task.positionName ?? `Tahap ${task.order}`,
    name: task.assignedUserName || "Petugas",
    status: badge,
    at: task.actedAt ? formatDateTime(task.actedAt) : undefined,
    note: task.comment ?? undefined,
    hash: task.contentHash ? `${task.contentHash.slice(0, 4)}…${task.contentHash.slice(-4)}` : undefined,
  };
}

export default function StudentDashboard() {
  const { user, status: sessionStatus } = useSession();
  const [letters, setLetters] = useState<DashboardLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<DashboardLetter | null>(null);
  const [drawerSteps, setDrawerSteps] = useState<DrawerStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [showAllLetters, setShowAllLetters] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const showNotification = (message: string) => {
    if (
      !message ||
      message.toLowerCase().includes("login kembali") ||
      message.toLowerCase().includes("masuk kembali")
    ) {
      return;
    }
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3400);
  };

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user?.id) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) { setLoading(true); setDataAvailable(false); setLetters([]); }
    });
    listMyLetters(1, 50)
      .then((result) => {
        if (!active) return;
        setLetters(result.items.map(toDashboardLetter));
        setError(null);
        setDataAvailable(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setDataAvailable(false);
        // Session handling owns 401s; repeating its login message here is not actionable.
        if (cause instanceof ApiError && cause.status === 401) {
          setError(null);
          return;
        }
        setError(
          cause instanceof Error
            ? cause.message
            : "Daftar surat tidak dapat dimuat.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey, user?.id, sessionStatus]);

  const retryLoadLetters = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const openLetterDrawer = useCallback(async (letter: DashboardLetter) => {
    setSelectedLetter(letter);
    setDrawerSteps([]);
    setStepsLoading(true);
    try {
      const workflow = await getLetterWorkflow(letter.id);
      setDrawerSteps([...workflow.tasks].sort((a, b) => a.order - b.order).map(toDrawerStep));
      setSelectedLetter((current) =>
        current && current.id === letter.id
          ? { ...current, finalDocumentId: workflow.finalDocumentId }
          : current,
      );
    } catch {
      setDrawerSteps([]);
    } finally {
      setStepsLoading(false);
    }
  }, []);

  const handleDownload = useCallback(
    async (letter: DashboardLetter) => {
      if (!letter.finalDocumentId) {
        showNotification("Dokumen final belum tersedia untuk surat ini.");
        return;
      }
      try {
        const blob = await downloadFinalLetter(letter.id);
        saveBlob(blob, `${letter.no.replace(/[/\\]/g, "-")}.pdf`);
        showNotification(`Dokumen ${letter.no}.pdf berhasil diunduh.`);
      } catch (cause) {
        showNotification(
          cause instanceof ApiError
            ? cause.message
            : "Dokumen tidak dapat diunduh.",
        );
      }
    },
    [],
  );

  const filteredLetters = useMemo(() => {
    return letters.filter((item) => {
      let matchesFilter = true;
      if (filter === "Berjalan") {
        matchesFilter = item.status === "review" || item.status === "pending";
      } else if (filter === "Disetujui") {
        matchesFilter = item.status === "approved";
      } else if (filter === "Revisi") {
        matchesFilter = item.status === "rejected";
      }
      if (!matchesFilter) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.no.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.stage.toLowerCase().includes(query)
      );
    });
  }, [letters, filter, searchQuery]);

  const metrics: SummaryMetric[] = useMemo(() => {
    const active = letters.filter((l) => l.status === "review").length;
    const waiting = letters.filter((l) => l.status === "pending").length;
    const approved = letters.filter((l) => l.status === "approved").length;
    const revision = letters.filter((l) => l.status === "rejected").length;
    const items: SummaryMetric[] = [
      {
        id: "active",
        title: "Surat Sedang Berjalan",
        value: `${active}`,
        subtitle: "sedang ditinjau approver",
        variant: "info",
      },
      {
        id: "waiting",
        title: "Menunggu Aksi Anda",
        value: `${waiting}`,
        subtitle: "draf atau perlu dilanjutkan",
        variant: "warning",
      },
      {
        id: "approved",
        title: "Surat Selesai (Ber-QR)",
        value: `${approved}`,
        subtitle: "siap diunduh format PDF",
        variant: "success",
      },
      {
        id: "revision",
        title: "Perlu Revisi",
        value: `${revision}`,
        subtitle: "menunggu perbaikan pengajuan",
        variant: "neutral",
      },
    ];
    return items.map((metric) => ({ ...metric, value: dataAvailable ? metric.value : "—" }));
  }, [letters, dataAvailable]);

  const activeCount = letters.filter(
    (l) => l.status === "review" || l.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans relative selection:bg-blue-100">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-rise flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <StudentSidebar currentPath="/" letterCount={activeCount} />

      <div className="md:pl-[260px] min-h-screen min-w-0 flex flex-col bg-canvas">
        <main className="mx-auto w-full max-w-[1240px] space-y-6 px-4 pb-6 pt-16 md:px-8 md:pt-6 flex-1 bg-canvas">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Selamat Datang, {(user?.name ?? "Mahasiswa").split(" ")[0]}
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Pantau kelancaran birokrasi dan status surat izin secara terpusat.
                </p>
              </div>

              <div role="status" className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-midnight/60 shadow-xs">
                <span aria-hidden="true" className={`size-2 rounded-full ${dataAvailable ? "bg-ok" : "bg-midnight/30"}`} />
                <span>{loading ? "Memuat data…" : dataAvailable ? "Tersinkron dengan server" : "Data belum tersedia"}</span>
              </div>
            </div>

            {error && (
              <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-revision-border bg-revision-bg px-4 py-3 text-xs text-revision">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={retryLoadLetters}
                  className="font-semibold underline focus-visible:outline-2 focus-visible:outline-revision cursor-pointer"
                >
                  Coba lagi
                </button>
              </div>
            )}

            <SummaryCards
              metrics={metrics}
              onSelectMetric={(id) => {
                if (id === "active" || id === "waiting") setFilter("Berjalan");
                else if (id === "approved") setFilter("Disetujui");
                else if (id === "revision") setFilter("Revisi");
              }}
            />

            <AttentionSection
              letters={letters}
              onOpenLetter={(letter) => void openLetterDrawer(letter)}
            />

            <div id="letters-section">
              <div className="mb-4">
                <SubmissionSearch value={searchQuery} onChange={setSearchQuery} />
              </div>
              <RecentLetters
                emptyMessage={dataAvailable ? undefined : "Data pengajuan belum tersedia."}
                letters={showAllLetters ? filteredLetters : filteredLetters.slice(0, 6)}
                currentFilter={filter}
                onFilterChange={setFilter}
                onSelectLetter={(letter) => void openLetterDrawer(letter)}
                onDownloadPdf={(letter) => void handleDownload(letter)}
              />
              {!showAllLetters && filteredLetters.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllLetters(true)}
                  className="mt-3 text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
                >
                  Tampilkan semua {filteredLetters.length} pengajuan
                </button>
              )}
            </div>
          </main>
      </div>

      {selectedLetter && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] transition-opacity flex justify-end"
          onClick={() => setSelectedLetter(null)}
        >
          <aside
            aria-label="Detail Pelacakan Surat"
            className="animate-rise w-full max-w-[460px] h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <span className="font-mono text-xs font-medium text-slate-400">
                  {selectedLetter.no}
                </span>
                <h3 className="mt-1 text-base font-semibold text-slate-900 leading-snug">
                  {selectedLetter.title}
                </h3>
                <div className="mt-2 text-xs text-slate-500">
                  {selectedLetter.category} · {selectedLetter.stage}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                aria-label="Tutup Detail"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="scroll-thin flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Alur Persetujuan &amp; Tanda Tangan
                </div>
                {stepsLoading ? (
                  <p className="text-xs text-slate-500">Memuat alur…</p>
                ) : drawerSteps.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    Alur belum tersedia untuk surat ini.
                  </p>
                ) : (
                  <ol className="space-y-4">
                    {drawerSteps.map((step, idx) => {
                      const isApproved = step.status === "approved";
                      const isReview = step.status === "pending" || step.status === "review";
                      const isRejected = step.status === "rejected";
                      const isDelegated = step.status === "delegated";
                      return (
                        <li key={idx} className="relative flex gap-3 text-xs">
                          {idx !== drawerSteps.length - 1 && (
                            <span
                              className={`absolute top-6 bottom-0 left-[13px] w-0.5 ${
                                isApproved ? "bg-emerald-300" : "bg-slate-200"
                              }`}
                            />
                          )}
                          <span
                            className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-white font-bold text-[10px] ${
                              isApproved
                                ? "bg-emerald-600"
                                : isReview
                                ? "bg-blue-600"
                                : isRejected
                                ? "bg-red-600"
                                : isDelegated
                                ? "bg-purple-600"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {isApproved ? <CheckIcon size={12} /> : idx + 1}
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5 pb-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-slate-900">{step.role}</span>
                              {step.at && (
                                <span className="text-[11px] text-slate-400 tabular-nums">
                                  {step.at}
                                </span>
                              )}
                            </div>
                            <div className="text-slate-500 mt-0.5">{step.name}</div>
                            {step.note && (
                              <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                                “{step.note}”
                              </div>
                            )}
                            {step.hash && (
                              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                                SHA-256: {step.hash}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-[#f8fafc] p-4 space-y-2">
              <Link
                href={`/surat/${selectedLetter.id}`}
                onClick={() => setSelectedLetter(null)}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-lg border border-[#1e3a8a] bg-blue-50/60 text-xs font-semibold text-[#1e3a8a] hover:bg-blue-100/70 transition cursor-pointer"
              >
                <span>Buka Halaman Surat</span>
              </Link>

              {selectedLetter.finalDocumentId ? (
                <button
                  type="button"
                  onClick={() => void handleDownload(selectedLetter)}
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] text-xs font-semibold text-white shadow-xs hover:bg-[#172554] transition cursor-pointer"
                >
                  <DownloadIcon size={15} />
                  <span>Unduh Dokumen Resmi (PDF Ber-QR)</span>
                </button>
              ) : (
                <p className="flex h-10 items-center justify-center text-xs text-slate-500">
                  Surat resmi dapat diunduh setelah seluruh tahap disetujui.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
