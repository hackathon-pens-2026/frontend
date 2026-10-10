"use client";

import { SearchIcon, XIcon } from "@/components/ui";

export function SubmissionSearch({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full max-w-lg">
      <SearchIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-midnight/50" />
      <input type="search" name="search" aria-label="Cari pengajuan" value={value} onChange={(event) => onChange(event.target.value)}
        placeholder="Cari nomor surat, perihal, atau pemohon…"
        className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-10 text-body text-midnight placeholder:text-midnight/50 focus-visible:outline-2 focus-visible:outline-navy" />
      {value && (
        <button type="button" aria-label="Bersihkan pencarian" onClick={() => onChange("")} className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-lg text-midnight/60 hover:bg-canvas focus-visible:outline-2 focus-visible:outline-navy">
          <XIcon aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
