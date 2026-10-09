"use client";

import React, { useState } from "react";
import { PersonOption } from "../types";
import { Avatar, CheckIcon, SearchIcon, ShieldCheckIcon } from "@/components/ui";

interface PersonPickerProps {
  title: string;
  people: PersonOption[];
  selected?: string | null;
  onSelect: (person: PersonOption) => void;
  placeholder: string;
}

export function PersonPicker({
  title,
  people,
  selected,
  onSelect,
  placeholder,
}: PersonPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = people.filter((p) =>
    `${p.name} ${p.meta}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="mt-3 w-full max-w-[440px] overflow-hidden rounded-xl border border-line bg-white shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-3 py-2 bg-canvas">
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
          {title}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheckIcon className="size-3 text-emerald-500" />
          <span>Data SSO PENS</span>
        </span>
      </div>

      {/* Search Input */}
      <div className="relative border-b border-line">
        <SearchIcon className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-9 w-full pr-3 pl-8 text-body outline-none placeholder:text-slate-400 bg-white"
        />
      </div>

      {/* Candidate List */}
      <div className="max-h-48 divide-y divide-line overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-3 text-center text-micro text-slate-400">
            Tidak ditemukan akun SSO yang cocok
          </div>
        ) : (
          filtered.map((person) => {
            const isSelected = selected === person.name;
            return (
              <button
                key={person.name}
                type="button"
                onClick={() => onSelect(person)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-green-50/70" : "hover:bg-slate-50"
                }`}
              >
                <Avatar name={person.name} size={30} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-body font-semibold text-midnight">
                    {person.name}
                  </div>
                  <div className="truncate text-micro text-slate-500">
                    {person.meta}
                  </div>
                </div>
                {isSelected ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#15803D] text-white">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                ) : (
                  <span className="size-4 rounded-full border border-slate-300" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
export default PersonPicker;
