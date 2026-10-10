export interface ApplicantData {
  name: string;
  nrp: string;
  organization: string;
  isSsoAutoFilled: boolean;
}

export interface FacilityItem {
  id: string;
  name: string;
  category: "room" | "equipment";
  isAvailable: boolean;
  unavailableReason?: string;
}

export interface UploadedAttachment {
  name: string;
  sizeFormatted: string;
  fileSizeBytes: number;
  progressPercent: number;
  uploadedAt: string;
}

export interface PermitFormData {
  // Step 1: Template
  templateId: string;
  templateTitle: string;

  // Step 2: Form Details
  applicant: ApplicantData;
  eventName: string;
  eventDateRange: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  selectedFacilityIds: string[];
  attachment: UploadedAttachment | null;

  // Letter Metadata (Auto-generated from PRD policy)
  letterNumber: string;
  letterDatePlace: string;
  letterSubject: string;
  letterRecipient: {
    title: string;
    institution: string;
    address: string;
  };
  pembinaName: string;
  ketuaHimaName: string;
}

export type WizardStep = 1 | 2 | 3;

export interface ApprovalChainNode {
  step: number;
  role: string;
  name: string;
  department: string;
  status: "completed" | "current" | "waiting";
}
