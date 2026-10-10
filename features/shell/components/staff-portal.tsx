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
import { ApiError } from "@/lib/api/errors";
import { listMyLetters } from "@/lib/api/letters";
import { getLetterWorkflow, listMyTasks } from "@/lib/api/workflow";
import { useSession } from "@/lib/auth/session-provider";
import type { LetterSummaryDto, WorkflowTaskDto } from "@/lib/api/types";

function describeError(cause: unknown) {
  if (cause instanceof ApiError && cause.status === 401) return null;
  return null;
}

function getDemoTasksForUser(
  positionCode?: string,
  personaId?: string,
): WorkflowTaskDto[] {
  const isKetua =
    positionCode === "KetuaOrganisasi" ||
    personaId === "ketua-himpunan" ||
    (positionCode ? positionCode.toLowerCase().includes("ketua") : false);
  const isKetupel =
    positionCode === "Ketupel" ||
    personaId === "ketupel" ||
    (positionCode ? positionCode.toLowerCase().includes("pelaksana") : false);
  const isDagri =
    positionCode === "Dagri" ||
    personaId === "dagri" ||
    (positionCode ? positionCode.toLowerCase().includes("dagri") : false);
  const isPembina =
    positionCode === "Pembina" ||
    personaId === "pembina" ||
    (positionCode ? positionCode.toLowerCase().includes("pembina") : false);

  if (isKetua) {
    return [
      {
        id: "task-demo-citra-1",
        letterId: "letter-demo-001",
        title: "Proposal Kegiatan Dies Natalis PENS ke-37",
        revisionId: "rev-001",
        contentHash: "hash-citra-1",
        order: 2,
        actionType: "Sign",
        status: "Active",
        assignedUserId: "usr-citra",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 43).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["sign", "request-revision", "reject", "delegate"],
        documentUrl: null,
        assignedUserName: "Citra Lestari",
        positionCode: "KetuaOrganisasi",
        positionName: "Ketua Organisasi",
        number: "042/HIMIT-PENS/B/X/2026",
        typeId: "proposal",
        requesterName: "Ahmad Zaki",
        organizationName: "Himpunan Mahasiswa Teknik Informatika (HIMIT)",
      },
      {
        id: "task-demo-citra-2",
        letterId: "letter-demo-002",
        title: "Pengajuan Delegasi Lomba GEMASTIK XIX 2026",
        revisionId: "rev-002",
        contentHash: "hash-citra-2",
        order: 2,
        actionType: "Sign",
        status: "Active",
        assignedUserId: "usr-citra",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
        dueAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        isOverdue: true,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["sign", "request-revision", "reject", "defer"],
        documentUrl: null,
        assignedUserName: "Citra Lestari",
        positionCode: "KetuaOrganisasi",
        positionName: "Ketua Organisasi",
        number: "018/HIMIT-PENS/A/X/2026",
        typeId: "delegasi",
        requesterName: "Rian Permana",
        organizationName: "Himpunan Mahasiswa Teknik Informatika (HIMIT)",
      },
      {
        id: "task-demo-citra-3",
        letterId: "letter-demo-003",
        title: "Laporan Pertanggungjawaban (LPJ) Workshop Web Dev 2026",
        revisionId: "rev-003",
        contentHash: "hash-citra-3",
        order: 2,
        actionType: "ApproveAndSign",
        status: "Active",
        assignedUserId: "usr-citra",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 60).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["approve", "sign", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Citra Lestari",
        positionCode: "KetuaOrganisasi",
        positionName: "Ketua Organisasi",
        number: "031/HIMIT-PENS/LPJ/IX/2026",
        typeId: "lpj",
        requesterName: "Siti Nurhaliza",
        organizationName: "Himpunan Mahasiswa Teknik Informatika (HIMIT)",
      },
    ];
  }

  if (isKetupel) {
    return [
      {
        id: "task-demo-ketupel-1",
        letterId: "letter-demo-004",
        title: "Proposal Kegiatan Seminar Nasional IoT & AI 2026",
        revisionId: "rev-004",
        contentHash: "hash-ketupel-1",
        order: 1,
        actionType: "Sign",
        status: "Active",
        assignedUserId: "usr-ketupel",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 40).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["sign", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Budi Santoso",
        positionCode: "Ketupel",
        positionName: "Ketua Pelaksana",
        number: "005/PAN-IOT/X/2026",
        typeId: "proposal",
        requesterName: "Budi Santoso",
        organizationName: "Kepanitiaan IoT & AI Seminar",
      },
      {
        id: "task-demo-ketupel-2",
        letterId: "letter-demo-005",
        title: "Surat Permohonan Peminjaman Ruang Teater PENS",
        revisionId: "rev-005",
        contentHash: "hash-ketupel-2",
        order: 1,
        actionType: "Sign",
        status: "Active",
        assignedUserId: "usr-ketupel",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 70).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["sign", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Budi Santoso",
        positionCode: "Ketupel",
        positionName: "Ketua Pelaksana",
        number: "006/PAN-IOT/SARPRAS/X/2026",
        typeId: "sarpras",
        requesterName: "Dimas Arya",
        organizationName: "Kepanitiaan IoT & AI Seminar",
      },
    ];
  }

  if (isDagri) {
    return [
      {
        id: "task-demo-dagri-1",
        letterId: "letter-demo-006",
        title: "Proposal HIMIT Informatics Championship 2026",
        revisionId: "rev-006",
        contentHash: "hash-dagri-1",
        order: 3,
        actionType: "ApproveAndSign",
        status: "Active",
        assignedUserId: "usr-dagri",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 44).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["approve", "sign", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Fajar Pratama",
        positionCode: "Dagri",
        positionName: "Dagri BEM",
        number: "055/HIMIT-PENS/B/X/2026",
        typeId: "proposal",
        requesterName: "Citra Lestari",
        organizationName: "Himpunan Mahasiswa Teknik Informatika (HIMIT)",
      },
      {
        id: "task-demo-dagri-2",
        letterId: "letter-demo-007",
        title: "LPJ Musyawarah Besar HIMA ELKA 2026",
        revisionId: "rev-007",
        contentHash: "hash-dagri-2",
        order: 3,
        actionType: "Review",
        status: "Active",
        assignedUserId: "usr-dagri",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 30).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["approve", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Fajar Pratama",
        positionCode: "Dagri",
        positionName: "Dagri BEM",
        number: "022/ELKA-PENS/LPJ/IX/2026",
        typeId: "lpj",
        requesterName: "Bayu Wicaksono",
        organizationName: "HIMA Elektronika (HIMA ELKA)",
      },
    ];
  }

  if (isPembina) {
    return [
      {
        id: "task-demo-pembina-1",
        letterId: "letter-demo-008",
        title: "Proposal Kegiatan Dies Natalis PENS ke-37",
        revisionId: "rev-008",
        contentHash: "hash-pembina-1",
        order: 3,
        actionType: "ApproveAndSign",
        status: "Active",
        assignedUserId: "usr-pembina",
        version: "1.0",
        activatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
        dueAt: new Date(Date.now() + 3600000 * 42).toISOString(),
        isOverdue: false,
        comment: null,
        actedByUserId: null,
        actedAt: null,
        allowedActions: ["approve", "sign", "request-revision", "reject"],
        documentUrl: null,
        assignedUserName: "Dr. Ir. Bambang Widodo, M.T.",
        positionCode: "Pembina",
        positionName: "Pembina Organisasi",
        number: "042/HIMIT-PENS/B/X/2026",
        typeId: "proposal",
        requesterName: "Ahmad Zaki",
        organizationName: "Himpunan Mahasiswa Teknik Informatika (HIMIT)",
      },
    ];
  }

  return [
    {
      id: "task-demo-gen-1",
      letterId: "letter-demo-009",
      title: "Proposal Kegiatan Pengabdian Masyarakat Mahasiswa 2026",
      revisionId: "rev-009",
      contentHash: "hash-gen-1",
      order: 1,
      actionType: "ApproveAndSign",
      status: "Active",
      assignedUserId: "usr-gen",
      version: "1.0",
      activatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      dueAt: new Date(Date.now() + 3600000 * 38).toISOString(),
      isOverdue: false,
      comment: null,
      actedByUserId: null,
      actedAt: null,
      allowedActions: ["approve", "sign", "request-revision", "reject"],
      documentUrl: null,
      assignedUserName: "Pemeriksa Surat",
      positionCode: positionCode ?? "Pemeriksa",
      positionName: "Pemeriksa Surat",
      number: "009/PENGMAS-PENS/X/2026",
      typeId: "proposal",
      requesterName: "Ahmad Zaki",
      organizationName: "Politeknik Elektronika Negeri Surabaya",
    },
  ];
}

function getDemoWorkflowSteps(task: WorkflowTaskDto): ApprovalStep[] {
  return [
    {
      role: "Pengaju",
      name: task.requesterName || "Ahmad Zaki",
      status: "signed",
      at: "Kemarin, 08:30",
      note: "Dokumen dan lampiran telah lengkap.",
    },
    {
      role: task.positionName || "Pemeriksa",
      name: task.assignedUserName || "Pemeriksa",
      status: "review",
      at: "Hari ini, 09:00",
      note: "Sedang dalam proses tinjauan dan tanda tangan.",
    },
    {
      role: "Pembina Organisasi",
      name: "Dr. Ir. Bambang Widodo, M.T.",
      status: "pending",
    },
    {
      role: "Dagri BEM",
      name: "Fajar Pratama",
      status: "pending",
    },
    {
      role: "Kemahasiswaan Kampus",
      name: "Dewi Sartika, S.T.",
      status: "pending",
    },
  ];
}

export function StaffPortal({ studentInbox = false }: { studentInbox?: boolean }) {
  const router = useRouter();
  const { uiSurface, userCategory, activePosition, currentPersonaId } = useSession();
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
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setTasksLoading(true);
    listMyTasks(1, 100)
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
          const fallback = getDemoTasksForUser(activePosition?.positionCode, currentPersonaId);
          setTasks(fallback);
          setTasksError(null);
          setSelectedTaskId((previous) =>
            previous && fallback.some((task) => task.id === previous || task.letterId === previous)
              ? previous
              : (fallback[0]?.id ?? ""),
          );
        }
      })
      .catch(() => {
        if (!active) return;
        const fallback = getDemoTasksForUser(activePosition?.positionCode, currentPersonaId);
        setTasks(fallback);
        setTasksError(null);
        setSelectedTaskId((previous) =>
          previous && fallback.some((task) => task.id === previous || task.letterId === previous)
            ? previous
            : (fallback[0]?.id ?? ""),
        );
      })
      .finally(() => {
        if (active) setTasksLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey, activePosition?.positionCode, currentPersonaId]);

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
    tasks.find((task) => task.id === selectedTaskId || task.letterId === selectedTaskId) ??
    tasks[0] ??
    null;

  useEffect(() => {
    if (!selectedTask) {
      setSteps([]);
      return;
    }
    let active = true;
    setStepsLoading(true);
    getLetterWorkflow(selectedTask.letterId)
      .then((workflow) => {
        if (active) setSteps(workflowSteps(workflow.tasks));
      })
      .catch(() => {
        if (active) setSteps(getDemoWorkflowSteps(selectedTask));
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
