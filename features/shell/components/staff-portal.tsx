"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { NavView } from "../types";
import { StaffSidebar } from "./staff-sidebar";
import { StaffHeader } from "./staff-header";
import { StaffDashboard } from "@/features/dashboard/components/staff-dashboard";
import { InboxView } from "@/features/inbox/components/inbox-view";
import { ApprovalStep, toInboxLetter, workflowSteps } from "@/features/inbox/types";
import { SubmissionsView } from "@/features/submissions/components/submissions-view";
import { DelegationView } from "@/features/delegation/components/delegation-view";
import { ApiError } from "@/lib/api/errors";
import { listMyLetters } from "@/lib/api/letters";
import { getLetterWorkflow, listMyTasks } from "@/lib/api/workflow";
import type { LetterSummaryDto, WorkflowTaskDto } from "@/lib/api/types";

function describeError(cause: unknown) {
  return cause instanceof ApiError
    ? cause.message
    : "Data tidak dapat dimuat dari server.";
}

export function StaffPortal() {
  const router = useRouter();
  const [view, setView] = useState<NavView>("dashboard");
  const [tasks, setTasks] = useState<WorkflowTaskDto[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [letters, setLetters] = useState<LetterSummaryDto[]>([]);
  const [lettersLoading, setLettersLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    listMyTasks(1, 100)
      .then((queue) => {
        if (!active) return;
        setTasks(queue.items);
        setTasksError(null);
        setSelectedTaskId((previous) =>
          previous && queue.items.some((task) => task.id === previous)
            ? previous
            : (queue.items[0]?.id ?? ""),
        );
      })
      .catch((cause: unknown) => {
        if (active) setTasksError(describeError(cause));
      })
      .finally(() => {
        if (active) setTasksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  useEffect(() => {
    let active = true;
    listMyLetters(1, 50)
      .then((result) => {
        if (active) setLetters(result.items);
      })
      .catch(() => {
        if (active) setLetters([]);
      })
      .finally(() => {
        if (active) setLettersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const refresh = useCallback(async () => {
    setRefreshKey((key) => key + 1);
  }, []);

  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null;

  useEffect(() => {
    if (!selectedTask) return;
    let active = true;
    getLetterWorkflow(selectedTask.letterId)
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
    const target = tasks.find((task) => task.letterId === letterId);
    if (target) setSelectedTaskId(target.id);
    setView("inbox");
  };

  return (
    <div className="min-h-screen min-w-[1280px] bg-canvas text-midnight">
      <StaffSidebar
        view={view}
        onChange={setView}
        pendingCount={pendingCount}
      />

      <div className="pl-[260px]">
        <StaffHeader
          profile={{
            name: "",
            short: "",
            role: "",
            nip: "",
          }}
          onNew={() => router.push("/surat/baru")}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="mx-auto max-w-[1440px] px-8 lg:px-20 py-8">
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
