"use client";

import React, { useState, useEffect } from "react";
import { NewDocumentTemplate } from "../types";
import {
  Button,
  ArrowRightIcon,
  CheckIcon,
  FileTextIcon,
  UploadCloudIcon,
  XIcon,
} from "@/components/ui";

interface NewRequestModalProps {
  templates: NewDocumentTemplate[];
  onClose: () => void;
  onSubmitSuccess?: (newDoc: { title: string; type: string }) => void;
}

const steps = ["Jenis Dokumen", "Unggah Berkas", "Alur & Kirim"];

export function NewRequestModal({
  templates,
  onClose,
  onSubmitSuccess,
}: NewRequestModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [title, setTitle] = useState("Pengajuan Fasilitas Praktikum Semester Gasal");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [generateState, setGenerateState] = useState<"none" | "busy" | "ready">("none");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const activeTemplate = templates[selectedTemplateIdx] ?? templates[0];

  const handleGenerate = () => {
    setGenerateState("busy");
    setTimeout(() => {
      setGenerateState("ready");
    }, 800);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    onSubmitSuccess?.({
      title,
      type: activeTemplate.t,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-midnight/40 p-6 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="animate-rise w-full max-w-[640px] rounded-xl bg-white shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h3 className="text-title font-semibold text-midnight">
            Ajukan Dokumen
          </h3>
          <button
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
            aria-label="Tutup"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Content Body */}
        {isSubmitted ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-ok-bg text-emerald-600 mb-4">
              <CheckIcon className="size-7" strokeWidth={3} />
            </span>
            <h4 className="text-title font-semibold text-midnight">
              Dokumen Berhasil Terkirim
            </h4>
            <p className="mt-2 text-body text-slate-500 max-w-md">
              Surat permohonan telah diterbitkan dengan nomor{" "}
              <b className="text-midnight">SGN-2025-0492</b> dan dialirkan ke
              penandatangan pertama.
            </p>
            <Button className="mt-6" onClick={onClose}>
              Tutup & Kembali ke Dasbor
            </Button>
          </div>
        ) : (
          <>
            {/* Stepper pills */}
            <div className="grid grid-cols-3 border-b border-line bg-canvas">
              {steps.map((st, i) => (
                <div
                  key={st}
                  className={`flex items-center justify-center gap-2 border-b-2 py-3 text-micro font-medium ${
                    currentStep === i
                      ? "border-navy text-navy font-semibold"
                      : currentStep > i
                      ? "border-ok text-emerald-700"
                      : "border-transparent text-slate-400"
                  }`}
                >
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      currentStep === i
                        ? "bg-navy text-white"
                        : currentStep > i
                        ? "bg-ok text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {currentStep > i ? "✓" : i + 1}
                  </span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            <div className="p-6">
              {/* Step 0: Document Type selection */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="text-body font-semibold text-midnight">
                    Pilih Jenis Dokumen yang Diajukan
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {templates.map((tpl, idx) => {
                      const isSelected = selectedTemplateIdx === idx;
                      return (
                        <button
                          key={tpl.t}
                          type="button"
                          onClick={() => setSelectedTemplateIdx(idx)}
                          className={`rounded-xl border p-4 text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-navy bg-review-bg/50 ring-2 ring-navy/20"
                              : "border-line bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-body font-semibold text-midnight">
                              {tpl.t}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-micro font-medium text-slate-600">
                              {tpl.sla}
                            </span>
                          </div>
                          <div className="mt-2 text-micro text-slate-500">
                            Alur: {tpl.chain.join(" → ")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: Upload Attachment / Subject */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-body font-semibold text-midnight block mb-1">
                      Perihal / Judul Pengajuan
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan perihal dokumen..."
                      className="h-11 w-full rounded-lg border border-line bg-canvas px-3 text-body outline-none focus:border-navy focus:bg-white focus:ring-4 focus:ring-navy/10"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="text-body font-semibold text-midnight block mb-1">
                      Berkas Pendukung / Draf
                    </label>
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-canvas p-6 text-center hover:bg-slate-50 transition-colors">
                      <UploadCloudIcon className="size-8 text-slate-400" />
                      <div className="mt-2 text-body font-medium text-slate-700">
                        Klik atau seret file PDF ke sini
                      </div>
                      <div className="mt-1 text-micro text-slate-400">
                        Format PDF, maksimal 15 MB
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-lg border border-line bg-white p-3 text-body">
                    <FileTextIcon className="size-4 text-navy" />
                    <span className="flex-1 font-medium text-midnight">
                      Draft_Permohonan_Elektro_2025.pdf
                    </span>
                    <span className="text-micro text-slate-400">2.1 MB</span>
                  </div>
                </div>
              )}

              {/* Step 2: Routing Chain & Submit */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="text-body font-semibold text-midnight">
                    Verifikasi Alur Penandatanganan
                  </div>
                  <div className="rounded-xl border border-line bg-canvas p-4 space-y-2.5">
                    {activeTemplate.chain.map((role, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-body"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex size-5 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-midnight">
                            {role}
                          </span>
                        </div>
                        <span className="text-micro text-slate-400">
                          Otomatis
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg bg-amber-50 p-3 text-micro text-amber-800 border border-amber-200">
                    💡 Setelah diajukan, dokumen akan otomatis mendapatkan nomor surat resmi dan QR tanda tangan dari server.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex justify-between rounded-b-xl border-t border-line bg-canvas px-6 py-4">
              <Button
                variant="ghost"
                onClick={() =>
                  currentStep === 0 ? onClose() : setCurrentStep((c) => c - 1)
                }
              >
                {currentStep === 0 ? "Batal" : "Kembali"}
              </Button>

              {currentStep < 2 ? (
                <Button onClick={() => setCurrentStep((c) => c + 1)}>
                  <span>Lanjut</span>
                  <ArrowRightIcon className="size-4" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={
                      generateState === "ready" ? "secondary" : "primary"
                    }
                    disabled={generateState === "busy"}
                    onClick={handleGenerate}
                  >
                    {generateState === "busy"
                      ? "Menyusun draf…"
                      : generateState === "ready"
                      ? "Generate Ulang"
                      : "Generate Draf Surat"}
                  </Button>
                  <Button
                    disabled={generateState !== "ready"}
                    onClick={handleSubmit}
                    title={
                      generateState === "ready"
                        ? undefined
                        : "Generate draf terlebih dahulu"
                    }
                  >
                    Ajukan Surat
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default NewRequestModal;
