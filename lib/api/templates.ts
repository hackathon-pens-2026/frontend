import { apiFetch } from "./client";
import type { LetterTemplateDto } from "./types";

export function listTemplates(): Promise<LetterTemplateDto[]> {
  return apiFetch<LetterTemplateDto[]>("/templates");
}

export function getTemplate(typeId: string): Promise<LetterTemplateDto> {
  return apiFetch<LetterTemplateDto>(`/templates/${encodeURIComponent(typeId)}`);
}
