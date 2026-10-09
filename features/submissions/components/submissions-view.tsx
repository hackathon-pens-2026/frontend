"use client";

import React, { useState } from "react";
import { StaffSubmission } from "../types";
import {
  Button,
  Card,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  StatusBadge,
  Timeline,
} from "@/components/ui";

interface SubmissionsViewProps {
  submissions: StaffSubmission[];
  onNew: () => void;
}

export function SubmissionsView({ submissions, onNew }: SubmissionsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    submissions[1]?.id ?? submissions[0]?.id ?? null
  );

  return (
    <div className="animate-rise space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-bold text-midnight">
            Pengajuan Saya
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Lacak posisi setiap dokumen secara real-time — tanpa perlu datang ke ruang TU.
          </p>
        </div>
        <Button onClick={onNew}>
          <PlusIcon className="size-4" />
          <span>Ajukan Dokumen Baru</span>
        </Button>
      </div>

      {/* Submissions Table / Card */}
      <Card className="overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid sm:grid-cols-[1fr_160px_140px_160px_40px] gap-4 border-b border-line bg-canvas px-6 py-3 text-micro font-semibold tracking-wide text-slate-500 uppercase">
          <span>Dokumen</span>
          <span>Jenis</span>
          <span>Diajukan</span>
          <span>Status</span>
          <span />
        </div>

        {/* Rows */}
        <div className="divide-y divide-line">
          {submissions.map((item) => {
            const isExpanded = expandedId === item.id;
            const approvedCount = item.steps.filter(
              (s) => s.status === "approved"
            ).length;

            return (
              <div key={item.id} className="transition-colors">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="grid w-full grid-cols-1 sm:grid-cols-[1fr_160px_140px_160px_40px] items-center gap-3 sm:gap-4 px-6 py-4 text-left hover:bg-canvas cursor-pointer"
                >
                  {/* Doc title & ID */}
                  <div className="min-w-0">
                    <div className="truncate text-body font-semibold text-midnight">
                      {item.title}
                    </div>
                    <div className="text-micro text-slate-400 tabular-nums">
                      {item.id} · {item.pages} halaman
                    </div>
                  </div>

                  {/* Type */}
                  <div className="text-body text-slate-600 sm:block">
                    <span className="sm:hidden font-medium text-slate-400">
                      Jenis:{" "}
                    </span>
                    {item.type}
                  </div>

                  {/* Submitted */}
                  <div className="text-micro text-slate-500">
                    <span className="sm:hidden font-medium text-slate-400">
                      Diajukan:{" "}
                    </span>
                    {item.submitted}
                  </div>

                  {/* Status */}
                  <div>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Expand icon */}
                  <div className="hidden sm:flex justify-end text-slate-400">
                    {isExpanded ? (
                      <ChevronDownIcon className="size-4" />
                    ) : (
                      <ChevronRightIcon className="size-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Tracking Detail */}
                {isExpanded && (
                  <div className="border-t border-line bg-canvas px-6 py-5">
                    <div className="max-w-xl">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="text-micro font-semibold text-slate-600">
                          Progres Persetujuan: {approvedCount} dari{" "}
                          {item.steps.length} tahap
                        </div>
                        <div className="text-micro text-slate-400">
                          {Math.round((approvedCount / item.steps.length) * 100)}%
                        </div>
                      </div>
                      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-navy transition-all"
                          style={{
                            width: `${(approvedCount / item.steps.length) * 100}%`,
                          }}
                        />
                      </div>
                      <Timeline steps={item.steps} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
