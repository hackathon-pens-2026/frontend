import React from "react";
import { DashboardLetter, FilterStatus } from "../types";
import {
  DownloadIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
} from "./icons";

interface RecentLettersProps {
  letters: DashboardLetter[];
  currentFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
  onSelectLetter: (letter: DashboardLetter) => void;
  onDownloadPdf: (letter: DashboardLetter) => void;
}

export function RecentLetters({
  letters,
  currentFilter,
  onFilterChange,
  onSelectLetter,
  onDownloadPdf,
}: RecentLettersProps) {
  const tabs: FilterStatus[] = ["Semua", "Berjalan", "Disetujui", "Revisi"];

  const renderStatusBadge = (status: DashboardLetter["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 whitespace-nowrap">
            <CheckCircleIcon size={13} />
            Disetujui
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 whitespace-nowrap">
            <span className="size-1.5 rounded-full bg-blue-600" />
            Ditinjau
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200 whitespace-nowrap">
            <AlertCircleIcon size={13} />
            Perlu Revisi
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 whitespace-nowrap">
            <ClockIcon size={13} />
            Menunggu Aksi
          </span>
        );
    }
  };

  return (
    <section aria-labelledby="history-heading" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      {/* Header and Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-200 px-5 py-3.5 gap-3">
        <h2 id="history-heading" className="text-base font-semibold text-slate-900">
          Riwayat Pengajuan Terbaru
        </h2>

        <div className="flex gap-1 rounded-lg bg-slate-100 p-1" role="tablist" aria-label="Filter status pengajuan">
          {tabs.map((tab) => {
            const isSelected = currentFilter === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onFilterChange(tab)}
                className={`h-8 rounded-md px-3 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[820px]">
          <thead className="bg-[#f8fafc] text-xs font-semibold tracking-wider text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">
                No. Surat / Perihal
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Kategori
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Tanggal Pengajuan
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Tahap / Posisi Dokumen
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-5 py-3 font-semibold text-right">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {letters.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate-400">
                  Tidak ada dokumen pengajuan dengan filter ini.
                </td>
              </tr>
            ) : (
              letters.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50/80 group"
                >
                  {/* Column 1: No & Perihal */}
                  <td className="px-5 py-3.5">
                    <div className="font-mono text-xs text-slate-400">{item.no}</div>
                    <button
                      type="button"
                      onClick={() => onSelectLetter(item)}
                      className="mt-0.5 font-medium text-slate-900 hover:text-[#1e3a8a] text-left transition-colors cursor-pointer text-sm line-clamp-1"
                    >
                      {item.title}
                    </button>
                  </td>

                  {/* Column 2: Kategori */}
                  <td className="px-4 py-3.5 text-xs text-slate-600">
                    {item.category}
                  </td>

                  {/* Column 3: Tanggal */}
                  <td className="px-4 py-3.5 text-xs text-slate-500 tabular-nums">
                    {item.date}
                  </td>

                  {/* Column 4: Tahap Posisi */}
                  <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                    {item.stage}
                  </td>

                  {/* Column 5: Status Badge */}
                  <td className="px-4 py-3.5">
                    {renderStatusBadge(item.status)}
                  </td>

                  {/* Column 6: Aksi */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {item.finalDocumentId && (
                        <button
                          type="button"
                          onClick={() => onDownloadPdf(item)}
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition cursor-pointer"
                          aria-label={`Unduh ${item.no}`}
                          title="Unduh PDF Resmi Ber-QR"
                        >
                          <DownloadIcon size={13} />
                          <span className="hidden sm:inline">Unduh PDF</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectLetter(item)}
                        className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                        aria-label={`Lihat detail ${item.no}`}
                        title="Buka Detail Alur"
                      >
                        <ChevronRightIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
