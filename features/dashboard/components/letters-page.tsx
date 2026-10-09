"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StudentSidebar } from "@/features/shell";
import { AttentionSection } from "./attention-section";
import { RecentLetters } from "./recent-letters";
import { PlusIcon, SearchIcon, XIcon } from "./icons";
import { ApiError } from "@/lib/api/errors";
import { downloadLetterDocument, listMyLetters } from "@/lib/api/letters";
import { saveBlob } from "@/lib/display/download";
import { toDashboardLetter } from "../adapters";
import { DashboardLetter, FilterStatus } from "../types";

export function LettersPage() {
  const router = useRouter();
  const [letters, setLetters] = useState<DashboardLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const showNotification = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 3400);
  };

  useEffect(() => {
    let active = true;
    listMyLetters(1, 100)
      .then((result) => {
        if (!active) return;
        setLetters(result.items.map(toDashboardLetter));
        setError(null);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiError
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
  }, [reloadKey]);

  const handleDownload = useCallback(
    async (letter: DashboardLetter) => {
      if (!letter.finalDocumentId) {
        showNotification("Dokumen final belum tersedia untuk surat ini.");
        return;
      }
      try {
        const blob = await downloadLetterDocument(letter.id, letter.finalDocumentId);
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

      <div className="pl-[260px] min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white px-8 shadow-xs">
          <div className="relative w-full max-w-[460px]">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari nomor surat, jenis izin, atau tahap..."
              className="h-10 w-full rounded-lg border border-line bg-canvas pr-8 pl-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-navy focus:bg-white focus:ring-2 focus:ring-navy/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <XIcon size={12} />
              </button>
            )}
          </div>

          <Link
            href="/surat/baru"
            className="ml-auto inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-navy-hover cursor-pointer"
          >
            <PlusIcon size={16} />
            <span>Ajukan Surat Baru</span>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1240px] space-y-6 px-8 py-6 flex-1">
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
            <div className="rounded-lg border border-revision-border bg-revision-bg px-4 py-3 text-xs text-revision">
              {error}
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setReloadKey((key) => key + 1);
                }}
                className="ml-2 font-semibold underline cursor-pointer"
              >
                Coba lagi
              </button>
            </div>
          )}

          <AttentionSection
            letters={letters}
            onOpenLetter={(letter) => {
              router.push(`/surat/${letter.id}`);
            }}
          />

          {loading ? (
            <p className="rounded-xl border border-line bg-white px-6 py-10 text-center text-body text-slate-500">
              Memuat pengajuan…
            </p>
          ) : (
            <RecentLetters
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
