import type { UiSurface, UserDto } from "@/lib/api/types";

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
  const management = pathname === "/manajemen" || pathname.startsWith("/manajemen/");
  if (pathname === "/staff") {
    return user.uiSurface === "Management" ? "/manajemen"
      : user.capabilities.some((capability) => capability === "Signer" || capability === "Approver")
        ? "/persetujuan" : "/";
  }
  if (management && user.uiSurface !== "Management") return "/";
  if (pathname === "/" && user.uiSurface === "Management") return "/manajemen";
  if (pathname === "/persetujuan") {
    if (user.uiSurface === "Management") return "/manajemen";
    if (!user.capabilities.some((capability) => capability === "Signer" || capability === "Approver")) return "/";
  }
  return null;
}

export function postLoginPath(user: UserDto, requested: string | null): string {
  const target = sanitizeInternalPath(requested) ?? dashboardPath(user.uiSurface);
  return routeRedirect(user, new URL(target, "https://signit.invalid").pathname) ?? target;
}
