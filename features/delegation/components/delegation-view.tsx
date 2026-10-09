"use client";

import React from "react";
import { Button, Card, DelegationIcon, ShieldCheckIcon } from "@/components/ui";

interface DelegationViewProps {
  onGoToInbox: () => void;
}

export function DelegationView({ onGoToInbox }: DelegationViewProps) {
  return (
    <div className="animate-rise space-y-6">
      <div>
        <h1 className="text-display font-bold text-midnight">
          Delegasi &amp; Dinas Luar
        </h1>
        <p className="mt-1 text-body text-slate-500">
          Mandat tanda tangan diberikan per tugas dan tercatat sebagai bukti
          audit pada surat terkait.
        </p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-delegate-bg text-delegate">
            <DelegationIcon className="size-6" />
          </span>
          <div className="flex-1">
            <h2 className="text-title font-semibold text-midnight">
              Delegasikan dari kotak persetujuan
            </h2>
            <p className="mt-1 max-w-2xl text-body text-slate-600">
              Buka tugas yang aktif, pilih{" "}
              <span className="font-semibold text-midnight">
                Delegasikan Tugas
              </span>
              , lalu pilih penerima mandat dengan posisi setara. Sistem backend
              memvalidasi kelayakan penerima, masa berlaku, dan mencatat nama
              pemberi maupun penerima mandat pada dokumen.
            </p>
            <ul className="mt-3 space-y-1.5 text-body text-slate-600">
              <li className="flex items-start gap-2">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-approved" />
                <span>Mandat hanya berlaku untuk satu tugas, maksimal 30 hari.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-approved" />
                <span>
                  Penerima mandat harus memiliki assignment aktif pada posisi
                  dan lingkup yang sama.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-approved" />
                <span>
                  Tanda tangan atas nama mandat tetap menampilkan aktor
                  sebenarnya pada timeline surat.
                </span>
              </li>
            </ul>
          </div>
          <Button variant="primary" onClick={onGoToInbox}>
            Buka Kotak Persetujuan
          </Button>
        </div>
      </Card>
    </div>
  );
}
export default DelegationView;
