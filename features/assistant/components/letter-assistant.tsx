"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AssistantMessage } from "../types";
import { StudentSidebar } from "@/features/shell";
import { AssistantHeader } from "./assistant-header";
import { DraftSummary, DraftStatus } from "./draft-summary";
import {
  Button,
  CheckIcon,
  SendIcon,
  SparklesIcon,
} from "@/components/ui";
import { ApiError } from "@/lib/api/errors";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import {
  createDraft,
  editDraft,
  getPreview,
  queuePreview,
  submitLetter,
} from "@/lib/api/letters";
import {
  listFacilities,
  listOrganizationCandidates,
  listOrganizations,
  listResources,
} from "@/lib/api/routing";
import { listTemplates } from "@/lib/api/templates";
import type {
  DraftDto,
  LetterPreviewDto,
  LetterTemplateDto,
  RoutingCandidateDto,
  RoutingFacilityDto,
  RoutingOrganizationDto,
  RoutingResourceDto,
} from "@/lib/api/types";

let messageId = 1;
const nextId = () => ++messageId;

const timeNow = () =>
  new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

const errorText = (cause: unknown, fallback: string) =>
  cause instanceof ApiError ? cause.message : fallback;

export function LetterAssistant() {
  const [templates, setTemplates] = useState<LetterTemplateDto[]>([]);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [template, setTemplate] = useState<LetterTemplateDto | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: nextId(),
      from: "bot",
      text: "Halo! Ingin membuat tipe surat apa? Pilih salah satu template resmi di bawah.",
      timestamp: timeNow(),
    },
  ]);
  const [input, setInput] = useState("");
  const [organizations, setOrganizations] = useState<RoutingOrganizationDto[]>([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [organizationId, setOrganizationId] = useState("");
  const [candidates, setCandidates] = useState<RoutingCandidateDto[]>([]);
  const [committeeChairId, setCommitteeChairId] = useState("");
  const [organizationChairId, setOrganizationChairId] = useState("");
  const [facilities, setFacilities] = useState<RoutingFacilityDto[]>([]);
  const [facilityId, setFacilityId] = useState("");
  const [resources, setResources] = useState<RoutingResourceDto[]>([]);
  const [resourceId, setResourceId] = useState("");
  const [draft, setDraft] = useState<DraftDto | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState<LetterPreviewDto | null>(null);
  const [status, setStatus] = useState<DraftStatus>("idle");
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    void (async () => {
      try {
        const [catalog, orgs] = await Promise.all([listTemplates(), listOrganizations()]);
        setTemplates(catalog);
        setOrganizations(orgs);
        setOrganizationsLoaded(true);
      } catch (cause) {
        setTemplatesError(
          errorText(cause, "Katalog template tidak dapat dimuat dari server."),
        );
      }
    })();
    return () => {
      cancelled.current = true;
    };
  }, []);

  const addMessage = useCallback(
    (text: string, from: AssistantMessage["from"] = "bot", tone?: AssistantMessage["tone"]) => {
      setMessages((prev) => [...prev, { id: nextId(), from, text, timestamp: timeNow(), tone }]);
    },
    [],
  );

  const selectTemplate = useCallback(
    (next: LetterTemplateDto) => {
      setTemplate(next);
      setFields({});
      setDraft(null);
      setDraftSavedAt(null);
      setPreview(null);
      setSubmittedNumber(null);
      setStatus("idle");
      setDirty(false);
      addMessage(
        `${next.name} dipilih. Lengkapi ${next.fields.filter((f) => f.valueSource === "user").length} field skema di panel kanan, lalu simpan draf.`,
      );
      if (next.typeId === "peminjaman-ruangan") {
        void listFacilities()
          .then(setFacilities)
          .catch(() => setFacilities([]));
      } else {
        setFacilities([]);
        setFacilityId("");
        setResources([]);
        setResourceId("");
      }
    },
    [addMessage],
  );

  const loadCandidates = useCallback(
    async (orgId: string) => {
      setCommitteeChairId("");
      setOrganizationChairId("");
      setCandidates([]);
      if (!orgId) return;
      try {
        const result = await listOrganizationCandidates(orgId);
        setCandidates(result);
        const committee = result.find((c) => c.positionCode === "Ketupel");
        const chair = result.find((c) => c.positionCode === "KetuaOrganisasi");
        setCommitteeChairId(committee?.userId ?? result[0]?.userId ?? "");
        setOrganizationChairId(chair?.userId ?? result[0]?.userId ?? "");
      } catch (cause) {
        addMessage(errorText(cause, "Kandidat penanda tangan tidak dapat dimuat."), "bot", "error");
      }
    },
    [addMessage],
  );

  const selectFacility = useCallback(
    async (nextFacilityId: string) => {
      setFacilityId(nextFacilityId);
      setResourceId("");
      setResources([]);
      if (!nextFacilityId) return;
      try {
        setResources(await listResources(nextFacilityId));
      } catch (cause) {
        addMessage(errorText(cause, "Daftar ruangan tidak dapat dimuat."), "bot", "error");
      }
    },
    [addMessage],
  );

  const updateField = useCallback(
    (key: string, value: string) => {
      setFields((prev) => ({ ...prev, [key]: value }));
      setDirty(true);
      if (preview) {
        setPreview(null);
        addMessage("Data berubah — pratinjau lama tidak berlaku lagi.");
      }
    },
    [preview, addMessage],
  );

  const userFields = useMemo(
    () => template?.fields.filter((f) => f.valueSource === "user") ?? [],
    [template],
  );
  const missingRequired = userFields.filter(
    (field) => field.required && !(fields[field.key] ?? "").trim(),
  );
  const routingComplete =
    Boolean(organizationId) &&
    Boolean(committeeChairId) &&
    Boolean(organizationChairId) &&
    (template?.typeId !== "peminjaman-ruangan" || Boolean(resourceId));

  const saveDraft = useCallback(
    async (silent = false): Promise<DraftDto | null> => {
      if (!template || missingRequired.length > 0) return null;
      setStatus("saving");
      try {
        const payload = {
          title: ((fields["nama_kegiatan"] ?? "").trim() || template.name || "Draf Surat").slice(0, 300),
          fields: Object.fromEntries(
            userFields.map((field) => [field.key, fields[field.key] ?? ""]),
          ),
        };
        const saved = draft
          ? await editDraft(
              draft.id,
              {
                expectedVersion: draft.version,
                expectedRevisionId: draft.revisionId,
                expectedContentHash: draft.contentHash,
                ...payload,
              },
              createIdempotencyKey(),
            )
          : await createDraft({ typeId: template.typeId, ...payload });
        setDraft(saved);
        setDraftSavedAt(timeNow());
        setDirty(false);
        setStatus("idle");
        if (!silent) addMessage("Draf tersimpan di server.", "bot", "success");
        return saved;
      } catch (cause) {
        setStatus("idle");
        addMessage(errorText(cause, "Draf gagal disimpan."), "bot", "error");
        return null;
      }
    },
    [template, fields, draft, missingRequired.length, userFields, addMessage],
  );

  const generatePreview = useCallback(async () => {
    if (!template || !routingComplete) {
      addMessage(
        "Lengkapi routing terlebih dahulu: organisasi, ketua pelaksana, ketua organisasi, dan ruangan bila diperlukan.",
        "bot",
        "error",
      );
      return;
    }
    setStatus("previewing");
    try {
      const current = !draft || dirty ? await saveDraft(true) : draft;
      if (!current) {
        setStatus("idle");
        return;
      }
      const request = {
        expectedVersion: current.version,
        expectedRevisionId: current.revisionId,
        expectedContentHash: current.contentHash,
        organizationId,
        committeeChairId,
        organizationChairId,
        resourceId: template.typeId === "peminjaman-ruangan" ? resourceId : null,
      };
      let snapshot = await queuePreview(current.id, request);
      let attempts = 0;
      while (!cancelled.current && ["Pending", "Processing"].includes(snapshot.state) && attempts < 40) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        snapshot = await getPreview(current.id, snapshot.jobId);
        attempts += 1;
      }
      if (snapshot.state === "Ready") {
        setPreview(snapshot);
        addMessage("Pratinjau PDF siap. Periksa dokumen sebelum mengajukan.", "bot", "success");
      } else if (snapshot.state === "Failed") {
        addMessage(
          `Pratinjau gagal diproses (${snapshot.errorCode ?? "renderer"}). Periksa data lalu coba lagi.`,
          "bot",
          "error",
        );
      } else {
        addMessage("Pratinjau masih diproses server. Coba cek kembali sesaat lagi.", "bot", "error");
      }
    } catch (cause) {
      addMessage(errorText(cause, "Pratinjau tidak dapat dibuat."), "bot", "error");
    } finally {
      setStatus("idle");
    }
  }, [template, routingComplete, draft, dirty, organizationId, committeeChairId, organizationChairId, resourceId, saveDraft, addMessage]);

  const submit = useCallback(async () => {
    if (!draft || !preview || !preview.reviewDocumentId || !preview.reviewHash) return;
    setStatus("submitting");
    try {
      const result = await submitLetter(
        draft.id,
        {
          expectedVersion: draft.version,
          expectedRevisionId: draft.revisionId,
          expectedContentHash: draft.contentHash,
          organizationId,
          committeeChairId,
          organizationChairId,
          resourceId: template?.typeId === "peminjaman-ruangan" ? resourceId : null,
          reviewDocumentId: preview.reviewDocumentId,
          expectedReviewHash: preview.reviewHash,
          slots: preview.slots,
        },
        createIdempotencyKey(),
      );
      setSubmittedNumber(result.number);
      setStatus("submitted");
      setPreview(null);
      addMessage(
        `Surat berhasil diajukan dengan nomor ${result.number}. Pantau tahapannya dari menu Surat Saya.`,
        "bot",
        "success",
      );
    } catch (cause) {
      setStatus("idle");
      addMessage(errorText(cause, "Pengajuan gagal dikirim."), "bot", "error");
    }
  }, [draft, preview, organizationId, committeeChairId, organizationChairId, resourceId, template, addMessage]);

  const handleSend = useCallback(() => {
    const raw = input.trim();
    if (!raw) return;
    setInput("");
    addMessage(raw, "user");
    if (!template) {
      addMessage("Pilih tipe surat terlebih dahulu dari daftar template.", "bot", "error");
      return;
    }
    const parts = raw
      .split(/[;\n]+/)
      .map((part) => part.trim())
      .filter(Boolean);
    const applied: string[] = [];
    const unmatched: string[] = [];
    for (const part of parts) {
      const separator = part.indexOf(":");
      if (separator <= 0) {
        unmatched.push(part);
        continue;
      }
      const label = part.slice(0, separator).trim().toLowerCase();
      const value = part.slice(separator + 1).trim();
      const match = userFields.find(
        (field) =>
          field.key.toLowerCase() === label ||
          field.label.toLowerCase().includes(label) ||
          label.includes(field.label.toLowerCase()),
      );
      if (!match || !value) {
        unmatched.push(part);
        continue;
      }
      updateField(match.key, value);
      applied.push(match.label);
    }
    if (applied.length > 0) {
      addMessage(`Data diisi ke formulir: ${applied.join(", ")}.`);
    }
    if (unmatched.length > 0) {
      addMessage(
        `Baris berikut tidak dikenali: ${unmatched.join(" | ")}. Ekstraksi bahasa alami penuh menunggu API asisten backend; gunakan format "Label: nilai".`,
        "bot",
        "error",
      );
    }
  }, [input, template, userFields, updateField, addMessage]);

  const committeeLabel =
    candidates.find((c) => c.userId === committeeChairId);
  const organizationChairLabel =
    candidates.find((c) => c.userId === organizationChairId);
  const ketupelCandidates = candidates.filter((c) => c.positionCode === "Ketupel");
  const chairCandidates = candidates.filter(
    (c) => c.positionCode === "KetuaOrganisasi",
  );
  const organizationLabel = organizations.find((o) => o.id === organizationId);
  const resourceLabel = resources.find((r) => r.id === resourceId);

  const canSave = Boolean(template) && missingRequired.length === 0 && status === "idle";
  const canGenerate = canSave && routingComplete;
  const canSubmit = Boolean(preview) && !dirty && status === "idle";

  return (
    <div className="flex h-screen min-w-[1240px] bg-canvas text-midnight selection:bg-blue-100">
      <StudentSidebar currentPath="/surat/baru" />

      <div className="flex min-w-0 flex-1 flex-col pl-[260px] overflow-hidden">
        <AssistantHeader
          isSaving={status === "saving"}
          lastSavedTime={draftSavedAt ?? "-"}
        />

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(480px,3fr)_minmax(360px,2fr)] gap-6 p-6 lg:p-7 overflow-hidden">
          <section
            aria-label="Asisten surat"
            className="flex min-h-0 flex-col rounded-xl border border-line bg-white shadow-card"
          >
            <div className="border-b border-line px-5 py-4">
              <h1 className="text-title font-bold text-midnight">Asisten Surat</h1>
              <p className="mt-0.5 text-micro text-slate-500">
                Pilih template dari katalog backend, isi schema, lalu susun
                pratinjau resmi sebelum diajukan.
              </p>
            </div>

            <div className="scroll-thin min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {templatesError && (
                <p className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision">
                  {templatesError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {templates.map((option) => {
                  const active = template?.typeId === option.typeId;
                  return (
                    <button
                      key={option.typeId}
                      type="button"
                      onClick={() => selectTemplate(option)}
                      className={`inline-flex h-11 items-center rounded-full border px-4 text-micro font-semibold transition-colors cursor-pointer ${
                        active
                          ? "border-navy bg-navy text-white"
                          : "border-line bg-white text-midnight hover:bg-slate-50"
                      }`}
                    >
                      {option.name}
                    </button>
                  );
                })}
                {!templatesError && templates.length === 0 && (
                  <p className="text-micro text-slate-500">Memuat katalog template…</p>
                )}
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-body leading-relaxed ${
                      message.from === "user"
                        ? "bg-navy text-white"
                        : message.tone === "error"
                        ? "bg-revision-bg text-revision ring-1 ring-revision-border"
                        : message.tone === "success"
                        ? "bg-approved-bg text-approved ring-1 ring-approved-border"
                        : "bg-canvas text-slate-700 ring-1 ring-line"
                    }`}
                  >
                    {message.text}
                    <div
                      className={`mt-1 text-[10px] ${
                        message.from === "user" ? "text-slate-300" : "text-slate-400"
                      }`}
                    >
                      {message.timestamp}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-line px-5 py-4 space-y-3">
              {template && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {organizationsLoaded && organizations.length === 0 && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800 sm:col-span-2">
                      Akun ini belum memiliki assignment pengaju pada organisasi
                      mana pun, sehingga katalog organisasi kosong. Gunakan akun
                      pengaju organisasi (mis. pengaju-bem@demo.signit.example),
                      atau minta tim menambahkan assignment Requester untuk akun
                      ini.
                    </p>
                  )}
                  <label className="space-y-1 text-micro font-medium text-slate-600">
                    Organisasi
                    <select
                      value={organizationId}
                      onChange={(event) => {
                        setOrganizationId(event.target.value);
                        void loadCandidates(event.target.value);
                      }}
                      className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                    >
                      <option value="">Pilih organisasi…</option>
                      {organizations.map((organization) => (
                        <option key={organization.id} value={organization.id}>
                          {organization.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-micro font-medium text-slate-600">
                    Ketua Pelaksana (Ketupel)
                    {ketupelCandidates.length > 1 ? (
                      <select
                        value={committeeChairId}
                        onChange={(event) => setCommitteeChairId(event.target.value)}
                        className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                      >
                        <option value="">Pilih ketua…</option>
                        {ketupelCandidates.map((candidate) => (
                          <option key={candidate.userId} value={candidate.userId}>
                            {candidate.name} — {candidate.positionName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex h-11 items-center rounded-lg border border-line bg-canvas px-3 text-body text-midnight">
                        {ketupelCandidates[0]
                          ? `${ketupelCandidates[0].name} — ${ketupelCandidates[0].positionName}`
                          : "Terisi otomatis setelah organisasi dipilih"}
                      </div>
                    )}
                  </label>

                  <label className="space-y-1 text-micro font-medium text-slate-600">
                    Ketua Organisasi
                    {chairCandidates.length > 1 ? (
                      <select
                        value={organizationChairId}
                        onChange={(event) => setOrganizationChairId(event.target.value)}
                        className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                      >
                        <option value="">Pilih ketua organisasi…</option>
                        {chairCandidates.map((candidate) => (
                          <option key={candidate.userId} value={candidate.userId}>
                            {candidate.name} — {candidate.positionName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex h-11 items-center rounded-lg border border-line bg-canvas px-3 text-body text-midnight">
                        {chairCandidates[0]
                          ? `${chairCandidates[0].name} — ${chairCandidates[0].positionName}`
                          : "Terisi otomatis setelah organisasi dipilih"}
                      </div>
                    )}
                  </label>

                  {template.typeId === "peminjaman-ruangan" && (
                    <>
                      <label className="space-y-1 text-micro font-medium text-slate-600">
                        Fasilitas
                        <select
                          value={facilityId}
                          onChange={(event) => void selectFacility(event.target.value)}
                          className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10"
                        >
                          <option value="">Pilih fasilitas…</option>
                          {facilities.map((facility) => (
                            <option key={facility.id} value={facility.id}>
                              {facility.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-micro font-medium text-slate-600">
                        Ruangan
                        <select
                          value={resourceId}
                          onChange={(event) => setResourceId(event.target.value)}
                          disabled={resources.length === 0}
                          className="h-11 w-full rounded-lg border border-line bg-white px-3 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:bg-slate-50"
                        >
                          <option value="">Pilih ruangan…</option>
                          {resources.map((resource) => (
                            <option key={resource.id} value={resource.id}>
                              {resource.code}
                              {resource.floor !== null ? ` · lantai ${resource.floor}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={2}
                  placeholder={'Isi cepat formulir, contoh:\nnama kegiatan: Buka Bersama; tanggal surat: 18 Oktober 2026'}
                  className="min-h-[64px] flex-1 resize-none rounded-lg border border-line bg-white px-3 py-2 text-body outline-none placeholder:text-slate-400 focus:border-navy focus:ring-4 focus:ring-navy/10"
                />
                <Button
                  type="button"
                  onClick={handleSend}
                  aria-label="Kirim data ke formulir"
                  className="h-11 shrink-0"
                >
                  <SendIcon className="size-4" />
                </Button>
              </div>
              <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <SparklesIcon className="size-3.5" />
                Ekstraksi bahasa alami penuh menunggu API asisten di backend.
                Saat ini format “Label: nilai” mengisi schema secara langsung.
                <CheckIcon className="ml-auto size-3.5 text-approved" />
                Draft &amp; preview disimpan di server.
              </p>
            </div>
          </section>

          <DraftSummary
            template={template}
            fields={fields}
            onFieldChange={updateField}
            organizationLabel={organizationLabel?.name ?? null}
            committeeLabel={
              committeeLabel ? `${committeeLabel.name} — ${committeeLabel.positionName}` : null
            }
            organizationChairLabel={
              organizationChairLabel
                ? `${organizationChairLabel.name} — ${organizationChairLabel.positionName}`
                : null
            }
            resourceLabel={resourceLabel?.code ?? null}
            draftSavedAt={draftSavedAt}
            preview={preview}
            status={status}
            canSave={canSave}
            canGenerate={canGenerate}
            canSubmit={canSubmit}
            submittedNumber={submittedNumber}
            submittedLetterId={draft?.id ?? null}
            onSaveDraft={() => void saveDraft()}
            onGeneratePreview={() => void generatePreview()}
            onSubmit={() => void submit()}
            onOpenPreview={() => {
              if (draft && preview?.reviewDocumentId) {
                window.open(
                  `/api/v1/letters/${draft.id}/documents/${preview.reviewDocumentId}`,
                  "_blank",
                  "noopener",
                );
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
export default LetterAssistant;
