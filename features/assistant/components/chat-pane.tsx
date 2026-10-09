"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, PersonOption, WidgetType } from "../types";
import { PersonPicker } from "./person-picker";
import {
  Avatar,
  CheckIcon,
  ClockIcon,
  FileTextIcon,
  PenToolIcon,
  PlusIcon,
  UploadCloudIcon,
} from "@/components/ui";

interface ChatPaneProps {
  messages: ChatMessage[];
  isThinking: boolean;
  inputValue: string;
  onInputChange: (val: string) => void;
  onSendMessage: (text?: string) => void;
  suggestions: string[];
  registeredKetua: PersonOption[];
  registeredPembina: PersonOption[];
  selectedKetua: string | null;
  selectedPembina: string | null;
  onSelectKetua: (p: PersonOption) => void;
  onSelectPembina: (p: PersonOption) => void;
  rundownValue: string | null;
  onOpenFilePicker: () => void;
  typePillOptions: string[];
  selectedType: string | null;
  onSelectType: (t: string) => void;
  onPreviewPdf?: () => void;
}

export function ChatPane({
  messages,
  isThinking,
  inputValue,
  onInputChange,
  onSendMessage,
  suggestions,
  registeredKetua,
  registeredPembina,
  selectedKetua,
  selectedPembina,
  onSelectKetua,
  onSelectPembina,
  rundownValue,
  onOpenFilePicker,
  typePillOptions,
  selectedType,
  onSelectType,
  onPreviewPdf,
}: ChatPaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  const renderWidget = (widget: WidgetType, messageId: number) => {
    switch (widget) {
      case "typePills":
        return (
          <div className="mt-3 flex flex-wrap gap-2">
            {typePillOptions.map((type, idx) => {
              const isActive = selectedType === type || idx === 0;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onSelectType(type)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-micro font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? "bg-navy text-white shadow-card"
                      : "bg-white text-slate-500 ring-1 ring-line hover:bg-slate-50"
                  }`}
                >
                  {isActive && (
                    <CheckIcon className="size-3.5 text-gold" strokeWidth={3} />
                  )}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        );

      case "ketuaPicker":
        return (
          <PersonPicker
            title="Ketua Pelaksana · Akun Terdaftar"
            people={registeredKetua}
            selected={selectedKetua}
            onSelect={onSelectKetua}
            placeholder="Cari nama atau NRP…"
          />
        );

      case "pembinaPicker":
        return (
          <PersonPicker
            title="Dosen Pembina · Akun Terdaftar"
            people={registeredPembina}
            selected={selectedPembina}
            onSelect={onSelectPembina}
            placeholder="Cari nama atau NIP dosen…"
          />
        );

      case "availability":
        return (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-micro font-semibold text-green-800 ring-1 ring-green-200">
            <CheckIcon className="size-4 text-emerald-600" />
            <span>SIM-Sarpras: Teater D4 kosong · 18 Okt 2026</span>
          </div>
        );

      case "upload":
        return rundownValue ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-micro font-semibold text-green-800 ring-1 ring-green-200">
            <CheckIcon className="size-4 text-emerald-600" />
            <span>{rundownValue}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenFilePicker}
            className="mt-3 flex w-full max-w-[440px] items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-left hover:border-[#15803D] hover:bg-green-50/50 cursor-pointer transition-colors"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-canvas text-navy ring-1 ring-line">
              <UploadCloudIcon className="size-4" />
            </span>
            <span>
              <span className="block text-body font-semibold text-midnight">
                Pilih file rundown
              </span>
              <span className="block text-[11px] text-slate-500">
                PDF atau DOCX · maks. 10 MB
              </span>
            </span>
          </button>
        );

      case "pdf":
        return (
          <div className="mt-3 flex w-full max-w-[440px] items-center gap-3 rounded-xl border border-line bg-white p-3 shadow-card">
            <span className="relative flex h-11 w-9 items-end justify-center rounded-[4px] bg-reject-bg pb-1 ring-1 ring-red-100">
              <span className="text-[8px] font-extrabold text-red-600">PDF</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body font-semibold text-midnight">
                Draf-Peminjaman-Teater-D4.pdf
              </span>
              <span className="block text-[11px] text-slate-500">
                2 halaman · kop resmi PENS · watermark DRAF · pratinjau saja
              </span>
            </span>
            <button
              type="button"
              onClick={onPreviewPdf}
              className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-micro font-semibold text-midnight hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Pratinjau
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white">
      {/* Pane Header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3">
        <BotBadge />
        <div className="flex-1 leading-tight">
          <div className="text-body font-bold text-midnight">
            Asisten Pembuat Surat
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span className="size-1.5 rounded-full bg-[#15803D]" />
            <span>Terhubung ke SIM-Sarpras & direktori SSO</span>
          </div>
        </div>
        <span className="rounded-full bg-review-bg px-2.5 py-1 text-[11px] font-semibold text-review">
          Mode: Peminjaman Ruangan
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="scroll-thin min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6"
      >
        <div className="text-center text-[11px] font-medium text-slate-400">
          Hari ini · sesi draf #D-2026-1182
        </div>

        {messages.map((msg) =>
          msg.from === "bot" ? (
            <div key={msg.id} className="animate-rise flex max-w-[680px] gap-3">
              <BotBadge />
              <div className="min-w-0 flex-1">
                <div className="inline-block rounded-2xl rounded-tl-md bg-canvas px-4 py-3 text-body leading-6 text-slate-700 ring-1 ring-line">
                  {msg.text}
                </div>
                {msg.widget && renderWidget(msg.widget, msg.id)}
              </div>
            </div>
          ) : (
            <div
              key={msg.id}
              className="animate-rise ml-auto flex max-w-[680px] justify-end gap-3"
            >
              <div className="rounded-2xl rounded-tr-md bg-navy px-4 py-3 text-body leading-6 text-white shadow-card">
                {msg.text}
              </div>
              <Avatar name="M. Fajrul" size={32} />
            </div>
          )
        )}

        {isThinking && (
          <div className="flex gap-3">
            <BotBadge />
            <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-md bg-canvas px-4 py-3.5 ring-1 ring-line">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-line bg-white px-5 pt-3 pb-4">
        {/* Suggestion Chips */}
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              onClick={() => onSendMessage(sug)}
              disabled={isThinking}
              className="h-11 rounded-full bg-canvas px-4 text-micro font-semibold text-slate-600 ring-1 ring-line hover:bg-green-50 hover:text-green-800 hover:ring-green-200 disabled:opacity-50 cursor-pointer transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-end gap-2 rounded-xl border border-line bg-white p-2 focus-within:border-[#15803D] focus-within:ring-4 focus-within:ring-green-700/10">
          <button
            type="button"
            onClick={onOpenFilePicker}
            aria-label="Lampirkan file"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-midnight cursor-pointer transition-colors"
          >
            <FileTextIcon className="size-4" />
          </button>
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            rows={2}
            placeholder="Ketik detail kegiatan atau tanyakan data yang kurang..."
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent py-1.5 text-body leading-6 outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={() => onSendMessage()}
            disabled={!inputValue.trim() || isThinking}
            aria-label="Kirim pesan"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#15803D] text-white shadow-card transition-colors hover:bg-[#166534] disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-default"
          >
            <PenToolIcon className="size-4" />
          </button>
        </div>

        {/* Shortcut Helper */}
        <div className="mt-1.5 text-[11px] text-slate-400">
          <kbd className="font-mono">Enter</kbd> kirim ·{" "}
          <kbd className="font-mono">Shift+Enter</kbd> baris baru
        </div>
      </div>
    </section>
  );
}

function BotBadge() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-navy to-midnight text-gold shadow-card">
      <PenToolIcon className="size-4 text-gold" />
    </span>
  );
}
export default ChatPane;
