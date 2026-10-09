import { ApprovalStep, BaseApprovalStatus } from "@/components/ui";

export interface StaffSubmission {
  id: string;
  title: string;
  type: string;
  applicant: string;
  nrp: string;
  unit: string;
  submitted: string;
  slaHours: number;
  slaTotal: number;
  status: BaseApprovalStatus | string;
  pages: number;
  steps: ApprovalStep[];
}

export interface NewDocumentTemplate {
  t: string;
  sla: string;
  chain: string[];
}
