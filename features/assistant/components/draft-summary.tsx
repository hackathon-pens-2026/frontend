"use client";

import React, { useState } from "react";
import { LetterFormField } from "../types";
import {
  AlertCircleIcon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PenToolIcon,
  PlusIcon,
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

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-line bg-white p-6">
      {/* Title & Progress Header */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-title font-semibold text-midnight">
            Ringkasan Data Surat
          </h2>
          <FileTextIcon className="mt-1 size-5 text-slate-300" />
        </div>

        <div className="mt-2 flex items-center justify-between text-micro">
          <span className="font-semibold text-midnight">
            <span className="text-[#15803D] tabular-nums">{filledCount}</span>{" "}
            dari {fields.length} field wajib terisi
          </span>
          <span className="font-semibold text-slate-400 tabular-nums">
            {progressPercent}%
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#15803D] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Field List */}
      <ul className="scroll-thin -mx-2 mt-5 min-h-0 flex-1 space-y-2 overflow-y-auto px-2">
        {fields.map((field) => {
          const isFilled = !!field.value;
          const isEditing = editingKey === field.key;

          return (
            <li
              key={field.key}
              className={`group rounded-lg border px-3.5 py-2.5 transition-colors ${
                isFilled
                  ? "border-line bg-white"
                  : "border-amber-200 bg-amber-50/60"
              }`}
            >
              {/* Field Label & Status Header */}
              <div className="flex items-center gap-2">
                {isFilled ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-800">
                    <CheckIcon className="size-3 text-emerald-600" />
                    <span>Terisi</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-[#92400E]">
                    <AlertCircleIcon className="size-3 text-[#92400E]" />
                    <span>Perlu Dilengkapi</span>
                  </span>
                )}

                <span className="text-micro font-medium text-slate-500">
                  {field.label}
                </span>

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
                  className={`-my-2 -mr-2 ml-auto flex size-11 items-center justify-center rounded-md transition-colors cursor-pointer ${
                    isFilled
                      ? "text-slate-400 hover:bg-slate-100 hover:text-navy"
                      : "text-[#92400E] hover:bg-amber-100"
                  }`}
                >
                  <PenToolIcon className="size-3.5" />
                </button>
              </div>

              {/* Edit Mode or View Mode */}
              {isEditing ? (
                <div className="mt-1.5 flex gap-1.5">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveInlineEdit();
                      if (e.key === "Escape") setEditingKey(null);
                    }}
                    className="h-11 flex-1 rounded-md border border-navy px-3 text-body outline-none ring-4 ring-navy/10 bg-white"
                  />
                  <button
                    type="button"
                    onClick={saveInlineEdit}
                    aria-label="Simpan"
                    className="flex size-11 items-center justify-center rounded-md bg-[#15803D] text-white hover:bg-[#166534] cursor-pointer transition-colors"
                  >
                    <CheckIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingKey(null)}
                    aria-label="Batal"
                    className="flex size-11 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ) : (
                <div
                  className={`mt-1 truncate text-body ${
                    isFilled
                      ? "font-semibold text-midnight"
                      : "text-[#92400E]/80 italic"
                  }`}
                >
                  {field.value ?? field.hint}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Action Footer */}
      <div className="mt-5 rounded-xl bg-canvas p-4 ring-1 ring-line">
        {isSubmitted ? (
          <div className="animate-rise flex items-start gap-3 rounded-lg bg-green-50 p-3 ring-1 ring-green-200">
            <CheckIcon className="mt-0.5 size-5 shrink-0 text-[#15803D]" />
            <div className="text-micro text-green-900">
              <div className="text-body font-bold">Surat Berhasil Diajukan</div>
              Nomor pelacakan <b className="font-mono">SGN/26/X/0431</b> telah
              masuk rantai approval. Pembaruan status dikirim via email.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Generate Button with tooltip if incomplete */}
            <div className="group relative">
              <button
                type="button"
                onClick={onGenerateDraft}
                disabled={emptyFields.length > 0 || isDrafting}
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-lg text-body font-bold transition-colors ${
                  emptyFields.length > 0
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : isDraftGenerated
                    ? "border border-line bg-white text-midnight hover:bg-slate-50 cursor-pointer"
                    : "bg-navy text-white shadow-lift hover:bg-[#1a3278] cursor-pointer"
                }`}
              >
                {isDrafting ? (
                  <ClockIcon className="size-4 animate-spin" />
                ) : (
                  <PenToolIcon className="size-4" />
                )}
                <span>
                  {isDrafting
                    ? "Menyusun draf…"
                    : isDraftGenerated
                    ? "Generate Ulang Draf"
                    : "Generate Draf Surat"}
                </span>
              </button>

              {emptyFields.length > 0 && (
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-midnight px-3 py-2 text-micro font-medium whitespace-nowrap text-white opacity-0 shadow-modal transition-opacity group-hover:opacity-100"
                >
                  Lengkapi {emptyFields.length} field wajib sebelum generate
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-midnight" />
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={onSubmitLetter}
              disabled={!isDraftGenerated}
              title={
                isDraftGenerated
                  ? undefined
                  : "Generate draf surat terlebih dahulu"
              }
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-navy text-body font-bold text-white shadow-lift transition-colors hover:bg-[#1a3278] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
            >
              <FileTextIcon className="size-4" />
              <span>Ajukan Surat</span>
            </button>

            {/* Save Draft Button */}
            <button
              type="button"
              onClick={onSaveAsDraft}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-body font-semibold text-slate-600 hover:bg-white hover:text-midnight cursor-pointer transition-colors"
            >
              <UploadCloudIcon className="size-4" />
              <span>Simpan sebagai Draf</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
export default DraftSummary;
