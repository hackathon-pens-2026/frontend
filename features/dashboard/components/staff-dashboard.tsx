"use client";

import React from "react";
import {
  Avatar,
  Button,
  Card,
  CardHeader,
  SlaBadge,
  StatusBadge,
  ArrowRightIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckIcon,
  AlertCircleIcon,
  ExternalDutyIcon,
} from "@/components/ui";
import type { BaseApprovalStatus } from "@/components/ui";
import { useSession } from "@/lib/auth/session-provider";
import {
  formatDate,
  letterStatusLabel,
  letterStatusToBadge,
} from "@/lib/display/letter";
import type { LetterSummaryDto } from "@/lib/api/types";

export interface PriorityItem {
  id: string;
  number: string;
  title: string;
  applicant: string;
  unit: string;
  slaHours: number;
  slaTotal: number;
  status: BaseApprovalStatus | string;
  priority?: boolean;
}

interface StaffDashboardProps {
  priorityLetters: PriorityItem[];
  pendingCount: number;
  overdueCount: number;
  myLetters: LetterSummaryDto[];
  loading?: boolean;
  onGoToInbox: () => void;
  onGoToDelegation: () => void;
  onGoToSubmissions: () => void;
  onOpenLetter: (letterId: string) => void;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

export function StaffDashboard({
  priorityLetters,
  pendingCount,
  overdueCount,
  myLetters,
  loading = false,
  onGoToInbox,
  onGoToDelegation,
  onGoToSubmissions,
  onOpenLetter,
}: StaffDashboardProps) {
  const { user } = useSession();
  const firstName = (user?.name ?? "").split(" ")[0];
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const completedCount = myLetters.filter((l) => l.status === "Completed").length;
  const revisionCount = myLetters.filter((l) => l.status === "NeedsRevision").length;

  const metrics = [
    {
      label: "Menunggu Tanda Tangan",
      value: `${pendingCount}`,
      delta: "tugas aktif di kotak persetujuan",
      icon: ClockIcon,
      tone: "text-amber-600 bg-pending-bg",
    },
    {
      label: "Melewati SLA",
      value: `${overdueCount}`,
      delta: overdueCount > 0 ? "perlu tindakan segera" : "semua dalam batas waktu",
      icon: AlertCircleIcon,
      tone: "text-red-500 bg-reject-bg",
    },
    {
      label: "Pengajuan Selesai",
      value: `${completedCount}`,
      delta: "dari pengajuan Anda",
      icon: CheckIcon,
      tone: "text-emerald-600 bg-ok-bg",
    },
    {
      label: "Perlu Revisi",
      value: `${revisionCount}`,
      delta: "dari pengajuan Anda",
      icon: ClockIcon,
      tone: "text-review bg-review-bg",
    },
  ];

  return (
    <div className="animate-rise space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-micro font-medium tracking-wide text-slate-500 uppercase">
            {today}
          </p>
          <h1 className="mt-1 text-display font-bold text-midnight">
            {greeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-body text-slate-500">
            {loading ? (
              "Memuat data dari server…"
            ) : (
              <>
                Ada{" "}
                <span className="font-semibold text-midnight">
                  {pendingCount} dokumen
                </span>{" "}
                menunggu tanda tangan Anda
                {overdueCount > 0
                  ? ` — ${overdueCount} di antaranya melewati batas SLA.`
                  : "."}
              </>
            )}
          </p>
        </div>
        <Button variant="gold" onClick={onGoToInbox}>
          <span>Mulai Tanda Tangan</span>
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-5">
              <div className="flex items-start justify-between">
                <span className="text-body font-medium text-slate-500">
                  {m.label}
                </span>
                <span
                  className={`flex size-9 items-center justify-center rounded-lg ${m.tone}`}
                >
                  <Icon className="size-[18px]" />
                </span>
              </div>
              <div className="mt-3 text-[32px] leading-10 font-bold tracking-tight text-midnight tabular-nums">
                {m.value}
              </div>
              <div className="mt-1 text-micro font-medium text-slate-500">
                {m.delta}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-12 p-6">
          <CardHeader
            title="Prioritas Hari Ini"
            action={
              <button
                onClick={onGoToInbox}
                className="flex items-center gap-1 text-body font-semibold text-navy hover:underline cursor-pointer"
              >
                <span>Lihat semua</span>
                <ChevronRightIcon className="size-4" />
              </button>
            }
          />
          <div className="mt-4 divide-y divide-line">
            {loading ? (
              <div className="py-8 text-center text-body text-slate-500">
                Memuat tugas dari server…
              </div>
            ) : priorityLetters.length === 0 ? (
              <div className="py-8 text-center text-body text-slate-500">
                Semua surat prioritas telah ditindaklanjuti.
              </div>
            ) : (
              priorityLetters.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onOpenLetter(item.id)}
                  className="group flex w-full items-center gap-4 py-4 text-left first:pt-2 last:pb-0 cursor-pointer"
                >
                  <Avatar name={item.applicant || "Pemohon"} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-body font-semibold text-midnight group-hover:text-navy">
                        {item.title}
                      </span>
                      {item.priority && (
                        <span className="rounded-full bg-midnight px-2 py-px text-[10px] font-bold tracking-wider text-gold uppercase">
                          Lewat SLA
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate text-micro text-slate-500">
                      {item.applicant}
                      {item.unit ? ` · ${item.unit}` : ""} ·{" "}
                      <span className="tabular-nums">{item.number}</span>
                    </div>
                  </div>
                  <SlaBadge hours={item.slaHours} total={item.slaTotal} />
                  <span className="flex h-11 items-center rounded-lg border border-line px-4 text-micro font-semibold text-midnight group-hover:border-navy group-hover:bg-navy group-hover:text-white transition-colors">
                    Tinjau
                  </span>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="lg:col-span-8 p-6">
          <CardHeader
            title="Pengajuan Saya"
            action={
              <button
                onClick={onGoToSubmissions}
                className="flex items-center gap-1 text-body font-semibold text-navy hover:underline cursor-pointer"
              >
                <span>Semua pengajuan</span>
                <ChevronRightIcon className="size-4" />
              </button>
            }
          />
          <div className="mt-4 divide-y divide-line">
            {myLetters.length === 0 ? (
              <div className="py-8 text-center text-body text-slate-500">
                Belum ada pengajuan atas nama Anda.
              </div>
            ) : (
              myLetters.slice(0, 5).map((letter) => (
                <div key={letter.id} className="flex items-center gap-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-body font-semibold text-midnight">
                      {letter.title}
                    </div>
                    <div className="mt-0.5 text-micro text-slate-500">
                      {letter.number} · {formatDate(letter.submittedAt)} ·{" "}
                      {letterStatusLabel(letter.status)}
                    </div>
                  </div>
                  <StatusBadge status={letterStatusToBadge(letter.status)} />
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="lg:col-span-4 overflow-hidden rounded-xl bg-midnight p-6 text-white shadow-lift flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-delegate/20 text-violet-300">
              <ExternalDutyIcon className="size-5" />
            </div>
            <h3 className="mt-4 text-title font-semibold">
              Dinas luar minggu depan?
            </h3>
            <p className="mt-1 text-body text-slate-400">
              Delegasikan wewenang tanda tangan per tugas dari kotak persetujuan
              agar alur birokrasi tidak terhenti.
            </p>
          </div>
          <Button
            variant="gold"
            className="mt-5 w-full"
            onClick={onGoToDelegation}
          >
            Pelajari Delegasi
          </Button>
        </div>
      </div>
    </div>
  );
}
