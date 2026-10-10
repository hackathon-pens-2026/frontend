import { apiDownload, apiFetch } from "./client";
import type {
  DelegateCandidateDto,
  LetterWorkflowDto,
  SignTaskRequest,
  SignTaskResultDto,
  WorkflowAction,
  WorkflowMutationDto,
  WorkflowMutationRequest,
  WorkflowQueueDto,
  WorkflowTaskDto,
} from "./types";

export async function listMyTasks(page = 1, pageSize = 20): Promise<WorkflowQueueDto> {
  const result = await apiFetch<WorkflowQueueDto>(`/tasks?page=${page}&pageSize=${pageSize}`);
  if (!result || !Array.isArray(result.items) || !Number.isInteger(result.total) || result.total < result.items.length || (result.total > 0 && result.items.length === 0 && page === 1)) {
    throw new Error("Respons antrean tugas tidak sesuai kontrak API. Data tidak dapat ditampilkan.");
  }
  return result;
}

export function getTask(id: string): Promise<WorkflowTaskDto> {
  return apiFetch<WorkflowTaskDto>(`/tasks/${id}`);
}

export function getLetterWorkflow(id: string): Promise<LetterWorkflowDto> {
  return apiFetch<LetterWorkflowDto>(`/letters/${id}/workflow`);
}

export function getDelegateCandidates(
  id: string,
): Promise<DelegateCandidateDto[]> {
  return apiFetch<DelegateCandidateDto[]>(`/tasks/${id}/delegate-candidates`);
}

export function signTask(
  id: string,
  action: "sign" | "approve" | "acknowledge",
  request: SignTaskRequest,
  idempotencyKey: string,
): Promise<SignTaskResultDto> {
  return apiFetch<SignTaskResultDto>(`/tasks/${id}/${action}`, {
    method: "POST",
    json: request,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function mutateTask(
  id: string,
  action: Exclude<WorkflowAction, "sign" | "approve" | "acknowledge">,
  request: WorkflowMutationRequest,
  idempotencyKey: string,
): Promise<WorkflowMutationDto> {
  return apiFetch<WorkflowMutationDto>(`/tasks/${id}/${action}`, {
    method: "POST",
    json: request,
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

export function downloadTaskDocument(taskId: string): Promise<Blob> {
  return apiDownload(`/tasks/${taskId}/document`);
}
