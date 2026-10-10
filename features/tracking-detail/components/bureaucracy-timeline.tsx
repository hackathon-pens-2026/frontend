"use client";

import React, { useState } from "react";
import { TimelineStage } from "../types";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  ShieldCheckIcon,
  InfoIcon,
  ArrowRightIcon,
} from "./icons";

interface BureaucracyTimelineProps {
  stages: TimelineStage[];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "PT";
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

export function BureaucracyTimeline({ stages }: BureaucracyTimelineProps) {
  // Keep track of which stages have open accordion details
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

  const [showEscalationInfo, setShowEscalationInfo] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
      {/* Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rantai Birokrasi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {stages.length} tahap · alur persetujuan &amp; legalisasi digital
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-medium text-slate-600">Disetujui</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#8b5cf6]" />
            <span className="text-[11px] font-medium text-slate-600">Delegasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-[#2563eb]" />
            <span className="text-[11px] font-medium text-slate-600">Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full border border-dashed border-slate-400 bg-white" />
            <span className="text-[11px] font-medium text-slate-600">Pending</span>
          </div>
        </div>
      </div>

      {/* Escalation Modal / Tooltip */}
      {showEscalationInfo && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 flex items-start gap-2.5 animate-rise">
          <InfoIcon size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="font-semibold text-blue-950">Kebijakan Eskalasi &amp; SLA Respon</div>
            <p className="text-blue-800 leading-relaxed text-[11px]">
              Setiap verifikator memiliki batas waktu respons SLA kerja. Apabila melebihi batas waktu,
              sistem SignIt! secara otomatis menandai status lewat SLA pada antrean tugas agar proses
              surat tidak tertunda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowEscalationInfo(false)}
            className="text-blue-700 hover:text-blue-950 font-bold text-xs p-1 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Vertical Timeline List */}
      <div className="relative space-y-5">
        {stages.map((stage, idx) => {
          const isLast = idx === stages.length - 1;
          const isApproved = stage.status === "approved";
          const isDelegated = stage.status === "delegated";
          const isActive = stage.status === "active";
          const isPending = stage.status === "pending";
          const isExpanded = !!expandedSteps[stage.stepNumber];

          return (
            <div key={stage.stepNumber} className="relative flex gap-4 text-xs group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute top-9 bottom-0 left-[18px] -translate-x-1/2 w-0.5 ${
                    isApproved
                      ? "bg-emerald-500"
                      : isDelegated
                      ? "bg-purple-500"
                      : isActive
                      ? "bg-gradient-to-b from-blue-500 via-blue-300 to-slate-200"
                      : "border-l-2 border-dashed border-slate-200 w-0"
                  }`}
                />
              )}

              {/* Node Icon Circle */}
              <div className="relative z-10 shrink-0 pt-1">
                {isApproved && (
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#10b981] text-white shadow-xs ring-4 ring-emerald-50">
                    <CheckIcon size={16} />
                  </div>
                )}
                {isDelegated && (
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#8b5cf6] text-white shadow-xs ring-4 ring-purple-50">
                    <CheckIcon size={16} />
                  </div>
                )}
                {isActive && (
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-md ring-4 ring-blue-100 animate-pulse">
                    <ClockIcon size={18} />
                  </div>
                )}
                {isPending && (
                  <div className="flex size-9 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-white text-slate-400">
                    <span className="text-[11px] font-bold">{stage.stepNumber}</span>
                  </div>
                )}
              </div>

              {/* Main Stage Content Card */}
              <div className="flex-1 min-w-0">
                {isActive ? (
                  /* Active Stage 6 Card (Gradient & High-priority Actions) */
                  <div className="rounded-xl border border-blue-300 bg-gradient-to-br from-blue-50/90 via-blue-50/30 to-white p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                          Tahap {stage.stepNumber} · Sedang diproses
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {stage.role}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-600 pt-0.5">
                          <span className="flex size-5 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-700">
                            {initialsOf(stage.assigneeName)}
                          </span>
                          <span className="font-semibold text-slate-900">{stage.assigneeName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {stage.lastActive ?? "Menunggu respons"}
                          </span>
                        </div>
                      </div>

                      <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-3 py-1 text-[11px] font-semibold text-blue-700">
                        <ClockIcon size={12} />
                        <span>Menunggu Respons</span>
                      </span>
                    </div>

                    {/* SLA Countdown Card */}
                    <div className="rounded-lg border border-blue-200/80 bg-white p-3.5 shadow-xs space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        {/* Amber SLA Pill */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-800 border border-amber-200/60 font-medium">
                          <ClockIcon size={14} className="text-amber-600" />
                          <span>Sisa Waktu Respons:</span>
                          <span className="font-mono font-bold text-amber-900">
                            {stage.slaRemaining ?? "-"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Mulai {stage.slaStartTime ?? "-"}</span>
                          <span>·</span>
                          <span className="font-medium text-slate-700">
                            Batas {stage.slaDeadline ?? "-"}
                          </span>
                        </div>
                      </div>

                      {/* Visual gradient progress bar for SLA */}
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-amber-500"
                          style={{ width: `${stage.slaPercent ?? 25}%` }}
                        />
                      </div>
                    </div>

                    {/* Escalation info */}
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowEscalationInfo((prev) => !prev)}
                        title="Informasi batas waktu dan eskalasi otomatis"
                        className="flex size-11 items-center justify-center rounded-lg border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 transition cursor-pointer"
                        aria-label="Informasi eskalasi"
                      >
                        <InfoIcon size={18} />
                      </button>
                      <span className="text-[11px] text-slate-500">
                        Pengingat dikirim otomatis oleh backend sesuai jadwal SLA.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Standard Stages Card (1, 2, 3, 4, 5, 7, 8) */
                  <div
                    className={`rounded-xl border transition-all ${
                      isPending
                        ? "border-slate-200/70 bg-slate-50/50 opacity-75"
                        : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                    }`}
                  >
                    {/* Stage Header Button (Interactive Accordion Trigger) */}
                    <button
                      type="button"
                      onClick={() => toggleStep(stage.stepNumber)}
                      className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold text-slate-400">
                          Tahap {stage.stepNumber}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-900">{stage.role}</h4>
                        <div className="text-xs text-slate-500">{stage.assigneeName}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Tag */}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                            <CheckIcon size={12} />
                            <span>{stage.statusLabel}</span>
                          </span>
                        )}

                        {isDelegated && (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-semibold text-purple-700">
                            <CheckIcon size={12} />
                            <span>{stage.statusLabel}</span>
                          </span>
                        )}

                        {isPending && (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                            Pending
                          </span>
                        )}

                        {/* Expand/Collapse Chevron (for stages with extra details) */}
                        {(stage.note || stage.sha256 || stage.delegation) && (
                          <span className="text-slate-400">
                            {isExpanded ? <ChevronDownIcon size={15} /> : <ChevronRightIcon size={15} />}
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Expandable Details Container */}
                    {isExpanded && (stage.note || stage.sha256 || stage.delegation) && (
                      <div className="border-t border-slate-200/80 px-4 pt-3 pb-4 space-y-3">
                        {/* Note */}
                        {stage.note && (
                          <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-2.5 text-xs text-emerald-900">
                            <span className="font-semibold">Catatan {stage.role}:</span> “{stage.note}”
                          </div>
                        )}

                        {/* TTE Valid Stamp & SHA-256 */}
                        {stage.sha256 && (
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                                <span className="font-mono">SHA-256: {stage.sha256}</span>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                  <ShieldCheckIcon size={13} className="text-emerald-600" />
                                  Tanda tangan digital terverifikasi
                                </span>
                              </div>
                            </div>

                            {/* Authentic Green TTE Valid Stamp */}
                            <div className="shrink-0 self-start md:self-center">
                              <div className="relative inline-flex items-center gap-2 rounded-md border-2 border-emerald-600/70 bg-emerald-50/70 px-2.5 py-1.5 text-emerald-900 shadow-2xs rotate-[-1.5deg]">
                                <div className="grid grid-cols-5 gap-0.5 p-0.5 bg-emerald-600/10 rounded">
                                  {Array.from({ length: 25 }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`size-1 rounded-[1px] ${
                                        i % 2 === 0 || i % 7 === 0 ? "bg-emerald-700" : "bg-transparent"
                                      }`}
                                    />
                                  ))}
                                </div>

                                <div className="space-y-0.5">
                                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                                    TTE Valid · SignIt!
                                  </div>
                                  <div className="font-mono text-[9px] text-emerald-700">
                                    {stage.sha256} {stage.timestamp ? `· ${stage.timestamp}` : ""}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Delegation Card */}
                        {stage.delegation && (
                          <div className="rounded-lg border border-purple-200 bg-purple-50/70 p-3 space-y-2">
                            <div className="flex items-center gap-2.5">
                              <span className="flex size-6 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                                {stage.delegation.delegatorInitials}
                              </span>
                              <ArrowRightIcon size={14} className="text-purple-400" />
                              <span className="flex size-6 items-center justify-center rounded-full bg-purple-200 text-[10px] font-bold text-purple-900">
                                {stage.delegation.delegateInitials}
                              </span>

                              <span className="font-semibold text-purple-950 text-xs">
                                {stage.delegation.reason}
                              </span>
                            </div>

                            <div className="text-[11px] text-purple-700 pl-8">
                              {stage.delegation.delegateName} · Disetujui {stage.delegation.approvedAt}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
