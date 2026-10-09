"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  ChatMessage,
  LetterFormField,
  PersonOption,
  WidgetType,
} from "../types";
import {
  initialFormFields,
  registeredKetuaList,
  registeredPembinaList,
  typePillOptions,
} from "../data/initial-data";
import { AssistantHeader } from "./assistant-header";
import { ChatPane } from "./chat-pane";
import { DraftSummary } from "./draft-summary";

let messageIdCounter = 10;
const getNextId = () => ++messageIdCounter;

export function LetterAssistant() {
  const [fields, setFields] = useState<LetterFormField[]>(initialFormFields);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      from: "bot",
      text: "Halo! Ingin membuat tipe surat apa hari ini?",
      widget: "typePills",
    },
    {
      id: 2,
      from: "bot",
      text: "Baik, untuk Peminjaman Ruangan saya memerlukan beberapa data: nama kegiatan, tanggal, estimasi peserta, dan ruangan yang dituju.",
    },
    {
      id: 3,
      from: "user",
      text: "Nama Kegiatan: Buka Bersama & Diskusi Himpunan; Tanggal: 18 Oktober 2026; Ruang: Teater D4.",
    },
    {
      id: 4,
      from: "bot",
      text: (
        <>
          Data dicatat! Ruangan{" "}
          <b className="text-midnight">&apos;Teater D4&apos;</b> tersedia pada
          tanggal tersebut. Silakan pilih Ketua Pelaksana yang terdaftar di
          sistem:
        </>
      ),
      widget: "ketuaPicker",
    },
  ]);

  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formattedTime, setFormattedTime] = useState("14:20");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isDraftGenerated, setIsDraftGenerated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setFormattedTime(
      new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  // Auto-save trigger on fields update
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsSaving(true);
    setIsDraftGenerated(false);
    const timer = setTimeout(() => {
      setIsSaving(false);
      setFormattedTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }, 700);
    return () => clearTimeout(timer);
  }, [fields]);

  const getFieldValue = (key: string) => {
    return fields.find((f) => f.key === key)?.value ?? null;
  };

  const updateFieldValue = (key: string, val: string | null) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value: val } : f))
    );
  };

  const askBot = (text: React.ReactNode, widget?: WidgetType, delay = 700) => {
    setIsThinking(true);
    setTimeout(() => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        { id: getNextId(), from: "bot", text, widget },
      ]);
    }, delay);
  };

  const checkNextMissingField = (remaining: LetterFormField[]) => {
    if (!remaining.length) {
      return askBot(
        'Semua field wajib sudah lengkap. Tekan "Generate Draf Surat" di panel kanan untuk menyusun draf dokumen resmi.'
      );
    }
    const nextField = remaining[0];
    if (nextField.key === "pembina") {
      return askBot(
        "Selanjutnya, pilih Dosen Pembina yang akan mengetahui surat ini:",
        "pembinaPicker"
      );
    }
    if (nextField.key === "rundown") {
      return askBot(
        "Tinggal satu lampiran: silakan unggah file rundown acara (PDF/DOCX).",
        "upload"
      );
    }
    if (nextField.key === "peserta") {
      return askBot(
        'Berapa estimasi jumlah peserta yang hadir? Contoh: "60 orang".'
      );
    }
  };

  const getMissingExcluding = (excludedKey: string) => {
    return fields.filter((f) => !f.value && f.key !== excludedKey);
  };

  // Handlers for specific widget selections
  const handleSelectKetua = (person: PersonOption) => {
    if (getFieldValue("ketua") !== person.name) {
      updateFieldValue("ketua", person.name);
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId(),
          from: "user",
          text: `Ketua Pelaksana: ${person.name}`,
        },
      ]);
      askBot(`${person.name} ditetapkan sebagai Ketua Pelaksana.`);
      setTimeout(() => {
        checkNextMissingField(getMissingExcluding("ketua"));
      }, 800);
    }
  };

  const handleSelectPembina = (person: PersonOption) => {
    const prev = getFieldValue("pembina");
    updateFieldValue("pembina", person.name);
    setMessages((prev) => [
      ...prev,
      {
        id: getNextId(),
        from: "user",
        text: `Dosen Pembina: ${person.name}`,
      },
    ]);
    if (prev) {
      askBot(`Dosen Pembina diperbarui menjadi ${person.name}.`);
    } else {
      checkNextMissingField(getMissingExcluding("pembina"));
    }
  };

  const handleFileUpload = (file?: File) => {
    if (!file) return;
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    updateFieldValue("rundown", `${file.name} · ${formattedSize}`);
    setMessages((prev) => [
      ...prev,
      {
        id: getNextId(),
        from: "user",
        text: (
          <span className="inline-flex items-center gap-1.5">
            📄 {file.name} ({formattedSize})
          </span>
        ),
      },
    ]);
    checkNextMissingField(getMissingExcluding("rundown"));
  };

  const handleSendMessage = (customText?: string) => {
    const raw = (customText ?? inputVal).trim();
    if (!raw || isThinking) return;

    setInputVal("");
    setMessages((prev) => [
      ...prev,
      { id: getNextId(), from: "user", text: raw },
    ]);

    const lower = raw.toLowerCase();

    // Parse participants / attendees
    const matchPeserta =
      lower.match(/(\d{1,4})\s*(orang|peserta|org)/) ??
      (lower.includes("peserta") ? lower.match(/(\d{1,4})/) : null);

    // Parse time / hours
    const matchTime = lower.match(
      /(\d{1,2})[.:](\d{2})\s*(?:-|–|sampai|s\.?d\.?)\s*(\d{1,2})[.:](\d{2})/
    );

    if (matchPeserta) {
      const count = Number(matchPeserta[1]);
      updateFieldValue("peserta", `${count} orang`);
      askBot(
        count > 250
          ? `Estimasi ${count} peserta dicatat, namun kapasitas Teater D4 hanya 250 kursi. Pertimbangkan Auditorium Pascasarjana.`
          : `Estimasi ${count} peserta dicatat — kapasitas Teater D4 (250 kursi) mencukupi.`
      );
      const remaining = getMissingExcluding("peserta");
      if (remaining.length) {
        setTimeout(() => checkNextMissingField(remaining), 900);
      }
      return;
    }

    if (matchTime) {
      const newTimeStr = `18 Oktober 2026 (${matchTime[1].padStart(2, "0")}:${
        matchTime[2]
      } - ${matchTime[3].padStart(2, "0")}:${matchTime[4]} WIB)`;
      updateFieldValue("tanggal", newTimeStr);
      askBot(
        `Waktu kegiatan diperbarui: ${newTimeStr}. Ruangan tetap tersedia pada slot tersebut.`,
        "availability"
      );
      return;
    }

    if (/pembina|dosen/.test(lower)) {
      return askBot(
        "Berikut dosen yang terdaftar sebagai pembina/pengampu HIMA TI:",
        "pembinaPicker"
      );
    }

    if (/rundown|lampiran|unggah|upload/.test(lower)) {
      return askBot("Silakan unggah file rundown di sini:", "upload");
    }

    if (/ketua/.test(lower)) {
      return askBot(
        "Pilih ulang Ketua Pelaksana dari akun terdaftar:",
        "ketuaPicker"
      );
    }

    const currentMissing = fields.filter((f) => !f.value);
    if (/kurang|apa saja|sisa|belum/.test(lower)) {
      return askBot(
        currentMissing.length
          ? `Masih ada ${currentMissing.length} field wajib: ${currentMissing
              .map((f) => f.label)
              .join(", ")}.`
          : "Tidak ada yang kurang — semua field wajib sudah terisi lengkap."
      );
    }

    askBot(
      currentMissing.length
        ? `Catatan Anda saya simpan sebagai keterangan tambahan. Masih ada ${
            currentMissing.length
          } field wajib: ${currentMissing.map((f) => f.label).join(", ")}.`
        : "Catatan ditambahkan ke keterangan surat."
    );
  };

  const handleEditFieldRequest = (field: LetterFormField) => {
    if (field.kind === "ketua") {
      return askBot(
        "Pilih ulang Ketua Pelaksana dari akun terdaftar:",
        "ketuaPicker",
        300
      );
    }
    if (field.kind === "pembina") {
      return askBot(
        "Pilih Dosen Pembina yang akan mengetahui surat ini:",
        "pembinaPicker",
        300
      );
    }
    if (field.kind === "file") {
      return fileInputRef.current?.click();
    }
  };

  const handleGenerateDraft = () => {
    const missing = fields.filter((f) => !f.value);
    if (missing.length > 0 || isDrafting) return;

    setIsDrafting(true);
    setTimeout(() => {
      setIsDrafting(false);
      setIsDraftGenerated(true);
      setMessages((prev) => [
        ...prev,
        {
          id: getNextId(),
          from: "bot",
          text: 'Draf surat berhasil dibuat dengan format resmi PENS. Tinjau pratinjaunya, lalu tekan "Ajukan Surat" di panel kanan bila sudah sesuai.',
          widget: "pdf",
        },
      ]);
    }, 1400);
  };

  const dynamicSuggestions = useMemo(() => {
    const list: string[] = [];
    if (!getFieldValue("pembina")) list.push("Pilih Dosen Pembina");
    if (!getFieldValue("rundown")) list.push("Unggah rundown acara");
    if (!getFieldValue("peserta")) list.push("Estimasi 60 peserta");
    list.push("Apa saja yang masih kurang?");
    return list;
  }, [fields]);

  return (
    <div className="flex h-screen min-w-[1024px] flex-col bg-canvas text-midnight">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files?.[0])}
      />

      {/* Top Header */}
      <AssistantHeader
        isSaving={isSaving}
        lastSavedTime={formattedTime}
        userName="M. Fajrul"
      />

      {/* Main 2-Column Grid Workspace */}
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(480px,3fr)_minmax(340px,2fr)] gap-6 p-6 lg:p-8 overflow-hidden">
        {/* Left Chat Pane */}
        <ChatPane
          messages={messages}
          isThinking={isThinking}
          inputValue={inputVal}
          onInputChange={setInputVal}
          onSendMessage={handleSendMessage}
          suggestions={dynamicSuggestions}
          registeredKetua={registeredKetuaList}
          registeredPembina={registeredPembinaList}
          selectedKetua={getFieldValue("ketua")}
          selectedPembina={getFieldValue("pembina")}
          onSelectKetua={handleSelectKetua}
          onSelectPembina={handleSelectPembina}
          rundownValue={getFieldValue("rundown")}
          onOpenFilePicker={() => fileInputRef.current?.click()}
          typePillOptions={typePillOptions}
          selectedType={getFieldValue("jenis")}
          onSelectType={(t) => updateFieldValue("jenis", t)}
          onPreviewPdf={() => {}}
        />

        {/* Right Data Summary & Action Pane */}
        <DraftSummary
          fields={fields}
          onUpdateField={updateFieldValue}
          onEditFieldRequest={handleEditFieldRequest}
          isDraftGenerated={isDraftGenerated}
          isDrafting={isDrafting}
          onGenerateDraft={handleGenerateDraft}
          isSubmitted={isSubmitted}
          onSubmitLetter={() => setIsSubmitted(true)}
          onSaveAsDraft={() =>
            setFormattedTime(
              new Date().toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })
            )
          }
        />
      </div>
    </div>
  );
}
export default LetterAssistant;
