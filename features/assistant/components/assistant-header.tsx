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
} from "@/components/ui";
import { useSession } from "@/lib/auth/session-provider";

interface AssistantHeaderProps {
  isSaving?: boolean;
  lastSavedTime?: string | null;
}

export function AssistantHeader({
  isSaving = false,
  lastSavedTime = null,
}: AssistantHeaderProps) {
  const { user } = useSession();
  const userName = user?.name ?? "Mahasiswa";
  const savedLabel = lastSavedTime
    ? `Draf tersimpan · ${lastSavedTime}`
    : "Draf belum disimpan";

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-white px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-body">
        <Link
          href="/"
          className="font-medium text-slate-500 hover:text-navy transition-colors"
        >
          Beranda
        </Link>
        <ChevronRightIcon className="size-3.5 text-slate-300" />
        <Link
          href="/surat"
          className="font-medium text-slate-500 hover:text-navy transition-colors"
        >
          Surat Saya
        </Link>
        <ChevronRightIcon className="size-3.5 text-slate-300" />
        <span className="font-semibold text-midnight">Buat Surat Baru</span>
      </nav>

      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-semibold transition-colors ${
          isSaving
            ? "bg-slate-100 text-slate-500"
            : lastSavedTime
            ? "bg-green-50 text-green-800 ring-1 ring-green-200"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {isSaving ? (
          <ClockIcon className="size-3.5 animate-spin" />
        ) : (
          <CheckIcon className="size-3.5" />
        )}
        <span>{isSaving ? "Menyimpan…" : savedLabel}</span>
      </span>

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
          <span>Kembali ke Dasbor</span>
        </Link>

        <Avatar name={userName} size={32} />
      </div>
    </header>
  );
}
export default AssistantHeader;
