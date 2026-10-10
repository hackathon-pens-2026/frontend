import type { LetterTemplateDto, TemplateFieldDto } from "@/lib/api/types";

/**
 * Deteksi template surat dari input pengguna (baik klik wizard chip maupun ketikan teks bebas).
 */
export function detectTemplate(
  text: string,
  templates: LetterTemplateDto[],
): LetterTemplateDto | null {
  if (!text || templates.length === 0) return null;
  const lower = text.trim().toLowerCase();

  // 1. Cek kecocokan typeId persis atau nama template persis
  for (const t of templates) {
    if (t.typeId.toLowerCase() === lower || t.name.toLowerCase() === lower) {
      return t;
    }
  }

  // 2. Keyword-based matching terarah
  // Peminjaman Ruangan & Fasilitas
  if (
    lower.includes("ruang") ||
    lower.includes("ruangan") ||
    lower.includes("fasilitas") ||
    lower.includes("tempat") ||
    lower.includes("teater") ||
    lower.includes("auditorium") ||
    lower.includes("hall")
  ) {
    const matched = templates.find((t) => t.typeId === "peminjaman-ruangan");
    if (matched) return matched;
  }

  // Peminjaman Alat / Barang
  if (
    lower.includes("barang") ||
    lower.includes("alat") ||
    lower.includes("inventaris") ||
    lower.includes("perlengkapan")
  ) {
    const matched = templates.find((t) => t.typeId === "peminjaman-barang");
    if (matched) return matched;
  }

  // Proposal Kegiatan
  if (lower.includes("proposal")) {
    const matched = templates.find((t) => t.typeId === "proposal");
    if (matched) return matched;
  }

  // LPJ / Laporan Pertanggungjawaban
  if (
    lower.includes("lpj") ||
    lower.includes("pertanggungjawaban") ||
    lower.includes("laporan pertanggungjawaban")
  ) {
    const matched = templates.find((t) => t.typeId === "lpj");
    if (matched) return matched;
  }

  // 3. Substring matching nama template
  for (const t of templates) {
    const tName = t.name.toLowerCase();
    if (tName.includes(lower) || lower.includes(tName)) {
      return t;
    }
  }

  return null;
}

export interface ExtractedInfo {
  extractedFields: Record<string, string>;
  appliedLabels: string[];
  recognizedFacility?: string;
  recognizedResource?: string;
  isQuestionAboutMissing?: boolean;
}

/**
 * Ekstraksi field formulir dari teks bahasa Indonesia alami maupun format "key: value".
 */
export function extractFieldsFromText(
  rawText: string,
  userFields: TemplateFieldDto[],
  typeId?: string,
): ExtractedInfo {
  const result: Record<string, string> = {};
  const appliedLabels: string[] = [];
  const text = rawText.trim();
  const lower = text.toLowerCase();

  // Cek apakah pengguna hanya menanyakan field yang kurang
  const isQuestionAboutMissing =
    lower.includes("kurang") ||
    lower.includes("belum diisi") ||
    lower.includes("apa saja") ||
    lower.includes("cek data") ||
    lower.includes("kelengkapan");

  if (isQuestionAboutMissing && !text.includes(":") && text.length < 50) {
    return {
      extractedFields: {},
      appliedLabels: [],
      isQuestionAboutMissing: true,
    };
  }

  // 1. Ekstraksi format berstruktur "label: value" atau "key: value"
  const lines = text.split(/[;\n]+/);
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx > 0) {
      const labelPart = line.slice(0, colonIdx).trim().toLowerCase();
      const valuePart = line.slice(colonIdx + 1).trim();
      if (!valuePart) continue;

      const matchedField = userFields.find(
        (f) =>
          f.key.toLowerCase() === labelPart ||
          f.label.toLowerCase() === labelPart ||
          labelPart.includes(f.key.toLowerCase()) ||
          labelPart.includes(f.label.toLowerCase()) ||
          f.label.toLowerCase().includes(labelPart),
      );

      if (matchedField) {
        result[matchedField.key] = valuePart;
        appliedLabels.push(matchedField.label);
      }
    }
  }

  // 2. Ekstraksi Natural Language untuk Nama Kegiatan
  if (!result["nama_kegiatan"]) {
    // Pola: "kegiatan [Nama Acara]", "acara [Nama Acara]", "workshop [Nama]"
    const eventMatch = text.match(
      /(?:untuk\s+(?:kegiatan|acara)?|kegiatan\s+(?:bernama|yaitu)?|acara\s+(?:bernama|yaitu)?|lomba|seminar|workshop|webinar)\s+["']?([^,.\n;]{3,60}?)["']?(?=\s+(?:pada|tanggal|tgl|di|jam|pukul|dengan)|$|[.,\n;])/i,
    );
    if (eventMatch && eventMatch[1]) {
      const cleanEvent = eventMatch[1].trim().replace(/^(bernama|yaitu)\s+/i, "");
      if (cleanEvent.length >= 3) {
        result["nama_kegiatan"] = cleanEvent;
        appliedLabels.push("Nama Kegiatan");
      }
    }
  }

  // 3. Ekstraksi Tanggal Pelaksanaan
  const dateMatch = text.match(
    /(?:tanggal|tgl|hari\s+dan\s+tanggal|hari\/tanggal)\s*:?\s*([0-9]{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+[0-9]{4}|[0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{4})/i,
  );
  if (dateMatch && dateMatch[1]) {
    const dateVal = dateMatch[1].trim();
    if (userFields.some((f) => f.key === "hari_tanggal_kegiatan")) {
      result["hari_tanggal_kegiatan"] = dateVal;
      appliedLabels.push("Hari & Tanggal Kegiatan");
    } else if (userFields.some((f) => f.key === "tanggal_kegiatan")) {
      result["tanggal_kegiatan"] = dateVal;
      appliedLabels.push("Tanggal Kegiatan");
    } else if (userFields.some((f) => f.key === "tanggal_surat")) {
      result["tanggal_surat"] = dateVal;
      appliedLabels.push("Tanggal Surat");
    }
  }

  // 4. Ekstraksi Jam / Waktu Pelaksanaan
  const timeMatch = text.match(
    /(?:jam|pukul|waktu)\s*:?\s*([0-9]{1,2}[.:][0-9]{2}(?:\s*(?:-|sampai|s\/d)\s*[0-9]{1,2}[.:][0-9]{2})?(?:\s*WIB)?)/i,
  );
  if (timeMatch && timeMatch[1]) {
    const timeVal = timeMatch[1].trim();
    if (userFields.some((f) => f.key === "waktu_kegiatan")) {
      result["waktu_kegiatan"] = timeVal;
      appliedLabels.push("Waktu Kegiatan");
    }
  }

  // 5. Ekstraksi Lokasi / Ruangan
  let recognizedResource: string | undefined;
  let recognizedFacility: string | undefined;

  const roomPatterns = [
    { pattern: /(?:teater|theatre)\s*(?:d4)?/i, code: "Ruang Teater D4", fac: "fac-d4" },
    { pattern: /hall\s*(?:utama\s*)?(?:d4)?/i, code: "Hall Utama D4", fac: "fac-d4" },
    { pattern: /auditorium/i, code: "Auditorium Pascasarjana", fac: "fac-pasca" },
    { pattern: /seminar\s*pasca/i, code: "Ruang Seminar Pascasarjana", fac: "fac-pasca" },
    { pattern: /hall\s*(?:gedung\s*)?d3/i, code: "Hall Gedung D3", fac: "fac-d3" },
    { pattern: /futsal/i, code: "Lapangan Futsal Kampus", fac: "fac-outdoor" },
    { pattern: /basket/i, code: "Lapangan Basket Kampus", fac: "fac-outdoor" },
    { pattern: /lab(?:oratorium)?\s*komputer/i, code: "Lab Jaringan Komputer", fac: "fac-d4" },
  ];

  for (const rp of roomPatterns) {
    if (rp.pattern.test(text)) {
      recognizedResource = rp.code;
      recognizedFacility = rp.fac;
      if (userFields.some((f) => f.key === "ruangan_kegiatan")) {
        result["ruangan_kegiatan"] = rp.code;
        appliedLabels.push("Ruangan Kegiatan");
      }
      break;
    }
  }

  // 6. Ekstraksi Perihal jika disebutkan
  const perihalMatch = text.match(/perihal\s*:?\s*([^,.\n;]{4,80})/i);
  if (perihalMatch && perihalMatch[1] && userFields.some((f) => f.key === "perihal")) {
    result["perihal"] = perihalMatch[1].trim();
    appliedLabels.push("Perihal");
  }

  // 7. Ekstraksi Jumlah Peserta
  const pesertaMatch = text.match(/([0-9]+)\s*(?:orang|peserta)/i);
  if (pesertaMatch && pesertaMatch[1] && userFields.some((f) => f.key === "jumlah_peserta")) {
    result["jumlah_peserta"] = pesertaMatch[1];
    appliedLabels.push("Jumlah Peserta");
  }

  // 8. Sinkronisasi alias field
  if (result["nama_kegiatan"] && !result["perihal"] && userFields.some((f) => f.key === "perihal")) {
    result["perihal"] = `Permohonan - ${result["nama_kegiatan"]}`;
  }

  return {
    extractedFields: result,
    appliedLabels: Array.from(new Set(appliedLabels)),
    recognizedFacility,
    recognizedResource,
    isQuestionAboutMissing: false,
  };
}
