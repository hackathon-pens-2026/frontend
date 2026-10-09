import React from "react";
import { PermitFormData } from "../types";
import { InfoIcon } from "./icons";

interface LiveLetterPreviewProps {
  formData: PermitFormData;
}

export function LiveLetterPreview({ formData }: LiveLetterPreviewProps) {
  const primaryVenue = formData.selectedFacilityIds[0] || "Kampus PENS";

  return (
    <div className="sticky top-20">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Pratinjau Dokumen
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          A4 · Hal. 1/1
        </span>
      </div>

      {/* Outer Paper Tray Canvas */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-200/70 to-slate-100 p-4 sm:p-5 shadow-xs">
        {/* A4 Sheet */}
        <article
          aria-label="Lembar Surat Resmi"
          className="relative mx-auto rounded-[3px] bg-white p-5 sm:p-6 text-slate-800 shadow-md ring-1 ring-slate-900/5 select-none text-[9.5px] leading-relaxed transition-all"
        >
          {/* Subtle Diagonal Watermark */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="rotate-[-28deg] border-y border-amber-500/25 bg-amber-500/5 px-6 py-2 text-center text-[11px] font-extrabold tracking-[0.25em] text-amber-600/35 uppercase">
              Preview · Format Resmi Otomatis
            </div>
          </div>

          {/* Kop Surat Resmi PENS */}
          <div className="border-b-[2.5px] border-slate-900 pb-2 mb-3">
            <div className="flex items-center gap-2.5">
              {/* Emblem / Seal PENS */}
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-white shadow-xs ring-2 ring-amber-400">
                <span className="text-[8px] font-black tracking-tight">PENS</span>
              </div>

              {/* Institution Header Text */}
              <div className="flex-1 text-center leading-tight">
                <div className="text-[6.5px] font-semibold text-slate-500 tracking-wider uppercase">
                  Kementerian Pendidikan Tinggi, Sains, dan Teknologi
                </div>
                <div className="text-[9.5px] font-extrabold text-slate-900 uppercase tracking-tight mt-0.5">
                  Politeknik Elektronika Negeri Surabaya
                </div>
                <div className="text-[7.5px] font-bold text-[#1e3a8a] uppercase tracking-wide mt-0.5">
                  Himpunan Mahasiswa Teknik Informatika
                </div>
                <div className="text-[5.5px] text-slate-400 mt-0.5">
                  Jl. Raya ITS, Sukolilo, Surabaya 60111 · Telp. (031) 594 7280 · www.pens.ac.id
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Surat Table & Date */}
          <div className="flex justify-between items-start text-[8.5px] gap-2 mb-3">
            <table className="text-left border-collapse">
              <tbody>
                <tr>
                  <td className="pr-1.5 text-slate-500 font-medium w-12">Nomor</td>
                  <td className="font-mono text-slate-800">: {formData.letterNumber}</td>
                </tr>
                <tr>
                  <td className="pr-1.5 text-slate-500 font-medium">Lampiran</td>
                  <td className="text-slate-800">: 1 (satu) berkas proposal</td>
                </tr>
                <tr>
                  <td className="pr-1.5 text-slate-500 font-medium align-top">Perihal</td>
                  <td className="font-semibold text-slate-900 leading-snug">
                    : {formData.letterSubject}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="text-right text-[8px] text-slate-500 tabular-nums shrink-0">
              {formData.letterDatePlace}
            </div>
          </div>

          {/* Letter Recipient */}
          <div className="mb-2.5 text-[8.5px] leading-tight text-slate-700">
            <div>Yth. {formData.letterRecipient.title}</div>
            <div>{formData.letterRecipient.institution}</div>
            <div>{formData.letterRecipient.address}</div>
          </div>

          {/* Body Paragraph 1 */}
          <p className="mb-2 text-justify leading-relaxed">
            Dengan hormat, sehubungan dengan program kerja Himpunan Mahasiswa Teknik Informatika PENS, kami bermaksud menyelenggarakan kegiatan{" "}
            <span className="rounded-xs bg-amber-100/90 px-1 py-0.5 font-semibold text-slate-900 ring-1 ring-amber-300/60">
              {formData.eventName || "(Nama Kegiatan Belum Diisi)"}
            </span>{" "}
            yang akan dilaksanakan pada:
          </p>

          {/* Detail Schedule Table */}
          <table className="mb-2 ml-4 text-[8.5px] border-collapse leading-relaxed">
            <tbody>
              <tr>
                <td className="pr-2 font-medium text-slate-500 w-20">Hari/Tanggal</td>
                <td>
                  :{" "}
                  <span className="rounded-xs bg-amber-100/90 px-1 py-0.5 font-semibold text-slate-900 ring-1 ring-amber-300/60">
                    {formData.eventDateRange || "Sab, 14 Mar – Min, 15 Mar 2026"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pr-2 font-medium text-slate-500">Waktu</td>
                <td>
                  :{" "}
                  <span className="rounded-xs bg-amber-100/90 px-1 py-0.5 font-semibold text-slate-900 ring-1 ring-amber-300/60 tabular-nums">
                    {formData.startTime} – {formData.endTime} {formData.timeZone}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="pr-2 font-medium text-slate-500">Tempat</td>
                <td>
                  :{" "}
                  <span className="rounded-xs bg-amber-100/90 px-1 py-0.5 font-semibold text-slate-900 ring-1 ring-amber-300/60">
                    {primaryVenue}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Body Paragraph 2 */}
          <p className="mb-1.5 text-justify leading-relaxed">
            Untuk menunjang kelancaran kegiatan tersebut, kami memohon izin penyelenggaraan serta peminjaman fasilitas kampus sebagai berikut:
          </p>

          {/* Facilities Numbered List */}
          <ol className="mb-2 ml-6 list-decimal space-y-0.5 text-[8.5px]">
            {formData.selectedFacilityIds.length === 0 ? (
              <li className="text-slate-400 italic">Belum ada fasilitas yang dipilih.</li>
            ) : (
              formData.selectedFacilityIds.map((facName, idx) => (
                <li key={idx}>
                  <span className="rounded-xs bg-amber-100/90 px-1 py-0.2 font-semibold text-slate-900 ring-1 ring-amber-300/60">
                    {facName}
                  </span>
                </li>
              ))
            )}
          </ol>

          {/* Closing Paragraph */}
          <p className="mb-4 text-justify leading-relaxed">
            Demikian surat permohonan ini kami sampaikan. Atas perhatian dan perkenan Bapak/Ibu, kami ucapkan terima kasih.
          </p>

          {/* Signature Blocks */}
          <div className="grid grid-cols-2 gap-4 text-center text-[8px] pt-1">
            {/* Mengetahui */}
            <div>
              <div className="text-slate-500 font-medium">Mengetahui,</div>
              <div className="mt-1 flex h-11 items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-1 text-[7.5px] text-slate-500 font-mono">
                [SLOT PEMBINA HIMA: {formData.pembinaName}]
              </div>
            </div>

            {/* Hormat Kami */}
            <div>
              <div className="text-slate-500 font-medium">Hormat kami,</div>
              <div className="mt-1 flex h-11 items-center justify-center rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-1 text-[7.5px] text-slate-500 font-mono">
                [SLOT KETUA HIMATIF: {formData.ketuaHimaName}]
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* Footer Helper Note */}
      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-slate-500">
        <InfoIcon size={14} className="text-amber-600 mt-0.5 shrink-0" />
        <p className="text-[11px] leading-tight">
          Bagian bertanda kuning diperbarui otomatis secara real-time dari isian formulir.
        </p>
      </div>
    </div>
  );
}
