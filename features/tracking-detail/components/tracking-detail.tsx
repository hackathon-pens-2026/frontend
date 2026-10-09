"use client";

import React, { useState } from "react";
import { TrackingDetailData } from "../types";
import { HeaderBanner } from "./header-banner";
import { BureaucracyTimeline } from "./bureaucracy-timeline";
import { DocumentSummaryCard } from "./document-summary-card";
import { AuditTrailCard } from "./audit-trail-card";

interface TrackingDetailProps {
  initialData?: TrackingDetailData;
  onBackToDashboard?: () => void;
  onBackToLetters?: () => void;
  onShowNotification?: (msg: string) => void;
}

const defaultTrackingData: TrackingDetailData = {
  letterNumber: "042/KM/PENS/X/2026",
  title: "Peminjaman Ruang Teater PENS",
  categoryTitle: "Peminjaman Fasilitas & Izin Kegiatan",
  organization: "HIMA Teknik Informatika (HIMATIF)",
  submittedAt: "08 Okt 2026, 08:47 WIB",
  currentStageNumber: 6,
  totalStages: 8,
  currentStageName: "Kabag Rumah Tangga",
  progressPercent: 62,
  estimatedCompletion: "10 Okt",
  stages: [
    {
      stepNumber: 1,
      role: "Ketua Panitia Pelaksana",
      assigneeName: "Ahmad Fauzi",
      status: "approved",
      statusLabel: "Disetujui · 08 Okt, 09:15",
      timestamp: "08 Okt, 09:15",
      note: "“Diajukan bersama proposal & rundown acara.”",
      sha256: "9f2c…a71e",
      isBsreCertified: true,
    },
    {
      stepNumber: 2,
      role: "Ketua HIMA Informatika",
      assigneeName: "Rian Pratama",
      status: "approved",
      statusLabel: "Disetujui · 08 Okt, 11:30",
      timestamp: "08 Okt, 11:30",
      sha256: "41be…0c93",
    },
    {
      stepNumber: 3,
      role: "Dosen Pembina Organisasi",
      assigneeName: "Ir. Budi Santoso, M.T.",
      status: "approved",
      statusLabel: "Disetujui · 08 Okt, 16:45",
      timestamp: "08 Okt, 16:45",
      note: "Disetujui. Koordinasi teknis teater disiapkan.",
      sha256: "c7d0…5f12",
    },
    {
      stepNumber: 4,
      role: "Kabid Minat & Bakat",
      assigneeName: "Dr. Hendra, S.ST., M.T.",
      status: "delegated",
      statusLabel: "Delegated / Dinas Luar",
      delegation: {
        delegatorName: "Dr. Hendra, S.ST., M.T.",
        delegatorInitials: "H",
        delegateName: "Rizal Maulana, S.ST. (Plt. Sekbid)",
        delegateInitials: "RM",
        reason: "Didelegasikan ke Plt. Sekbid karena dinas luar ke Ditjen Vokasi",
        approvedAt: "09 Okt, 08:30",
      },
    },
    {
      stepNumber: 5,
      role: "Presiden BEM PENS",
      assigneeName: "Kevin Ardiansyah",
      status: "approved",
      statusLabel: "Disetujui · 09 Okt, 11:00",
      timestamp: "09 Okt, 11:00",
      sha256: "e510…77a9",
    },
    {
      stepNumber: 6,
      role: "Kepala Bagian Rumah Tangga & Sarpras",
      assigneeName: "H. Agus Salim",
      assigneeInitials: "HA",
      status: "active",
      statusLabel: "Menunggu Respons",
      lastActive: "Terakhir aktif 42 mnt lalu",
      slaRemaining: "18 Jam 41 Menit 54d",
      slaStartTime: "09 Okt, 11:00",
      slaDeadline: "10 Okt, 11:00",
    },
    {
      stepNumber: 7,
      role: "Wakil Direktur III Bidang Kemahasiswaan",
      assigneeName: "Dr. Ir. Bima Sena, M.T. · Menunggu Tahap 6",
      status: "pending",
      statusLabel: "Pending",
    },
    {
      stepNumber: 8,
      role: "Penerbitan QR Code & Legalisir Digital",
      assigneeName: "Sistem SignIt! · Otomatis setelah seluruh tahap disetujui",
      status: "pending",
      statusLabel: "Pending",
      isSystem: true,
    },
  ],
  summary: {
    type: "Peminjaman Fasilitas & Izin Kegiatan",
    room: "Ruang Teater PENS · Gd. Pascasarjana Lt. 1",
    useTime: "Sab, 17 Okt 2026 · 13.00–21.00 WIB",
    activity: "Malam Apresiasi Seni HIMATIF (± 250 peserta)",
    attachments: ["Proposal", "Rundown", "Denah Panggung"],
  },
  auditTrail: [
    {
      id: "ev-10",
      timestamp: "2026-10-09T11:00:07+07:00",
      category: "system",
      actor: "SYSTEM",
      action: "Routing → Kabag Rumah Tangga & Sarpras. SLA 24 jam dimulai",
      dotColor: "blue",
    },
    {
      id: "ev-9",
      timestamp: "2026-10-09T11:00:04+07:00",
      category: "user",
      actor: "Kevin Ardiansyah",
      action: "APPROVED · TTE tersegel (SHA-256 e510…77a9)",
      metadata: "IP 10.10.4.21 · Chrome/macOS",
      dotColor: "green",
    },
    {
      id: "ev-8",
      timestamp: "2026-10-09T10:12:51+07:00",
      category: "user",
      actor: "Kevin Ardiansyah",
      action: "Membuka dokumen (view)",
      dotColor: "slate",
    },
    {
      id: "ev-7",
      timestamp: "2026-10-09T08:30:22+07:00",
      category: "user",
      actor: "Rizal Maulana (Plt.)",
      action: "APPROVED atas nama Kabid Minat & Bakat",
      metadata: "Delegasi #DLG-118 · IP 10.10.2.7",
      dotColor: "purple",
    },
    {
      id: "ev-6",
      timestamp: "2026-10-09T07:00:00+07:00",
      category: "system",
      actor: "SYSTEM",
      action: "Delegasi aktif: Dr. Hendra → Plt. Sekbid (09–11 Okt)",
      dotColor: "purple",
    },
    {
      id: "ev-5",
      timestamp: "2026-10-08T16:45:39+07:00",
      category: "user",
      actor: "Ir. Budi Santoso, M.T.",
      action: "APPROVED · catatan ditambahkan",
      metadata: "IP 10.10.1.88 · Edge/Windows",
      dotColor: "green",
    },
    {
      id: "ev-4",
      timestamp: "2026-10-08T11:30:12+07:00",
      category: "user",
      actor: "Rian Pratama",
      action: "APPROVED · TTE tersegel (SHA-256 41be…0c93)",
      metadata: "Mobile · SignIt! PWA",
      dotColor: "green",
    },
    {
      id: "ev-3",
      timestamp: "2026-10-08T09:15:03+07:00",
      category: "user",
      actor: "Ahmad Fauzi",
      action: "APPROVED · TTE tersegel (SHA-256 9f2c…a71e)",
      dotColor: "green",
    },
    {
      id: "ev-2",
      timestamp: "2026-10-08T08:47:56+07:00",
      category: "system",
      actor: "SYSTEM",
      action: "Nomor registrasi diterbitkan: 042/KM/PENS/X/2026",
      dotColor: "amber",
    },
    {
      id: "ev-1",
      timestamp: "2026-10-08T08:47:31+07:00",
      category: "user",
      actor: "M. Fajrul",
      action: "SUBMITTED · 3 lampiran (4.1 MB)",
      metadata: "PENS SSO · 2103191001",
      dotColor: "blue",
    },
  ],
};

export function TrackingDetail({
  initialData = defaultTrackingData,
  onBackToDashboard,
  onBackToLetters,
  onShowNotification,
}: TrackingDetailProps) {
  const [data] = useState<TrackingDetailData>(initialData);
  const [isReminderSent, setIsReminderSent] = useState(false);

  const handleSendReminder = () => {
    setIsReminderSent(true);
    if (onShowNotification) {
      onShowNotification(
        "Auto-reminder terkirim via WhatsApp resmi & SSO ke H. Agus Salim (Kabag Rumah Tangga)."
      );
    }
  };

  const handleDownloadDraft = () => {
    if (onShowNotification) {
      onShowNotification(
        `Mengunduh salinan draf surat permohonan #${data.letterNumber.replace(/\//g, "-")}.pdf`
      );
    }
  };

  const handlePreviewAttachment = (filename: string) => {
    if (onShowNotification) {
      onShowNotification(`Membuka berkas lampiran resmi: ${filename}`);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-6 px-4 sm:px-8 py-6 flex-1 bg-[#f8fafc]">
      {/* Top Section: Breadcrumb & Hero Milestone Banner */}
      <HeaderBanner
        letterNumber={data.letterNumber}
        title={data.title}
        organization={data.organization}
        submittedAt={data.submittedAt}
        currentStageNumber={data.currentStageNumber}
        totalStages={data.totalStages}
        currentStageName={data.currentStageName}
        progressPercent={data.progressPercent}
        estimatedCompletion={data.estimatedCompletion}
        onBackToDashboard={onBackToDashboard}
        onBackToLetters={onBackToLetters}
        onDownloadDraft={handleDownloadDraft}
      />

      {/* Main 2-Column Content Layout (Matching 592px / 340px grid proportions) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rantai Birokrasi (8-stage timeline) */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          <BureaucracyTimeline
            stages={data.stages}
            onSendReminder={handleSendReminder}
            isReminderSent={isReminderSent}
          />
        </div>

        {/* Right Column: Ringkasan Dokumen & Log Aktivitas / Audit Trail */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          <DocumentSummaryCard
            summary={data.summary}
            onPreviewAttachment={handlePreviewAttachment}
          />

          <AuditTrailCard
            logs={data.auditTrail}
            onExportCsv={() => {
              if (onShowNotification) {
                onShowNotification("Audit trail CSV berhasil diekspor.");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
