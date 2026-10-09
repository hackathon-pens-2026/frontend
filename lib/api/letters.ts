import { apiDownload, apiFetch } from "./client";
import type {
  CancelLetterDto,
  CancelLetterRequest,
  DraftDto,
  EditDraftRequest,
  LetterListDto,
  LetterPreviewDto,
  PreviewLetterRequest,
  SaveDraftRequest,
  SubmissionDto,
  SubmitLetterRequest,
} from "./types";

export function listMyLetters(page = 1, pageSize = 20): Promise<LetterListDto> {
  return apiFetch<LetterListDto>(`/letters?page=${page}&pageSize=${pageSize}`);
}

export function getLetter(id: string): Promise<DraftDto> {
  return apiFetch<DraftDto>(`/letters/${id}`);
}

export function createDraft(request: SaveDraftRequest): Promise<DraftDto> {
  return apiFetch<DraftDto>("/letters/drafts", { method: "POST", json: request });
}

export function editDraft(
  id: string,
  request: EditDraftRequest,
  idempotencyKey: string,
): Promise<DraftDto> {
  return apiFetch<DraftDto>(`/letters/${id}/draft`, {
    method: "PUT",
    json: request,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function cancelLetter(
  id: string,
  request: CancelLetterRequest,
  idempotencyKey: string,
): Promise<CancelLetterDto> {
  return apiFetch<CancelLetterDto>(`/letters/${id}/cancel`, {
    method: "POST",
    json: request,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function queuePreview(
  id: string,
  request: PreviewLetterRequest,
): Promise<LetterPreviewDto> {
  return apiFetch<LetterPreviewDto>(`/letters/${id}/preview`, {
    method: "POST",
    json: request,
  });
}

export function getPreview(
  id: string,
  jobId: string,
): Promise<LetterPreviewDto> {
  return apiFetch<LetterPreviewDto>(`/letters/${id}/previews/${jobId}`);
}

export function submitLetter(
  id: string,
  request: SubmitLetterRequest,
  idempotencyKey: string,
): Promise<SubmissionDto> {
  return apiFetch<SubmissionDto>(`/letters/${id}/submit`, {
    method: "POST",
    json: request,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function downloadLetterDocument(
  letterId: string,
  documentId: string,
): Promise<Blob> {
  return apiDownload(`/letters/${letterId}/documents/${documentId}`);
}
