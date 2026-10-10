import type { UserDto, UserCategory, UiSurface, UserCapability, AssignmentDto } from "@/lib/api/types";

export interface DemoPersona {
  id: string;
  name: string;
  roleLabel: string;
  positionName: string;
  email: string;
  nimNip: string;
  userCategory: UserCategory;
  uiSurface: UiSurface;
  capabilities: UserCapability[];
  assignments: AssignmentDto[];
  badgeColor?: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  { id: "pengaju-organisasi", name: "UAT Pengaju Organisasi", roleLabel: "Mahasiswa / Pengaju", positionName: "Pengaju Organisasi", email: "uat.pengaju-organisasi@demo.signit.example", nimNip: "", userCategory: "StudentGeneral", uiSurface: "Student", capabilities: [], assignments: [] },
  { id: "minat-bakat", name: "UAT Tim Pembina Minat dan Bakat", roleLabel: "Manajemen", positionName: "Tim Pembina Minat dan Bakat", email: "uat.minat-bakat@demo.signit.example", nimNip: "", userCategory: "Management", uiSurface: "Management", capabilities: [], assignments: [] },
  { id: "wadir2", name: "UAT Wakil Direktur II", roleLabel: "Manajemen", positionName: "Wakil Direktur II", email: "uat.wadir2@demo.signit.example", nimNip: "", userCategory: "Management", uiSurface: "Management", capabilities: [], assignments: [] },
  { id: "ketupel-pengganti", name: "UAT Ketua Pelaksana Pengganti", roleLabel: "Penerima Delegasi", positionName: "Ketua Pelaksana", email: "uat.ketupel-pengganti@demo.signit.example", nimNip: "", userCategory: "StudentGeneral", uiSurface: "Student", capabilities: [], assignments: [] },
  { id: "ketua-pengganti", name: "UAT Ketua Organisasi Pengganti", roleLabel: "Penerima Delegasi", positionName: "Ketua Organisasi", email: "uat.ketua-pengganti@demo.signit.example", nimNip: "", userCategory: "StudentGeneral", uiSurface: "Student", capabilities: [], assignments: [] },
  {
    id: "pengaju",
    name: "Ahmad Zaki",
    roleLabel: "Mahasiswa / Pengaju",
    positionName: "Pengaju Himpunan HIMIT",
    email: "uat.pengaju-himpunan@demo.signit.example",
    nimNip: "3122500001",
    userCategory: "StudentGeneral",
    uiSurface: "Student",
    capabilities: ["Requester"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000010",
        positionCode: "Pengaju",
        positionName: "Pengaju Himpunan",
        scope: "uat-himpunan",
        capability: "Requester",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "ketupel",
    name: "Budi Santoso",
    roleLabel: "Ketua Pelaksana (Signer 1)",
    positionName: "Ketua Pelaksana Kegiatan",
    email: "uat.ketupel@demo.signit.example",
    nimNip: "3122500015",
    userCategory: "StudentGeneral",
    uiSurface: "Student",
    capabilities: ["Signer"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000030",
        positionCode: "Ketupel",
        positionName: "Ketua Pelaksana",
        scope: "uat-himpunan",
        capability: "Signer",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  {
    id: "ketua-himpunan",
    name: "Citra Lestari",
    roleLabel: "Ketua Himpunan (Signer 2)",
    positionName: "Ketua Himpunan HIMIT",
    email: "uat.ketua@demo.signit.example",
    nimNip: "3121500003",
    userCategory: "StudentGeneral",
    uiSurface: "Student",
    capabilities: ["Signer"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000040",
        positionCode: "KetuaOrganisasi",
        positionName: "Ketua Organisasi",
        scope: "uat-himpunan",
        capability: "Signer",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "pembina",
    name: "Dr. Ir. Bambang Widodo, M.T.",
    roleLabel: "Pembina Organisasi (Approver)",
    positionName: "Dosen Pembina HIMIT",
    email: "uat.pembina@demo.signit.example",
    nimNip: "197508122001121001",
    userCategory: "Management",
    uiSurface: "Management",
    capabilities: ["Approver"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000050",
        positionCode: "Pembina",
        positionName: "Pembina Organisasi",
        scope: "uat-himpunan",
        capability: "Approver",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  },
  {
    id: "kemahasiswaan",
    name: "Dewi Sartika, S.T.",
    roleLabel: "Bagian Kemahasiswaan (Approver)",
    positionName: "Kemahasiswaan Kampus",
    email: "uat.kemahasiswaan@demo.signit.example",
    nimNip: "198203152008042001",
    userCategory: "Management",
    uiSurface: "Management",
    capabilities: ["Approver"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000060",
        positionCode: "Kemahasiswaan",
        positionName: "Kemahasiswaan",
        scope: "uat-himpunan",
        capability: "Approver",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "dagri",
    name: "Fajar Pratama",
    roleLabel: "Dagri BEM (Approver)",
    positionName: "Menteri Dalam Negeri BEM",
    email: "uat.dagri@demo.signit.example",
    nimNip: "3121500045",
    userCategory: "StudentDagri",
    uiSurface: "Student",
    capabilities: ["Approver"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000080",
        positionCode: "Dagri",
        positionName: "Dagri BEM",
        scope: "uat-himpunan",
        capability: "Approver",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "baak",
    name: "Hendra Kusuma, S.Kom.",
    roleLabel: "BAAK (Ruangan & No. Surat)",
    positionName: "Kesekretariatan BAAK",
    email: "uat.baak@demo.signit.example",
    nimNip: "198005202005011002",
    userCategory: "BAAK",
    uiSurface: "Management",
    capabilities: ["Approver", "UnitOperator"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-000000000090",
        positionCode: "BAAK",
        positionName: "BAAK",
        scope: "uat-himpunan",
        capability: "Approver",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  },
  {
    id: "wadir3",
    name: "Prof. Dr. Tri Arief Sardjono",
    roleLabel: "Wakil Direktur III (Final)",
    positionName: "Wakil Direktur Bidang Kemahasiswaan",
    email: "uat.wadir3@demo.signit.example",
    nimNip: "196802141994031001",
    userCategory: "Management",
    uiSurface: "Management",
    capabilities: ["Approver"],
    assignments: [
      {
        id: "ab202610-0010-4000-8000-0000000100",
        positionCode: "Wadir3",
        positionName: "Wakil Direktur III",
        scope: "uat-himpunan",
        capability: "Approver",
        validFrom: "2026-01-01T00:00:00Z",
        validTo: null,
      },
    ],
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
];

export function personaToUserDto(persona: DemoPersona): UserDto {
  return {
    id: persona.id,
    name: persona.name,
    email: persona.email,
    nimNip: persona.nimNip,
    isActive: true,
    emailVerifiedAt: "2026-01-01T00:00:00Z",
    userCategory: persona.userCategory,
    uiSurface: persona.uiSurface,
    capabilities: persona.capabilities,
    assignments: persona.assignments,
  };
}
