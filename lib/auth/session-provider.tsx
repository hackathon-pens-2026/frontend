"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { loginPersonaAction, logoutAction } from "@/lib/auth/actions";
import { DEMO_PERSONAS, personaToUserDto, type DemoPersona } from "@/lib/auth/personas";
import { destinationByPosition, routeRedirect } from "./routing";
import type { AssignmentDto, UiSurface, UserCapability, UserCategory, UserDto } from "@/lib/api/types";

export type SessionStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export interface ActivePosition {
  positionCode: string;
  positionName: string;
  scope: string;
  capability: UserCapability;
}

export interface SessionValue {
  status: SessionStatus;
  user: UserDto | null;
  userCategory: UserCategory | null;
  uiSurface: UiSurface | null;
  activePosition: ActivePosition | null;
  capabilities: UserCapability[];
  assignments: AssignmentDto[];
  hasCapability: (capability: UserCapability) => boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  personas: DemoPersona[];
  currentPersonaId: string;
  switchUser: (personaId: string) => void;
  switchPosition: (positionCode: string) => void;
}

const SessionContext = createContext<SessionValue | null>(null);

function extractActivePosition(user: UserDto, preferredCode?: string): ActivePosition {
  const asg =
    (preferredCode ? user.assignments.find((a) => a.positionCode === preferredCode) : null) ??
    user.assignments[0];

  return {
    positionCode: asg?.positionCode ?? "Pengaju",
    positionName: asg?.positionName ?? "Pengaju Himpunan",
    scope: asg?.scope ?? "uat-himpunan",
    capability: asg?.capability ?? "Requester",
  };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentPersonaId, setCurrentPersonaId] = useState<string>("pengaju");
  const [user, setUser] = useState<UserDto>(() => personaToUserDto(DEMO_PERSONAS[0]));
  const [activePosition, setActivePosition] = useState<ActivePosition>(() =>
    extractActivePosition(personaToUserDto(DEMO_PERSONAS[0])),
  );
  const [status, setStatus] = useState<SessionStatus>("authenticated");

  // Pulihkan persona tersimpan lalu login nyata ke backend agar cookie sesi
  // (pratinjau dokumen, chat, daftar surat) benar-benar tersedia.
  useEffect(() => {
    let active = true;
    let savedPersonaId: string | null = null;
    let savedPosition: string | null = null;
    try {
      savedPersonaId = localStorage.getItem("signit_active_persona");
      savedPosition = localStorage.getItem("signit_active_position");
    } catch {
      // localStorage tidak tersedia
    }
    const found =
      DEMO_PERSONAS.find((persona) => persona.id === savedPersonaId) ?? DEMO_PERSONAS[0];
    loginPersonaAction(found.id)
      .then((realUser) => {
        if (!active) return;
        setCurrentPersonaId(found.id);
        setUser(realUser);
        setActivePosition(extractActivePosition(realUser, savedPosition ?? undefined));
        setStatus("authenticated");
      })
      .catch(() => {
        // Tanpa sesi nyata, halaman menampilkan error jujur dari backend.
      });
    return () => {
      active = false;
    };
  }, []);

  // Optional background sync with backend /me if a real backend session exists
  useEffect(() => {
    let active = true;
    apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true })
      .then((realUser) => {
        if (!active) return;
        if (realUser?.name) {
          setUser(realUser);
          setActivePosition(extractActivePosition(realUser));
        }
      })
      .catch(() => {
        // Fallback gracefully to demo persona
      });

    return () => {
      active = false;
    };
  }, []);

  // Redirect away from /login if user is in demo mode
  useEffect(() => {
    if (pathname === "/login") {
      router.replace("/");
    }
  }, [pathname, router]);

  // Enforce role-based and position-based route access
  useEffect(() => {
    const redirect = routeRedirect(user, pathname);
    if (redirect && redirect !== pathname) {
      router.replace(redirect);
    }
  }, [user, pathname, router]);

  // Ganti persona: login nyata ke backend memakai akun UAT persona tersebut,
  // lalu arahkan ke tampilan sesuai jabatan.
  const switchUser = useCallback(
    (personaId: string) => {
      const target = DEMO_PERSONAS.find((p) => p.id === personaId);
      if (!target) return;
      loginPersonaAction(target.id)
        .then((realUser) => {
          const newPos = extractActivePosition(realUser);
          setCurrentPersonaId(target.id);
          setUser(realUser);
          setActivePosition(newPos);
          setStatus("authenticated");
          try {
            localStorage.setItem("signit_active_persona", target.id);
            localStorage.setItem("signit_active_position", newPos.positionCode);
          } catch {
            // Ignore
          }
          const destination = destinationByPosition(newPos.positionCode, realUser.uiSurface);
          if (destination && destination !== pathname) {
            router.push(destination);
          }
        })
        .catch(() => {
          // Login persona gagal (env/seed belum siap); halaman akan
          // menampilkan error jujur dari endpoint backend.
        });
    },
    [pathname, router],
  );

  // Switch position callback (for users with multiple assignments)
  const switchPosition = useCallback(
    (positionCode: string) => {
      const newPos = extractActivePosition(user, positionCode);
      setActivePosition(newPos);
      try {
        localStorage.setItem("signit_active_position", newPos.positionCode);
      } catch {
        // Ignore
      }
      const destination = destinationByPosition(newPos.positionCode, user.uiSurface);
      if (destination && destination !== pathname) {
        router.push(destination);
      }
    },
    [user, pathname, router],
  );

  const refresh = useCallback(async () => {
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
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
      activePosition,
      capabilities: user.capabilities,
      assignments: user.assignments,
      hasCapability: (capability) => user.capabilities.includes(capability),
      refresh,
      logout,
      personas: DEMO_PERSONAS,
      currentPersonaId,
      switchUser,
      switchPosition,
    }),
    [status, user, activePosition, refresh, logout, currentPersonaId, switchUser, switchPosition],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession harus dipakai di dalam SessionProvider.");
  return value;
}
