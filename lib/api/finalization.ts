import { apiFetch } from "./client";
import type { LetterStatus } from "./types";

export interface FinalizationDto {
  letterId: string;
  revisionId: string;
  version: string;
  status: LetterStatus;
  verificationCode: string | null;
  downloadUrl: string | null;
}

export function getFinalization(letterId: string) {
  return apiFetch<FinalizationDto>(`/letters/${letterId}/finalization`);
}

export function retryFinalization(letterId: string, request: { expectedRevisionId: string; expectedContentHash: string; expectedVersion: string }, key: string) {
  return apiFetch<FinalizationDto>(`/letters/${letterId}/finalization/retry`, {
    method: "POST", json: request, headers: { "Idempotency-Key": key },
  });
}
