import type { UiSurface, UserDto, AssignmentDto } from "@/lib/api/types";

export function getPrimaryPosition(user: UserDto): AssignmentDto | null {
  return user.assignments?.[0] ?? null;
}

export function destinationByPosition(positionCode?: string | null, surface?: UiSurface): string {
  if (!positionCode) {
    return surface === "Management" ? "/manajemen" : "/";
  }

  switch (positionCode) {
    case "Pengaju":
      return "/"; // Dasbor Mahasiswa (Buat Surat & Riwayat)
    case "Ketupel":
    case "KetuaOrganisasi":
    case "Dagri":
      return "/persetujuan"; // Kotak Persetujuan & Tanda Tangan Ormawa
    case "Pembina":
    case "Kemahasiswaan":
    case "BAAK":
    case "Wadir3":
    case "Wadir2":
      return "/manajemen"; // Portal Eksekutif Manajemen & Disposisi
    default:
      return surface === "Management" ? "/manajemen" : "/";
  }
}

export function dashboardPath(surface: UiSurface): string {
  return surface === "Management" ? "/manajemen" : "/";
}

export function sanitizeInternalPath(value: string | null): string | null {
  if (!value?.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return null;
  try {
    const url = new URL(value, "https://signit.invalid");
    const pathname = decodeURIComponent(url.pathname);
    if (url.origin !== "https://signit.invalid" || pathname.startsWith("//") || pathname.includes("\\")) return null;
    if (["/api", "/login", "/forgot-password", "/reset-password"].some(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    )) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function routeRedirect(user: UserDto, pathname: string): string | null {
  const primary = getPrimaryPosition(user);
  const positionCode = primary?.positionCode;
  const isManagement =
    user.uiSurface === "Management" ||
    ["Pembina", "Kemahasiswaan", "BAAK", "Wadir3", "Wadir2"].includes(positionCode ?? "");
  const canSignOrApprove =
    user.capabilities.some((c) => c === "Signer" || c === "Approver") ||
    ["Ketupel", "KetuaOrganisasi", "Dagri"].includes(positionCode ?? "");

  // Path /staff alias
  if (pathname === "/staff") {
    return isManagement ? "/manajemen" : canSignOrApprove ? "/persetujuan" : "/";
  }

  // Path /manajemen - Khusus Manajemen
  if (pathname === "/manajemen" || pathname.startsWith("/manajemen/")) {
    if (!isManagement) {
      return canSignOrApprove ? "/persetujuan" : "/";
    }
  }

  // Path / - Khusus Mahasiswa / Pengaju
  if (pathname === "/") {
    if (isManagement) {
      return "/manajemen";
    }
  }

  // Path /persetujuan - Khusus peran yang memiliki tugas tanda tangan
  if (pathname === "/persetujuan") {
    if (isManagement) {
      return "/manajemen";
    }
    if (!canSignOrApprove) {
      return "/";
    }
  }

  return null;
}

export function postLoginPath(user: UserDto, requested: string | null): string {
  const sanitized = sanitizeInternalPath(requested);
  if (sanitized) {
    const pathname = new URL(sanitized, "https://signit.invalid").pathname;
    const redirect = routeRedirect(user, pathname);
    if (!redirect) return sanitized;
    return redirect;
  }
  return dashboardPath(user.uiSurface);
}
