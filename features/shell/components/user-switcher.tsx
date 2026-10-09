"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession } from "@/lib/auth/session-provider";
import { DEMO_PERSONAS, type DemoPersona } from "@/lib/auth/personas";

export function UserSwitcher() {
  const { user, currentPersonaId, switchUser } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const activePersona =
    DEMO_PERSONAS.find((p) => p.id === currentPersonaId) ??
    DEMO_PERSONAS.find((p) => p.email === user?.email) ??
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

  return (
    <div className="relative mb-4" ref={dropdownRef}>
      {/* Trigger Button: User Card + Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-left transition-all hover:border-gold/50 hover:bg-white/[0.09] cursor-pointer"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="relative shrink-0">
          <span className="flex size-9 items-center justify-center rounded-full bg-navy text-micro font-bold text-white ring-1 ring-white/20 group-hover:ring-gold/60 transition-colors">
            {initialsOf(activePersona.name)}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-midnight bg-emerald-500" />
        </div>

        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-body font-semibold text-white group-hover:text-gold transition-colors">
              {activePersona.name}
            </span>
            <svg
              className={`size-4 text-slate-400 transition-transform ${open ? "rotate-180 text-gold" : "group-hover:text-white"}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="mt-0.5 truncate text-[11px] text-slate-300">
            {activePersona.positionName}
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`inline-block rounded-md border px-1.5 py-0.2 text-[10px] font-medium ${activePersona.badgeColor ?? "bg-slate-700 text-slate-200 border-slate-600"}`}
            >
              {activePersona.roleLabel.split("(")[0]?.trim()}
            </span>
            <span className="font-mono text-[10px] text-slate-400">
              {activePersona.nimNip}
            </span>
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-[290px] rounded-2xl border border-white/15 bg-[#0f172a] p-2 text-white shadow-2xl backdrop-blur-xl animate-rise">
          <div className="border-b border-white/10 px-3 py-2">
            <div className="text-micro font-bold text-gold uppercase tracking-wider">
              Ganti Akun Demo
            </div>
            <p className="text-[11px] text-slate-400">
              Pilih peran untuk menguji alur persetujuan surat
            </p>
          </div>

          <div className="max-h-[340px] overflow-y-auto py-1 space-y-1 scrollbar-thin">
            {DEMO_PERSONAS.map((persona) => {
              const isSelected = persona.id === activePersona.id;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handleSelect(persona)}
                  className={`flex w-full items-start gap-3 rounded-xl px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white/15 text-white ring-1 ring-gold/40"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-200 ring-1 ring-white/10 mt-0.5">
                    {initialsOf(persona.name)}
                  </span>

                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-[13px] font-medium text-white">
                        {persona.name}
                      </span>
                      {isSelected && (
                        <span className="text-gold text-micro shrink-0">✓</span>
                      )}
                    </div>
                    <div className="truncate text-[11px] text-slate-400 mt-0.5">
                      {persona.positionName}
                    </div>
                    <span
                      className={`inline-block mt-1 rounded border px-1.5 py-px text-[9.5px] font-semibold ${persona.badgeColor ?? "bg-slate-700 text-slate-200 border-slate-600"}`}
                    >
                      {persona.roleLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
