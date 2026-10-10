// Kontrak DTO backend /api/v1. Enum diserialisasi sebagai string PascalCase.
export type UiSurface = "Student" | "Management";

export type UserCategory =
  | "StudentGeneral"
  | "StudentDagri"
  | "BAAK"
  | "Management";

export type UserCapability =
  | "Requester"
  | "Signer"
  | "Approver"
  | "UnitOperator";

export interface AssignmentDto {
  id: string;
  positionCode: string;
  positionName: string;
  scope: string;
  capability: UserCapability;
  validFrom: string;
  validTo: string | null;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  nimNip: string | null;
  isActive: boolean;
  emailVerifiedAt: string | null;
  userCategory: UserCategory;
  uiSurface: UiSurface;
  capabilities: UserCapability[];
  assignments: AssignmentDto[];
}

export interface CapabilitiesDto {
  userCategory: UserCategory;
  uiSurface: UiSurface;
  capabilities: UserCapability[];
  assignments: AssignmentDto[];
}

export interface AuthTokensDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
  tokenType: string;
}

export type LetterStatus =
  | "Draft"
  | "InProgress"
  | "NeedsRevision"
  | "AwaitingResourceResolution"
  | "Finalizing"
  | "ProcessingFailed"
  | "Completed"
  | "Rejected"
  | "Cancelled"
  | "Revoked";

export type WorkflowActionType = "Sign" | "Acknowledge" | "ApproveAndSign" | "Review";

export type WorkflowTaskStatus =
  | "Pending"
  | "Active"
  | "Signed"
  | "Acknowledged"
  | "Approved"
  | "RevisionRequested"
  | "Rejected"
  | "Deferred"
  | "Cancelled"
  | "Superseded";

export type WorkflowAction =
  | "sign"
  | "approve"
  | "acknowledge"
  | "reject"
  | "request-revision"
  | "defer"
  | "resume"
  | "delegate"
  | "revoke-delegation";

export interface WorkflowTaskDto {
  id: string;
  letterId: string;
  title: string;
  revisionId: string;
  contentHash: string;
  order: number;
  actionType: WorkflowActionType;
  status: WorkflowTaskStatus;
  assignedUserId: string;
  version: string;
  activatedAt: string | null;
  dueAt: string | null;
  isOverdue: boolean;
  comment: string | null;
  actedByUserId: string | null;
  actedAt: string | null;
  allowedActions: WorkflowAction[];
  documentUrl: string | null;
  assignedUserName: string;
  positionCode: string | null;
  positionName: string | null;
  number: string;
  typeId: string;
  requesterName: string;
  organizationName: string;
}

export interface WorkflowQueueDto {
  page: number;
  pageSize: number;
  total: number;
  items: WorkflowTaskDto[];
}

export interface WorkflowTimelineDto {
  action: string;
  actor: string | null;
  at: string;
  reason: string | null;
}

export interface LetterWorkflowDto {
  letterId: string;
  number: string;
  status: LetterStatus;
  version: string;
  revisionId: string;
  contentHash: string;
  finalDocumentId: string | null;
  tasks: WorkflowTaskDto[];
  timeline: WorkflowTimelineDto[];
}

export interface DelegateCandidateDto {
  userId: string;
  name: string;
  positionName: string;
  validTo: string | null;
}

export interface SignTaskRequest {
  expectedRevisionId: string;
  expectedContentHash: string;
  comment: string | null;
  expectedTaskVersion: string;
}

export interface SignTaskResultDto {
  taskId: string;
  status: WorkflowTaskStatus;
  actedAt: string;
  evidenceId: string;
  role: string;
  position: string | null;
  contentHash: string;
  qrSha256: string;
  isWorkflowCompleted: boolean;
  verificationCode: string | null;
}

export interface WorkflowMutationRequest {
  expectedRevisionId: string;
  expectedContentHash: string;
  expectedTaskVersion: string;
  reason: string;
  delegateUserId?: string | null;
  until?: string | null;
}

export interface WorkflowMutationDto {
  taskId: string;
  status: WorkflowTaskStatus;
  taskVersion: string;
  letterStatus: LetterStatus;
  letterVersion: string;
  delegationId: string | null;
}

export interface LetterActiveTaskDto {
  id: string;
  order: number;
  actionType: WorkflowActionType;
  positionCode: string | null;
  positionName: string | null;
  activatedAt: string | null;
  dueAt: string | null;
  isOverdue: boolean;
}

export interface LetterSummaryDto {
  id: string;
  number: string;
  typeId: string;
  title: string;
  status: LetterStatus;
  version: string;
  revisionId: string;
  submittedAt: string;
  completedAt: string | null;
  totalTasks: number;
  completedTasks: number;
  activeTask: LetterActiveTaskDto | null;
}

export interface LetterListDto {
  page: number;
  pageSize: number;
  total: number;
  items: LetterSummaryDto[];
}

export interface DraftDto {
  id: string;
  typeId: string;
  title: string;
  version: string;
  revisionId: string;
  contentHash: string;
  dataJson: string;
}

export interface SaveDraftRequest {
  typeId: string;
  title: string;
  fields: Record<string, string>;
}

export interface EditDraftRequest {
  expectedVersion: string;
  expectedRevisionId: string;
  expectedContentHash: string;
  title: string;
  fields: Record<string, string>;
}

export interface SignatureSlotDto {
  positionCode: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreviewLetterRequest {
  expectedVersion: string;
  expectedRevisionId: string;
  expectedContentHash: string;
  organizationId: string;
  committeeChairId: string;
  organizationChairId: string;
  resourceId: string | null;
}

export type PreviewState = "Pending" | "Processing" | "Ready" | "Failed" | "Superseded";

export interface LetterPreviewDto {
  jobId: string;
  letterId: string;
  revisionId: string;
  state: PreviewState;
  errorCode: string | null;
  reviewDocumentId: string | null;
  reviewHash: string | null;
  slots: SignatureSlotDto[];
  downloadUrl: string | null;
}

export interface SubmitLetterRequest extends PreviewLetterRequest {
  reviewDocumentId: string;
  expectedReviewHash: string;
  slots: SignatureSlotDto[];
}

export interface SubmissionDto {
  letterId: string;
  revisionId: string;
  number: string;
  status: LetterStatus;
}

export interface CancelLetterRequest {
  expectedVersion: string;
  expectedRevisionId: string;
  expectedContentHash: string;
  reason: string;
}

export interface CancelLetterDto {
  id: string;
  status: LetterStatus;
  version: string;
}

export type TemplateValueSource =
  | "user"
  | "participant"
  | "signatureEvidence"
  | "resource"
  | "organization"
  | "server";

export interface TemplateFieldDto {
  key: string;
  label: string;
  type: string;
  required: boolean;
  group: string;
  valueSource: TemplateValueSource;
  defaultValue?: string;
}

export interface LetterTemplateDto {
  typeId: string;
  templateId: string;
  name: string;
  version: string;
  sourceDocument: string;
  fields: TemplateFieldDto[];
}

export interface RoutingOrganizationDto {
  id: string;
  name: string;
  kind: string;
}

export interface RoutingCandidateDto {
  userId: string;
  name: string;
  positionCode: string;
  positionName: string;
}

export interface RoutingFacilityDto {
  id: string;
  code: string;
  name: string;
}

export interface RoutingResourceDto {
  id: string;
  facilityId: string;
  code: string;
  floor: number | null;
}

export interface RoutingInput {
  typeId: string;
  organizationId: string;
  committeeChairId: string;
  organizationChairId: string;
  resourceId: string | null;
}

export interface RoutingStageDto {
  order: number;
  userId: string;
  name: string;
  positionCode: string;
  positionName: string;
}

export interface RoomDto {
  id: string;
  code: string;
  floor: number | null;
  facilityId: string;
  facilityName: string;
  facilityCode: string;
}

export type ReservationStatus = "Pending" | "Confirmed" | "Cancelled" | "Released";

export interface ReservationDto {
  id: string;
  roomId: string;
  activityType: string;
  startsAt: string;
  endsAt: string;
  status: ReservationStatus;
  letterRequestId: string | null;
}

export interface AvailabilityDto {
  isAvailable: boolean;
  confirmedConflicts: ReservationDto[];
  pendingConflicts: ReservationDto[];
}

export interface ConfirmReservationResultDto {
  confirmed: boolean;
  conflicts: ReservationDto[];
}

export interface UserSignatureQrDto {
  id: string;
  ownerUserId: string;
  version: number;
  imageSha256: string;
  qrDataUrl: string;
  opaqueCode: string;
  createdAt: string;
}

export interface ApiProblem {
  type?: string;
  title: string;
  detail?: string;
  status: number;
  instance?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// Chat DTOs (/api/v1/chat)
// ==========================================
export interface CreateSessionRequest {
  letterRequestId?: string | null;
  typeId?: string | null;
}

export interface SendChatMessageRequest {
  text?: string | null;
  directFieldUpdates?: Record<string, string> | null;
}

export interface ChatMessageDto {
  id: number;
  from: string;
  text: string;
  widget?: string | null;
  createdAt: string;
}

export interface FieldSummaryDto {
  totalRequired: number;
  filledRequired: number;
  missingRequiredKeys: string[];
}

export interface CandidatePersonDto {
  userId: string;
  name: string;
  positionCode: string;
  positionName: string;
  meta?: string | null;
}

export interface RoomOptionDto {
  id: string;
  code: string;
  floor?: number | null;
  facilityId: string;
  facilityName: string;
}

export interface ChatTurnResponseDto {
  sessionId: string;
  letterRequestId?: string | null;
  typeId?: string | null;
  reply: ChatMessageDto;
  fields: Record<string, string>;
  fieldSummary: FieldSummaryDto;
  suggestedWidget?: string | null;
  candidates?: CandidatePersonDto[] | null;
  availability?: AvailabilityDto | null;
  draft?: DraftDto | null;
  status: string;
  fallbackAvailable: boolean;
}

export interface ChatSessionDetailDto {
  sessionId: string;
  letterRequestId?: string | null;
  typeId?: string | null;
  status: string;
  messages: ChatMessageDto[];
  fields: Record<string, string>;
  fieldSummary: FieldSummaryDto;
  suggestedWidget?: string | null;
  draft?: DraftDto | null;
}

