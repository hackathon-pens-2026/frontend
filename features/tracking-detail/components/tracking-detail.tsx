"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AuditLogItem, TimelineStage, TrackingDetailData } from "../types";
import { HeaderBanner } from "./header-banner";
import { BureaucracyTimeline } from "./bureaucracy-timeline";
import { DocumentSummaryCard } from "./document-summary-card";
import { AuditTrailCard } from "./audit-trail-card";
import { ApiError } from "@/lib/api/errors";
import { apiDownload } from "@/lib/api/client";
import { downloadFinalLetter, getLetter } from "@/lib/api/letters";
import { getLetterWorkflow } from "@/lib/api/workflow";
import {
  formatDate,
  formatDateTime,
  letterStatusLabel,
  letterTypeLabel,
  taskStatusToBadge,
} from "@/lib/display/letter";
import { saveBlob } from "@/lib/display/download";
import type { WorkflowTaskDto, LetterWorkflowDto } from "@/lib/api/types";
import { LetterActions } from "./letter-actions";
import { SignedLetterPreview } from "@/features/signatures/signed-letter-preview";

interface TrackingDetailProps {
  letterId: string;
  onBackToDashboard?: () => void;
  onBackToLetters?: () => void;
  onShowNotification?: (msg: string) => void;
}

function formatDurationUntil(dueAt: string | null): string {
  if (!dueAt) return "-";
  const diff = new Date(dueAt).getTime() - Date.now();
  if (diff <= 0) return "Melewati batas";
  const hours = Math.floor(diff / 36e5);
  const minutes = Math.floor((diff % 36e5) / 6e4);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} hari ${hours % 24} jam`;
  }
  return `${hours} jam ${minutes} menit`;
}

function statusLabelOf(task: WorkflowTaskDto): string {
  const badge = taskStatusToBadge(task.status);
  if (badge === "approved") {
    return task.status === "Acknowledged"
      ? `Dikonfirmasi · ${formatDateTime(task.actedAt)}`
      : `Disetujui · ${formatDateTime(task.actedAt)}`;
  }
  if (badge === "rejected") {
    return task.status === "Rejected" ? "Ditolak" : "Perlu Revisi";
  }
  if (badge === "delegated") return "Ditunda";
  if (badge === "pending") return "Menunggu Respons";
  return "Belum giliran";
}

function toStage(task: WorkflowTaskDto, now: number): TimelineStage {
  const badge = taskStatusToBadge(task.status);
  const total = task.activatedAt && task.dueAt
    ? new Date(task.dueAt).getTime() - new Date(task.activatedAt).getTime()
    : 0;
  const remaining = task.dueAt ? new Date(task.dueAt).getTime() - now : 0;
  return {
    stepNumber: task.order,
    role: task.positionName ?? `Tahap ${task.order}`,
    assigneeName: task.assignedUserName || "Petugas",
    status:
      badge === "approved"
        ? "approved"
        : badge === "delegated"
        ? "delegated"
        : badge === "pending"
        ? "active"
        : "pending",
    statusLabel: statusLabelOf(task),
    timestamp: task.actedAt ? formatDateTime(task.actedAt) : undefined,
    note: task.comment ?? undefined,
    sha256: task.contentHash
      ? `${task.contentHash.slice(0, 4)}…${task.contentHash.slice(-4)}`
      : undefined,
    lastActive: task.activatedAt
      ? `Aktif sejak ${formatDateTime(task.activatedAt)}`
      : undefined,
    slaRemaining: task.status === "Active" ? formatDurationUntil(task.dueAt) : undefined,
    slaStartTime: task.activatedAt ? formatDateTime(task.activatedAt) : undefined,
    slaDeadline: task.dueAt ? formatDateTime(task.dueAt) : undefined,
    slaPercent:
      total > 0 && remaining > 0
        ? Math.min(100, Math.round((remaining / total) * 100))
        : undefined,
  };
}

const ACTION_LABELS: Record<string, string> = {
  "letter.submitted": "Pengajuan diajukan",
  "letter.edited": "Draf diperbarui",
  "letter.cancelled": "Surat dibatalkan",
  "letter.completed": "Surat selesai & QR diterbitkan",
  "letter.processing_failed": "Finalisasi gagal diproses",
  "letter.resource_conflict": "Konflik jadwal resource terdeteksi",
  "task.activated": "Tahap berikutnya diaktifkan",
  "letter.preview_queued": "Pratinjau PDF diantrekan",
  "letter.preview_ready": "Pratinjau PDF siap",
  "letter.preview_failed": "Pratinjau PDF gagal",
  "letter.preview_superseded": "Pratinjau lama kedaluwarsa",
};

function timelineToAudit(
  action: string,
  actorId: string | null,
  at: string,
  reason: string | null,
  nameOf: (id: string) => string,
): AuditLogItem {
  const isSystem = actorId === null;
  const label = ACTION_LABELS[action] ?? action;
  const dotColor: AuditLogItem["dotColor"] = isSystem
    ? "slate"
    : action.includes("reject") || action.includes("revision")
    ? "amber"
    : action.includes("resource")
    ? "purple"
    : "green";
  return {
    id: `${action}-${at}-${actorId ?? "system"}`,
    timestamp: at,
    category: isSystem ? "system" : "user",
    actor: isSystem ? "SISTEM" : nameOf(actorId),
    action: label,
    metadata: reason ?? undefined,
    dotColor,
  };
}

export function TrackingDetail({
  letterId,
  onBackToDashboard,
  onBackToLetters,
  onShowNotification,
}: TrackingDetailProps) {
  const [data, setData] = useState<TrackingDetailData | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [workflowSnapshot, setWorkflowSnapshot] = useState<LetterWorkflowDto | null>(null);
  const [owner, setOwner] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getLetterWorkflow(letterId), getLetter(letterId).catch((cause: unknown) => {
      if (cause instanceof ApiError && cause.status === 404) return null;
      throw cause;
    })])
      .then(([workflow, draft]) => {
        if (!active) return;
        setError(null);
        setOwner(draft !== null);
        setWorkflowSnapshot(workflow);
        setDocumentId(workflow.finalDocumentId);
        const now = Date.now();
        const tasks = [...workflow.tasks].sort((a, b) => a.order - b.order);
        const activeTask = tasks.find((task) => task.status === "Active");
        const completed = tasks.filter((task) =>
          ["Signed", "Approved", "Acknowledged"].includes(task.status),
        ).length;
        const total = tasks.length;
        const firstTask = tasks[0];
        let values: Record<string, string> = {};
        try {
          values = JSON.parse(draft?.dataJson ?? "{}") as Record<string, string>;
        } catch {
          values = {};
        }
        const nameById = new Map<string, string>();
        for (const task of tasks) {
          if (task.assignedUserName) nameById.set(task.assignedUserId, task.assignedUserName);
          if (task.actedByUserId && task.assignedUserName)
            nameById.set(task.actedByUserId, task.assignedUserName);
        }
        const organization = firstTask?.organizationName ?? "-";
        setData({
          letterNumber: workflow.number || draft?.title || firstTask?.title || "Surat",
          title: firstTask?.title ?? draft?.title ?? "Surat",
          categoryTitle: letterTypeLabel(draft?.typeId || firstTask?.typeId || ""),
          organization,
          submittedAt: firstTask?.activatedAt
            ? formatDateTime(firstTask.activatedAt)
            : "-",
          currentStageNumber: activeTask?.order ?? total,
          totalStages: total,
          currentStageName: activeTask?.positionName ?? letterStatusLabel(workflow.status),
          progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
          estimatedCompletion: activeTask?.dueAt
            ? formatDate(activeTask.dueAt)
            : "-",
          stages: tasks.map((task) => toStage(task, now)),
          summary: {
            type: letterTypeLabel(draft?.typeId || firstTask?.typeId || ""),
            room: values["ruangan_kegiatan"] ?? "-",
            useTime:
              [values["hari_tanggal_kegiatan"], values["waktu_kegiatan"]]
                .filter(Boolean)
                .join(" · ") || "-",
            activity: values["nama_kegiatan"] || draft?.title || firstTask?.title || "-",
            attachments: [],
          },
          auditTrail: workflow.timeline.map((entry) =>
            timelineToAudit(
              entry.action,
              entry.actor,
              entry.at,
              entry.reason,
              (id) => nameById.get(id) ?? `Petugas ${id.slice(0, 8)}`,
            ),
          ),
        });
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof ApiError
              ? cause.message
              : "Detail surat tidak dapat dimuat.",
          );
      });
    return () => {
      active = false;
    };
  }, [letterId, reload]);

  const handleDownloadDocument = useCallback(async () => {
    if (!data || !documentId) return;
    setDownloading(true);
    try {
      const blob = owner ? await downloadFinalLetter(letterId) : await apiDownload(`/letters/${letterId}/signed-document`);
      saveBlob(blob, `${data.letterNumber.replace(/[/\\]/g, "-")}.pdf`);
      onShowNotification?.("Dokumen final berhasil diunduh.");
    } catch (cause) {
      onShowNotification?.(
        cause instanceof ApiError ? cause.message : "Dokumen tidak dapat diunduh.",
      );
    } finally {
      setDownloading(false);
    }
  }, [data, documentId, letterId, onShowNotification, owner]);

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 py-10 flex-1">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="mt-4 text-xs font-semibold text-[#1e3a8a] hover:underline cursor-pointer"
        >
          Kembali ke dashboard
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-8 py-10 flex-1">
        <p className="text-sm text-slate-500">Memuat detail pelacakan…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 px-4 sm:px-8 py-6 flex-1 bg-[#f8fafc]">
      <HeaderBanner
        letterNumber={data.letterNumber}
        title={data.title}
        organization={data.organization}
        submittedAt={data.submittedAt}
        currentStageNumber={data.currentStageNumber}
        totalStages={data.totalStages}
        currentStageName={data.currentStageName}
        progressPercent={data.progressPercent}
        estimatedCompletion={data.estimatedCompletion}
        stageStatuses={data.stages.map((stage) => stage.status)}
        canDownloadDocument={documentId !== null}
        downloading={downloading}
        onBackToDashboard={onBackToDashboard}
        onBackToLetters={onBackToLetters}
        onDownloadDraft={() => void handleDownloadDocument()}
      />

      {data.totalStages > 0 && <SignedLetterPreview key={`${letterId}:${reload}`} letterId={letterId} refresh={reload} />}
      {workflowSnapshot && <LetterActions key={`${workflowSnapshot.version}:${reload}`} workflow={workflowSnapshot} owner={owner} onChanged={() => setReload((value) => value + 1)} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <BureaucracyTimeline stages={data.stages} />
        </div>

        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          <DocumentSummaryCard summary={data.summary} />

          <AuditTrailCard logs={data.auditTrail} letterNumber={data.letterNumber} />
        </div>
      </div>
    </div>
  );
}
