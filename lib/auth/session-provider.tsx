"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, UNAUTHORIZED_EVENT } from "@/lib/api/client";
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
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [accessKey, setAccessKey] = useState("");
  const [selectionError, setSelectionError] = useState("");

  // Optional background sync with backend /me if a real backend session exists
  useEffect(() => {
    let active = true;
    apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true })
      .then((realUser) => {
        if (!active) return;
        const persona = DEMO_PERSONAS.find((item) => item.email.toLowerCase() === realUser.email.toLowerCase());
        if (persona) {
          setCurrentPersonaId(persona.id);
          setUser(realUser);
          setActivePosition(extractActivePosition(realUser));
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (active) setStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const expire = () => {
      setSelectionError("Akses backend berubah atau kedaluwarsa. Pilih akun kembali.");
      setStatus("unauthenticated");
    };
    const changed = (event: StorageEvent) => {
      if (event.key === "signit_active_persona") expire();
    };
    window.addEventListener(UNAUTHORIZED_EVENT, expire);
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, expire);
      window.removeEventListener("storage", changed);
    };
  }, []);

  // The UAT account picker replaces the email/password screen.
  useEffect(() => {
    if (pathname === "/login") {
      router.replace("/");
    }
  }, [pathname, router]);

  // Enforce role-based and position-based route access
  useEffect(() => {
    if (status !== "authenticated") return;
    const redirect = routeRedirect(user, pathname);
    if (redirect && redirect !== pathname) {
      router.replace(redirect);
    }
  }, [user, pathname, router, status]);

  // Switch user callback: updates persona & position, and auto-routes to appropriate view
  const switchUser = useCallback(
    async (personaId: string) => {
      const target = DEMO_PERSONAS.find((p) => p.id === personaId);
      if (!target) return;

      if (!accessKey) {
        setCurrentPersonaId(target.id);
        setSelectionError("Masukkan kode akses UAT untuk mengganti akun backend.");
        setStatus("unauthenticated");
        return;
      }
      setStatus("loading");
      setSelectionError("");
      let dto: UserDto;
      try {
        const response = await fetch("/api/uat/select-account", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ personaId, accessKey }), cache: "no-store",
        });
        if (!response.ok) {
          const failure = await response.json();
          throw new Error(failure.detail || "Akun belum dapat dipilih.");
        }
        dto = await response.json();
      } catch (cause) {
        setSelectionError(cause instanceof Error ? cause.message : "Akun belum dapat dipilih.");
        setStatus("unauthenticated");
        return;
      }
      setCurrentPersonaId(target.id);
      const newPos = extractActivePosition(dto);

      setUser(dto);
      setActivePosition(newPos);
      setStatus("authenticated");

      try {
        localStorage.setItem("signit_active_persona", target.id);
        localStorage.setItem("signit_active_position", newPos.positionCode);
      } catch {
        // Ignore
      }

      // Auto-navigate to the optimal destination according to the new position
      const destination = destinationByPosition(newPos.positionCode, dto.uiSurface);
      if (destination && destination !== pathname) {
        router.push(destination);
      }
    },
    [pathname, router, accessKey],
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
    const dto = await apiFetch<UserDto>("/me", { skipUnauthorizedEvent: true });
    setUser(dto);
    setActivePosition(extractActivePosition(dto));
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST", skipUnauthorizedEvent: true });
    } finally {
      setAccessKey("");
      setStatus("unauthenticated");
    }
  }, []);

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

  return <SessionContext.Provider value={value}>
    {status === "authenticated" ? <div key={user.id}>{children}</div> :
      <main className="mx-auto max-w-lg space-y-4 px-5 py-16 text-midnight">
        <h1 className="text-title font-semibold">Pilih akun</h1>
        <p className="text-body">Akses UAT terbatas. Pilihan akun menggunakan identitas dan izin dari backend.</p>
        {status === "loading" ? <p role="status">Menghubungkan akun backend…</p> : <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void switchUser(currentPersonaId); }}>
          <label className="block">Akun<select className="mt-2 block w-full rounded-lg border border-line bg-surface p-3" value={currentPersonaId} onChange={(event) => setCurrentPersonaId(event.target.value)}>{DEMO_PERSONAS.map((persona) => <option key={persona.id} value={persona.id}>{persona.name} — {persona.positionName}</option>)}</select></label>
          <label className="block">Kode akses UAT<input type="password" autoComplete="off" required className="mt-2 block w-full rounded-lg border border-line bg-surface p-3" value={accessKey} onChange={(event) => setAccessKey(event.target.value)} /></label>
          {selectionError && <p role="alert">{selectionError}</p>}
          <button className="min-h-11 rounded-lg bg-navy px-5 text-surface" type="submit">Gunakan akun</button>
        </form>}
      </main>}
  </SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useSession harus dipakai di dalam SessionProvider.");
  return value;
}
