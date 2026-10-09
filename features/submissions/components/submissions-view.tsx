"use client";

import React, { useState } from "react";
import {
  Button,
  Card,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
  StatusBadge,
  Timeline,
} from "@/components/ui";
import { ApiError } from "@/lib/api/errors";
import { getLetterWorkflow } from "@/lib/api/workflow";
import {
  formatDate,
  formatDateTime,
  letterStatusLabel,
  letterStatusToBadge,
  letterTypeLabel,
} from "@/lib/display/letter";
import type { ApprovalStep } from "@/features/inbox/types";
import type { LetterSummaryDto } from "@/lib/api/types";
import { workflowSteps } from "@/features/inbox/types";

interface SubmissionsViewProps {
  letters: LetterSummaryDto[];
  loading?: boolean;
  onNew: () => void;
}

interface WorkflowState {
  steps: ApprovalStep[];
  loading: boolean;
  error: string | null;
}

export function SubmissionsView({ letters, loading = false, onNew }: SubmissionsViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [workflows, setWorkflows] = useState<Record<string, WorkflowState>>({});

  const toggle = async (letter: LetterSummaryDto) => {
    if (expandedId === letter.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(letter.id);
    if (workflows[letter.id]) return;
    setWorkflows((prev) => ({
      ...prev,
      [letter.id]: { steps: [], loading: true, error: null },
    }));
    try {
      const workflow = await getLetterWorkflow(letter.id);
      setWorkflows((prev) => ({
        ...prev,
        [letter.id]: {
          steps: workflowSteps(workflow.tasks),
          loading: false,
          error: null,
        },
      }));
    } catch (cause) {
      setWorkflows((prev) => ({
        ...prev,
        [letter.id]: {
          steps: [],
          loading: false,
          error:
            cause instanceof ApiError
              ? cause.message
              : "Alur persetujuan tidak dapat dimuat.",
        },
      }));
    }
  };

  return (
    <div className="animate-rise space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-display font-bold text-midnight">
            Pengajuan Saya
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Lacak posisi setiap dokumen yang Anda ajukan melalui sistem.
          </p>
        </div>
        <Button onClick={onNew}>
          <PlusIcon className="size-4" />
          <span>Ajukan Dokumen Baru</span>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden sm:grid sm:grid-cols-[1fr_180px_150px_160px_40px] gap-4 border-b border-line bg-canvas px-6 py-3 text-micro font-semibold tracking-wide text-slate-500 uppercase">
          <span>Dokumen</span>
          <span>Jenis</span>
          <span>Diajukan</span>
          <span>Status</span>
          <span />
        </div>

        <div className="divide-y divide-line">
          {loading ? (
            <div className="px-6 py-10 text-center text-body text-slate-500">
              Memuat pengajuan…
            </div>
          ) : letters.length === 0 ? (
            <div className="px-6 py-10 text-center text-body text-slate-500">
              Belum ada pengajuan. Mulai dari Asisten Surat untuk membuat draf
              baru.
            </div>
          ) : (
            letters.map((item) => {
              const isExpanded = expandedId === item.id;
              const workflow = workflows[item.id];
              const progress =
                item.totalTasks > 0
                  ? Math.round((item.completedTasks / item.totalTasks) * 100)
                  : 0;

              return (
                <div key={item.id} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => void toggle(item)}
                    className="grid w-full grid-cols-1 sm:grid-cols-[1fr_180px_150px_160px_40px] items-center gap-3 sm:gap-4 px-6 py-4 text-left hover:bg-canvas cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-body font-semibold text-midnight">
                        {item.title}
                      </div>
                      <div className="truncate text-micro text-slate-400 tabular-nums">
                        {item.number}
                      </div>
                    </div>

                    <div className="text-body text-slate-600">
                      <span className="sm:hidden font-medium text-slate-400">
                        Jenis:{" "}
                      </span>
                      {letterTypeLabel(item.typeId)}
                    </div>

                    <div className="text-micro text-slate-500">
                      <span className="sm:hidden font-medium text-slate-400">
                        Diajukan:{" "}
                      </span>
                      {formatDate(item.submittedAt)}
                    </div>

                    <div>
                      <StatusBadge status={letterStatusToBadge(item.status)} />
                    </div>

                    <div className="hidden sm:flex justify-end text-slate-400">
                      {isExpanded ? (
                        <ChevronDownIcon className="size-4" />
                      ) : (
                        <ChevronRightIcon className="size-4" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-line bg-canvas px-6 py-5">
                      <div className="max-w-xl">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="text-micro font-semibold text-slate-600">
                            Progres Persetujuan: {item.completedTasks} dari{" "}
                            {item.totalTasks} tahap ·{" "}
                            {letterStatusLabel(item.status)}
                          </div>
                          <div className="text-micro text-slate-400">
                            {progress}%
                          </div>
                        </div>
                        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full bg-navy transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        {workflow?.loading ? (
                          <p className="text-micro text-slate-500">
                            Memuat alur…
                          </p>
                        ) : workflow?.error ? (
                          <p className="text-micro text-revision">
                            {workflow.error}
                          </p>
                        ) : (
                          <Timeline steps={workflow?.steps ?? []} />
                        )}
                        {item.activeTask && (
                          <p className="mt-4 text-micro text-slate-500">
                            Tahap aktif:{" "}
                            <span className="font-medium text-midnight">
                              {item.activeTask.positionName ??
                                `Tahap ${item.activeTask.order}`}
                            </span>{" "}
                            · batas waktu{" "}
                            {formatDateTime(item.activeTask.dueAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
