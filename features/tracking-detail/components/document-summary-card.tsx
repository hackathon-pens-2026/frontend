"use client";

import React from "react";
import { DocumentSummary } from "../types";
import {
  FileTextIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  PaperclipIcon,
} from "./icons";

interface DocumentSummaryCardProps {
  summary: DocumentSummary;
  onPreviewAttachment?: (name: string) => void;
}

export function DocumentSummaryCard({
  summary,
  onPreviewAttachment,
}: DocumentSummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">Ringkasan Dokumen</h3>

      <div className="divide-y divide-slate-100">
        {/* Tipe */}
        <div className="flex items-start gap-3 py-3 first:pt-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f8fafc] text-slate-500">
            <FileTextIcon size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Tipe
            </span>
            <span className="text-xs font-semibold text-slate-900 block leading-snug">
              {summary.type}
            </span>
          </div>
        </div>

        {/* Ruangan */}
        <div className="flex items-start gap-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f8fafc] text-slate-500">
            <MapPinIcon size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Ruangan
            </span>
            <span className="text-xs font-semibold text-slate-900 block leading-snug">
              {summary.room}
            </span>
          </div>
        </div>

        {/* Jam Pakai */}
        <div className="flex items-start gap-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f8fafc] text-slate-500">
            <ClockIcon size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Jam Pakai
            </span>
            <span className="text-xs font-semibold text-slate-900 block leading-snug">
              {summary.useTime}
            </span>
          </div>
        </div>

        {/* Kegiatan */}
        <div className="flex items-start gap-3 py-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f8fafc] text-slate-500">
            <UsersIcon size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Kegiatan
            </span>
            <span className="text-xs font-semibold text-slate-900 block leading-snug">
              {summary.activity}
            </span>
          </div>
        </div>

        {/* Lampiran */}
        <div className="flex items-start gap-3 py-3 last:pb-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-[#f8fafc] text-slate-500">
            <PaperclipIcon size={16} />
          </div>
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Lampiran
            </span>
            <div className="text-xs font-semibold text-slate-900 leading-snug">
              {summary.attachments.join(", ")}
            </div>
            {onPreviewAttachment && (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {summary.attachments.map((file) => (
                  <button
                    key={file}
                    type="button"
                    onClick={() => onPreviewAttachment(file)}
                    className="text-[10px] text-[#1e3a8a] font-medium hover:underline cursor-pointer"
                  >
                    Lihat berkas
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
