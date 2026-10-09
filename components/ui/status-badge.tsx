import React from "react";

export type BaseApprovalStatus =
  | "approved"
  | "review"
  | "pending"
  | "rejected"
  | "delegated"
  | "waiting";

export const statusMap: Record<
  BaseApprovalStatus,
  { label: string; cls: string; dot: string }
> = {
  approved: {
    label: "Disetujui",
    cls: "bg-ok-bg text-emerald-700",
    dot: "bg-ok",
  },
  review: {
    label: "Ditinjau",
    cls: "bg-review-bg text-review",
    dot: "bg-review",
  },
  pending: {
    label: "Menunggu Aksi",
    cls: "bg-pending-bg text-amber-700",
    dot: "bg-pending",
  },
  rejected: {
    label: "Perlu Revisi",
    cls: "bg-reject-bg text-red-600",
    dot: "bg-reject",
  },
  delegated: {
    label: "Didelegasikan",
    cls: "bg-delegate-bg text-violet-700",
    dot: "bg-delegate",
  },
  waiting: {
    label: "Antri",
    cls: "bg-slate-100 text-slate-500",
    dot: "bg-slate-400",
  },
};

export function StatusBadge({ status }: { status: BaseApprovalStatus | string }) {
  const item = statusMap[status as BaseApprovalStatus] || statusMap.waiting;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-medium whitespace-nowrap ${item.cls}`}
    >
      <span className={`size-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}
