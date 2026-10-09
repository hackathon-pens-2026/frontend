"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  ChevronDownIcon,
  ExternalDutyIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/ui";

export interface HeaderStaffProfile {
  name: string;
  short: string;
  role: string;
  nip: string;
}

interface StaffHeaderProps {
  profile: HeaderStaffProfile;
  onNew: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
}

export function StaffHeader({
  profile,
  onNew,
  searchQuery = "",
  onSearchChange,
}: StaffHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-line bg-white/85 px-10 lg:px-20 backdrop-blur">
      {/* Search Input */}
      <div className="relative w-full max-w-[420px]">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Cari dokumen, nomor surat, atau NRP…"
          className="h-11 w-full rounded-lg border border-line bg-canvas pr-3 pl-9 text-body outline-none placeholder:text-slate-400 focus:border-navy focus:bg-white focus:ring-4 focus:ring-navy/10"
        />
      </div>

      {/* Right Controls */}
      <div className="ml-auto flex items-center gap-4">
        {/* New Request Button */}
        <button
          onClick={onNew}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-navy px-4 text-body font-semibold text-white shadow-card hover:bg-[#1a3278] cursor-pointer"
        >
          <PlusIcon className="size-4" />
          <span>Ajukan Dokumen</span>
        </button>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            className="flex h-11 items-center gap-3 rounded-lg pr-2 pl-1 hover:bg-slate-100 cursor-pointer"
          >
            <Avatar name={profile.short} size={36} />
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-body font-semibold text-midnight">
                {profile.short}
              </div>
              <div className="flex items-center gap-1 text-micro text-slate-500">
                <span className="size-1.5 rounded-full bg-ok" />
                <span>PENS SSO</span>
              </div>
            </div>
            <ChevronDownIcon className="size-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="animate-rise absolute right-0 mt-2 w-[290px] rounded-xl border border-line bg-white p-2 shadow-modal">
              {/* User info */}
              <div className="border-b border-line px-3 pt-2 pb-3">
                <div className="text-body font-semibold">{profile.name}</div>
                <div className="text-micro text-slate-500">{profile.role}</div>
                <div className="mt-1 text-micro text-slate-400 tabular-nums">
                  NIP {profile.nip}
                </div>
              </div>

              {/* Quick portal switcher */}
              <div className="border-b border-line py-1">
                <Link
                  href="/"
                  className="flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-body text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <ExternalDutyIcon className="size-4 text-navy" />
                  <span className="font-medium">Beralih ke Portal Mahasiswa</span>
                </Link>
              </div>

              {/* Logout SSO */}
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="mt-1 flex h-11 w-full items-center gap-2 rounded-lg px-3 text-body text-red-600 hover:bg-reject-bg cursor-pointer"
              >
                <LogoutIcon className="size-4" />
                <span>Keluar dari SSO</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
