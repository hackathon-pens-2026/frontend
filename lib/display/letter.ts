import type { BaseApprovalStatus } from "@/components/ui";
import type { LetterStatus, WorkflowTaskStatus } from "@/lib/api/types";

export const LETTER_TYPE_LABELS: Record<string, string> = {
  "peminjaman-ruangan": "Peminjaman Ruangan",
  "peminjaman-barang": "Peminjaman Barang",
  proposal: "Proposal Kegiatan",
  lpj: "Laporan Pertanggungjawaban",
};

export function letterTypeLabel(typeId: string): string {
  return LETTER_TYPE_LABELS[typeId] ?? typeId.replace(/[-_]/g, " ");
}

export function letterStatusLabel(status: LetterStatus): string {
  const labels: Record<LetterStatus, string> = {
    Draft: "Draf",
    InProgress: "Berjalan",
    NeedsRevision: "Perlu Revisi",
    AwaitingResourceResolution: "Menunggu Resource",
    Finalizing: "Finalisasi",
    ProcessingFailed: "Gagal Diproses",
    Completed: "Selesai",
    Rejected: "Ditolak",
    Cancelled: "Dibatalkan",
    Revoked: "Dicabut",
  };
  return labels[status];
}

export function letterStatusToBadge(status: LetterStatus): BaseApprovalStatus {
  switch (status) {
    case "Completed":
      return "approved";
    case "NeedsRevision":
    case "Rejected":
    case "ProcessingFailed":
      return "rejected";
    case "InProgress":
    case "Finalizing":
      return "review";
    case "AwaitingResourceResolution":
      return "delegated";
    default:
      return "waiting";
  }
}

export function taskStatusToBadge(status: WorkflowTaskStatus): BaseApprovalStatus {
  switch (status) {
    case "Signed":
    case "Approved":
    case "Acknowledged":
      return "approved";
    case "Active":
      return "pending";
    case "Deferred":
      return "delegated";
    case "RevisionRequested":
    case "Rejected":
      return "rejected";
    case "Pending":
      return "waiting";
    default:
      return "waiting";
  }
}

export function taskActionLabel(
  actionType: string,
  action?: string,
): string {
  if (action === "approve") return "Setujui & Tanda Tangani";
  if (action === "sign") return "Tanda Tangani Dokumen";
  if (action === "acknowledge") return "Tandai Diketahui";
  if (actionType === "ApproveAndSign") return "Persetujuan";
  if (actionType === "Sign") return "Tanda Tangan";
  if (actionType === "Acknowledge") return "Konfirmasi";
  return "Tinjauan";
}

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return dateTimeFormatter.format(date);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function hoursBetween(from: string, to: string): number {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, (end - start) / 36e5);
}
