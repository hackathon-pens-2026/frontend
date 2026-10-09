"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiFetch, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { logoutAction } from "@/lib/auth/actions";
import { isPublicPath } from "@/lib/auth/constants";
import { postLoginPath, routeRedirect } from "./routing";
import type { AssignmentDto, UiSurface, UserCapability, UserCategory, UserDto } from "@/lib/api/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";
export interface SessionValue {
  status: SessionStatus;
  user: UserDto | null;
  userCategory: UserCategory | null;
  uiSurface: UiSurface | null;
  capabilities: UserCapability[];
  assignments: AssignmentDto[];
  hasCapability: (capability: UserCapability) => boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}
type SessionState = { pathname: string; status: SessionStatus; user: UserDto | null; message?: string };
const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sequence = useRef(0);
  const [session, setSession] = useState<SessionState>({ pathname: "", status: "loading", user: null });

  const checkSession = useCallback(async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    const request = ++sequence.current;
    try {
      const user = await apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true, signal });
      if (request === sequence.current && !signal?.aborted) setSession({ pathname, user, status: "authenticated" });
    } catch (cause) {
      if (request !== sequence.current || signal?.aborted) return;
      setSession({ pathname, user: null,
        status: cause instanceof ApiError && cause.status === 401 ? "unauthenticated" : "error",
        message: cause instanceof Error ? cause.message : "Sesi tidak dapat diperiksa. Coba kembali.",
      });
    }
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => void checkSession(controller.signal));
    return () => controller.abort();
  }, [checkSession]);

  useEffect(() => {
    const handler = () => {
      sequence.current++;
      setSession({ pathname, user: null, status: "unauthenticated" });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, [pathname]);

  // A previous page's 401 must never redirect a freshly completed login.
  const status = session.pathname === pathname ? session.status : "loading";
  const user = status === "authenticated" ? session.user : null;
  const destination = user
    ? pathname === "/login" ? postLoginPath(user, searchParams.get("next")) : routeRedirect(user, pathname)
    : status === "unauthenticated" && !isPublicPath(pathname)
      ? `/login?next=${encodeURIComponent(`${pathname}${searchParams.size ? `?${searchParams}` : ""}`)}` : null;

  useEffect(() => {
    if (destination) router.replace(destination);
  }, [destination, router]);

  const refresh = useCallback(async () => { await checkSession(); }, [checkSession]);
  const logout = useCallback(async () => {
    sequence.current++;
    setSession({ pathname, status: "loading", user: null });
    await logoutAction();
  }, [pathname]);
  const value = useMemo<SessionValue>(() => ({
    status, user, userCategory: user?.userCategory ?? null, uiSurface: user?.uiSurface ?? null,
    capabilities: user?.capabilities ?? [], assignments: user?.assignments ?? [],
    hasCapability: (capability) => (user?.capabilities ?? []).includes(capability), refresh, logout,
  }), [status, user, refresh, logout]);

  const content = isPublicPath(pathname) || (status === "authenticated" && !destination) ? children
    : <main className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="max-w-md space-y-4 rounded-xl border border-line bg-surface p-6" role="status">
          <p>{status === "error" ? session.message : "Memeriksa sesi…"}</p>
          {status === "error" && <button type="button" onClick={() => void refresh()}
            className="rounded-lg bg-primary px-4 py-2 text-surface">Coba lagi</button>}
        </div>
      </main>;
  return <SessionContext.Provider value={value}>{content}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession harus dipakai di dalam SessionProvider.");
  return value;
}
