"use client";

import React from "react";
import Link from "next/link";
import {
  DashboardIcon,
  FileTextIcon,
  HelpCircleIcon,
  MailIcon,
  PenToolIcon,
  ShieldCheckIcon,
  SignItIcon,
  SparklesIcon,
} from "@/components/ui";

interface StudentSidebarProps {
  currentPath?: string;
}

export function StudentSidebar({ currentPath = "/surat/baru" }: StudentSidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dasbor Beranda",
      href: "/",
      icon: DashboardIcon,
    },
    {
      id: "assistant",
      label: "Asisten Surat AI",
      href: "/surat/baru",
      icon: SparklesIcon,
      highlight: true,
    },
    {
      id: "letters",
      label: "Surat Saya",
      href: "/#my-letters",
      icon: FileTextIcon,
      badge: 3,
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-midnight px-4 py-5 select-none text-white shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 pb-5">
        <Link href="/" className="group flex items-center gap-3">
          <SignItIcon className="size-10 rounded-xl shadow-lift" />
          <div className="leading-tight">
            <div className="text-[18px] font-extrabold tracking-tight text-white group-hover:text-gold transition-colors">
              SignIt<span className="text-gold">!</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">
              Portal Mahasiswa PENS
            </div>
          </div>
        </Link>
      </div>

      {/* User Identity Card */}
      <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex size-9 items-center justify-center rounded-full bg-navy text-micro font-bold text-white ring-1 ring-white/20">
              MF
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-midnight bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-body font-semibold text-white">
              M. Fajrul
            </div>
            <div className="truncate font-mono text-[11px] text-slate-400">
              2103191001
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
          <span className="max-w-[120px] truncate text-[11px] text-slate-400">
            D4 T. Informatika
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <ShieldCheckIcon className="size-3 text-emerald-400" />
            <span>SSO Valid</span>
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Menu Utama
      </div>
      <nav className="flex flex-col gap-1.5" aria-label="Menu Mahasiswa">
        {navItems.map((item) => {
          const isActive =
            (item.href === "/surat/baru" && currentPath === "/surat/baru") ||
            (item.href === "/" && currentPath === "/");

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-body font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-full bg-gold" />
              )}
              <item.icon
                className={`size-[18px] ${
                  isActive
                    ? item.highlight
                      ? "text-gold"
                      : "text-white"
                    : "text-slate-400"
                }`}
                strokeWidth={2}
              />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-gold px-1.5 py-px text-[11px] font-bold text-midnight tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Support & Info */}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
        <Link
          href="/"
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-body font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <HelpCircleIcon className="size-[18px]" />
          <span>Panduan Mahasiswa</span>
        </Link>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-slate-500">
          <MailIcon className="size-3.5" />
          <span>Pemberitahuan via email SSO</span>
        </div>
      </div>
    </aside>
  );
}
export default StudentSidebar;
