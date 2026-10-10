"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function SidebarFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);
  const open = openForPath !== null && openForPath === pathname;
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenForPath(null);
      trigger.current?.focus();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <>
      <button ref={trigger} type="button" aria-label={open ? "Tutup navigasi" : "Buka navigasi"} aria-expanded={open} aria-controls={id}
        onClick={() => setOpenForPath(open ? null : pathname)}
        className={`fixed left-4 top-3 z-50 flex size-10 items-center justify-center rounded-lg border focus-visible:outline-2 focus-visible:outline-gold md:hidden ${open ? "border-white/15 bg-midnight text-white hover:bg-navy" : "border-line bg-surface text-midnight shadow-card hover:bg-canvas"}`}>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <path d={open ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      {open && <button type="button" aria-label="Tutup menu navigasi" onClick={() => setOpenForPath(null)} className="fixed inset-0 z-30 bg-midnight/50 md:hidden" />}
      <aside id={id} onClick={(event) => {
        if ((event.target as HTMLElement).closest("a, nav button")) setOpenForPath(null);
      }} className={`fixed inset-y-0 left-0 z-40 w-[260px] max-w-[calc(100vw-3rem)] flex-col overflow-y-auto overscroll-contain bg-midnight px-4 pb-5 pt-16 text-white shadow-lift md:flex md:pt-5 ${open ? "flex" : "hidden"}`}>
        {children}
      </aside>
    </>
  );
}
