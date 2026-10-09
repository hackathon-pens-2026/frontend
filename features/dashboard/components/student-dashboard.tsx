"use client";

import React, { useMemo, useState } from "react";
import { FilterStatus, Letter, NavigationItem, UserProfile } from "../types";
import { SummaryCards } from "./summary-cards";
import { AttentionSection } from "./attention-section";
import { RecentLetters } from "./recent-letters";
import { PermitWizard } from "@/features/permit-wizard/components/permit-wizard";
import { TrackingDetail } from "@/features/tracking-detail/components/tracking-detail";
import {
  LogoIcon,
  SearchIcon,
  PlusIcon,
  LayoutDashboardIcon,
  FilePlusIcon,
  FileTextIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  DownloadIcon,
  XIcon,
  CheckIcon,
  UploadIcon,
} from "./icons";

const mockProfile: UserProfile = {
  name: "M. Fajrul",
  nrp: "2103191001",
  prodi: "D4 Teknik Informatika",
  initials: "MF",
  isSsoVerified: true,
};

const mockLetters: Letter[] = [
  {
    no: "042/KM/PENS/X/2026",
    title: "Peminjaman Ruang Teater PENS",
    category: "Peminjaman Fasilitas",
    date: "08 Okt 2026",
    stage: "Kabag Rumah Tangga (6/8)",
    status: "review",
    steps: [
      { role: "Ketua Panitia Pelaksana", name: "Ahmad Fauzi", status: "approved", at: "08 Okt, 09:15", hash: "9f2c…a71e" },
      { role: "Ketua HIMA Informatika", name: "Rian Pratama", status: "approved", at: "08 Okt, 11:30", hash: "41be…0c93" },
      { role: "Dosen Pembina Organisasi", name: "Ir. Budi Santoso, M.T.", status: "approved", at: "08 Okt, 16:45", hash: "c7d0…5f12", note: "Disetujui. Koordinasi teknis teater disiapkan." },
      { role: "Kabid Minat & Bakat", name: "Dr. Hendra, S.ST., M.T.", status: "delegated", at: "09 Okt, 08:30", hash: "2a8e…d4b7", delegate: { to: "Rizal Maulana, S.ST. (Plt. Sekbid)", reason: "Dinas luar ke Ditjen Vokasi" } },
      { role: "Presiden BEM PENS", name: "Kevin Ardiansyah", status: "approved", at: "09 Okt, 11:00", hash: "e510…77a9" },
      { role: "Kabag Rumah Tangga & Sarpras", name: "H. Agus Salim", status: "review" },
      { role: "Wadir III Kemahasiswaan", name: "Dr. Ir. Bima Sena, M.T.", status: "waiting" },
      { role: "Penerbitan QR Code & Legalisir", name: "Sistem SignIt!", status: "waiting" },
    ],
  },
  {
    no: "SGN/25/0612",
    title: "Peminjaman Gedung D4 & Sound System",
    category: "Peminjaman Fasilitas",
    date: "10 Jun 2025",
    stage: "BEM PENS (5/8)",
    status: "review",
    steps: [
      { role: "Ketua Panitia Pelaksana", name: "Ahmad Fauzi", status: "approved", at: "10 Jun, 08:12", hash: "9f2c…a71e", note: "Diajukan bersama proposal & rundown acara." },
      { role: "Pembina UKM", name: "Dr. Hendra S.", status: "approved", at: "10 Jun, 13:40", hash: "41be…0c93" },
      { role: "Kaprodi D4 Informatika", name: "Dr. Tita Karlita", status: "approved", at: "11 Jun, 09:05", hash: "c7d0…5f12" },
      { role: "Kepala Departemen", name: "Dr. Rina Kartika", status: "approved", at: "11 Jun, 15:22", hash: "2a8e…d4b7" },
      { role: "BEM PENS", name: "Kementerian Dalam Kampus", status: "review", at: "11 Jun, 16:00" },
      { role: "Bagian Umum & Sarpras", name: "Pengelola Gedung D4", status: "waiting" },
      { role: "Wadir III Kemahasiswaan", name: "Dr. Agus Salim", status: "waiting" },
      { role: "Unit Keamanan Kampus", name: "Satpam PENS", status: "waiting" },
    ],
  },
  {
    no: "SGN/25/0598",
    title: "Dispensasi Lomba Hackathon Nasional",
    category: "Dispensasi",
    date: "08 Jun 2025",
    stage: "Pembina HIMA (2/4)",
    status: "rejected",
    steps: [
      { role: "Dosen Wali", name: "Arna Fariza, M.Kom.", status: "approved", at: "08 Jun, 10:00" },
      { role: "Pembina HIMA", name: "Dr. Ferry Astika", status: "rejected", at: "09 Jun, 14:31", note: "Lampirkan surat undangan resmi panitia & daftar anggota tim." },
      { role: "Kaprodi D4 Informatika", name: "Dr. Tita Karlita", status: "waiting" },
      { role: "BAAK", name: "Bagian Akademik", status: "waiting" },
    ],
  },
  {
    no: "SGN/25/0587",
    title: "Permohonan Dana Delegasi Gemastik",
    category: "Permohonan Dana",
    date: "05 Jun 2025",
    stage: "Wadir III (3/4)",
    status: "pending",
    steps: [
      { role: "Pembina UKM", name: "Dr. Hendra S.", status: "approved", at: "05 Jun, 09:00" },
      { role: "Kaprodi D4 Informatika", name: "Dr. Tita Karlita", status: "approved", at: "06 Jun, 11:10" },
      { role: "Wadir III Kemahasiswaan", name: "Dr. Agus Salim", status: "pending" },
      { role: "Bagian Keuangan", name: "BAUK", status: "waiting" },
    ],
  },
  {
    no: "SGN/25/0571",
    title: "Peminjaman Ruang Seminar Lt. 3",
    category: "Peminjaman Fasilitas",
    date: "02 Jun 2025",
    stage: "BEM PENS (3/3)",
    status: "approved",
    downloadable: true,
    steps: [
      { role: "Ketua HIMA", name: "Nadia Putri", status: "approved", at: "02 Jun, 08:30" },
      { role: "Pembina HIMA", name: "Dr. Ferry Astika", status: "approved", at: "02 Jun, 13:00" },
      { role: "BEM PENS", name: "Kementerian Dalam Kampus", status: "approved", at: "03 Jun, 09:41" },
    ],
  },
  {
    no: "SGN/25/0544",
    title: "Surat Keterangan Aktif Kuliah",
    category: "Keterangan Akademik",
    date: "28 Mei 2025",
    stage: "BAAK (2/2)",
    status: "approved",
    downloadable: true,
    steps: [
      { role: "Dosen Wali", name: "Arna Fariza, M.Kom.", status: "approved", at: "28 Mei, 10:20" },
      { role: "BAAK", name: "Bagian Akademik", status: "approved", at: "28 Mei, 15:02" },
    ],
  },
  {
    no: "SGN/25/0519",
    title: "Rekomendasi Magang MBKM — PT. Telkom",
    category: "Rekomendasi",
    date: "21 Mei 2025",
    stage: "Kaprodi (2/2)",
    status: "approved",
    downloadable: true,
    steps: [
      { role: "Dosen Wali", name: "Arna Fariza, M.Kom.", status: "approved", at: "21 Mei, 09:00" },
      { role: "Kaprodi D4 Informatika", name: "Dr. Tita Karlita", status: "approved", at: "22 Mei, 10:45" },
    ],
  },
];

const navigationMenu: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "new-request", label: "Buat Pengajuan Baru" },
  { id: "my-letters", label: "Surat Saya", badge: 3 },
];

export default function StudentDashboard() {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [filter, setFilter] = useState<FilterStatus>("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isNudgeSent, setIsNudgeSent] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewLetterModal, setShowNewLetterModal] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const filteredLetters = useMemo(() => {
    return mockLetters.filter((item) => {
      let matchesFilter = true;
      if (filter === "Berjalan") {
        matchesFilter = item.status === "review" || item.status === "pending";
      } else if (filter === "Disetujui") {
        matchesFilter = item.status === "approved";
      } else if (filter === "Revisi") {
        matchesFilter = item.status === "rejected";
      }

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.no.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.stage.toLowerCase().includes(q)
      );
    });
  }, [filter, searchQuery]);

  const renderNavIcon = (id: string) => {
    switch (id) {
      case "dashboard":
        return <LayoutDashboardIcon size={18} />;
      case "new-request":
        return <FilePlusIcon size={18} />;
      case "my-letters":
      default:
        return <FileTextIcon size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans relative selection:bg-blue-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 animate-rise flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Formal Left Sidebar (Deep Navy Slate #0F172A) */}
      <aside
        aria-label="Sidebar Menu"
        className="fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col bg-[#0f172a] px-4 py-5 select-none text-white shadow-lg"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#1e3a8a] text-white shadow-xs ring-1 ring-white/10">
            <LogoIcon size={20} />
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-bold tracking-tight text-white">
              SignIt<span className="text-amber-400 font-extrabold">!</span>
            </div>
            <div className="text-[11px] font-medium text-slate-400">Portal Mahasiswa</div>
          </div>
        </div>

        {/* User Identity Card */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex size-[38px] items-center justify-center rounded-full bg-[#1e3a8a] text-xs font-semibold text-white">
                {mockProfile.initials}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-[#0f172a] bg-emerald-500" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm font-semibold text-white">{mockProfile.name}</div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">{mockProfile.nrp}</div>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
              {mockProfile.prodi}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300">
              <ShieldCheckIcon size={11} className="text-emerald-400" />
              SSO Terverifikasi
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="mt-6 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Navigasi
        </div>
        <nav className="flex flex-col gap-1" aria-label="Menu Utama">
          {navigationMenu.map((item) => {
            const isActive =
              activeNav === item.id ||
              (item.id === "my-letters" && activeNav === "tracking");
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "my-letters") {
                    setActiveNav("tracking");
                  } else {
                    setActiveNav(item.id);
                  }
                }}
                className={`relative flex h-10 items-center gap-3 rounded-lg px-3 text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-white/10 text-white font-semibold"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <span className="absolute top-1.5 bottom-1.5 -left-4 w-1 rounded-r-full bg-[#1e3a8a]" />
                )}
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {renderNavIcon(item.id)}
                </span>
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge !== undefined && (
                  <span className="rounded-full bg-[#1e3a8a] px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums leading-none">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Public QR Card */}
        <button
          type="button"
          onClick={() => showNotification("Verifikasi QR Publik: Seluruh dokumen resmi divalidasi dengan tanda tangan elektronik.")}
          className="mt-auto block rounded-xl border border-white/10 bg-slate-800/60 p-4 text-left transition hover:border-slate-600 cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <QrCodeIcon size={16} className="text-emerald-400" />
            <span>Verifikasi QR Publik</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
            Keabsahan dokumen ber-QR dapat diverifikasi secara daring oleh instansi terkait.
          </p>
        </button>
      </aside>

      {/* Main Surface Area */}
      <div className="pl-[260px] min-h-screen flex flex-col bg-[#f8fafc]">
        {/* TopBar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-8 shadow-xs">
          {/* Search Bar */}
          <div className="relative w-full max-w-[460px]">
            <SearchIcon
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor surat, jenis izin, atau approver..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-[#f8fafc] pr-8 pl-9 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                aria-label="Bersihkan pencarian"
              >
                <XIcon size={12} />
              </button>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="ml-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveNav("new-request")}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1e3a8a] px-4 text-xs font-semibold text-white shadow-xs transition hover:bg-[#172554] cursor-pointer"
            >
              <PlusIcon size={16} />
              <span>Ajukan Surat Izin Baru</span>
            </button>

            <div className="h-6 w-px bg-slate-200" />

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex size-10 items-center justify-center rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="Menu Akun Mahasiswa"
                aria-expanded={showProfileMenu}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-bold text-[#1e3a8a]">
                  {mockProfile.initials}
                </span>
              </button>

              {showProfileMenu && (
                <div className="animate-rise absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                  <div className="border-b border-slate-100 px-3 pt-2 pb-3">
                    <div className="text-xs font-semibold text-slate-900">{mockProfile.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {mockProfile.nrp} · {mockProfile.prodi}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      showNotification("Sesi akun PENS SSO aktif.");
                    }}
                    className="mt-1 flex h-9 w-full items-center gap-2 rounded-lg px-3 text-xs text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        {activeNav === "new-request" ? (
          <PermitWizard onBackToDashboard={() => setActiveNav("dashboard")} />
        ) : activeNav === "tracking" || activeNav === "my-letters" ? (
          <TrackingDetail
            onBackToDashboard={() => setActiveNav("dashboard")}
            onBackToLetters={() => setActiveNav("dashboard")}
            onShowNotification={showNotification}
          />
        ) : (
          <main className="mx-auto w-full max-w-[1240px] space-y-6 px-8 py-6 flex-1 bg-[#f8fafc]">
            {/* Welcome Header */}
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Selamat Datang, Fajrul
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Pantau kelancaran birokrasi dan status surat izin secara terpusat.
                </p>
              </div>

              {/* Sync Badge */}
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-xs">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60" />
                  <span className="relative size-2 rounded-full bg-emerald-500" />
                </span>
                <span>Tersinkron · baru saja</span>
              </div>
            </div>

            {/* Component: Summary Cards */}
            <SummaryCards
              onSelectMetric={(id) => {
                if (id === "active") setFilter("Berjalan");
                else if (id === "approved") setFilter("Disetujui");
                else if (id === "waiting") setFilter("Berjalan");
              }}
            />

            {/* Component: Attention Section */}
            <AttentionSection
              onOpenTracking={(no) => {
                if (no === "042/KM/PENS/X/2026") {
                  setActiveNav("tracking");
                } else {
                  const item = mockLetters.find((l) => l.no === no);
                  if (item) setSelectedLetter(item);
                }
              }}
              onSendNudge={() => {
                setIsNudgeSent(true);
                showNotification("Nudge pengingat resmi dikirim ke approver BEM PENS via email.");
              }}
              onViewNotes={() => setShowRevisionModal(true)}
              onUploadRevision={() => setShowUploadModal(true)}
              isNudgeSent={isNudgeSent}
            />

            {/* Component: Recent Letters Table */}
            <RecentLetters
              letters={filteredLetters}
              currentFilter={filter}
              onFilterChange={setFilter}
              onSelectLetter={(letter) => {
                if (letter.no === "042/KM/PENS/X/2026") {
                  setActiveNav("tracking");
                } else {
                  setSelectedLetter(letter);
                }
              }}
              onDownloadPdf={(letter) =>
                showNotification(`Mengunduh berkas resmi ber-QR: ${letter.no}.pdf`)
              }
            />
          </main>
        )}
      </div>

      {/* Slide-over Drawer for Tracking Detail */}
      {selectedLetter && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] transition-opacity flex justify-end"
          onClick={() => setSelectedLetter(null)}
        >
          <aside
            aria-label="Detail Pelacakan Surat"
            className="animate-rise w-full max-w-[460px] h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-200 p-6">
              <div>
                <span className="font-mono text-xs font-medium text-slate-400">
                  {selectedLetter.no}
                </span>
                <h3 className="mt-1 text-base font-semibold text-slate-900 leading-snug">
                  {selectedLetter.title}
                </h3>
                <div className="mt-2 text-xs text-slate-500">
                  {selectedLetter.category} · {selectedLetter.stage}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLetter(null)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                aria-label="Tutup Detail"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="scroll-thin flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  Alur Persetujuan &amp; Tanda Tangan
                </div>

                <ol className="space-y-4">
                  {selectedLetter.steps.map((step, idx) => {
                    const isApproved = step.status === "approved";
                    const isReview = step.status === "review";
                    const isRejected = step.status === "rejected";
                    const isDelegated = step.status === "delegated";

                    return (
                      <li key={idx} className="relative flex gap-3 text-xs">
                        {idx !== selectedLetter.steps.length - 1 && (
                          <span
                            className={`absolute top-6 bottom-0 left-[13px] w-0.5 ${
                              isApproved ? "bg-emerald-300" : "bg-slate-200"
                            }`}
                          />
                        )}

                        <span
                          className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full text-white font-bold text-[10px] ${
                            isApproved
                              ? "bg-emerald-600"
                              : isReview
                              ? "bg-blue-600"
                              : isRejected
                              ? "bg-red-600"
                              : isDelegated
                              ? "bg-purple-600"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {isApproved ? (
                            <CheckIcon size={12} />
                          ) : (
                            idx + 1
                          )}
                        </span>

                        <div className="min-w-0 flex-1 pt-0.5 pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-900">{step.role}</span>
                            {step.at && (
                              <span className="text-[11px] text-slate-400 tabular-nums">
                                {step.at}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 mt-0.5">{step.name}</div>

                          {step.note && (
                            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                              “{step.note}”
                            </div>
                          )}

                          {step.delegate && (
                            <div className="mt-2 rounded-lg border border-purple-200 bg-purple-50 p-2 text-xs text-purple-700">
                              <span className="font-semibold block">{step.delegate.reason}</span>
                              <span className="text-[11px]">{step.delegate.to}</span>
                            </div>
                          )}

                          {step.hash && (
                            <div className="mt-1 text-[11px] text-slate-400 font-mono">
                              SHA-256: {step.hash}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-[#f8fafc] p-4 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedLetter(null);
                  setActiveNav("tracking");
                }}
                className="w-full flex h-10 items-center justify-center gap-2 rounded-lg border border-[#1e3a8a] bg-blue-50/60 text-xs font-semibold text-[#1e3a8a] hover:bg-blue-100/70 transition cursor-pointer"
              >
                <span>Buka Detail Pelacakan Penuh #{selectedLetter.no.split("/")[0]}</span>
              </button>

              {selectedLetter.downloadable ? (
                <button
                  type="button"
                  onClick={() =>
                    showNotification(`Mengunduh dokumen PDF resmi ${selectedLetter.no}.pdf`)
                  }
                  className="w-full flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1e3a8a] text-xs font-semibold text-white shadow-xs hover:bg-[#172554] transition cursor-pointer"
                >
                  <DownloadIcon size={15} />
                  <span>Unduh Dokumen Resmi (PDF Ber-QR)</span>
                </button>
              ) : (
                <p className="flex h-10 items-center justify-center text-xs text-slate-500">
                  Surat resmi dapat diunduh setelah seluruh tahap disetujui.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Modal: Lihat Catatan Revisi */}
      {showRevisionModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowRevisionModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="animate-rise w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full ring-1 ring-red-200">
                  Catatan Revisi
                </span>
                <h3 id="revision-modal-title" className="mt-2 text-sm font-semibold text-slate-900">
                  Dispensasi Lomba Hackathon Nasional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Tutup Modal"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 text-slate-500">
                <span className="font-semibold text-slate-900">Dr. Ferry Astika</span>
                <span>· Pembina HIMA</span>
                <span>· 09 Jun, 14:31 WIB</span>
              </div>
              <div className="rounded-lg bg-[#f8fafc] p-3 border border-slate-200 text-slate-700 italic">
                “Lampirkan surat undangan resmi panitia &amp; daftar anggota tim.”
              </div>
              <p className="text-slate-500 leading-relaxed">
                Silakan siapkan lampiran pendukung dalam format PDF untuk diunggah ulang agar surat dapat dilanjutkan ke Kaprodi.
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRevisionModal(false);
                  setShowUploadModal(true);
                }}
                className="h-9 rounded-lg bg-red-700 px-3 text-xs font-semibold text-white hover:bg-red-800 cursor-pointer"
              >
                Unggah Berkas Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Unggah Dokumen Revisi */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            className="animate-rise w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 id="upload-modal-title" className="text-sm font-semibold text-slate-900">
                  Unggah Dokumen Lampiran Revisi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  SGN/25/0598 · Dispensasi Lomba Hackathon Nasional
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Tutup Modal"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-[#f8fafc] hover:border-[#1e3a8a] transition cursor-pointer">
                <UploadIcon size={28} className="mx-auto text-slate-400 mb-3" />
                <p className="text-xs font-semibold text-slate-900">
                  Pilih file lampiran PDF atau seret ke area ini
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Maksimal 10 MB (Surat Undangan Resmi &amp; Daftar Peserta).
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadModal(false);
                  showNotification("Berkas lampiran revisi berhasil dikirim ke Pembina HIMA.");
                }}
                className="h-9 rounded-lg bg-[#1e3a8a] px-3.5 text-xs font-semibold text-white hover:bg-[#172554] cursor-pointer"
              >
                Kirim Revisi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ajukan Surat Baru */}
      {showNewLetterModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setShowNewLetterModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-letter-title"
            className="animate-rise w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full ring-1 ring-blue-200">
                  Pengajuan Baru
                </span>
                <h3 id="new-letter-title" className="mt-2 text-base font-bold text-slate-900">
                  Ingin membuat tipe surat apa?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih salah satu template surat resmi yang telah divalidasi oleh institusi PENS.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewLetterModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Tutup Dialog"
              >
                <XIcon size={16} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  title: "Peminjaman Fasilitas & Ruang",
                  desc: "Acara himpunan/UKM yang membutuhkan ruang kelas, gedung, atau alat kampus",
                  sla: "± 3 hari kerja",
                },
                {
                  title: "Dispensasi Perkuliahan",
                  desc: "Izin tidak mengikuti kuliah karena penugasan lomba atau delegasi resmi",
                  sla: "± 2 hari kerja",
                },
                {
                  title: "Permohonan Dana Kegiatan",
                  desc: "Pengajuan anggaran kegiatan kemahasiswaan ke Wadir III",
                  sla: "± 5 hari kerja",
                },
                {
                  title: "Surat Keterangan Aktif",
                  desc: "Keperluan beasiswa, BPJS, atau tunjangan kedinasan orang tua",
                  sla: "± 1 hari kerja",
                },
              ].map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => {
                    setShowNewLetterModal(false);
                    setActiveNav("new-request");
                    showNotification(`Template "${tmpl.title}" dipilih. Silakan lengkapi formulir.`);
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-[#f8fafc] hover:border-[#1e3a8a] hover:bg-white text-left transition group cursor-pointer shadow-xs"
                >
                  <h4 className="text-xs font-semibold text-slate-900 group-hover:text-[#1e3a8a] transition-colors">
                    {tmpl.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tmpl.desc}
                  </p>
                  <span className="mt-3 inline-block text-[10px] font-medium text-slate-400">
                    Estimasi SLA: {tmpl.sla}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowNewLetterModal(false)}
                className="h-9 rounded-lg border border-slate-200 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
