export type DashboardLetterStatus = "review" | "approved" | "rejected" | "pending";

export interface DashboardLetter {
  id: string;
  no: string;
  title: string;
  category: string;
  date: string;
  stage: string;
  status: DashboardLetterStatus;
  completedTasks: number;
  totalTasks: number;
  finalDocumentId: string | null;
  dueAt: string | null;
  isOverdue: boolean;
  version: string;
  revisionId: string;
  contentHash: string;
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
