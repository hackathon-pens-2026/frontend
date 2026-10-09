"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { logoutAction } from "@/lib/auth/actions";
import { DEMO_PERSONAS, personaToUserDto, type DemoPersona } from "@/lib/auth/personas";
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
  personas: DemoPersona[];
  currentPersonaId: string;
  switchUser: (personaId: string) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentPersonaId, setCurrentPersonaId] = useState<string>("pengaju");
  const [user, setUser] = useState<UserDto>(() => personaToUserDto(DEMO_PERSONAS[0]));
  const [status, setStatus] = useState<SessionStatus>("authenticated");

  // Load persisted demo persona from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("signit_active_persona");
      if (saved) {
        const found = DEMO_PERSONAS.find((p) => p.id === saved);
        if (found) {
          setCurrentPersonaId(found.id);
          setUser(personaToUserDto(found));
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Try optional background sync with backend /me if real session exists
  useEffect(() => {
    let active = true;
    apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true })
      .then((realUser) => {
        if (!active) return;
        // If a real backend session exists, merge or use it
        if (realUser?.name) {
          setUser(realUser);
        }
      })
      .catch(() => {
        // Fallback gracefully to demo persona without kicking user out
      });

    return () => {
      active = false;
    };
  }, []);

  // Redirect away from /login if user is already in demo mode
  useEffect(() => {
    if (pathname === "/login") {
      router.replace("/");
    }
  }, [pathname, router]);

  // Switch user callback
  const switchUser = useCallback((personaId: string) => {
    const target = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (!target) return;

    setCurrentPersonaId(target.id);
    const dto = personaToUserDto(target);
    setUser(dto);
    setStatus("authenticated");

    try {
      localStorage.setItem("signit_active_persona", target.id);
    } catch {
      // Ignore
    }

    // Auto-navigate between student & management portals if appropriate
    if (target.uiSurface === "Management" && pathname === "/") {
      router.push("/manajemen");
    } else if (target.uiSurface === "Student" && pathname === "/manajemen") {
      router.push("/");
    }
  }, [pathname, router]);

  const refresh = useCallback(async () => {
    // Keep user authenticated
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    // Switch back to default student persona instead of forcing login screen
    switchUser("pengaju");
    try {
      await logoutAction();
    } catch {
      // Ignore
    }
  }, [switchUser]);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      userCategory: user.userCategory,
      uiSurface: user.uiSurface,
      capabilities: user.capabilities,
      assignments: user.assignments,
      hasCapability: (capability) => user.capabilities.includes(capability),
      refresh,
      logout,
      personas: DEMO_PERSONAS,
      currentPersonaId,
      switchUser,
    }),
    [status, user, refresh, logout, currentPersonaId, switchUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession harus dipakai di dalam SessionProvider.");
  return value;
}
