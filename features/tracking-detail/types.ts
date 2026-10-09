export type StageStatus = "approved" | "delegated" | "active" | "pending";

export interface DelegationInfo {
  delegatorName: string;
  delegatorInitials: string;
  delegateName: string;
  delegateInitials: string;
  reason: string;
  approvedAt: string;
}

export interface TimelineStage {
  stepNumber: number;
  role: string;
  assigneeName: string;
  assigneeInitials?: string;
  status: StageStatus;
  statusLabel: string;
  timestamp?: string;
  note?: string;
  sha256?: string;
  isBsreCertified?: boolean;
  delegation?: DelegationInfo;
  isExpanded?: boolean;
  slaRemaining?: string;
  slaStartTime?: string;
  slaDeadline?: string;
  lastActive?: string;
  isSystem?: boolean;
}

export interface DocumentSummary {
  type: string;
  room: string;
  useTime: string;
  activity: string;
  attachments: string[];
}

export type AuditCategory = "all" | "user" | "system";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  category: "user" | "system";
  actor: string;
  action: string;
  detail?: string;
  metadata?: string;
  dotColor: "blue" | "green" | "purple" | "slate" | "amber";
}

export interface TrackingDetailData {
  letterNumber: string;
  title: string;
  categoryTitle: string;
  organization: string;
  submittedAt: string;
  currentStageNumber: number;
  totalStages: number;
  currentStageName: string;
  progressPercent: number;
  estimatedCompletion: string;
  stages: TimelineStage[];
  summary: DocumentSummary;
  auditTrail: AuditLogItem[];
}
