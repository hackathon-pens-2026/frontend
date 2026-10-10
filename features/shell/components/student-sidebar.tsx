"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DashboardIcon,
  FileTextIcon,
  InboxIcon,
  HelpCircleIcon,
  MailIcon,
  ShieldCheckIcon,
  SignItIcon,
  SparklesIcon,
  XIcon,
} from "@/components/ui";
import { useSession } from "@/lib/auth/session-provider";
import { SignatureQrPanel } from "@/features/signature/components/signature-qr-panel";
import { listMyLetters } from "@/lib/api/letters";
import { listMyTasks } from "@/lib/api/workflow";
import { UserSwitcher } from "./user-switcher";

interface StudentSidebarProps {
  currentPath?: string;
  letterCount?: number;
  pendingCount?: number;
}

export function StudentSidebar({
  currentPath: propPath,
  letterCount: propLetterCount,
  pendingCount: propPendingCount,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const currentPath = propPath ?? pathname ?? "/";
  const { user, capabilities } = useSession();
  const [qrOpen, setQrOpen] = useState(false);
  const [letterCount, setLetterCount] = useState<number | undefined>(propLetterCount);
  const [pendingCount, setPendingCount] = useState<number | undefined>(propPendingCount);

  useEffect(() => {
    if (propLetterCount !== undefined) {
      setLetterCount(propLetterCount);
      return;
    }
    let active = true;
    listMyLetters(1, 50)
      .then((res) => {
        if (active) setLetterCount(res.items.filter((l) => l.status !== "Completed" && l.status !== "Rejected").length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propLetterCount]);

  useEffect(() => {
    if (propPendingCount !== undefined) {
      setPendingCount(propPendingCount);
      return;
    }
    if (!capabilities.some((c) => c === "Signer" || c === "Approver")) return;
    let active = true;
    listMyTasks(1, 50)
      .then((res) => {
        if (active) setPendingCount(res.items.length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propPendingCount, capabilities]);

  const canApprove = capabilities.some((capability) => capability === "Signer" || capability === "Approver");

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
      href: "/surat",
      icon: FileTextIcon,
      badge: letterCount,
    },
    ...(canApprove
      ? [{ id: "inbox", label: "Persetujuan Saya", href: "/persetujuan", icon: InboxIcon, badge: pendingCount }]
      : []),
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

      {/* User Switcher Dropdown */}
      <UserSwitcher />

      {/* QR Tanda Tangan */}
      <button
        type="button"
        onClick={() => setQrOpen(true)}
        className="mb-5 flex h-11 w-full items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-body font-medium text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer"
      >
        <ShieldCheckIcon className="size-[18px] text-gold" />
        <span>QR Tanda Tangan</span>
      </button>

      {qrOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR tanda tangan"
          className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/60 p-4 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="animate-rise w-full max-w-sm rounded-xl bg-white p-5 text-midnight shadow-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-title font-semibold">QR Tanda Tangan</h2>
              <button
                type="button"
                aria-label="Tutup"
                onClick={() => setQrOpen(false)}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <SignatureQrPanel />
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Menu Utama
      </div>
      <nav className="flex flex-col gap-1.5" aria-label="Menu Mahasiswa">
        {navItems.map((item) => {
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && Boolean(currentPath?.startsWith(item.href)));

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
