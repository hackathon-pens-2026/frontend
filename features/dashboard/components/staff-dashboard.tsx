"use client";

import React from "react";
import { StaffActivityItem, StaffProfile } from "../types";
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

export interface PriorityItem {
  id: string;
  title: string;
  applicant: string;
  unit: string;
  slaHours: number;
  slaTotal: number;
  status: "approved" | "review" | "pending" | "rejected" | "delegated" | "waiting";
  priority?: boolean;
}

interface StaffDashboardProps {
  profile: StaffProfile;
  priorityLetters: PriorityItem[];
  activities: StaffActivityItem[];
  onGoToInbox: () => void;
  onGoToDelegation: () => void;
  onOpenLetter: (id: string) => void;
}

export function StaffDashboard({
  profile,
  priorityLetters,
  activities,
  onGoToInbox,
  onGoToDelegation,
  onOpenLetter,
}: StaffDashboardProps) {
  const pendingCount = priorityLetters.filter((l) => l.status === "pending").length;

  const metrics = [
    {
      label: "Menunggu Tanda Tangan",
      value: `${pendingCount}`,
      delta: "2 mendesak",
      icon: ClockIcon,
      tone: "text-amber-600 bg-pending-bg",
    },
    {
      label: "Disetujui Bulan Ini",
      value: "128",
      delta: "+18% vs Mei",
      icon: CheckIcon,
      tone: "text-emerald-600 bg-ok-bg",
    },
    {
      label: "Rata-rata Waktu Proses",
      value: "6,4j",
      delta: "−2,1j lebih cepat",
      icon: ClockIcon,
      tone: "text-review bg-review-bg",
    },
    {
      label: "Perlu Revisi",
      value: "3",
      delta: "dari pengajuan Anda",
      icon: AlertCircleIcon,
      tone: "text-red-500 bg-reject-bg",
    },
  ];

  return (
    <div className="animate-rise space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-micro font-medium tracking-wide text-slate-500 uppercase">
            Rabu, 18 Juni 2025
          </p>
          <h1 className="mt-1 text-display font-bold text-midnight">
            Selamat pagi, {profile.short.split(" ")[0]}
          </h1>
          <p className="mt-1 text-body text-slate-500">
            Ada{" "}
            <span className="font-semibold text-midnight">
              {pendingCount} dokumen
            </span>{" "}
            menunggu tanda tangan Anda — 1 di antaranya mendekati batas SLA.
          </p>
        </div>
        <Button variant="gold" onClick={onGoToInbox}>
          <span>Mulai Tanda Tangan</span>
          <ArrowRightIcon className="size-4" />
        </Button>
      </div>

      {/* Metric Cards */}
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

      {/* Main Grid: Priority Inbox, Activities & External Duty Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Priority Today */}
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
            {priorityLetters.length === 0 ? (
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
                  <Avatar name={item.applicant} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-body font-semibold text-midnight group-hover:text-navy">
                        {item.title}
                      </span>
                      {item.priority && (
                        <span className="rounded-full bg-midnight px-2 py-px text-[10px] font-bold tracking-wider text-gold uppercase">
                          Mendesak
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-micro text-slate-500">
                      {item.applicant} · {item.unit} ·{" "}
                      <span className="tabular-nums">{item.id}</span>
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

        {/* Activity Feed */}
        <Card className="lg:col-span-8 p-6">
          <CardHeader title="Aktivitas Terkini" />
          <ol className="relative mt-5 space-y-5 before:absolute before:top-2 before:bottom-2 before:left-[15px] before:w-px before:bg-line">
            {activities.map((act, i) => (
              <li key={i} className="relative flex items-center gap-4">
                <span className="relative z-10 flex size-8 items-center justify-center rounded-full bg-white ring-1 ring-line">
                  <Avatar name={act.who} size={26} />
                </span>
                <div className="flex-1 text-body text-slate-600">
                  <span className="font-semibold text-midnight">{act.who}</span>{" "}
                  {act.what}{" "}
                  <span className="font-medium text-midnight">{act.doc}</span>
                </div>
                <StatusBadge status={act.status} />
                <span className="w-14 text-right text-micro text-slate-400">
                  {act.when}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        {/* External Duty Banner */}
        <div className="lg:col-span-4 overflow-hidden rounded-xl bg-midnight p-6 text-white shadow-lift flex flex-col justify-between">
          <div>
            <div className="flex size-10 items-center justify-center rounded-lg bg-delegate/20 text-violet-300">
              <ExternalDutyIcon className="size-5" />
            </div>
            <h3 className="mt-4 text-title font-semibold">
              Dinas luar minggu depan?
            </h3>
            <p className="mt-1 text-body text-slate-400">
              Delegasikan wewenang tanda tangan ke Sekretaris Departemen agar alur birokrasi tidak terhenti.
            </p>
          </div>
          <Button
            variant="gold"
            className="mt-5 w-full"
            onClick={onGoToDelegation}
          >
            Atur Delegasi
          </Button>
        </div>
      </div>
    </div>
  );
}
