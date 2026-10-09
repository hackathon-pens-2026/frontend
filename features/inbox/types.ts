export type ApprovalStatus =
  | "approved"
  | "review"
  | "pending"
  | "rejected"
  | "delegated"
  | "waiting";

export interface ApprovalStep {
  role: string;
  name: string;
  status: ApprovalStatus;
  at?: string;
  note?: string;
  delegate?: {
    to: string;
    reason: string;
  };
}

export interface InboxLetter {
  id: string;
  title: string;
  type: string;
  applicant: string;
  nrp: string;
  unit: string;
  submitted: string;
  slaHours: number;
  slaTotal: number;
  status: ApprovalStatus;
  priority?: boolean;
  pages: number;
  steps: ApprovalStep[];
}
