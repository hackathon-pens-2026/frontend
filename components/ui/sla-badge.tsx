import React from "react";
import { ClockIcon } from "./icons";

export function SlaBadge({ hours, total }: { hours: number; total: number }) {
  if (hours <= 0) {
    return (
      <span className="text-micro font-medium text-slate-400">Selesai</span>
    );
  }
  const ratio = hours / total;
  const colorCls =
    ratio < 0.2
      ? "text-red-600 bg-reject-bg"
      : ratio < 0.5
      ? "text-amber-700 bg-pending-bg"
      : "text-slate-600 bg-slate-100";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-micro font-medium tabular-nums ${colorCls}`}
    >
      <ClockIcon className="size-3" />
      {hours}j tersisa
    </span>
  );
}
