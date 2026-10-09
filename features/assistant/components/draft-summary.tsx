"use client";

import React from "react";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PenToolIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@/components/ui";
import type { LetterPreviewDto, LetterTemplateDto } from "@/lib/api/types";

export type DraftStatus =
  | "idle"
  | "saving"
  | "previewing"
  | "submitting"
  | "submitted";

interface DraftSummaryProps {
  template: LetterTemplateDto | null;
  fields: Record<string, string>;
  onFieldChange: (key: string, value: string) => void;
  organizationLabel: string | null;
  committeeLabel: string | null;
  organizationChairLabel: string | null;
  resourceLabel: string | null;
  draftSavedAt: string | null;
  preview: LetterPreviewDto | null;
  status: DraftStatus;
  canSave: boolean;
  canGenerate: boolean;
  canSubmit: boolean;
  submittedNumber: string | null;
  submittedLetterId: string | null;
  onSaveDraft: () => void;
  onGeneratePreview: () => void;
  onSubmit: () => void;
  onOpenPreview: () => void;
}

function prettifyGroup(group: string): string {
  if (!group) return "Data Surat";
  return group
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function DraftSummary({
  template,
  fields,
  onFieldChange,
  organizationLabel,
  committeeLabel,
  organizationChairLabel,
  resourceLabel,
  draftSavedAt,
  preview,
  status,
  canSave,
  canGenerate,
  canSubmit,
  submittedNumber,
  submittedLetterId,
  onSaveDraft,
  onGeneratePreview,
  onSubmit,
  onOpenPreview,
}: DraftSummaryProps) {
  const userFields = template?.fields.filter((f) => f.valueSource === "user") ?? [];
  const missing = userFields.filter(
    (field) => field.required && !(fields[field.key] ?? "").trim(),
  );
  const filled = userFields.length - userFields.filter((field) => !(fields[field.key] ?? "").trim()).length;
  const progress = userFields.length > 0 ? Math.round((filled / userFields.length) * 100) : 0;

  const groups = Array.from(new Set(userFields.map((field) => field.group || "umum")));

  return (
    <aside className="flex min-h-0 flex-col rounded-xl border border-line bg-white p-5 lg:p-6 shadow-card">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-title font-bold text-midnight">Ringkasan Data Surat</h2>
            <p className="mt-0.5 text-micro text-slate-500">
              {template
                ? `${template.name} · skema versi ${template.version}`
                : "Pilih tipe surat untuk memuat skema field"}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-slate-400 ring-1 ring-line">
            <FileTextIcon className="size-4.5" />
          </span>
        </div>

        <div className="mt-3.5">
          {progress === 100 && userFields.length > 0 ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-micro font-semibold text-emerald-800 ring-1 ring-emerald-200">
              <CheckCircle2Icon className="size-4 shrink-0 text-emerald-600" />
              Semua field wajib sudah lengkap. Buat pratinjau PDF lalu ajukan.
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-micro font-semibold text-amber-800 ring-1 ring-amber-200">
              <AlertCircleIcon className="size-4 shrink-0 text-amber-600" />
              {template
                ? `${missing.length} field wajib belum lengkap (${filled}/${userFields.length} terisi)`
                : "Belum ada tipe surat yang dipilih"}
            </div>
          )}
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-navy transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="scroll-thin mt-5 min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
        {template === null && (
          <p className="rounded-lg border border-dashed border-line bg-canvas px-4 py-6 text-center text-body text-slate-500">
            Pilih tipe surat di panel sebelah kiri untuk menampilkan field dari
            skema backend.
          </p>
        )}

        {groups.map((group) => (
          <section key={group}>
            <div className="mb-2 flex items-center gap-2 text-micro font-semibold tracking-wide text-slate-500 uppercase">
              <PenToolIcon className="size-3.5" />
              <span>{prettifyGroup(group)}</span>
            </div>
            <div className="space-y-2.5">
              {userFields
                .filter((field) => (field.group || "umum") === group)
                .map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label
                      htmlFor={`field-${field.key}`}
                      className="text-micro font-medium text-slate-600"
                    >
                      {field.label}
                      {field.required && <span className="text-revision"> *</span>}
                    </label>
                    <textarea
                      id={`field-${field.key}`}
                      value={fields[field.key] ?? ""}
                      onChange={(event) => onFieldChange(field.key, event.target.value)}
                      rows={2}
                      placeholder={field.label}
                      className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-body text-midnight outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                    />
                  </div>
                ))}
            </div>
          </section>
        ))}

        {template && (
          <section>
            <div className="mb-2 flex items-center gap-2 text-micro font-semibold tracking-wide text-slate-500 uppercase">
              <ShieldCheckIcon className="size-3.5" />
              <span>Routing &amp; Otorisasi</span>
            </div>
            <dl className="space-y-2 rounded-lg border border-line bg-canvas px-3.5 py-3 text-body">
              {[
                ["Organisasi", organizationLabel],
                ["Ketua Pelaksana", committeeLabel],
                ["Ketua Organisasi", organizationChairLabel],
                ["Ruangan/Resource", resourceLabel],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="truncate text-right font-medium text-midnight">
                    {value ?? "Belum dipilih"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {draftSavedAt && (
          <p className="flex items-center gap-1.5 text-micro text-slate-500">
            <ClockIcon className="size-3.5" />
            Draf tersimpan di server · {draftSavedAt}
          </p>
        )}

        {preview && (
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
            <div className="flex items-center gap-2 text-micro font-semibold text-emerald-800">
              <CheckIcon className="size-4" />
              <span>Pratinjau PDF siap ditinjau</span>
            </div>
            <button
              type="button"
              onClick={onOpenPreview}
              className="mt-2 text-micro font-semibold text-navy hover:underline cursor-pointer"
            >
              Buka pratinjau PDF di tab baru
            </button>
          </section>
        )}

        {submittedNumber && (
          <section className="rounded-lg border border-approved-border bg-approved-bg px-3.5 py-3">
            <div className="text-micro font-semibold text-approved">
              Surat berhasil diajukan
            </div>
            <div className="mt-0.5 font-mono text-body font-semibold text-midnight">
              {submittedNumber}
            </div>
            {submittedLetterId && (
              <a
                href={`/surat/${submittedLetterId}`}
                className="mt-1.5 inline-flex text-micro font-semibold text-navy hover:underline"
              >
                Buka halaman surat →
              </a>
            )}
          </section>
        )}
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-4">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={!canSave || status === "saving"}
          className="w-full flex h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white text-body font-semibold text-midnight shadow-card hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <ShieldCheckIcon className="size-4" />
          <span>{status === "saving" ? "Menyimpan draf…" : "Simpan Draf ke Server"}</span>
        </button>

        <button
          type="button"
          onClick={onGeneratePreview}
          disabled={!canGenerate || status === "previewing"}
          className="w-full flex h-11 items-center justify-center gap-2 rounded-lg bg-gold text-body font-bold text-midnight shadow-card hover:bg-amber-400 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <SparklesIcon className="size-4" />
          <span>
            {status === "previewing" ? "Menyusun pratinjau…" : "Generate Pratinjau PDF"}
          </span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || status === "submitting" || !preview}
          className="w-full flex h-11 items-center justify-center gap-2 rounded-lg bg-navy text-body font-bold text-white shadow-card hover:bg-navy-hover disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <CheckIcon className="size-4" />
          <span>{status === "submitting" ? "Mengajukan…" : "Ajukan Surat Sekarang"}</span>
        </button>
        <p className="text-center text-micro text-slate-400">
          Ajukan hanya setelah pratinjau sesuai. Perubahan data membatalkan
          pratinjau sebelumnya.
        </p>
      </div>
    </aside>
  );
}
