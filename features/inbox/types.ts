import type { BaseApprovalStatus, TimelineStep } from "@/components/ui";
import type { WorkflowAction, WorkflowTaskDto } from "@/lib/api/types";
import {
  formatDateTime,
  hoursBetween,
  letterTypeLabel,
  taskStatusToBadge,
} from "@/lib/display/letter";

export type ApprovalStatus = BaseApprovalStatus;
export type ApprovalStep = TimelineStep;

export interface InboxLetter {
  task: WorkflowTaskDto;
  id: string;
  number: string;
  title: string;
  type: string;
  stage: string;
  applicant: string;
  unit: string;
  submitted: string;
  slaHours: number;
  slaTotal: number;
  status: ApprovalStatus;
  allowedActions: WorkflowAction[];
}

const SLA_FALLBACK_HOURS = 72;

export function toInboxLetter(task: WorkflowTaskDto): InboxLetter {
  const now = new Date().toISOString();
  const total = task.activatedAt
    ? Math.max(
        hoursBetween(task.activatedAt, task.dueAt ?? now),
        SLA_FALLBACK_HOURS,
      )
    : SLA_FALLBACK_HOURS;
  return {
    task,
    id: task.letterId,
    number: task.number,
    title: task.title,
    type: letterTypeLabel(task.typeId),
    stage: task.positionName ?? `Tahap ${task.order}`,
    applicant: task.requesterName,
    unit: task.organizationName,
    submitted: formatDateTime(task.activatedAt ?? task.dueAt),
    slaHours: task.dueAt ? hoursBetween(now, task.dueAt) : total,
    slaTotal: total,
    status: taskStatusToBadge(task.status),
    allowedActions: task.allowedActions,
  };
}

export function workflowSteps(tasks: WorkflowTaskDto[]): ApprovalStep[] {
  return [...tasks]
    .sort((a, b) => a.order - b.order)
    .map((task) => ({
      role: task.positionName ?? `Tahap ${task.order}`,
      name: task.assignedUserName || "Petugas",
      status: taskStatusToBadge(task.status),
      at: task.actedAt ? formatDateTime(task.actedAt) : undefined,
      note: task.comment ?? undefined,
    }));
}
