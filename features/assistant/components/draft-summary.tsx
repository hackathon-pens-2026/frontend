"use client";

import React, { useState } from "react";
import { FieldGroupKey, LetterFormField } from "../types";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PenToolIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadCloudIcon,
  XIcon,
} from "@/components/ui";

interface DraftSummaryProps {
  fields: LetterFormField[];
  onUpdateField: (key: string, value: string | null) => void;
  onEditFieldRequest: (field: LetterFormField) => void;
  isDraftGenerated: boolean;
  isDrafting: boolean;
  onGenerateDraft: () => void;
  isSubmitted: boolean;
  onSubmitLetter: () => void;
  onSaveAsDraft: () => void;
}

interface GroupDef {
  key: FieldGroupKey;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GROUPS: GroupDef[] = [
  {
    key: "document",
    title: "Informasi Dokumen",
    icon: FileTextIcon,
  },
  {
    key: "activity",
    title: "Rincian Kegiatan & Fasilitas",
    icon: PenToolIcon,
  },
  {
    key: "authorization",
    title: "Otorisasi & Dokumen Pendukung",
    icon: ShieldCheckIcon,
  },
];

export function DraftSummary({
  fields,
  onUpdateField,
  onEditFieldRequest,
  isDraftGenerated,
  isDrafting,
  onGenerateDraft,
  isSubmitted,
  onSubmitLetter,
  onSaveAsDraft,
}: DraftSummaryProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const emptyFields = fields.filter((f) => !f.value);
  const filledCount = fields.length - emptyFields.length;
  const progressPercent = Math.round((filledCount / fields.length) * 100);

  const startInlineEdit = (field: LetterFormField) => {
    setEditingKey(field.key);
    setEditValue(field.value ?? "");
  };

  const saveInlineEdit = () => {
    if (!editingKey) return;
    onUpdateField(editingKey, editValue.trim() || null);
    setEditingKey(null);
  };

  // Group fields per Miller's Law (Chunking)
  const groupedFields = GROUPS.map((group) => {
    const groupItems = fields.filter(
      (f) => (f.group ?? "activity") === group.key
    );
    const groupFilled = groupItems.filter((f) => !!f.value).length;
    return {
      ...group,
      items: groupItems,
      filledCount: groupFilled,
      totalCount: groupItems.length,
      isAllFilled: groupFilled === groupItems.length && groupItems.length > 0,
    };
  });

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-line bg-white p-5 lg:p-6 shadow-card">
      {/* Title & Progress Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-title font-bold text-midnight">
              Ringkasan Data Surat
            </h2>
            <p className="mt-0.5 text-micro text-slate-500">
              Sinkronisasi realtime dari percakapan AI & input manual
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-slate-400 ring-1 ring-line">
            <FileTextIcon className="size-4.5" />
          </span>
        </div>

        {/* Goal-Gradient Effect: Dynamic Motivational Banner */}
        <div className="mt-3.5">
          {progressPercent === 100 ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-micro font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <CheckCircle2Icon className="size-4 text-emerald-600 shrink-0" />
              <span>🎉 Semua data lengkap! Draf surat siap dibuat.</span>
            </div>
          ) : progressPercent >= 60 ? (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-micro font-semibold text-navy ring-1 ring-blue-200">
              <SparklesIcon className="size-4 text-gold shrink-0" />
              <span>
                Hampir selesai! Tinggal{" "}
                <b className="font-bold text-navy">{emptyFields.length}</b> data
                lagi sebelum draf siap digenerate.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-micro font-semibold text-[#92400E] ring-1 ring-amber-200">
              <AlertCircleIcon className="size-4 text-[#92400E] shrink-0" />
              <span>Lengkapi data rincian kegiatan dan otorisasi di bawah.</span>
            </div>
          )}
        </div>

        {/* Progress Bar & Counter */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-micro">
            <span className="font-semibold text-midnight">
              <span className="text-[#15803D] font-bold tabular-nums">
                {filledCount}
              </span>{" "}
              dari {fields.length} data wajib terisi
            </span>
            <span className="font-bold text-slate-500 tabular-nums">
              {progressPercent}%
            </span>
          </div>

          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent === 100 ? "bg-[#15803D]" : "bg-navy"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chunked Field List (Miller's Law & Law of Proximity) */}
      <div className="scroll-thin -mx-2 mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto px-2 pr-2.5">
        {groupedFields.map((group) => {
          const GroupIcon = group.icon;
          return (
            <div
              key={group.key}
              className="rounded-xl border border-line bg-canvas/60 p-3"
            >
              {/* Group Sub-Header with progress badge */}
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GroupIcon className="size-3.5 text-navy" />
                  <h3 className="text-micro font-bold tracking-tight text-midnight">
                    {group.title}
                  </h3>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${
                    group.isAllFilled
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {group.isAllFilled && (
                    <CheckIcon className="size-2.5 text-[#15803D]" strokeWidth={3} />
                  )}
                  <span>
                    {group.filledCount}/{group.totalCount}
                  </span>
                </span>
              </div>

              {/* Items within Group */}
              <div className="space-y-2">
                {group.items.map((field) => {
                  const isFilled = !!field.value;
                  const isEditing = editingKey === field.key;

                  return (
                    <div
                      key={field.key}
                      className={`group rounded-lg border px-3 py-2 transition-all ${
                        isFilled
                          ? "border-line bg-white hover:border-slate-300 shadow-2xs"
                          : "border-amber-200 bg-amber-50/70"
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-center gap-2">
                        {isFilled ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-bold text-green-800 ring-1 ring-green-200">
                            <CheckIcon className="size-2.5 text-emerald-600" strokeWidth={3} />
                            <span>Terisi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-[#92400E] ring-1 ring-amber-200">
                            <AlertCircleIcon className="size-2.5 text-[#92400E]" />
                            <span>Perlu Dilengkapi</span>
                          </span>
                        )}

                        <span className="text-micro font-semibold text-slate-600">
                          {field.label}
                        </span>

                        {/* Fitts's Law: Accessible touch target for Edit action (min 36px) */}
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              field.kind === "ketua" ||
                              field.kind === "pembina" ||
                              field.kind === "file"
                            ) {
                              onEditFieldRequest(field);
                            } else {
                              startInlineEdit(field);
                            }
                          }}
                          aria-label={`Ubah ${field.label}`}
                          title={`Ubah ${field.label}`}
                          className={`ml-auto flex size-8 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                            isFilled
                              ? "text-slate-400 hover:bg-canvas hover:text-navy"
                              : "text-[#92400E] hover:bg-amber-100"
                          }`}
                        >
                          <PenToolIcon className="size-3.5" />
                        </button>
                      </div>

                      {/* Item Content: Edit Mode or View Mode */}
                      {isEditing ? (
                        <div className="mt-2 flex items-center gap-1.5">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveInlineEdit();
                              if (e.key === "Escape") setEditingKey(null);
                            }}
                            className="h-9 flex-1 rounded-md border border-navy bg-white px-2.5 text-body font-medium outline-none ring-3 ring-navy/15"
                            placeholder={`Ketik ${field.label}...`}
                          />
                          <button
                            type="button"
                            onClick={saveInlineEdit}
                            aria-label="Simpan perubahan"
                            title="Simpan (Enter)"
                            className="flex size-9 items-center justify-center rounded-md bg-[#15803D] text-white hover:bg-[#166534] cursor-pointer transition-colors shrink-0 shadow-2xs"
                          >
                            <CheckIcon className="size-4" strokeWidth={2.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingKey(null)}
                            aria-label="Batalkan perubahan"
                            title="Batal (Esc)"
                            className="flex size-9 items-center justify-center rounded-md border border-line bg-white text-slate-400 hover:bg-slate-50 hover:text-midnight cursor-pointer transition-colors shrink-0"
                          >
                            <XIcon className="size-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`mt-1 text-body ${
                            isFilled
                              ? "font-semibold text-midnight break-words"
                              : "text-[#92400E]/85 italic text-micro"
                          }`}
                        >
                          {field.value ?? field.hint}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer: Fitts's Law & Visual CTA Hierarchy */}
      <div className="mt-4 rounded-xl bg-canvas p-3.5 ring-1 ring-line">
        {isSubmitted ? (
          <div className="animate-rise flex items-start gap-3 rounded-lg bg-green-50 p-3.5 ring-1 ring-green-200">
            <CheckCircle2Icon className="mt-0.5 size-5 shrink-0 text-[#15803D]" />
            <div className="text-micro text-green-900 leading-relaxed">
              <div className="text-body font-bold text-green-900">
                Surat Berhasil Diajukan!
              </div>
              Nomor tiket <b className="font-mono font-bold">SGN/26/X/0431</b>{" "}
              telah masuk rantai approval. Notifikasi status akan dikirim berkala
              melalui email SSO resmi Anda.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Primary Action Button: Generate Draft (48px high target) */}
            <div className="group relative">
              <button
                type="button"
                onClick={onGenerateDraft}
                disabled={emptyFields.length > 0 || isDrafting}
                aria-describedby={emptyFields.length > 0 ? "gen-tip" : undefined}
                className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-body font-bold transition-all ${
                  emptyFields.length > 0
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : isDraftGenerated
                    ? "border-2 border-[#15803D] bg-green-50 text-green-900 hover:bg-green-100 cursor-pointer shadow-card"
                    : "bg-navy text-white shadow-lift hover:bg-[#1a3278] cursor-pointer"
                }`}
              >
                {isDrafting ? (
                  <ClockIcon className="size-4.5 animate-spin" />
                ) : isDraftGenerated ? (
                  <CheckIcon className="size-4.5 text-[#15803D]" strokeWidth={2.5} />
                ) : (
                  <PenToolIcon className="size-4.5" />
                )}
                <span>
                  {isDrafting
                    ? "Menyusun draf resmi…"
                    : isDraftGenerated
                    ? "Draf Dibuat · Generate Ulang"
                    : "Generate Draf Surat (PDF)"}
                </span>
              </button>

              {emptyFields.length > 0 && (
                <span
                  id="gen-tip"
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-lg bg-midnight px-3 py-1.5 text-micro font-medium whitespace-nowrap text-white opacity-0 shadow-modal transition-opacity group-hover:opacity-100"
                >
                  Lengkapi {emptyFields.length} field wajib terlebih dahulu
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
                </span>
              )}
            </div>

            {/* Submit Button (Accessible only once draft is reviewed) */}
            <button
              type="button"
              onClick={onSubmitLetter}
              disabled={!isDraftGenerated}
              title={
                isDraftGenerated
                  ? undefined
                  : "Generate draf surat terlebih dahulu"
              }
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803D] text-body font-bold text-white shadow-lift transition-colors hover:bg-[#166534] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              <FileTextIcon className="size-4.5" />
              <span>Ajukan Surat Sekarang</span>
            </button>

            {/* Secondary Action: Save Draft (44px target) */}
            <button
              type="button"
              onClick={onSaveAsDraft}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-body font-semibold text-slate-700 hover:bg-slate-50 hover:text-midnight cursor-pointer transition-colors shadow-2xs"
            >
              <UploadCloudIcon className="size-4 text-slate-500" />
              <span>Simpan sebagai Draf</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
export default DraftSummary;
