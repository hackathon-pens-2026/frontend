"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { StudentSidebar } from "@/features/shell";
import { TrackingDetail } from "./tracking-detail";
import { BackendLetterReview } from "./backend-letter-review";

const GUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function LetterDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const documentId = useSearchParams().get("documentId") ?? "";
  const id = typeof params?.id === "string" ? params.id : "";

  return (
    <div className="min-h-screen bg-canvas">
      <StudentSidebar currentPath="/surat" />
      <div className="pt-16 md:pt-0 md:pl-[260px]">
        {GUID_PATTERN.test(id) && GUID_PATTERN.test(documentId) ? <BackendLetterReview key={`${id}:${documentId}`} letterId={id} documentId={documentId} /> : GUID_PATTERN.test(id) ? (
          <TrackingDetail
            letterId={id}
            onBackToDashboard={() => router.push("/")}
            onBackToLetters={() => router.push("/surat")}
          />
        ) : (
          <div className="mx-auto max-w-md px-8 py-20 text-center">
            <h1 className="text-title font-semibold text-midnight">
              ID surat tidak valid
            </h1>
            <p className="mt-2 text-body text-slate-500">
              Tautan surat tidak dikenali. Buka daftar pengajuan untuk memilih
              surat.
            </p>
            <button
              type="button"
              onClick={() => router.push("/surat")}
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-navy px-4 text-body font-semibold text-white hover:bg-navy-hover cursor-pointer"
            >
              Kembali ke Surat Saya
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
