import React, { useRef } from "react";
import { FacilityItem, PermitFormData } from "../types";
import {
  LockIcon,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  PlusIcon,
  UploadCloudIcon,
  TrashIcon,
} from "./icons";

interface ApplicantFormProps {
  formData: PermitFormData;
  onChange: (patch: Partial<PermitFormData>) => void;
  facilities: FacilityItem[];
}

export function ApplicantForm({
  formData,
  onChange,
  facilities,
}: ApplicantFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFacility = (facilityId: string) => {
    const isSelected = formData.selectedFacilityIds.includes(facilityId);
    let updated: string[];
    if (isSelected) {
      updated = formData.selectedFacilityIds.filter((id) => id !== facilityId);
    } else {
      updated = [...formData.selectedFacilityIds, facilityId];
    }
    onChange({ selectedFacilityIds: updated });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      onChange({
        attachment: {
          name: file.name,
          sizeFormatted: `${sizeMB} MB uploaded`,
          fileSizeBytes: file.size,
          progressPercent: 100,
          uploadedAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      });
    }
  };

  const removeAttachment = () => {
    onChange({ attachment: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs divide-y divide-slate-100">
        {/* Section 1: Data Pemohon */}
        <section aria-labelledby="sec-applicant" className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600 ring-1 ring-amber-200">
                1
              </span>
              <h2 id="sec-applicant" className="text-sm font-semibold text-slate-900">
                Data Pemohon
              </h2>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
              <LockIcon size={12} className="text-blue-600" />
              <span>Terisi otomatis dari PENS SSO</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Nama Pemohon */}
            <div className="sm:col-span-7 rounded-lg border border-slate-200 bg-[#f8fafc] p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                Nama Pemohon
              </label>
              <div className="mt-0.5 text-xs font-semibold text-slate-800 pr-6">
                {formData.applicant.name}
              </div>
              <LockIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* NRP */}
            <div className="sm:col-span-5 rounded-lg border border-slate-200 bg-[#f8fafc] p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                NRP
              </label>
              <div className="mt-0.5 text-xs font-semibold text-slate-800 font-mono pr-6">
                {formData.applicant.nrp}
              </div>
              <LockIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Organisasi / UKM */}
            <div className="sm:col-span-12 rounded-lg border border-dashed border-slate-300 bg-[#f8fafc] p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                Organisasi / UKM
              </label>
              <div className="mt-0.5 text-xs font-semibold text-slate-800 pr-6">
                {formData.applicant.organization}
              </div>
              <LockIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </section>

        {/* Section 2: Nama Acara / Kegiatan */}
        <section aria-labelledby="sec-event-name" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600 ring-1 ring-amber-200">
                2
              </span>
              <h2 id="sec-event-name" className="text-sm font-semibold text-slate-900">
                Nama Acara / Kegiatan
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {formData.eventName.length}/80
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              maxLength={80}
              value={formData.eventName}
              onChange={(e) => onChange({ eventName: e.target.value })}
              placeholder="Contoh: Workshop AI & Cloud Computing 2026"
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none transition focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/10"
            />
          </div>
        </section>

        {/* Section 3: Tanggal & Waktu Pelaksanaan */}
        <section aria-labelledby="sec-datetime" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600 ring-1 ring-amber-200">
                3
              </span>
              <h2 id="sec-datetime" className="text-sm font-semibold text-slate-900">
                Tanggal &amp; Waktu Pelaksanaan
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Zona waktu WIB
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Date Range Input */}
            <div className="sm:col-span-6 rounded-lg border border-slate-200 bg-white p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                Tanggal Pelaksanaan
              </label>
              <input
                type="text"
                value={formData.eventDateRange}
                onChange={(e) => onChange({ eventDateRange: e.target.value })}
                placeholder="Sab, 14 Mar – Min, 15 Mar 2026"
                className="mt-0.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none pr-6"
              />
              <CalendarIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Jam Mulai */}
            <div className="sm:col-span-3 rounded-lg border border-slate-200 bg-white p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                Jam mulai
              </label>
              <input
                type="text"
                value={formData.startTime}
                onChange={(e) => onChange({ startTime: e.target.value })}
                placeholder="08.00"
                className="mt-0.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none pr-6 tabular-nums"
              />
              <ClockIcon size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Jam Selesai */}
            <div className="sm:col-span-3 rounded-lg border border-slate-200 bg-white p-2.5 relative">
              <label className="block text-[11px] font-medium text-slate-400">
                Jam selesai
              </label>
              <input
                type="text"
                value={formData.endTime}
                onChange={(e) => onChange({ endTime: e.target.value })}
                placeholder="16.00"
                className="mt-0.5 w-full bg-transparent text-xs font-semibold text-slate-900 outline-none pr-6 tabular-nums"
              />
              <ClockIcon size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Section 4: Fasilitas yang Diajukan */}
        <section aria-labelledby="sec-facilities" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600 ring-1 ring-amber-200">
                4
              </span>
              <h2 id="sec-facilities" className="text-sm font-semibold text-slate-900">
                Fasilitas yang Diajukan
              </h2>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {formData.selectedFacilityIds.length} dipilih
            </span>
          </div>

          {/* Facility Pills */}
          <div className="flex flex-wrap gap-2.5">
            {facilities.map((fac) => {
              const isSelected = formData.selectedFacilityIds.includes(fac.name);

              if (!fac.isAvailable) {
                return (
                  <div
                    key={fac.id}
                    title="Fasilitas sedang dalam pemeliharaan atau dipinjam unit lain"
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-400 cursor-not-allowed select-none"
                  >
                    <span>{fac.name}</span>
                    <span className="text-[10px] text-slate-400">· Tidak tersedia</span>
                  </div>
                );
              }

              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => toggleFacility(fac.name)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#1e3a8a] text-white shadow-xs ring-1 ring-[#1e3a8a]"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isSelected ? (
                    <CheckIcon size={13} className="text-white" />
                  ) : (
                    <PlusIcon size={13} className="text-slate-400" />
                  )}
                  <span>{fac.name}</span>
                </button>
              );
            })}
          </div>

          {/* Availability note */}
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-700">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Auditorium Pascasarjana Lt. 3 tersedia pada tanggal terpilih</span>
          </div>
        </section>

        {/* Section 5: Upload Proposal Kegiatan & Rundown */}
        <section aria-labelledby="sec-upload" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-xs font-bold text-amber-600 ring-1 ring-amber-200">
                5
              </span>
              <h2 id="sec-upload" className="text-sm font-semibold text-slate-900">
                Upload Proposal Kegiatan &amp; Rundown
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              PDF · maks. 10 MB
            </span>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />

          {/* Upload Dropzone */}
          {!formData.attachment ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-[#1e3a8a] rounded-xl p-6 text-center bg-[#f8fafc] hover:bg-white transition-all cursor-pointer group"
            >
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-white shadow-xs border border-slate-200 text-slate-400 group-hover:text-[#1e3a8a] mb-3">
                <UploadCloudIcon size={20} />
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Tarik &amp; lepas berkas di sini, atau{" "}
                <span className="text-[#1e3a8a] underline underline-offset-2">pilih file</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Gabungkan proposal dan rundown dalam satu PDF
              </div>
            </div>
          ) : (
            /* Uploaded File Card */
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 flex items-center gap-3 shadow-xs">
              {/* PDF Icon Badge */}
              <div className="flex size-9 shrink-0 flex-col items-center justify-center rounded-md bg-red-50 text-red-600 font-extrabold text-[9px] border border-red-200">
                PDF
              </div>

              {/* File Info & Progress */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate text-xs font-semibold text-slate-900">
                    {formData.attachment.name}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 shrink-0">
                    <CheckIcon size={12} />
                    <span>{formData.attachment.sizeFormatted}</span>
                  </div>
                </div>

                <div className="mt-1.5 h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${formData.attachment.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Remove Action */}
              <button
                type="button"
                onClick={removeAttachment}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                aria-label="Hapus Berkas Lampiran"
                title="Hapus berkas"
              >
                <TrashIcon size={15} />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
