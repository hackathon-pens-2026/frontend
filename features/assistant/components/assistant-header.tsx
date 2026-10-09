"use client";

import React from "react";
import Link from "next/link";
import {
  Avatar,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  MailIcon,
  PenToolIcon,
} from "@/components/ui";

interface AssistantHeaderProps {
  isSaving?: boolean;
  lastSavedTime?: string;
  userName?: string;
}

export function AssistantHeader({
  isSaving = false,
  lastSavedTime = "14:20",
  userName = "M. Fajrul",
}: AssistantHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-white px-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body">
        <Link
          href="/"
          className="font-medium text-slate-500 hover:text-navy transition-colors"
        >
          Beranda
        </Link>
        <ChevronRightIcon className="size-3.5 text-slate-300" />
        <Link
          href="/#my-letters"
          className="font-medium text-slate-500 hover:text-navy transition-colors"
        >
          Surat Saya
        </Link>
        <ChevronRightIcon className="size-3.5 text-slate-300" />
        <span className="font-semibold text-midnight">
          Buat Surat Baru (Asisten AI)
        </span>
      </nav>

      {/* Auto-save status */}
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-semibold transition-colors ${
          isSaving
            ? "bg-slate-100 text-slate-500"
            : "bg-green-50 text-green-800 ring-1 ring-green-200"
        }`}
      >
        {isSaving ? (
          <ClockIcon className="size-3.5 animate-spin" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
        <span>
          {isSaving ? "Menyimpan…" : `Draf Tersimpan Otomatis · ${lastSavedTime}`}
        </span>
      </span>

      {/* Right action & user profile */}
      <div className="ml-auto flex items-center gap-5">
        <span
          className="hidden sm:inline-flex items-center gap-1.5 text-micro text-slate-400"
          title="Semua notifikasi dikirim melalui email SSO"
        >
          <MailIcon className="size-3.5" />
          <span>Notifikasi via email</span>
        </span>

        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1.5 text-body font-semibold text-navy hover:underline"
        >
          <FileTextIcon className="size-4" />
          <span>Beralih ke Formulir Manual</span>
        </Link>

        <Avatar name={userName} size={32} />
      </div>
    </header>
  );
}
export default AssistantHeader;
