"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getMySignatureQr } from "@/lib/api/me";
import { ApiError } from "@/lib/api/errors";
import type { UserSignatureQrDto } from "@/lib/api/types";

export function SignatureQrPanel() {
  const [qr, setQr] = useState<UserSignatureQrDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    getMySignatureQr()
      .then((result) => {
        if (active) setQr(result);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setError(
          cause instanceof ApiError
            ? cause.message
            : "QR tanda tangan tidak dapat dimuat.",
        );
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision">
        {error}
      </p>
    );
  }

  if (!qr) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-line bg-canvas">
        <span className="text-body text-slate-500">Memuat QR…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center rounded-xl border border-line bg-white p-4">
        <Image
          src={qr.qrDataUrl}
          alt="QR tanda tangan akun"
          width={192}
          height={192}
          unoptimized
        />
      </div>
      <div className="rounded-lg border border-line bg-canvas px-3 py-2">
        <div className="text-micro text-slate-500">Kode verifikasi</div>
        <div className="font-mono text-body font-semibold text-midnight">
          {qr.opaqueCode}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(qr.opaqueCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? "Kode disalin" : "Salin kode"}
        </Button>
        <a
          href={qr.qrDataUrl}
          download={`qr-signit-${qr.opaqueCode}.png`}
          className="inline-flex h-11 items-center rounded-lg border border-line bg-white px-3 text-micro font-semibold text-midnight shadow-card hover:bg-slate-50"
        >
          Unduh PNG
        </a>
      </div>
      <p className="text-micro text-slate-500">
        QR dibuat otomatis oleh sistem. Tempelkan pada dokumen melalui alur
        tanda tangan, bukan diunggah manual.
      </p>
    </div>
  );
}
