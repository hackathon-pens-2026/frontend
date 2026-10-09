import React from "react";
import { ArrowLeftIcon, ArrowRightIcon, SaveIcon } from "./icons";

interface WizardFooterProps {
  onSaveDraft: () => void;
  onBack: () => void;
  onNext: () => void;
  isSavingDraft?: boolean;
}

export function WizardFooter({
  onSaveDraft,
  onBack,
  onNext,
  isSavingDraft = false,
}: WizardFooterProps) {
  return (
    <footer className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-lg">
      <div className="mx-auto flex h-18 max-w-[1240px] items-center justify-between px-8">
        {/* Left: Save Draft Action */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSaveDraft}
            disabled={isSavingDraft}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <SaveIcon size={15} />
            <span>{isSavingDraft ? "Menyimpan..." : "Simpan sebagai Draf"}</span>
          </button>
          <span className="hidden sm:inline text-xs text-slate-400 font-medium tabular-nums">
            Draf tersimpan otomatis · baru saja
          </span>
        </div>

        {/* Right: Navigation Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors cursor-pointer"
          >
            <ArrowLeftIcon size={14} />
            <span>Kembali</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1e3a8a] px-5 text-xs font-semibold text-white shadow-xs hover:bg-[#172554] transition-colors cursor-pointer"
          >
            <span>Lanjut ke Rantai Approval</span>
            <ArrowRightIcon size={14} />
          </button>
        </div>
      </div>
    </footer>
  );
}
