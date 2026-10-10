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
  SignItIcon,
  SparklesIcon,
} from "@/components/ui";
import { useSession } from "@/lib/auth/session-provider";
import { listMyLetters } from "@/lib/api/letters";
import { listMyTasks } from "@/lib/api/workflow";
import { UserSwitcher } from "./user-switcher";
import { SidebarFrame } from "./sidebar-frame";

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
  const [loadedLetterCount, setLetterCount] = useState<number>();
  const [loadedPendingCount, setPendingCount] = useState<number>();
  const letterCount = propLetterCount ?? loadedLetterCount;
  const pendingCount = propPendingCount ?? loadedPendingCount;

  useEffect(() => {
    if (propLetterCount !== undefined) return;
    let active = true;
    listMyLetters(1, 50)
      .then((res) => {
        if (active) setLetterCount(res.items.filter((l) => l.status !== "Completed" && l.status !== "Rejected").length);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propLetterCount, user?.id]);

  useEffect(() => {
    if (propPendingCount !== undefined) return;
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
  }, [propPendingCount, capabilities, user?.id]);

  const canApprove = capabilities.some((capability) => capability === "Signer" || capability === "Approver");

  const navItems = [
    {
      id: "dashboard",
      label: "Dasbor Beranda",
      href: "/",
      icon: DashboardIcon,
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
    <SidebarFrame>
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

      {/* Nav Menu */}
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Menu Utama
      </div>
      <nav className="shrink-0" aria-label="Menu Mahasiswa">
        <ul className="flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isAssistant = currentPath === "/surat/baru";
          const isActive =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(`${item.href}/`) && !isAssistant);

          return (
            <li key={item.id}>
            <Link
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-body font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold ${
                isActive
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {isActive && (
                <span className="absolute top-2 bottom-2 -left-4 w-1 rounded-r-full bg-gold" />
              )}
              <item.icon
                aria-hidden="true"
                className={`size-[18px] shrink-0 ${isActive ? "text-white" : "text-white/60"}`}
                strokeWidth={2}
              />
              <span className="min-w-0 flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="rounded-full bg-gold px-1.5 py-px text-[11px] font-bold text-midnight tabular-nums">
                  {item.badge}
                </span>
              )}
            </Link>
            {item.id === "letters" && (
              <ul aria-label="Submenu Surat Saya" className="ml-5 mt-1 border-l border-white/15 pl-3">
                <li>
                  <Link
                    href="/surat/baru"
                    aria-current={isAssistant ? "page" : undefined}
                    className={`flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-micro font-medium transition-colors focus-visible:outline-2 focus-visible:outline-gold ${isAssistant ? "bg-white/10 text-gold" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                  >
                    <SparklesIcon aria-hidden="true" className="size-4 shrink-0" />
                    <span>Asisten Surat AI</span>
                  </Link>
                </li>
              </ul>
            )}
            </li>
          );
        })}
        </ul>
      </nav>

      {/* Footer Support & Info */}
      <div className="mt-auto shrink-0 space-y-1 border-t border-white/10 pt-3">
        <Link
          href="/"
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-body font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
        >
          <HelpCircleIcon className="size-[18px]" />
          <span>Panduan Mahasiswa</span>
        </Link>
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-slate-500">
          <MailIcon className="size-3.5" />
          <span>Pemberitahuan via email</span>
        </div>
      </div>
    </SidebarFrame>
  );
}
export default StudentSidebar;
