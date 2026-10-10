"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentSidebar } from "@/features/shell";
import { AttentionSection } from "./attention-section";
import { RecentLetters } from "./recent-letters";
import { SubmissionSearch } from "@/features/shell/components/submission-search";
import { ApiError } from "@/lib/api/errors";
import { downloadFinalLetter, listMyLetters } from "@/lib/api/letters";
import { saveBlob } from "@/lib/display/download";
import { toDashboardLetter } from "../adapters";
import { DashboardLetter, FilterStatus } from "../types";
import { useSession } from "@/lib/auth/session-provider";

export function LettersPage() {
  const { user, status: sessionStatus } = useSession();
  const router = useRouter();
  const [letters, setLetters] = useState<DashboardLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
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
    listMyLetters(1, 100)
      .then((result) => {
        if (!active) return;
        setLetters(result.items.map(toDashboardLetter));
        setError(null);
        setDataAvailable(true);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setDataAvailable(false);
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

  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans">
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="animate-rise fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      <StudentSidebar currentPath="/surat" letterCount={letters.filter((l) => l.status !== "approved").length} />

      <div className="md:pl-[260px] min-h-screen min-w-0 flex flex-col">
        <main className="mx-auto w-full max-w-[1240px] space-y-6 px-4 pb-6 pt-16 md:px-8 md:pt-6 flex-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Surat Saya
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Semua pengajuan atas nama akun Anda, lengkap dengan tahap aktif dan
              tautan ke halaman surat.
            </p>
          </div>

          {error && (
            <div role="status" className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-revision-border bg-revision-bg px-4 py-3 text-xs text-revision">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReloadKey((key) => key + 1);
                }}
                className="font-semibold underline focus-visible:outline-2 focus-visible:outline-revision cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          )}

          <SubmissionSearch value={searchQuery} onChange={setSearchQuery} />

          {<AttentionSection
            letters={letters}
            onOpenLetter={(letter) => {
              router.push(`/surat/${letter.id}`);
            }}
          />}

          {loading ? (
            <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-body text-slate-500">
              Memuat pengajuan…
            </p>
          ) : (
            <RecentLetters
              emptyMessage={dataAvailable ? undefined : "Data pengajuan belum tersedia."}
              letters={filteredLetters}
              currentFilter={filter}
              onFilterChange={setFilter}
              onSelectLetter={(letter) => {
                router.push(`/surat/${letter.id}`);
              }}
              onDownloadPdf={(letter) => void handleDownload(letter)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
