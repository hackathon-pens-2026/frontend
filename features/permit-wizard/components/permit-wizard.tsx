"use client";

import React, { useState } from "react";
import { FacilityItem, PermitFormData, WizardStep } from "../types";
import { WizardStepsHeader } from "./wizard-steps-header";
import { ApplicantForm } from "./applicant-form";
import { LiveLetterPreview } from "./live-letter-preview";
import { WizardFooter } from "./wizard-footer";
import { ApprovalChainModal } from "./approval-chain-modal";
import { AiAssistantDrawer } from "./ai-assistant-drawer";

interface PermitWizardProps {
  onBackToDashboard?: () => void;
}

const initialFormData: PermitFormData = {
  templateId: "peminjaman-fasilitas",
  templateTitle: "Pengajuan Surat Izin & Peminjaman Fasilitas",
  applicant: {
    name: "Muhammad Fajrul",
    nrp: "2103191001",
    organization: "Himpunan Mahasiswa Informatika",
    isSsoAutoFilled: true,
  },
  eventName: "Workshop AI & Cloud Computing 2026",
  eventDateRange: "Sab, 14 Mar – Min, 15 Mar 2026",
  startTime: "08.00",
  endTime: "16.00",
  timeZone: "WIB",
  selectedFacilityIds: [
    "Auditorium Pascasarjana Lt. 3",
    "Sound System 2000W",
    "2 Unit Proyektor",
  ],
  attachment: {
    name: "proposal-ai-workshop.pdf",
    sizeFormatted: "2.4 MB uploaded",
    fileSizeBytes: 2516582,
    progressPercent: 100,
    uploadedAt: "10.30",
  },
  letterNumber: "041/HIMATIF/PENS/III/2026",
  letterDatePlace: "Surabaya, 2 Maret 2026",
  letterSubject: "Permohonan Izin Kegiatan dan Peminjaman Fasilitas",
  letterRecipient: {
    title: "Wakil Direktur III Bidang Kemahasiswaan",
    institution: "Politeknik Elektronika Negeri Surabaya",
    address: "di Tempat",
  },
  pembinaName: "Dr. Ferry Astika Saputra",
  ketuaHimaName: "M. Fajrul",
};

const initialFacilities: FacilityItem[] = [
  { id: "auditorium-pasca", name: "Auditorium Pascasarjana Lt. 3", category: "room", isAvailable: true },
  { id: "sound-system", name: "Sound System 2000W", category: "equipment", isAvailable: true },
  { id: "proyektor-2", name: "2 Unit Proyektor", category: "equipment", isAvailable: true },
  { id: "ruang-seminar-d4", name: "Ruang Seminar D4 Lt. 2", category: "room", isAvailable: true },
  { id: "mic-wireless", name: "Mic Wireless (4 unit)", category: "equipment", isAvailable: true },
  { id: "kursi-lipat", name: "Kursi Lipat (100 unit)", category: "equipment", isAvailable: true },
  { id: "streaming-kit", name: "Live Streaming Kit", category: "equipment", isAvailable: false, unavailableReason: "Sedang dalam perawatan sarpras" },
];

export function PermitWizard({ onBackToDashboard }: PermitWizardProps) {
  const [formData, setFormData] = useState<PermitFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState<WizardStep>(2);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 3200);
  };

  const handleFormChange = (patch: Partial<PermitFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleSaveDraft = () => {
    showNotification("Draf pengajuan surat izin berhasil disimpan.");
  };

  const handleNext = () => {
    if (currentStep === 2) {
      setIsApprovalModalOpen(true);
    }
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsApprovalModalOpen(false);
      showNotification("Pengajuan berhasil dikirimkan ke antrean tugas Pembina HIMA via email.");
      setTimeout(() => {
        onBackToDashboard?.();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] min-h-0 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 right-8 z-50 animate-rise flex items-center gap-2.5 rounded-lg bg-slate-900 px-4 py-3 text-xs font-medium text-white shadow-xl"
        >
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Wizard Steps Header */}
      <WizardStepsHeader
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step === 3) setIsApprovalModalOpen(true);
          else if (step === 1 && onBackToDashboard) onBackToDashboard();
          else setCurrentStep(step);
        }}
        onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
      />

      {/* Main 2-Column Working Area */}
      <div className="mx-auto w-full max-w-[1240px] px-8 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 5 Form Sections (span 7) */}
          <div className="lg:col-span-7">
            <ApplicantForm
              formData={formData}
              onChange={handleFormChange}
              facilities={initialFacilities}
            />
          </div>

          {/* Right Column: Live Letter Preview (span 5) */}
          <div className="lg:col-span-5">
            <LiveLetterPreview formData={formData} />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Footer */}
      <WizardFooter
        onSaveDraft={handleSaveDraft}
        onBack={() => (onBackToDashboard ? onBackToDashboard() : setCurrentStep(1))}
        onNext={handleNext}
      />

      {/* Step 3: Approval Chain Modal */}
      <ApprovalChainModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onSubmitLetter={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />

      {/* AI Assistant Drawer */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onApplyPatch={(patch) => {
          handleFormChange(patch);
          showNotification("Formulir dan pratinjau surat berhasil diisi otomatis oleh AI.");
        }}
      />
    </div>
  );
}
