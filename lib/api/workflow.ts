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

export function listMyTasks(page = 1, pageSize = 20): Promise<WorkflowQueueDto> {
  return apiFetch<WorkflowQueueDto>(`/tasks?page=${page}&pageSize=${pageSize}`);
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
