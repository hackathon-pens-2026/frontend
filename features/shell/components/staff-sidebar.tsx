"use client";

import React from "react";
import Link from "next/link";
import { NavView } from "../types";
import {
  DashboardIcon,
  InboxIcon,
  SubmissionsIcon,
  DelegationIcon,
  HelpCircleIcon,
  MailIcon,
  SignItIcon,
} from "@/components/ui";
import { UserSwitcher } from "./user-switcher";
import { SidebarFrame } from "./sidebar-frame";

interface StaffSidebarProps {
  view: NavView;
  onChange: (view: NavView) => void;
  pendingCount?: number;
}

export function StaffSidebar({
  view,
  onChange,
  pendingCount = 0,
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
    <SidebarFrame>
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pb-6">
        <SignItIcon className="size-10 rounded-xl shadow-lift" />
        <div className="leading-tight">
          <div className="text-[18px] font-extrabold tracking-tight text-white">
            SignIt<span className="text-gold">!</span>
          </div>
          <div className="text-[11px] font-medium text-slate-400">
            PENS · e-Approval
          </div>
        </div>
      </div>

      {/* User Switcher Dropdown */}
      <UserSwitcher />

      {/* Nav Menu */}
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Menu Utama
      </div>
      <nav className="flex flex-col gap-1">
        <Link href="/ruangan" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-body text-surface">Jadwal Fasilitas</Link>
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
    </SidebarFrame>
  );
}
