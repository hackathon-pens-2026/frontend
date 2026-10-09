import React from "react";
import { WizardStep } from "../types";
import { SparklesIcon, CheckIcon } from "./icons";

interface WizardStepsHeaderProps {
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
  onOpenAiAssistant: () => void;
}

export function WizardStepsHeader({
  currentStep,
  onStepClick,
  onOpenAiAssistant,
}: WizardStepsHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-8 py-5">
        {/* Left: Title & AI Trigger */}
        <div className="max-w-xl">
          <div className="text-xs font-semibold tracking-wider text-amber-600 uppercase">
            Langkah {currentStep} dari 3
          </div>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Pengajuan Surat Izin &amp; Peminjaman Fasilitas
          </h1>
          <div className="mt-2">
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] hover:text-[#172554] transition-colors cursor-pointer group"
            >
              <SparklesIcon size={14} className="text-amber-500 group-hover:scale-110 transition-transform" />
              <span>Gunakan Asisten AI</span>
            </button>
          </div>
        </div>

        {/* Right: 3-Step Wizard Navigation */}
        <nav aria-label="Tahapan Formulir" className="flex items-center gap-3 sm:gap-6">
          {/* Step 1 */}
          <button
            type="button"
            onClick={() => onStepClick(1)}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-85 cursor-pointer"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <CheckIcon size={16} />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                Selesai
              </div>
              <div className="text-xs font-medium text-slate-800">
                Pilih Jenis Template
              </div>
            </div>
          </button>

          <div className="h-px w-6 sm:w-8 bg-slate-200" />

          {/* Step 2 */}
          <button
            type="button"
            onClick={() => onStepClick(2)}
            className="flex items-center gap-3 text-left cursor-pointer"
          >
            <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-bold text-white shadow-xs ring-4 ring-[#1e3a8a]/15">
              <span>2</span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-amber-500" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[11px] font-semibold text-[#1e3a8a] uppercase tracking-wider">
                Sedang diisi
              </div>
              <div className="text-xs font-semibold text-slate-900">
                Rincian Kegiatan &amp; Fasilitas
              </div>
            </div>
          </button>

          <div className="h-px w-6 sm:w-8 bg-slate-200" />

          {/* Step 3 */}
          <button
            type="button"
            onClick={() => onStepClick(3)}
            className="flex items-center gap-3 text-left transition-opacity hover:opacity-85 cursor-pointer"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-xs font-bold text-slate-400">
              3
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Berikutnya
              </div>
              <div className="text-xs font-medium text-slate-500">
                Konfirmasi Rantai Approval
              </div>
            </div>
          </button>
        </nav>
      </div>
    </header>
  );
}
