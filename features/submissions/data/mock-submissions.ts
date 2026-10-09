import { NewDocumentTemplate, StaffSubmission } from "../types";

export const mockSubmissionsData: StaffSubmission[] = [
  {
    id: "SGN-2025-0390",
    title: "SK Penugasan Dosen Pembimbing TA",
    type: "Surat Keputusan",
    applicant: "Dr. Rina Kartika",
    nrp: "-",
    unit: "Dept. Teknik Elektro",
    submitted: "12 Jun",
    slaHours: 0,
    slaTotal: 72,
    status: "approved",
    pages: 4,
    steps: [
      { role: "Kepala Departemen", name: "Dr. Rina Kartika", status: "approved", at: "12 Jun, 08:00" },
      { role: "Wadir I Akademik", name: "Dr. Ali Ridho", status: "approved", at: "13 Jun, 10:15" },
      { role: "Direktur PENS", name: "Dr. Aliridho Barakbah", status: "approved", at: "14 Jun, 16:02" },
    ],
  },
  {
    id: "SGN-2025-0421",
    title: "Pengajuan Anggaran Alat Praktikum 2025",
    type: "Anggaran",
    applicant: "Dr. Rina Kartika",
    nrp: "-",
    unit: "Dept. Teknik Elektro",
    submitted: "15 Jun",
    slaHours: 22,
    slaTotal: 96,
    status: "review",
    pages: 8,
    steps: [
      { role: "Kepala Departemen", name: "Dr. Rina Kartika", status: "approved", at: "15 Jun, 09:00" },
      { role: "Wadir II Keuangan", name: "Dr. Tri Harsono", status: "review" },
      { role: "Direktur PENS", name: "Dr. Aliridho Barakbah", status: "waiting" },
    ],
  },
  {
    id: "SGN-2025-0402",
    title: "Surat Tugas Konferensi IES 2025",
    type: "Surat Tugas",
    applicant: "Dr. Rina Kartika",
    nrp: "-",
    unit: "Dept. Teknik Elektro",
    submitted: "13 Jun",
    slaHours: 0,
    slaTotal: 48,
    status: "rejected",
    pages: 2,
    steps: [
      { role: "Kepala Departemen", name: "Dr. Rina Kartika", status: "approved", at: "13 Jun, 11:00" },
      { role: "Wadir I Akademik", name: "Dr. Ali Ridho", status: "rejected", at: "14 Jun, 09:31", note: "Lampirkan Letter of Acceptance dan rincian biaya perjalanan." },
    ],
  },
];

export const mockNewTemplates: NewDocumentTemplate[] = [
  { t: "Permohonan Dana", sla: "48 jam", chain: ["Pembina", "Kaprodi", "Kadep", "Wadir III"] },
  { t: "Surat Rekomendasi", sla: "72 jam", chain: ["Dosen Wali", "Kadep"] },
  { t: "Peminjaman Fasilitas", sla: "24 jam", chain: ["Kalab", "Kadep"] },
  { t: "Cuti Akademik", sla: "72 jam", chain: ["Dosen Wali", "Kadep", "BAAK"] },
];
