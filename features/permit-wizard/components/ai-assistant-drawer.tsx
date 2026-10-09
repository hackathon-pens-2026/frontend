import React, { useState } from "react";
import { PermitFormData } from "../types";
import { SparklesIcon, XIcon, SendIcon, CheckIcon } from "./icons";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPatch: (patch: Partial<PermitFormData>) => void;
}

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
  candidatePatch?: Partial<PermitFormData>;
}

export function AiAssistantDrawer({
  isOpen,
  onClose,
  onApplyPatch,
}: AiAssistantDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Halo Fajrul! Ingin membuat tipe surat apa? Ceritakan rincian acara, tanggal, dan fasilitas yang Anda butuhkan dalam kalimat biasa, saya akan bantu mengisinya.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: inputText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsProcessing(true);

    setTimeout(() => {
      const assistantReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Saya telah menganalisis kebutuhan Anda dan mengekstrak data acara resmi kampus sebagai berikut:",
        candidatePatch: {
          eventName: "Workshop AI & Cloud Computing 2026",
          eventDateRange: "Sab, 14 Mar – Min, 15 Mar 2026",
          startTime: "08.00",
          endTime: "16.00",
          selectedFacilityIds: [
            "Auditorium Pascasarjana Lt. 3",
            "Sound System 2000W",
            "2 Unit Proyektor",
          ],
        },
      };
      setMessages((prev) => [...prev, assistantReply]);
      setIsProcessing(false);
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistant-title"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[2px] flex justify-end"
      onClick={onClose}
    >
      <aside
        className="animate-rise w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-200">
              <SparklesIcon size={16} />
            </div>
            <div>
              <h3 id="ai-assistant-title" className="text-sm font-bold text-slate-900">
                Asisten AI SignIt
              </h3>
              <p className="text-[11px] text-slate-500">
                Bantu susun draf surat izin &amp; peminjaman otomatis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            aria-label="Tutup Asisten AI"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-thin bg-[#f8fafc]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  msg.sender === "user"
                    ? "bg-[#1e3a8a] text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200 rounded-bl-none"
                }`}
              >
                {msg.text}

                {/* Candidate Patch Card */}
                {msg.candidatePatch && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-[11px] text-slate-800 space-y-1.5">
                    <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                      <SparklesIcon size={13} className="text-amber-600" />
                      <span>Hasil Ekstraksi Formulir:</span>
                    </div>
                    <div>
                      <strong>Acara:</strong> {msg.candidatePatch.eventName}
                    </div>
                    <div>
                      <strong>Jadwal:</strong> {msg.candidatePatch.eventDateRange} (
                      {msg.candidatePatch.startTime} - {msg.candidatePatch.endTime})
                    </div>
                    <div>
                      <strong>Fasilitas:</strong>{" "}
                      {msg.candidatePatch.selectedFacilityIds?.join(", ")}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (msg.candidatePatch) {
                          onApplyPatch(msg.candidatePatch);
                          onClose();
                        }
                      }}
                      className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-md bg-[#1e3a8a] py-1.5 text-xs font-semibold text-white hover:bg-[#172554] transition cursor-pointer"
                    >
                      <CheckIcon size={13} />
                      <span>Terapkan ke Formulir</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
              <span className="size-2 rounded-full bg-amber-500 animate-ping" />
              <span>Memproses teks dan mencocokkan skema template...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Contoh Pertanyaan Cepat:
          </div>
          <button
            type="button"
            onClick={() =>
              setInputText(
                "Tolong buatkan draf izin pinjam Auditorium Pascasarjana Lt. 3 untuk Workshop AI & Cloud Computing pada 14-15 Maret 2026 jam 08.00-16.00 WIB bersama 2 Unit Proyektor dan Sound System."
              )
            }
            className="w-full text-left text-[11px] text-slate-600 hover:text-[#1e3a8a] bg-slate-50 hover:bg-slate-100 p-2 rounded-lg border border-slate-200 transition truncate cursor-pointer"
          >
            “Pinjam Auditorium Pasca untuk Workshop AI tgl 14-15 Maret...”
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis instruksi atau kebutuhan Anda..."
              className="flex-1 rounded-lg border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#1e3a8a] focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]/10"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="flex size-9 items-center justify-center rounded-lg bg-[#1e3a8a] text-white hover:bg-[#172554] transition disabled:opacity-50 cursor-pointer shrink-0"
              aria-label="Kirim Pesan ke AI"
            >
              <SendIcon size={14} />
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
