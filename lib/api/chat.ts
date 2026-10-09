import { apiFetch } from "./client";
import type {
  ChatSessionDetailDto,
  ChatTurnResponseDto,
  CreateSessionRequest,
  SendChatMessageRequest,
} from "./types";

export async function createOrResumeSession(
  request: CreateSessionRequest = {},
): Promise<ChatSessionDetailDto> {
  return await apiFetch<ChatSessionDetailDto>("/chat/sessions", {
    method: "POST",
    json: request,
  });
}

export async function getChatSession(
  sessionId: string,
): Promise<ChatSessionDetailDto> {
  return await apiFetch<ChatSessionDetailDto>(`/chat/sessions/${sessionId}`);
}

export async function sendChatMessage(
  sessionId: string,
  request: SendChatMessageRequest,
): Promise<ChatTurnResponseDto> {
  return await apiFetch<ChatTurnResponseDto>(
    `/chat/sessions/${sessionId}/messages`,
    {
      method: "POST",
      json: request,
    },
  );
}

export async function getChatSessionByDraft(
  draftId: string,
): Promise<ChatSessionDetailDto> {
  return await apiFetch<ChatSessionDetailDto>(`/chat/sessions/by-draft/${draftId}`);
}
