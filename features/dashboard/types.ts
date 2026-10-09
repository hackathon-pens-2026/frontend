export type LetterStatus = "review" | "approved" | "rejected" | "pending";

export type ApprovalStepStatus = LetterStatus | "waiting" | "delegated";

export interface ApprovalStep {
  role: string;
  name: string;
  status: ApprovalStepStatus;
  at?: string;
  note?: string;
  hash?: string;
  delegate?: {
    to: string;
    reason: string;
  };
}

export interface Letter {
  no: string;
  title: string;
  category: string;
  date: string;
  stage: string;
  status: LetterStatus;
  downloadable?: boolean;
  steps: ApprovalStep[];
}

export interface UserProfile {
  name: string;
  nrp: string;
  prodi: string;
  initials: string;
  isSsoVerified: boolean;
}

export interface SummaryMetric {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  badge?: {
    label: string;
    variant: "success" | "info" | "warning";
  };
  variant: "info" | "warning" | "success" | "neutral";
}

export type FilterStatus = "Semua" | "Berjalan" | "Disetujui" | "Revisi";

export interface NavigationItem {
  id: string;
  label: string;
  badge?: number;
}

export interface StaffProfile {
  name: string;
  short: string;
  role: string;
  nip: string;
  initials: string;
}

export interface StaffDashboardMetric {
  label: string;
  value: string;
  delta: string;
  tone: string;
}

export interface StaffActivityItem {
  who: string;
  what: string;
  doc: string;
  when: string;
  status: "approved" | "review" | "pending" | "rejected" | "delegated" | "waiting";
}

