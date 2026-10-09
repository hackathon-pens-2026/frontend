"use client";

import React from "react";
import { NavView } from "../types";
import {
  DashboardIcon,
  InboxIcon,
  SubmissionsIcon,
  DelegationIcon,
  HelpCircleIcon,
  MailIcon,
  PenToolIcon,
} from "@/components/ui";

interface StaffSidebarProps {
  view: NavView;
  onChange: (view: NavView) => void;
  pendingCount?: number;
}

export function StaffSidebar({
  view,
  onChange,
  pendingCount = 4,
}: StaffSidebarProps) {
  const navItems = [
    { id: "dashboard" as NavView, label: "Dasbor", icon: DashboardIcon },
    {
      id: "inbox" as NavView,
      label: "Kotak Persetujuan",
      icon: InboxIcon,
      badge: pendingCount,
    },
    {
      id: "submissions" as NavView,
      label: "Pengajuan Saya",
      icon: SubmissionsIcon,
    },
    {
      id: "delegation" as NavView,
      label: "Delegasi & Dinas Luar",
      icon: DelegationIcon,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-midnight px-4 py-5">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="relative flex size-10 items-center justify-center rounded-xl bg-navy shadow-lift">
          <PenToolIcon className="size-5 text-white" strokeWidth={2.4} />
          <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-midnight bg-gold" />
        </div>
        <div className="leading-tight">
          <div className="text-[18px] font-extrabold tracking-tight text-white">
            SignIt<span className="text-gold">!</span>
          </div>
          <div className="text-[11px] font-medium text-slate-400">
            PENS · e-Approval
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Menu Utama
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ id, label, icon: Icon, badge }) => {
          const isActive = view === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-body font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-full bg-gold" />
              )}
              <Icon
                className={`size-[18px] ${isActive ? "text-gold" : ""}`}
                strokeWidth={2}
              />
              <span className="flex-1 text-left">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="rounded-full bg-gold px-1.5 py-px text-[11px] leading-4 font-bold text-midnight tabular-nums">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Support & Info */}
      <div className="mt-auto space-y-1">
        <button
          type="button"
          className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-body font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 cursor-pointer"
        >
          <HelpCircleIcon className="size-[18px]" />
          <span>Pusat Bantuan</span>
        </button>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-slate-500">
          <MailIcon className="size-3.5" />
          <span>Notifikasi dikirim via email resmi</span>
        </div>
      </div>
    </aside>
  );
}
