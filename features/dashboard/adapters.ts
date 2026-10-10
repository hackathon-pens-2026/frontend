import { formatDate, letterStatusLabel, letterTypeLabel } from "@/lib/display/letter";
import type { LetterSummaryDto } from "@/lib/api/types";
import type { DashboardLetter } from "./types";

export function toDashboardLetter(letter: LetterSummaryDto): DashboardLetter {
  const statusMap: Record<LetterSummaryDto["status"], DashboardLetter["status"]> = {
    Completed: "approved",
    NeedsRevision: "rejected",
    Rejected: "rejected",
    ProcessingFailed: "rejected",
    InProgress: "review",
    Finalizing: "review",
    AwaitingResourceResolution: "review",
    Draft: "pending",
    Cancelled: "pending",
    Revoked: "pending",
  };
  return {
    id: letter.id,
    no: letter.number,
    title: letter.title,
    category: letterTypeLabel(letter.typeId),
    date: formatDate(letter.submittedAt),
    stage: letter.activeTask
      ? (letter.activeTask.positionName ?? `Tahap ${letter.activeTask.order}`)
      : letterStatusLabel(letter.status),
    status: statusMap[letter.status],
    completedTasks: letter.completedTasks,
    totalTasks: letter.totalTasks,
    finalDocumentId: null,
    dueAt: letter.activeTask?.dueAt ?? null,
    isOverdue: letter.activeTask?.isOverdue ?? false,
    version: letter.version,
    revisionId: letter.revisionId,
    contentHash: "",
  };
}
