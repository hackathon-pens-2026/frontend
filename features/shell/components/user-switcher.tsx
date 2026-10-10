"use client";

import React, { useId, useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth/session-provider";
import { DEMO_PERSONAS, type DemoPersona } from "@/lib/auth/personas";
import { destinationByPosition } from "@/lib/auth/routing";
import type { UiSurface } from "@/lib/api/types";

export function UserSwitcher() {
  const { user, activePosition, currentPersonaId, switchUser, logout } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownId = useId();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const activePersona =
    DEMO_PERSONAS.find((p) => p.email === user?.email) ??
    DEMO_PERSONAS.find((p) => p.id === currentPersonaId) ??
    DEMO_PERSONAS[0];

  function handleSelect(persona: DemoPersona) {
    switchUser(persona.id);
    setOpen(false);
  }

  function initialsOf(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return (first + second).toUpperCase();
  }

  function destinationLabel(posCode: string, surface: UiSurface): string {
    const dest = destinationByPosition(posCode, surface);
    if (dest === "/") return "Dasbor Mahasiswa";
    if (dest === "/persetujuan") return "Kotak Persetujuan";
    if (dest === "/manajemen") return "Portal Manajemen";
    return dest;
  }

  return (
    <div className="relative mb-5 shrink-0" ref={dropdownRef}>
      {/* Trigger Button: User Card + Dropdown Trigger */}
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition-colors hover:border-gold/50 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-gold cursor-pointer"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
      >
        <div className="relative shrink-0">
          <span className="flex size-9 items-center justify-center rounded-full bg-navy text-micro font-bold text-white ring-1 ring-white/20 group-hover:ring-gold/60 transition-colors">
            {initialsOf(user?.name ?? activePersona.name)}
          </span>
          <span aria-hidden="true" className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-midnight bg-ok" />
        </div>

        <div className="min-w-0 leading-relaxed">
            <span className="block break-words text-body font-semibold text-white group-hover:text-gold transition-colors">
              {user?.name ?? activePersona.name}
            </span>
            <span className="mt-0.5 block break-words text-micro text-white/70">
              {activePosition?.positionName ?? activePersona.positionName}
            </span>
        </div>
            <svg
              aria-hidden="true"
              className={`mt-1 size-4 shrink-0 text-white/60 transition-transform motion-reduce:transition-none ${open ? "rotate-180 text-gold" : "group-hover:text-white"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          <div className="col-span-3 grid min-w-0 gap-2 border-t border-white/10 pt-2">
            <span
              className="w-fit max-w-full break-words rounded-md border border-white/15 bg-white/10 px-2 py-1 text-micro font-medium text-white/80"
            >
              {activePersona.roleLabel.split("(")[0]?.trim()}
            </span>
            <span className="break-all text-micro text-white/60 tabular-nums">
              NIM/NIP · {user?.nimNip ?? activePersona.nimNip}
            </span>
          </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div id={dropdownId} role="region" aria-label="Ganti peran demo" className="absolute top-full left-0 z-50 mt-1.5 w-full rounded-2xl border border-white/15 bg-midnight p-2 text-white shadow-modal animate-rise">
          <div className="border-b border-white/10 px-3 py-2">
            <div className="text-micro font-bold text-gold uppercase tracking-wider">
              Ganti Jabatan / Peran Demo
            </div>
            <p className="text-micro text-white/60">
              Sistem otomatis mengarahkan ke tampilan sesuai jabatan
            </p>
          </div>

          <div className="max-h-[min(350px,50dvh)] overflow-y-auto overscroll-contain py-1 space-y-1 scroll-thin">
            {DEMO_PERSONAS.map((persona) => {
              const isSelected = persona.id === activePersona.id;
              const primaryAsg = persona.assignments[0];
              const destName = destinationLabel(primaryAsg?.positionCode ?? "", persona.uiSurface);

              return (
                <button
                  key={persona.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => handleSelect(persona)}
                  className={`grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-gold cursor-pointer ${
                    isSelected
                      ? "bg-white/15 text-white ring-1 ring-gold/40"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-micro font-bold text-white ring-1 ring-white/10 mt-0.5">
                    {initialsOf(persona.name)}
                  </span>

                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="break-words text-micro font-medium text-white">
                        {persona.name}
                      </span>
                      {isSelected && (
                        <span className="text-gold text-micro shrink-0 font-bold">✓ Aktif</span>
                      )}
                    </div>
                    <div className="break-words text-micro text-white/60 mt-1">
                      {persona.positionName}
                    </div>
                    <div className="mt-2 grid gap-1.5">
                      <span
                        className="w-fit max-w-full break-words rounded border border-white/15 bg-white/10 px-1.5 py-1 text-micro font-medium text-white/80"
                      >
                        {persona.roleLabel}
                      </span>
                      <span className="break-words text-micro text-gold/80 font-medium">
                        &rarr; {destName}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 border-t border-white/10 pt-2">
            <button type="button" onClick={async () => { setOpen(false); await logout(); }}
              className="flex min-h-11 w-full items-center rounded-lg px-3 text-body font-medium text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold">
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
