"use client";

import React, { useState } from "react";
import { NavView } from "../types";
import { StaffSidebar } from "./staff-sidebar";
import { StaffHeader } from "./staff-header";
import { StaffDashboard } from "@/features/dashboard/components/staff-dashboard";
import { StaffActivityItem, StaffProfile } from "@/features/dashboard/types";
import { InboxView } from "@/features/inbox/components/inbox-view";
import { ApprovalStatus, InboxLetter } from "@/features/inbox/types";
import { initialInboxLetters } from "@/features/inbox/data/mock-inbox";
import { SubmissionsView } from "@/features/submissions/components/submissions-view";
import { NewRequestModal } from "@/features/submissions/components/new-request-modal";
import { StaffSubmission } from "@/features/submissions/types";
import {
  mockNewTemplates,
  mockSubmissionsData,
} from "@/features/submissions/data/mock-submissions";
import { DelegationView } from "@/features/delegation/components/delegation-view";
import {
  mockDelegationCandidates,
  mockDelegationScopes,
} from "@/features/delegation/data/mock-delegation";

const defaultStaffProfile: StaffProfile = {
  name: "Dr. Ir. Rina Kartika, M.T.",
  short: "Rina Kartika",
  role: "Kepala Departemen Teknik Elektro",
  nip: "19780412 200501 2 003",
  initials: "RK",
};

const initialActivities: StaffActivityItem[] = [
  {
    who: "Ir. Siti Aminah",
    what: "menyetujui",
    doc: "Permohonan Dana KRI 2025",
    when: "12 mnt",
    status: "approved",
  },
  {
    who: "Dr. Tri Harsono",
    what: "sedang meninjau",
    doc: "Anggaran Alat Praktikum",
    when: "1 jam",
    status: "review",
  },
  {
    who: "Dr. Ali Ridho",
    what: "meminta revisi",
    doc: "Surat Tugas IES 2025",
    when: "3 jam",
    status: "rejected",
  },
  {
    who: "Anda",
    what: "mendelegasikan",
    doc: "Peminjaman Lab Embedded",
    when: "1 hari",
    status: "delegated",
  },
];

export function StaffPortal() {
  const [view, setView] = useState<NavView>("dashboard");
  const [letters, setLetters] = useState<InboxLetter[]>(initialInboxLetters);
  const [submissions, setSubmissions] =
    useState<StaffSubmission[]>(mockSubmissionsData);
  const [activities, setActivities] =
    useState<StaffActivityItem[]>(initialActivities);
  const [selectedLetterId, setSelectedLetterId] = useState<string>(
    initialInboxLetters[0]?.id ?? ""
  );
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingCount = letters.filter((l) => l.status === "pending").length;

  const handleUpdateLetterStatus = (
    id: string,
    newStatus: ApprovalStatus,
    note?: string
  ) => {
    setLetters((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          status: newStatus,
          slaHours: newStatus === "approved" ? 0 : l.slaHours,
          steps: l.steps.map((st) =>
            st.name.includes("Rina")
              ? {
                  ...st,
                  status: newStatus,
                  at: "18 Jun, baru saja",
                  note,
                }
              : st
          ),
        };
      })
    );

    // Also register activity
    const targetLetter = letters.find((l) => l.id === id);
    if (targetLetter) {
      const verb =
        newStatus === "approved"
          ? "menyetujui & menandatangani"
          : note?.startsWith("[DITOLAK]")
          ? "menolak"
          : "meminta revisi";

      setActivities((prev) => [
        {
          who: "Anda",
          what: verb,
          doc: targetLetter.title,
          when: "baru saja",
          status: newStatus,
        },
        ...prev,
      ]);
    }
  };

  const handleNewDocSubmit = (newDoc: { title: string; type: string }) => {
    const newSubmission: StaffSubmission = {
      id: `SGN-2025-0${Math.floor(490 + Math.random() * 50)}`,
      title: newDoc.title,
      type: newDoc.type,
      applicant: defaultStaffProfile.name,
      nrp: "-",
      unit: "Dept. Teknik Elektro",
      submitted: "Baru saja",
      slaHours: 48,
      slaTotal: 48,
      status: "pending",
      pages: 3,
      steps: [
        {
          role: "Kepala Departemen",
          name: defaultStaffProfile.name,
          status: "approved",
          at: "18 Jun, 14:00",
        },
        {
          role: "Wadir III Kemahasiswaan",
          name: "Dr. Agus Salim",
          status: "waiting",
        },
      ],
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
  };

  const filteredLetters = searchQuery.trim()
    ? letters.filter(
        (l) =>
          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.nrp.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : letters;

  return (
    <div className="min-h-screen min-w-[1280px] bg-canvas text-midnight">
      {/* Fixed Sidebar */}
      <StaffSidebar
        view={view}
        onChange={setView}
        pendingCount={pendingCount}
      />

      {/* Main Container */}
      <div className="pl-[260px]">
        {/* Top Header */}
        <StaffHeader
          profile={defaultStaffProfile}
          onNew={() => setIsNewModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content View */}
        <main className="mx-auto max-w-[1440px] px-8 lg:px-20 py-8">
          {view === "dashboard" && (
            <StaffDashboard
              profile={defaultStaffProfile}
              priorityLetters={filteredLetters}
              activities={activities}
              onGoToInbox={() => setView("inbox")}
              onGoToDelegation={() => setView("delegation")}
              onOpenLetter={(id) => {
                setSelectedLetterId(id);
                setView("inbox");
              }}
            />
          )}

          {view === "inbox" && (
            <InboxView
              letters={filteredLetters}
              selectedId={selectedLetterId}
              onSelect={setSelectedLetterId}
              onUpdateLetterStatus={handleUpdateLetterStatus}
            />
          )}

          {view === "submissions" && (
            <SubmissionsView
              submissions={submissions}
              onNew={() => setIsNewModalOpen(true)}
            />
          )}

          {view === "delegation" && (
            <DelegationView
              candidates={mockDelegationCandidates}
              scopes={mockDelegationScopes}
            />
          )}
        </main>
      </div>

      {/* New Request Modal */}
      {isNewModalOpen && (
        <NewRequestModal
          templates={mockNewTemplates}
          onClose={() => setIsNewModalOpen(false)}
          onSubmitSuccess={handleNewDocSubmit}
        />
      )}
    </div>
  );
}
export default StaffPortal;
