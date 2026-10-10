"use server";

import { redirect } from "next/navigation";
import { ApiError, toApiError } from "@/lib/api/errors";
import type { AuthTokensDto, UserDto } from "@/lib/api/types";
import { backendFetch } from "@/lib/server/backend";
import {
  clearAuthCookies,
  getAccessToken,
  setAuthCookies,
} from "@/lib/server/session";
import type { AuthFormState } from "./form-state";
import { PERSONA_EMAILS } from "./persona-accounts";
import { postLoginPath, sanitizeInternalPath } from "./routing";

async function parseError(response: Response): Promise<AuthFormState> {
  const error = await toApiError(response);
  return { status: "error", message: error.message, fieldErrors: error.fieldErrors };
}

export async function loginAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = sanitizeInternalPath(
    typeof formData.get("next") === "string" ? String(formData.get("next")) : null,
  );
  if (!email || !password) {
    return { status: "error", message: "Email dan password wajib diisi." };
  }

  let response: Response;
  try {
    response = await backendFetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch (error) {
    return { status: "error", message: error instanceof ApiError ? error.message : "Tidak dapat menghubungi server. Coba kembali." };
  }
  if (!response.ok) return await parseError(response);

  const tokens = (await response.json()) as AuthTokensDto;
  await setAuthCookies(tokens);
  redirect(postLoginPath(tokens.user, next));
}

// Login nyata untuk persona user-switcher. Password hanya dibaca server-side
// dari SIGNIT_UAT_PASSWORD agar tidak pernah terekspos ke bundle browser.
export async function loginPersonaAction(personaId: string): Promise<UserDto> {
  const email = PERSONA_EMAILS[personaId];
  if (!email) throw new Error("Persona tidak dikenal.");
  const password = process.env.SIGNIT_UAT_PASSWORD;
  if (!password) throw new Error("SIGNIT_UAT_PASSWORD belum dikonfigurasi pada frontend.");
  const response = await backendFetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await toApiError(response);
    throw new Error(error.message);
  }
  const tokens = (await response.json()) as AuthTokensDto;
  await setAuthCookies(tokens);
  return tokens.user;
}

export async function logoutAction(): Promise<void> {
  const token = await getAccessToken();
  if (token) {
    try {
      await backendFetch("/api/v1/auth/logout", { method: "POST", token });
    } catch {
      // Sesi lokal tetap dibersihkan walau jaringan gagal.
    }
  }
  await clearAuthCookies();
  redirect("/login");
}

export async function forgotPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { status: "error", message: "Email wajib diisi." };

  let response: Response;
  try {
    response = await backendFetch("/api/v1/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    return { status: "error", message: "Tidak dapat menghubungi server. Coba kembali." };
  }
  if (!response.ok) return await parseError(response);
  return {
    status: "success",
    message:
      "Jika akun tersedia, instruksi reset password akan dikirim melalui email Anda.",
  };
}

export async function resetPasswordAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const token = String(formData.get("token") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (!token) {
    return { status: "error", message: "Tautan reset tidak valid atau tidak lengkap." };
  }
  if (newPassword.length < 12) {
    return { status: "error", message: "Password minimal 12 karakter." };
  }
  if (newPassword !== confirmation) {
    return { status: "error", message: "Konfirmasi password tidak cocok." };
  }

  let response: Response;
  try {
    response = await backendFetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
  } catch {
    return { status: "error", message: "Tidak dapat menghubungi server. Coba kembali." };
  }
  if (!response.ok) return await parseError(response);
  return {
    status: "success",
    message: "Password berhasil diubah. Silakan login kembali.",
  };
}
