"use client";

import React, { useMemo, useState } from "react";
import { AuditCategory, AuditLogItem } from "../types";
import { FileSpreadsheetIcon } from "./icons";

interface AuditTrailCardProps {
  logs: AuditLogItem[];
  letterNumber?: string;
  onExportCsv?: () => void;
}

export function AuditTrailCard({ logs, letterNumber, onExportCsv }: AuditTrailCardProps) {
  const [filter, setFilter] = useState<AuditCategory>("all");

  const filteredLogs = useMemo(() => {
    if (filter === "user") return logs.filter((log) => log.category === "user");
    if (filter === "system") return logs.filter((log) => log.category === "system");
    return logs;
  }, [logs, filter]);

  const handleDownloadCsv = () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }

    // Default CSV generation
    const headers = "Timestamp,Kategori,Aktor,Aksi,Metadata\n";
    const rows = logs
      .map(
        (log) =>
          `"${log.timestamp}","${log.category}","${log.actor}","${log.action.replace(
            /"/g,
            '""'
          )}","${(log.metadata || "").replace(/"/g, '""')}"`
      )
      .join("\n");

    const safeNumber = (letterNumber || "surat").replace(/[/\\]/g, "-");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `audit-trail-${safeNumber}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-200 p-5 pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Log Aktivitas &amp; Audit Trail
          </h3>
          <span className="font-mono text-xs text-slate-400">
            {filteredLogs.length} event
          </span>
        </div>

        {/* Filter Tabs Segmented Control */}
        <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition cursor-pointer text-center ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilter("user")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition cursor-pointer text-center ${
              filter === "user"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Pengguna
          </button>
          <button
            type="button"
            onClick={() => setFilter("system")}
            className={`flex-1 rounded-md py-1.5 font-semibold transition cursor-pointer text-center ${
              filter === "system"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sistem
          </button>
        </div>
      </div>

      {/* Audit Log Timeline Items */}
      <div className="p-5 space-y-4 max-h-[580px] overflow-y-auto scroll-thin">
        {filteredLogs.map((item, idx) => {
          const isLast = idx === filteredLogs.length - 1;

          return (
            <div key={item.id} className="relative flex gap-3 text-xs">
              {/* Connector line */}
              {!isLast && (
                <span className="absolute top-3.5 bottom-0 left-[3.5px] -translate-x-1/2 w-0.5 bg-slate-200" />
              )}

              {/* Status Dot */}
              <div className="relative z-10 pt-1">
                <span
                  className={`block size-2 rounded-full ${
                    item.dotColor === "blue"
                      ? "bg-[#2563eb]"
                      : item.dotColor === "green"
                      ? "bg-[#10b981]"
                      : item.dotColor === "purple"
                      ? "bg-[#8b5cf6]"
                      : item.dotColor === "amber"
                      ? "bg-[#f59e0b]"
                      : "bg-[#cbd5e1]"
                  }`}
                />
              </div>

              {/* Event Content */}
              <div className="min-w-0 flex-1 space-y-0.5 pb-2">
                <time className="font-mono text-[10px] text-slate-400 block tabular-nums">
                  {item.timestamp}
                </time>

                <div className="text-xs text-slate-800 leading-snug">
                  {item.category === "system" ? (
                    <span>
                      <strong className="font-mono font-bold text-[#1e3a8a]">SYSTEM</strong>
                      <span className="text-slate-700"> — {item.action}</span>
                    </span>
                  ) : (
                    <span>
                      <strong className="font-semibold text-slate-900">{item.actor}</strong>
                      <span className="text-slate-600"> — {item.action}</span>
                    </span>
                  )}
                </div>

                {item.metadata && (
                  <div className="text-[11px] text-slate-400 font-normal">
                    {item.metadata}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: Export CSV Action */}
      <div className="border-t border-slate-200 bg-slate-50/50 p-3 text-center">
        <button
          type="button"
          onClick={handleDownloadCsv}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] hover:text-[#172554] hover:underline transition cursor-pointer"
        >
          <FileSpreadsheetIcon size={14} />
          <span>Ekspor audit trail (.csv)</span>
        </button>
      </div>
    </div>
  );
}
