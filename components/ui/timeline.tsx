import React from "react";
import { BaseApprovalStatus } from "./status-badge";
import {
  CheckIcon,
  ClockIcon,
  XIcon,
  DelegationIcon,
  AlertCircleIcon,
} from "./icons";

export interface TimelineStep {
  role: string;
  name: string;
  status: BaseApprovalStatus | string;
  at?: string;
  note?: string;
  delegate?: {
    to: string;
    reason: string;
  };
}

export type ApprovalStep = TimelineStep;

const timelineStyles: Record<
  string,
  { Icon: React.FC<{ className?: string; strokeWidth?: number }>; cls: string }
> = {
  approved: { Icon: CheckIcon, cls: "bg-ok text-white" },
  review: { Icon: ClockIcon, cls: "bg-review text-white" },
  pending: {
    Icon: ClockIcon,
    cls: "bg-gold text-midnight ring-4 ring-gold/20",
  },
  rejected: { Icon: XIcon, cls: "bg-reject text-white" },
  delegated: { Icon: DelegationIcon, cls: "bg-delegate text-white" },
  waiting: { Icon: AlertCircleIcon, cls: "bg-white text-slate-400 ring-1 ring-line" },
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0">
      {steps.map((step, idx) => {
        const { Icon, cls } = timelineStyles[step.status] || timelineStyles.waiting;
        const isLast = idx === steps.length - 1;

        return (
          <li key={idx} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast && (
              <span
                className={`absolute top-7 bottom-0 left-[13px] w-0.5 ${
                  step.status === "approved" ? "bg-ok/40" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full ${cls}`}
            >
              <Icon className="size-3.5" strokeWidth={2.6} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-body font-semibold text-midnight">
                  {step.role}
                </span>
                {step.at && (
                  <span className="text-micro text-slate-400 tabular-nums">
                    {step.at}
                  </span>
                )}
              </div>
              <div className="text-micro text-slate-500">{step.name}</div>
              {step.note && (
                <div className="mt-2 rounded-lg border border-red-100 bg-reject-bg px-3 py-2 text-micro text-red-700">
                  “{step.note}”
                </div>
              )}
              {step.delegate && (
                <div className="mt-1.5 rounded-lg border border-violet-100 bg-delegate-bg px-2.5 py-1.5 text-micro text-violet-800">
                  Dialihkan ke: <b>{step.delegate.to}</b> ({step.delegate.reason})
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
