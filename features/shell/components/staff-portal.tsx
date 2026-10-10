"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NavView } from "../types";
import { StaffSidebar } from "./staff-sidebar";
import { SubmissionSearch } from "./submission-search";
import { StudentSidebar } from "./student-sidebar";
import { StaffDashboard } from "@/features/dashboard/components/staff-dashboard";
import { InboxView } from "@/features/inbox/components/inbox-view";
import { ApprovalStep, toInboxLetter, workflowSteps } from "@/features/inbox/types";
import { SubmissionsView } from "@/features/submissions/components/submissions-view";
import { DelegationView } from "@/features/delegation/components/delegation-view";
import { listMyLetters } from "@/lib/api/letters";
import { getLetterWorkflow, listMyTasks } from "@/lib/api/workflow";
import { useSession } from "@/lib/auth/session-provider";
import { verifyAccount } from "@/lib/api/account-data";
import type { LetterSummaryDto, WorkflowTaskDto } from "@/lib/api/types";

export function StaffPortal({ studentInbox = false }: { studentInbox?: boolean }) {
  const router = useRouter();
  const { uiSurface, userCategory, activePosition, currentPersonaId, user, status: sessionStatus } = useSession();
  const isStudent =
    studentInbox ||
    uiSurface === "Student" ||
    userCategory === "StudentDagri" ||
    userCategory === "StudentGeneral";
  const [selectedView, setView] = useState<NavView>(isStudent ? "inbox" : "dashboard");
  const view = isStudent && selectedView === "dashboard" ? "inbox" : selectedView;
  const [tasks, setTasks] = useState<WorkflowTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [letters, setLetters] = useState<LetterSummaryDto[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [lettersError, setLettersError] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user?.id) return;
    let active = true;
    Promise.resolve().then(async () => {
      if (active) setTasksLoading(true);
      await verifyAccount(user.id);
      return listMyTasks(1, 100);
    })
      .then((queue) => {
        if (!active) return;
        if (queue.items && queue.items.length > 0) {
          setTasks(queue.items);
          setTasksError(null);
          setSelectedTaskId((previous) =>
            previous && queue.items.some((task) => task.id === previous || task.letterId === previous)
              ? previous
              : (queue.items[0]?.id ?? ""),
          );
        } else {
          setTasks([]);
          setTasksError(null);
          setSelectedTaskId("");
        }
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setTasks([]);
        setSelectedTaskId("");
        setTasksError(cause instanceof Error ? cause.message : "Tugas belum dapat dimuat.");
      })
      .finally(() => {
        if (active) setTasksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, activePosition?.positionCode, currentPersonaId, user?.id, sessionStatus]);

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user?.id) return;
    let active = true;
    Promise.resolve().then(() => {
      if (active) { setLettersLoading(true); setLetters([]); }
    });
    verifyAccount(user.id).then(() => listMyLetters(1, 100))
      .then((result) => {
        if (active) { setLetters(result.items); setLettersError(null); }
      })
      .catch((cause: unknown) => {
        if (active) {
          setLetters([]);
          setLettersError(cause instanceof Error ? cause.message : "Daftar pengajuan belum dapat dimuat.");
        }
      })
      .finally(() => {
        if (active) setLettersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, user?.id, currentPersonaId, sessionStatus]);

  const refresh = useCallback(async () => {
    setRefreshKey((key) => key + 1);
  }, []);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId || task.letterId === selectedTaskId) ??
    tasks[0] ??
    null;

  useEffect(() => {
    if (!selectedTask) {
      return;
    }
    let active = true;
    Promise.resolve().then(() => {
      if (active) setStepsLoading(true);
      return getLetterWorkflow(selectedTask.letterId);
    })
      .then((workflow) => {
        if (active) setSteps(workflowSteps(workflow.tasks));
      })
      .catch(() => {
        if (active) setSteps([]);
      })
      .finally(() => {
        if (active) setStepsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedTask, refreshKey]);

  const inboxLetters = useMemo(
    () => tasks.map(toInboxLetter),
    [tasks],
  );

  const filteredLetters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return inboxLetters;
    return inboxLetters.filter(
      (letter) =>
        letter.title.toLowerCase().includes(query) ||
        letter.number.toLowerCase().includes(query) ||
        letter.applicant.toLowerCase().includes(query) ||
        letter.unit.toLowerCase().includes(query),
    );
  }, [inboxLetters, searchQuery]);

  const pendingCount = inboxLetters.length;
  const overdueCount = tasks.filter((task) => task.isOverdue).length;

  const openLetterFromDashboard = (letterId: string) => {
    const target = tasks.find((task) => task.letterId === letterId || task.id === letterId);
    if (target) setSelectedTaskId(target.id);
    setView("inbox");
  };

  return (
    <div className="min-h-screen min-w-0 bg-canvas text-midnight">
      {isStudent ? (
        <StudentSidebar currentPath="/persetujuan" pendingCount={pendingCount} />
      ) : (
        <StaffSidebar
          view={view}
          onChange={setView}
          pendingCount={pendingCount}
        />
      )}

      <div className="min-w-0 md:pl-[260px]">
        <main className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-16 md:px-6 md:pt-6 lg:px-8 xl:px-10">
          {((view === "dashboard" && (tasksError || lettersError)) || (view === "submissions" && lettersError)) && (
            <div role="alert" className="mb-4 rounded-lg border border-line bg-surface p-4 text-midnight">
              <p>{view === "dashboard" ? tasksError || lettersError : lettersError}</p>
              <button type="button" onClick={() => void refresh()} className="mt-2 underline">Muat ulang data</button>
            </div>
          )}
          {view === "dashboard" && (
            <div className="mb-6">
              <SubmissionSearch value={searchQuery} onChange={setSearchQuery} />
            </div>
          )}
          {view === "dashboard" && (
            <StaffDashboard
              priorityLetters={filteredLetters.map((letter) => ({
                id: letter.id,
                number: letter.number,
                title: letter.title,
                applicant: letter.applicant,
                unit: letter.unit,
                slaHours: letter.slaHours,
                slaTotal: letter.slaTotal,
                status: letter.status,
                priority: letter.task.isOverdue,
              }))}
              pendingCount={pendingCount}
              overdueCount={overdueCount}
              myLetters={letters}
              loading={tasksLoading || lettersLoading}
              onGoToInbox={() => setView("inbox")}
              onGoToDelegation={() => setView("delegation")}
              onGoToSubmissions={() => setView("submissions")}
              onOpenLetter={openLetterFromDashboard}
            />
          )}

          {view === "inbox" && (
            <InboxView
              letters={filteredLetters}
              selectedId={selectedTask?.id ?? ""}
              onSelect={setSelectedTaskId}
              steps={steps}
              stepsLoading={stepsLoading}
              onRefresh={refresh}
              loading={tasksLoading}
              error={tasksError}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {view === "submissions" && (
            <SubmissionsView
              letters={letters}
              loading={lettersLoading}
              onNew={() => router.push("/surat/baru")}
            />
          )}

          {view === "delegation" && (
            <DelegationView onGoToInbox={() => setView("inbox")} />
          )}
        </main>
      </div>
    </div>
  );
}
export default StaffPortal;
