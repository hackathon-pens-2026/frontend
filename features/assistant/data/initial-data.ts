import { LetterFormField, PersonOption } from "../types";

export const initialFormFields: LetterFormField[] = [
  {
    key: "jenis",
    label: "Jenis Surat",
    value: "Peminjaman Ruangan",
    kind: "text",
    hint: "",
  },
  {
    key: "nama",
    label: "Nama Kegiatan",
    value: "Buka Bersama & Diskusi Himpunan",
    kind: "text",
    hint: "",
  },
  {
    key: "tanggal",
    label: "Tanggal",
    value: "18 Oktober 2026 (15:00 - 19:00 WIB)",
    kind: "text",
    hint: "",
  },
  {
    key: "lokasi",
    label: "Lokasi",
    value: "Ruang Teater Gedung D4",
    kind: "text",
    hint: "",
  },
  {
    key: "ketua",
    label: "Ketua Pelaksana",
    value: "Ahmad Fauzi",
    kind: "ketua",
    hint: "",
  },
  {
    key: "pembina",
    label: "Dosen Pembina",
    value: null,
    kind: "pembina",
    hint: "Belum dipilih",
  },
  {
    key: "rundown",
    label: "File Lampiran Rundown",
    value: null,
    kind: "file",
    hint: "Belum diunggah",
  },
  {
    key: "peserta",
    label: "Estimasi Peserta",
    value: null,
    kind: "text",
    hint: "Belum diisi",
  },
];

export const registeredKetuaList: PersonOption[] = [
  { name: "Ahmad Fauzi", meta: "NRP: 2103191001 - HIMA TI" },
  { name: "Rian Pratama", meta: "NRP: 2103191012 - HIMA TI" },
  { name: "Nadia Putri", meta: "NRP: 2103191018 - HIMA TI" },
  { name: "Aulia Rahma", meta: "NRP: 2103191033 - HIMA TI" },
];

export const registeredPembinaList: PersonOption[] = [
  {
    name: "Ir. Budi Santoso, M.T.",
    meta: "NIP 19700512 199803 1 004 · Pembina HIMA TI",
  },
  {
    name: "Dr. Ferry Astika Saputra",
    meta: "NIP 19770315 200312 1 002 · Dosen Informatika",
  },
  {
    name: "Arna Fariza, M.Kom.",
    meta: "NIP 19760804 200212 2 001 · Dosen Informatika",
  },
];

export const typePillOptions = [
  "Peminjaman Ruangan & Fasilitas",
  "Dispensasi Kuliah",
  "Permohonan Dana",
  "Surat Rekomendasi",
];
