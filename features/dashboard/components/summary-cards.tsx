import React from "react";
import { SummaryMetric } from "../types";
import { ClockIcon, HourglassIcon, CheckCircleIcon, TimerIcon } from "./icons";

interface SummaryCardsProps {
  metrics?: SummaryMetric[];
  onSelectMetric?: (id: string) => void;
}

const defaultMetrics: SummaryMetric[] = [
  {
    id: "active",
    title: "Surat Sedang Berjalan",
    value: "3",
    subtitle: "1 di tahap akhir persetujuan",
    variant: "info",
  },
  {
    id: "waiting",
    title: "Menunggu Respon Approver",
    value: "2",
    subtitle: "Respon tercepat: BEM PENS",
    variant: "warning",
  },
  {
    id: "approved",
    title: "Surat Disetujui (Siap Cetak/QR)",
    value: "14",
    subtitle: "+3 pengajuan bulan ini",
    variant: "success",
  },
  {
    id: "speed",
    title: "Rata-rata Waktu Selesai",
    value: "1.8 Hari",
    subtitle: "vs 5 hari manual",
    badge: {
      label: "64% lebih cepat",
      variant: "success",
    },
    variant: "neutral",
  },
];

export function SummaryCards({ metrics = defaultMetrics, onSelectMetric }: SummaryCardsProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case "active":
        return <ClockIcon size={18} />;
      case "waiting":
        return <HourglassIcon size={18} />;
      case "approved":
        return <CheckCircleIcon size={18} />;
      case "speed":
      default:
        return <TimerIcon size={18} />;
    }
  };

  const getStyle = (variant: SummaryMetric["variant"]) => {
    switch (variant) {
      case "info":
        return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
      case "warning":
        return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
      case "success":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
      case "neutral":
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  };

  return (
    <section aria-label="Ringkasan Status Surat" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectMetric?.(item.id)}
          className={`rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all duration-150 ${
            onSelectMetric ? "cursor-pointer hover:border-slate-300 hover:shadow-sm" : ""
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium text-slate-600 leading-snug">
              {item.title}
            </span>
            <span
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${getStyle(
                item.variant
              )}`}
            >
              {getIcon(item.id)}
            </span>
          </div>

          <div className="mt-3 text-[28px] font-bold tracking-tight text-slate-900 tabular-nums leading-none">
            {item.value}
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
            <span>{item.subtitle}</span>
            {item.badge && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                {item.badge.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
