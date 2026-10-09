import React from "react";
import { InboxLetter } from "../types";
import { QrCodeMiniPattern } from "@/components/ui";

export function DocumentSheet({ doc }: { doc: InboxLetter }) {
  const isApproved = doc.status === "approved";

  return (
    <div className="mx-auto aspect-[1/1.38] w-full max-w-[420px] rounded-sm bg-white p-8 text-[9px] leading-[14px] text-slate-700 shadow-lift flex flex-col justify-between">
      <div>
        {/* Letterhead */}
        <div className="flex items-center gap-3 border-b-2 border-midnight pb-3">
          <div className="flex size-9 items-center justify-center rounded-full bg-navy text-[8px] font-extrabold text-gold">
            PENS
          </div>
          <div>
            <div className="text-[8px] font-semibold tracking-wide text-slate-500 uppercase">
              Kementerian Pendidikan Tinggi, Sains, dan Teknologi
            </div>
            <div className="text-[11px] font-bold text-midnight">
              Politeknik Elektronika Negeri Surabaya
            </div>
            <div className="text-[7px] text-slate-400">
              Jl. Raya ITS, Sukolilo, Surabaya 60111
            </div>
          </div>
        </div>

        {/* Title & Doc Number */}
        <div className="mt-4 text-center text-[10px] font-bold text-midnight uppercase underline">
          {doc.type}
        </div>
        <div className="text-center text-[8px] text-slate-400">
          No: {doc.id}/PL14/2025
        </div>

        {/* Content simulation */}
        <div className="mt-4 space-y-1.5">
          <p className="font-semibold text-midnight">Perihal: {doc.title}</p>
          {[92, 100, 85, 97, 70, 100, 88, 60].map((w, idx) => (
            <div
              key={idx}
              className="h-1.5 rounded-full bg-slate-100"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>

      {/* Signature Section */}
      <div className="mt-6 ml-auto w-1/2 text-center">
        <div>Surabaya, 18 Juni 2025</div>
        {isApproved ? (
          <div className="my-2 flex h-14 items-center justify-center gap-2 rounded-md border border-emerald-200 bg-ok-bg/60 px-2">
            <QrCodeMiniPattern />
            <span className="text-left text-[7px] leading-[10px] text-emerald-800">
              <b className="block">Ditandatangani elektronik</b>
              Dr. Ir. Rina Kartika, M.T.
            </span>
          </div>
        ) : (
          <div className="my-2 flex h-14 items-center justify-center rounded-md border-2 border-dashed border-ok/70 px-2">
            <span className="text-[7.5px] leading-[10px] font-bold text-emerald-700">
              [SLOT KEPALA DEPARTEMEN: Dr. Ir. Rina Kartika, M.T.]
            </span>
          </div>
        )}
        <div className="text-[7px] text-slate-400">
          NIP 19780412 200501 2 003
        </div>
      </div>
    </div>
  );
}
