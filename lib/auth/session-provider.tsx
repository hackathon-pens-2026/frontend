"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { logoutAction } from "@/lib/auth/actions";
import { isPublicPath } from "@/lib/auth/constants";
import type {
  AssignmentDto,
  UiSurface,
  UserCapability,
  UserCategory,
  UserDto,
} from "@/lib/api/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

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

const SessionContext = createContext<SessionValue | null>(null);

async function fetchMe(): Promise<UserDto> {
  return apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true });
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<UserDto | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refresh = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      setStatus("authenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchMe()
      .then((me) => {
        if (!active) return;
        setUser(me);
        setStatus("authenticated");
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setStatus("unauthenticated");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setStatus("unauthenticated");
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, []);

  useEffect(() => {
    if (status !== "unauthenticated" || isPublicPath(pathname)) return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${next}`);
  }, [status, pathname, router]);

  const logout = useCallback(async () => {
    await logoutAction();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      userCategory: user?.userCategory ?? null,
      uiSurface: user?.uiSurface ?? null,
      capabilities: user?.capabilities ?? [],
      assignments: user?.assignments ?? [],
      hasCapability: (capability) => (user?.capabilities ?? []).includes(capability),
      refresh,
      logout,
    }),
    [status, user, refresh, logout],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession harus dipakai di dalam SessionProvider.");
  return value;
}
