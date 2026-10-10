"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AssistantMessage } from "../types";
import { StudentSidebar } from "@/features/shell";
import { DraftSummary, DraftStatus } from "./draft-summary";
import { MessageContent } from "./message-content";
import {
  ArrowDownIcon,
  Button,
  CheckCheckIcon,
  CheckIcon,
  SendIcon,
  SignItIcon,
  SparklesIcon,
} from "@/components/ui";
import { createIdempotencyKey } from "@/lib/api/idempotency";
import {
  createOrResumeSession,
  sendChatMessage,
} from "@/lib/api/chat";
import {
  createDraft,
  editDraft,
  getPreview,
  getLetter,
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
import { useSession } from "@/lib/auth/session-provider";
import { detectTemplate, extractFieldsFromText } from "@/lib/assistant/nlp-parser";
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
  cause instanceof Error && cause.message ? cause.message : fallback;

function LetterAssistantContent() {
  const { currentPersonaId } = useSession();
  const searchParams = useSearchParams();
  const urlDraftId = searchParams.get("draftId");
  const urlTypeId = searchParams.get("typeId");

  const [templates, setTemplates] = useState<LetterTemplateDto[]>([]);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [template, setTemplate] = useState<LetterTemplateDto | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: nextId(),
      from: "bot",
      text: "Halo! Ingin membuat tipe surat apa hari ini? Pilih salah satu template resmi di bawah atau ketik langsung kebutuhan Anda.",
      timestamp: timeNow(),
      widget: "typePills",
    },
  ]);
  const [input, setInput] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean | null>(null);
  const [, setSuggestedWidget] = useState<string | null>(null);

  const [organizations, setOrganizations] = useState<RoutingOrganizationDto[]>([]);
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
  const [submittedLetterId, setSubmittedLetterId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const cancelled = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const operationInFlight = useRef(false);
  const submissionKey = useRef<string | null>(null);

  const addMessage = useCallback(
    (
      text: string,
      from: AssistantMessage["from"] = "bot",
      tone?: AssistantMessage["tone"],
      widget?: string | null,
    ) => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from,
          text,
          timestamp: timeNow(),
          tone,
          widget,
          status: from === "user" ? "delivered" : undefined,
        },
      ]);
    },
    [],
  );

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isBotThinking]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  // Initialize or resume chat session with backend
  useEffect(() => {
    cancelled.current = false;
    void (async () => {
      let catalog: LetterTemplateDto[] = [];
      try {
        const [loadedCatalog, orgs] = await Promise.all([
          listTemplates(),
          listOrganizations(),
        ]);
        if (cancelled.current) return;
        if (loadedCatalog && loadedCatalog.length > 0) {
          catalog = loadedCatalog;
          setTemplates(loadedCatalog);
        }
        if (orgs && orgs.length > 0) {
          setOrganizations(orgs);
          setOrganizationId(orgs[0].id);
        }
        if (urlDraftId) {
          const saved = await getLetter(urlDraftId);
          if (cancelled.current) return;
          setDraft(saved);
          setFields(JSON.parse(saved.dataJson));
          setTemplate(catalog.find((t) => t.typeId === saved.typeId) ?? null);
          setDraftSavedAt(timeNow());
        }
      } catch (cause) {
        if (!cancelled.current) {
          setTemplatesError(errorText(cause, "Data server belum dapat dimuat. Input di halaman ini belum tersimpan di server."));
        }
      }

      // Initialize backend chat session
      try {
        const session = await createOrResumeSession({
          letterRequestId: urlDraftId ?? undefined,
          typeId: urlTypeId ?? undefined,
        });
        if (cancelled.current) return;

        setSessionId(session.sessionId);
        setIsBackendConnected(true);
        setSuggestedWidget(session.suggestedWidget ?? null);

        if (session.messages?.length) {
          setMessages(
            session.messages.map((m) => ({
              id: m.id,
              from: m.from === "user" ? "user" : "bot",
              text: m.text,
              timestamp: new Date(m.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              widget: m.widget,
              status: m.from === "user" ? "delivered" : undefined,
            })),
          );
        }

        if (session.fields && Object.keys(session.fields).length > 0) {
          setFields(session.fields);
        }

        if (session.draft) {
          setDraft(session.draft);
          const matched = catalog.find((t) => t.typeId === session.draft?.typeId);
          if (matched) setTemplate(matched);
          setDraftSavedAt(timeNow());
        } else if (session.typeId) {
          const matched = catalog.find((t) => t.typeId === session.typeId);
          if (matched) setTemplate(matched);
        }
      } catch {
        if (!cancelled.current) {
          setIsBackendConnected(false);
        }
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [urlDraftId, urlTypeId, currentPersonaId]);

  const selectTemplate = useCallback(
    async (next: LetterTemplateDto) => {
      setTemplate(next);

      // Pre-fill initial defaults dari skema template
      const initial: Record<string, string> = {};
      for (const field of next.fields) {
        if (
          field.defaultValue &&
          field.valueSource !== "signatureEvidence" &&
          field.valueSource !== "server"
        ) {
          initial[field.key] = field.defaultValue;
        }
      }
      setFields(initial);

      setDraft(null);
      setDraftSavedAt(null);
      setPreview(null);
      setSubmittedNumber(null);
      setSubmittedLetterId(null);
      setStatus("idle");
      setDirty(false);

      if (next.typeId === "peminjaman-ruangan") {
        const initialFacility = "";
        const initialResources: RoutingResourceDto[] = [];
        setFacilities([]);
        setFacilityId(initialFacility);
        setResources(initialResources);
        setResourceId(initialResources[0]?.id ?? "");

        void listFacilities()
          .then((facs) => {
            if (facs.length > 0) {
              setFacilities(facs);
              setFacilityId(facs[0].id);
              return listResources(facs[0].id).then((res) => {
                if (res.length > 0) {
                  setResources(res);
                  setResourceId(res[0].id);
                }
              });
            }
          })
          .catch((cause) => addMessage(errorText(cause, "Katalog fasilitas belum dapat dimuat."), "bot", "error"));
      } else {
        setFacilities([]);
        setFacilityId("");
        setResources([]);
        setResourceId("");
      }

      if (sessionId && isBackendConnected) {
        setIsBotThinking(true);
        try {
          const response = await sendChatMessage(sessionId, {
            text: `Saya memilih template: ${next.name}`,
            directFieldUpdates: { typeId: next.typeId },
          });
          setIsBotThinking(false);
          if (response.reply?.text) {
            addMessage(
              response.reply.text,
              "bot",
              undefined,
              response.reply.widget ?? undefined,
            );
          }
          if (response.fields && Object.keys(response.fields).length > 0) {
            setFields((prev) => ({ ...prev, ...response.fields }));
          }
          if (response.draft) {
            setDraft(response.draft);
            setDraftSavedAt(timeNow());
          }
          if (response.suggestedWidget) {
            setSuggestedWidget(response.suggestedWidget);
          }
        } catch {
          setIsBotThinking(false);
          addMessage(
            `Template **${next.name}** telah dipilih! 📋\n\nSilakan sebutkan nama kegiatan, tanggal, dan rincian permohonan Anda, atau lengkapi data melalui formulir ringkasan draf di samping kanan.`,
            "bot",
          );
        }
      } else {
        addMessage(
          `Template **${next.name}** telah dipilih! 📋\n\nSilakan sebutkan nama kegiatan, tanggal, dan rincian permohonan Anda, atau lengkapi data melalui formulir ringkasan draf di samping kanan.`,
          "bot",
        );
      }
    },
    [sessionId, isBackendConnected, addMessage],
  );

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    listOrganizationCandidates(organizationId).then((result) => {
      if (!active) return;
      setCandidates(result);
      setCommitteeChairId(result.find((c) => c.positionCode === "Ketupel")?.userId ?? "");
      setOrganizationChairId(result.find((c) => c.positionCode === "KetuaOrganisasi")?.userId ?? "");
    }).catch((cause) => {
      if (active) addMessage(errorText(cause, "Peserta organisasi belum dapat dimuat."), "bot", "error");
    });
    return () => { active = false; };
  }, [organizationId, addMessage]);

  const selectFacility = useCallback(
    async (nextFacilityId: string) => {
      setFacilityId(nextFacilityId);
      setPreview(null);
      submissionKey.current = null;
      setResources([]);
      setResourceId("");

      if (!nextFacilityId) return;

      try {
        const list = await listResources(nextFacilityId);
        if (list && list.length > 0) {
          setResources(list);
          setResourceId(list[0].id);
        }
      } catch (cause) {
        addMessage(errorText(cause, "Daftar ruangan belum dapat dimuat."), "bot", "error");
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

      submissionKey.current = null;
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
      if (!template) return null;
      setStatus("saving");
      try {
        const payload = {
          title: (
            (fields["nama_kegiatan"] ?? "").trim() ||
            template.name ||
            "Draf Surat"
          ).slice(0, 300),
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
        addMessage(errorText(cause, "Draft belum tersimpan. Input tetap tersedia di halaman ini; coba simpan kembali."), "bot", "error");
        return null;
      }
    },
    [template, fields, draft, userFields, addMessage],
  );

  const generatePreview = useCallback(async () => {
    if (operationInFlight.current) return;
    if (!template || !routingComplete || missingRequired.length > 0) {
      addMessage(
        "Lengkapi data wajib, organisasi, ketua pelaksana, ketua organisasi, dan ruangan bila diperlukan sebelum menyiapkan tinjauan.",
        "bot",
        "error",
      );
      return;
    }
    operationInFlight.current = true;
    setPreview(null);
    submissionKey.current = null;
    setStatus("previewing");
    try {
      const current = !draft || dirty ? await saveDraft(true) : draft;
      if (!current) {
        setStatus("idle");
        return;
      }
      setStatus("previewing");
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
      while (
        !cancelled.current &&
        ["Pending", "Processing"].includes(snapshot.state) &&
        attempts < 40
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        snapshot = await getPreview(current.id, snapshot.jobId);
        attempts += 1;
      }
      if (snapshot.state === "Ready") {
        setPreview(snapshot);
        addMessage(
          "Pratinjau PDF siap. Periksa dokumen di panel kanan sebelum mengajukan.",
          "bot",
          "success",
          "pdf",
        );
      } else if (snapshot.state === "Failed") {
        addMessage(
          `Pratinjau gagal diproses (${snapshot.errorCode ?? "renderer"}). Periksa data lalu coba lagi.`,
          "bot",
          "error",
        );
      } else {
        addMessage(
          "Pratinjau masih diproses server. Coba cek kembali sesaat lagi.",
          "bot",
          "error",
        );
      }
    } catch (cause) {
      addMessage(errorText(cause, "Pratinjau PDF belum tersedia. Data tetap tersedia; coba Generate kembali."), "bot", "error");
    } finally {
      operationInFlight.current = false;
      setStatus("idle");
    }
  }, [
    template,
    routingComplete,
    missingRequired.length,
    draft,
    dirty,
    organizationId,
    committeeChairId,
    organizationChairId,
    resourceId,
    saveDraft,
    addMessage,
  ]);

  const submit = useCallback(async () => {
    if (operationInFlight.current || dirty || !draft || preview?.state !== "Ready" || preview.revisionId !== draft.revisionId || !preview.reviewDocumentId || !preview.reviewHash)
      return;
    operationInFlight.current = true;
    submissionKey.current ??= createIdempotencyKey();
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
        submissionKey.current,
      );
      setSubmittedNumber(result.number);
      setSubmittedLetterId(result.letterId);
      setStatus("submitted");
      setPreview(null);
      addMessage(
        `Surat berhasil diajukan dengan nomor ${result.number}. Pantau tahapannya dari menu Surat Saya.`,
        "bot",
        "success",
      );
    } catch (cause) {
      setStatus("idle");
      addMessage(errorText(cause, "Surat belum berhasil diajukan. Periksa koneksi lalu coba kembali."), "bot", "error");
    } finally {
      operationInFlight.current = false;
    }
  }, [
    draft,
    preview,
    dirty,
    organizationId,
    committeeChairId,
    organizationChairId,
    resourceId,
    template,
    addMessage,
  ]);

  const handleSend = useCallback(
    async (customText?: string) => {
      const raw = (customText ?? input).trim();
      if (!raw || isBotThinking) return;

      if (!customText) setInput("");
      addMessage(raw, "user");

      // 1. Backend Orchestration Path (bila backend aktif & terhubung)
      if (sessionId && isBackendConnected) {
        setIsBotThinking(true);
        try {
          const response = await sendChatMessage(sessionId, {
            text: raw,
            directFieldUpdates: null,
          });
          setIsBotThinking(false);

          if (response.reply?.text) {
            addMessage(
              response.reply.text,
              "bot",
              undefined,
              response.reply.widget ?? undefined,
            );
          }

          if (response.fields && Object.keys(response.fields).length > 0) {
            setFields((prev) => ({ ...prev, ...response.fields }));
            setPreview(null);
            submissionKey.current = null;
            setDirty(true);
          }

          if (response.draft) {
            setDraft(response.draft);
            setDraftSavedAt(timeNow());
            setDirty(false);
          }

          if (
            response.typeId &&
            (!template || template.typeId !== response.typeId)
          ) {
            const matched = templates.find((t) => t.typeId === response.typeId);
            if (matched) setTemplate(matched);
          }

          if (response.suggestedWidget) {
            setSuggestedWidget(response.suggestedWidget);
          }
          return;
        } catch {
          setIsBotThinking(false);
          // Meluncur ke NLP local fallback di bawah bila backend gagal
        }
      }

      // 2. Resilient NLP Parser & Local Orchestration Fallback
      // Kasus A: Template belum dipilih sama sekali
      if (!template) {
        const matched = detectTemplate(raw, templates);
        if (matched) {
          await selectTemplate(matched);

          // Cek apakah prompt pertama pengguna sudah mengandung rincian acara/tanggal
          const userFieldsForMatched = matched.fields.filter(
            (f) => f.valueSource === "user",
          );
          const nlp = extractFieldsFromText(
            raw,
            userFieldsForMatched,
            matched.typeId,
          );
          if (nlp.appliedLabels.length > 0) {
            setFields((prev) => ({ ...prev, ...nlp.extractedFields }));
            setDirty(true);
            if (nlp.recognizedFacility && nlp.recognizedResource) {
              setFacilityId(nlp.recognizedFacility);
              setResourceId(nlp.recognizedResource);
            }
            const summary = nlp.appliedLabels
              .map((lbl) => `• **${lbl}**`)
              .join("\n");
            addMessage(
              `✅ **Data awal berhasil dicatat:**\n${summary}\n\nPeriksa panel sebelah kanan untuk melihat draf yang telah terisi.`,
              "bot",
              "success",
            );
          }
          return;
        }

        addMessage(
          "Silakan pilih salah satu opsi template resmi di atas:\n• **Surat Permohonan Peminjaman Ruangan**\n• **Surat Permohonan Peminjaman Alat / Barang**\n• **Proposal Kegiatan**\n• **Laporan Pertanggungjawaban (LPJ)**\n\nAtau ketik langsung permohonan Anda (contoh: *\"Saya mau pinjam ruang Teater D4 untuk seminar\"*).",
          "bot",
        );
        return;
      }

      // Kasus B: Pengguna meminta ganti template saat template sudah aktif
      const switchCandidate = detectTemplate(raw, templates);
      if (
        switchCandidate &&
        switchCandidate.typeId !== template.typeId &&
        (raw.toLowerCase().startsWith("ganti") ||
          raw.toLowerCase().startsWith("pindah") ||
          raw.toLowerCase().startsWith("buat") ||
          raw.toLowerCase().includes("ke "))
      ) {
        await selectTemplate(switchCandidate);
        return;
      }

      // Kasus C: Ekstraksi field atau penanganan kelengkapan data
      const nlp = extractFieldsFromText(raw, userFields, template.typeId);

      // Cek pertanyaan tentang kelengkapan field
      if (nlp.isQuestionAboutMissing) {
        if (missingRequired.length === 0) {
          addMessage(
            `🎉 Semua data wajib untuk template **${template.name}** sudah lengkap! Anda dapat meninjau pratinjau PDF di panel kanan sebelum mengajukan.`,
            "bot",
            "success",
          );
        } else {
          const missingList = missingRequired
            .slice(0, 5)
            .map((f) => `• **${f.label}**`)
            .join("\n");
          addMessage(
            `📋 **Data yang masih perlu dilengkapi (${missingRequired.length} field tersisa):**\n${missingList}\n\nSilakan ketik data di atas atau lengkapi langsung di panel formulir sebelah kanan.`,
            "bot",
          );
        }
        return;
      }

      // Jika ada field yang berhasil diekstrak
      if (nlp.appliedLabels.length > 0) {
        setFields((prev) => ({ ...prev, ...nlp.extractedFields }));
        setDirty(true);

        if (nlp.recognizedFacility && nlp.recognizedResource) {
          setFacilityId(nlp.recognizedFacility);
          setResourceId(nlp.recognizedResource);
        }

        const summary = nlp.appliedLabels
          .map((lbl) => `• **${lbl}**`)
          .join("\n");
        const remaining = missingRequired.filter(
          (m) => !nlp.appliedLabels.includes(m.label),
        ).length;

        addMessage(
          `✅ **Data berikut berhasil dicatat ke draf:**\n${summary}\n\n${
            remaining > 0
              ? `Masih ada **${remaining} data wajib** yang perlu dilengkapi.`
              : "Semua data wajib telah lengkap! Siap untuk diproses."
          }`,
          "bot",
          "success",
        );
        return;
      }

      // Catatan teks umum
      addMessage(
        `**Catatan di halaman ini:**\n${raw}\n\n**Tips pengisian**\nKetik detail berikut pada baris terpisah:\n• Nama kegiatan: Workshop Cloud Computing\n• Tanggal: 28 Oktober 2026\n• Waktu: 08.00–15.00\n• Ruangan: Ruang Teater D4`,
        "bot",
      );
    },
    [
      input,
      isBotThinking,
      sessionId,
      isBackendConnected,
      template,
      templates,
      userFields,
      missingRequired,
      selectTemplate,
      addMessage,
    ],
  );

  const committeeLabel = candidates.find((c) => c.userId === committeeChairId);
  const organizationChairLabel = candidates.find(
    (c) => c.userId === organizationChairId,
  );
  const ketupelCandidates = candidates.filter(
    (c) => c.positionCode === "Ketupel",
  );
  const chairCandidates = candidates.filter(
    (c) => c.positionCode === "KetuaOrganisasi",
  );
  const organizationLabel = organizations.find((o) => o.id === organizationId);
  const resourceLabel = resources.find((r) => r.id === resourceId);

  const canSave = Boolean(template) && status === "idle";
  const canGenerate = canSave && routingComplete && missingRequired.length === 0;
  const canSubmit = preview?.state === "Ready" && preview.revisionId === draft?.revisionId && !dirty && status === "idle";

  // Dynamic quick suggestions capped at 3 (Hick's law)
  const quickSuggestions = useMemo(() => {
    const list: string[] = [];
    if (!template) {
      list.push("Peminjaman Ruangan & Fasilitas");
      list.push("Proposal Kegiatan");
      list.push("Laporan Pertanggungjawaban (LPJ)");
      return list;
    }
    const emptyKeys = missingRequired.map((f) => f.label);
    if (emptyKeys.length > 0) {
      list.push(`Lengkapi ${emptyKeys[0]}`);
    }
    if (!organizationId) {
      list.push("Pilih Organisasi Pemohon");
    }
    list.push("Apa saja data yang masih kurang?");
    return list.slice(0, 3);
  }, [template, missingRequired, organizationId]);

  return (
    <div className="flex min-h-dvh min-w-0 bg-canvas text-midnight xl:h-dvh">
      <StudentSidebar currentPath="/surat/baru" />

      <div className="flex min-w-0 flex-1 flex-col pt-16 md:pt-0 md:pl-[260px] overflow-hidden">
        <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-4 p-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:gap-6 xl:p-7 xl:overflow-hidden">
          {/* Chat Workspace (Left) */}
          <section
            aria-label="Asisten surat"
            className="relative flex min-h-[36rem] min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card xl:min-h-0"
          >
            {/* Header with backend connection indicator */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-canvas/40">
              <div className="flex items-center gap-2.5">
                <SignItIcon size={32} className="size-8 rounded-lg shadow-card" />
                <div>
                  <h1 className="text-body font-bold text-midnight leading-tight">
                    Asisten Pembuat Surat
                  </h1>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span
                      className={`size-2 rounded-full ${
                        isBackendConnected === true
                          ? "bg-emerald-500"
                          : isBackendConnected === false
                          ? "bg-amber-500"
                          : "bg-slate-300"
                      }`}
                    />
                    <span>
                      {isBackendConnected === true
                        ? "Terhubung ke AI Assistant Backend"
                        : isBackendConnected === false
                        ? "Formulir — belum tersimpan di server"
                        : "Menghubungkan ke backend…"}
                    </span>
                  </div>
                </div>
              </div>
              {template && (
                <span className="rounded-full bg-review-bg px-2.5 py-1 text-[11px] font-semibold text-review ring-1 ring-amber-300/60">
                  Mode: {template.name}
                </span>
              )}
            </div>

            {/* Scrollable Message List */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="scroll-thin min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"
            >
              {templatesError && (
                <p className="rounded-lg border border-revision-border bg-revision-bg px-3 py-2 text-body text-revision">
                  {templatesError}
                </p>
              )}

              {/* Template Selection Pills */}
              <div className="flex flex-wrap gap-2">
                {templates.map((option) => {
                  const active = template?.typeId === option.typeId;
                  return (
                    <button
                      key={option.typeId}
                      type="button"
                      onClick={() => void selectTemplate(option)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-micro font-semibold transition-all cursor-pointer ${
                        active
                          ? "bg-navy text-white shadow-card ring-2 ring-navy/20"
                          : "bg-white text-slate-700 ring-1 ring-line hover:bg-slate-50"
                      }`}
                    >
                      {active && (
                        <CheckIcon className="size-3 text-gold" strokeWidth={3} />
                      )}
                      <span>{option.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chat Message Bubbles */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`animate-rise flex ${
                    message.from === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-body leading-relaxed shadow-2xs ${
                      message.from === "user"
                        ? "rounded-tr-md bg-navy text-white"
                        : message.tone === "error"
                        ? "rounded-tl-md bg-revision-bg text-revision ring-1 ring-revision-border"
                        : message.tone === "success"
                        ? "rounded-tl-md bg-approved-bg text-approved ring-1 ring-approved-border"
                        : "rounded-tl-md bg-canvas text-slate-700 ring-1 ring-line"
                    }`}
                  >
                    <MessageContent text={message.text} formatted={message.from === "bot"} />
                    <div
                      className={`mt-1 flex items-center gap-1 text-[10px] ${
                        message.from === "user"
                          ? "justify-end text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      <span>{message.timestamp}</span>
                      {message.from === "user" && (
                        <CheckCheckIcon className="size-3 text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* AI Thinking Indicator (Doherty Threshold) */}
              {isBotThinking && (
                <div className="animate-rise flex items-center gap-2 rounded-2xl rounded-tl-md bg-canvas px-4 py-3 ring-1 ring-line w-fit">
                  <SignItIcon size={20} className="size-5 rounded" />
                  <span className="text-[11px] font-medium text-slate-500">
                    Asisten AI sedang mengekstrak data &amp; memeriksa sistem…
                  </span>
                  <span className="flex items-center gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="size-1.5 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </span>
                </div>
              )}
            </div>

            {/* Floating Scroll to Bottom Button */}
            {showScrollBottom && (
              <button
                type="button"
                onClick={scrollToBottom}
                className="animate-rise absolute bottom-28 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-midnight/90 backdrop-blur px-3.5 py-1.5 text-micro font-semibold text-white shadow-lift hover:bg-midnight cursor-pointer transition-all z-10"
              >
                <ArrowDownIcon className="size-3.5 text-gold" />
                <span>Pesan Terbaru</span>
              </button>
            )}

            {/* Input & Routing Bar */}
            <div className="border-t border-line px-5 py-3.5 space-y-3 bg-white">
              {/* Routing Selectors when template is active */}
              {template && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label className="space-y-1 text-micro font-medium text-slate-600">
                    Organisasi Pemohon
                    <select
                      value={organizationId}
                      onChange={(event) => {
                        const orgId = event.target.value;
                        setOrganizationId(orgId);
                        setPreview(null);
                        submissionKey.current = null;
                        const org = organizations.find((o) => o.id === orgId);
                        if (org) {
                          addMessage(`Organisasi pemohon: ${org.name}`, "user");
                        }
                      }}
                      className="h-10 w-full rounded-lg border border-line bg-white px-2.5 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 text-midnight"
                    >
                      <option value="">Pilih organisasi…</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1 text-micro font-medium text-slate-600">
                    Ketua Pelaksana
                    {ketupelCandidates.length > 1 ? (
                      <select
                        value={committeeChairId}
                        onChange={(event) => {
                          const candId = event.target.value;
                          setCommitteeChairId(candId);
                          setPreview(null);
                          submissionKey.current = null;
                          const cand = candidates.find((c) => c.userId === candId);
                          if (cand) {
                            addMessage(`Ketua Pelaksana: ${cand.name}`, "user");
                          }
                        }}
                        className="h-10 w-full rounded-lg border border-line bg-white px-2.5 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 text-midnight"
                      >
                        <option value="">Pilih ketua…</option>
                        {ketupelCandidates.map((candidate) => (
                          <option key={candidate.userId} value={candidate.userId}>
                            {candidate.name} — {candidate.positionName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex h-10 items-center rounded-lg border border-line bg-canvas px-3 text-body text-midnight truncate">
                        {ketupelCandidates[0]
                          ? `${ketupelCandidates[0].name} — ${ketupelCandidates[0].positionName}`
                          : "Pilih organisasi pemohon terlebih dahulu"}
                      </div>
                    )}
                  </label>

                  <label className="space-y-1 text-micro font-medium text-midnight/70">
                    Ketua Organisasi
                    <select value={organizationChairId} onChange={(event) => { setOrganizationChairId(event.target.value); setPreview(null); submissionKey.current = null; }} className="h-10 w-full rounded-lg border border-line bg-surface px-2.5 text-body text-midnight focus-visible:outline-2 focus-visible:outline-navy">
                      <option value="">Pilih ketua organisasi…</option>
                      {chairCandidates.map((candidate) => <option key={candidate.userId} value={candidate.userId}>{candidate.name} — {candidate.positionName}</option>)}
                    </select>
                  </label>

                  {template.typeId === "peminjaman-ruangan" && (
                    <>
                      <label className="space-y-1 text-micro font-medium text-slate-600">
                        Fasilitas
                        <select
                          value={facilityId}
                          onChange={(event) => void selectFacility(event.target.value)}
                          className="h-10 w-full rounded-lg border border-line bg-white px-2.5 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 text-midnight"
                        >
                          <option value="">Pilih fasilitas…</option>
                          {facilities.map((fac) => (
                            <option key={fac.id} value={fac.id}>
                              {fac.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-1 text-micro font-medium text-slate-600">
                        Ruangan / Fasilitas
                        <select
                          value={resourceId}
                          onChange={(event) => {
                            const resId = event.target.value;
                            setResourceId(resId);
                            setPreview(null);
                            submissionKey.current = null;
                            const res = resources.find((r) => r.id === resId);
                            if (res) {
                              addMessage(`Ruangan: ${res.code}`, "user");
                              if (sessionId && isBackendConnected) {
                                void sendChatMessage(sessionId, {
                                  text: `Ruangan: ${res.code}`,
                                  directFieldUpdates: {
                                    resourceId: resId,
                                    ruangan: res.code,
                                  },
                                }).catch(() => {});
                              }
                            }
                          }}
                          disabled={resources.length === 0}
                          className="h-10 w-full rounded-lg border border-line bg-white px-2.5 text-body outline-none focus:border-navy focus:ring-4 focus:ring-navy/10 disabled:bg-slate-50 text-midnight"
                        >
                          <option value="">Pilih ruangan…</option>
                          {resources.map((resource) => (
                            <option key={resource.id} value={resource.id}>
                              {resource.code}
                              {resource.floor !== null
                                ? ` · lantai ${resource.floor}`
                                : ""}
                            </option>
                          ))}
                        </select>
                      </label>
                    </>
                  )}
                </div>
              )}

              {/* Quick suggestion chips (max 3, Hick's law) */}
              <div className="flex flex-wrap gap-1.5">
                {quickSuggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => void handleSend(sug)}
                    disabled={isBotThinking}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-micro font-semibold text-slate-600 ring-1 ring-line hover:bg-blue-50 hover:text-navy hover:ring-blue-200 disabled:opacity-50 cursor-pointer transition-all shadow-2xs"
                  >
                    <SparklesIcon className="size-3 text-gold shrink-0" />
                    <span>{sug}</span>
                  </button>
                ))}
              </div>

              {/* Text Input & Send Button */}
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void handleSend();
                    }
                  }}
                  rows={2}
                  placeholder={
                    template
                      ? 'Ketik detail permohonan, atau tanyakan field yang kurang…'
                      : 'Ketik tipe surat atau keperluan izin Anda…'
                  }
                  className="min-h-[52px] max-h-32 flex-1 resize-none rounded-xl border border-line bg-white px-3 py-2 text-body outline-none placeholder:text-slate-400 focus:border-navy focus:ring-4 focus:ring-navy/10"
                />
                <Button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isBotThinking}
                  aria-label="Kirim pesan"
                  className="h-11 w-11 shrink-0 rounded-xl bg-navy text-white shadow-lift hover:bg-[#1a3278] disabled:opacity-50 cursor-pointer p-0 flex items-center justify-center"
                >
                  <SendIcon className="size-4.5" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  <kbd className="font-mono">Enter</kbd> kirim ·{" "}
                  <kbd className="font-mono">Shift+Enter</kbd> baris baru
                </span>
                <span>Asisten SignIt! AI v2.0</span>
              </div>
            </div>
          </section>

          {/* Right Pane (Draft Summary & Actions) */}
          <DraftSummary
            template={template}
            fields={fields}
            onFieldChange={updateField}
            organizationLabel={organizationLabel?.name ?? null}
            committeeLabel={
              committeeLabel
                ? `${committeeLabel.name} — ${committeeLabel.positionName}`
                : null
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
            submittedLetterId={submittedLetterId}
            isDemo={false}
            reviewHref={preview?.reviewDocumentId && draft ? `/surat/${draft.id}?documentId=${preview.reviewDocumentId}` : null}
            onSaveDraft={() => void saveDraft()}
            onGeneratePreview={() => void generatePreview()}
            onSubmit={() => void submit()}
            onOpenPreview={() => {
              if (draft && preview?.reviewDocumentId) {
                const searchParams = new URLSearchParams();
                if (draft.title) searchParams.set("title", draft.title);
                if (draft.typeId) searchParams.set("typeId", draft.typeId);
                if (organizationLabel?.name) searchParams.set("org", organizationLabel.name);
                if (committeeLabel?.name) searchParams.set("ketupel", committeeLabel.name);
                if (organizationChairLabel?.name) searchParams.set("ketua", organizationChairLabel.name);
                if (fields["nama_kegiatan"]) searchParams.set("activity", fields["nama_kegiatan"]);
                if (fields["deskripsi"]) searchParams.set("desc", fields["deskripsi"]);
                if (fields["tanggal_mulai"] || fields["hari_tanggal_kegiatan"]) {
                  searchParams.set("date", fields["hari_tanggal_kegiatan"] || fields["tanggal_mulai"]);
                }
                if (fields["lokasi"] || fields["ruangan_kegiatan"] || resourceLabel?.code) {
                  searchParams.set(
                    "location",
                    fields["ruangan_kegiatan"] || fields["lokasi"] || resourceLabel?.code || "",
                  );
                }

                const queryStr = searchParams.toString();
                const url = `/api/v1/letters/${draft.id}/documents/${preview.reviewDocumentId}${queryStr ? `?${queryStr}` : ""}`;
                window.open(url, "_blank", "noopener");
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
export function LetterAssistant() {
  const { currentPersonaId } = useSession();
  const searchParams = useSearchParams();
  return <LetterAssistantContent key={`${currentPersonaId}:${searchParams.get("draftId") ?? "new"}`} />;
}
export default LetterAssistant;
