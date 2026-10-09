import { apiFetch } from "./client";
import type { CapabilitiesDto, UserDto, UserSignatureQrDto } from "./types";

export function getMe(): Promise<UserDto> {
  return apiFetch<UserDto>("/me");
}

export function getMyCapabilities(): Promise<CapabilitiesDto> {
  return apiFetch<CapabilitiesDto>("/me/capabilities");
}

export function getMySignatureQr(): Promise<UserSignatureQrDto> {
  return apiFetch<UserSignatureQrDto>("/me/signature-qr");
}
