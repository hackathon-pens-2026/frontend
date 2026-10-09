"use client";

import React, { useState } from "react";
import {
  ChevronRightIcon,
  CopyIcon,
  UsersIcon,
  CalendarIcon,
  DownloadIcon,
  CheckIcon,
} from "./icons";

interface HeaderBannerProps {
  letterNumber: string;
  title: string;
  organization: string;
  submittedAt: string;
  currentStageNumber: number;
  totalStages: number;
  currentStageName: string;
  progressPercent: number;
  estimatedCompletion: string;
  onBackToDashboard?: () => void;
  onBackToLetters?: () => void;
  onDownloadDraft?: () => void;
}

export function HeaderBanner({
  letterNumber,
  title,
  organization,
  submittedAt,
  currentStageNumber,
  totalStages,
  currentStageName,
  progressPercent,
  estimatedCompletion,
  onBackToDashboard,
  onBackToLetters,
  onDownloadDraft,
}: HeaderBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(letterNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="font-medium text-slate-500 hover:text-[#1e3a8a] transition cursor-pointer"
        >
          Dashboard
        </button>
        <ChevronRightIcon size={12} className="text-slate-400" />
        <button
          type="button"
          onClick={onBackToLetters || onBackToDashboard}
          className="font-medium text-slate-500 hover:text-[#1e3a8a] transition cursor-pointer"
        >
          Surat Saya
        </button>
        <ChevronRightIcon size={12} className="text-slate-400" />
        <span className="font-semibold text-slate-900">
          Detail Pelacakan #{letterNumber.split("/")[0] || "042"}
        </span>
      </nav>

      {/* Hero Tracking Card */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Left blue accent indicator bar */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-[#1e3a8a]" />

        <div className="p-6 pl-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Detail Pelacakan Surat
              </span>
              <h1 className="text-2xl lg:text-[28px] font-bold text-slate-900 leading-tight">
                {title}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                {/* Registration Number badge with copy */}
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  title="Klik untuk menyalin nomor registrasi"
                  className="group inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-[#f8fafc] px-2.5 py-1 font-mono text-xs font-semibold text-slate-800 hover:border-slate-300 hover:bg-slate-100 transition cursor-pointer"
                >
                  <span>No. Reg: {letterNumber}</span>
                  {copied ? (
                    <CheckIcon size={12} className="text-emerald-600" />
                  ) : (
                    <CopyIcon size={12} className="text-slate-400 group-hover:text-slate-600" />
                  )}
                </button>

                {/* Organization */}
                <div className="inline-flex items-center gap-1.5 text-slate-500">
                  <UsersIcon size={14} className="text-slate-400" />
                  <span>{organization}</span>
                </div>

                {/* Submission date */}
                <div className="inline-flex items-center gap-1.5 text-slate-500">
                  <CalendarIcon size={14} className="text-slate-400" />
                  <span>Disubmit {submittedAt}</span>
                </div>
              </div>
            </div>

            {/* Action Button: Download Draft Copy */}
            <div className="shrink-0">
              <button
                type="button"
                onClick={onDownloadDraft}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs lg:text-sm font-semibold text-slate-800 shadow-xs hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
              >
                <DownloadIcon size={16} className="text-slate-600" />
                <span>Download Salinan Draf</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Milestone Progress Tracker Bar */}
        <div className="border-t border-slate-200 bg-slate-50/70 px-6 py-3.5 pl-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Stage Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2563eb] px-3 py-1 text-white shadow-xs">
              <span className="size-2 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Tahap {currentStageNumber} dari {totalStages}: Menunggu {currentStageName}
              </span>
            </div>

            {/* 8-segment progress track */}
            <div className="flex flex-1 items-center gap-1.5 max-w-md mx-2">
              {/* Stages 1 to 8 visually encoded */}
              {/* Stage 1: Approved */}
              <div className="h-1.5 flex-1 rounded-full bg-[#10b981]" title="Tahap 1: Disetujui" />
              {/* Stage 2: Approved */}
              <div className="h-1.5 flex-1 rounded-full bg-[#10b981]" title="Tahap 2: Disetujui" />
              {/* Stage 3: Approved */}
              <div className="h-1.5 flex-1 rounded-full bg-[#10b981]" title="Tahap 3: Disetujui" />
              {/* Stage 4: Delegated */}
              <div className="h-1.5 flex-1 rounded-full bg-[#8b5cf6]" title="Tahap 4: Delegasi" />
              {/* Stage 5: Approved */}
              <div className="h-1.5 flex-1 rounded-full bg-[#10b981]" title="Tahap 5: Disetujui" />
              {/* Stage 6: Active */}
              <div className="h-1.5 flex-1 rounded-full bg-[#2563eb]/50" title="Tahap 6: Aktif" />
              {/* Stage 7: Pending */}
              <div className="h-1.5 flex-1 rounded-full bg-[#cbd5e1]" title="Tahap 7: Pending" />
              {/* Stage 8: Pending */}
              <div className="h-1.5 flex-1 rounded-full bg-[#cbd5e1]" title="Tahap 8: Pending" />
            </div>

            {/* Percentage & Estimation */}
            <span className="text-xs font-semibold text-slate-500 shrink-0">
              {progressPercent}% · est. selesai {estimatedCompletion}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
