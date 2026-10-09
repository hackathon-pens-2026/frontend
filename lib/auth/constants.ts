export const ACCESS_COOKIE = "signit_at";
export const REFRESH_COOKIE = "signit_rt";

export const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
