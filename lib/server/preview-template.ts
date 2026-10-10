export interface PreviewLetterData {
  letterId: string;
  documentId: string;
  title?: string;
  typeId?: string;
  org?: string;
  ketupel?: string;
  ketua?: string;
  activity?: string;
  desc?: string;
  date?: string;
  location?: string;
}

function escapeHtml(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function renderLetterHtml(data: PreviewLetterData): string {
  const title = escapeHtml(data.title || "Proposal Kegiatan Kemahasiswaan");
  const org = escapeHtml(data.org || "Unit Kegiatan Kerohanian Islam (UKKI)");
  const ketupel = escapeHtml(data.ketupel || "Budi Santoso — Ketua Pelaksana");
  const ketua = escapeHtml(data.ketua || "Citra Lestari — Ketua Organisasi");
  const activity = escapeHtml(data.activity || data.title || "Penyelenggaraan Kegiatan Mahasiswa");
  const desc = escapeHtml(
    data.desc ||
      "Permohonan persetujuan dan pengesahan kegiatan mahasiswa dalam rangka peningkatan mutu kegiatan, kepemimpinan, dan pengembangan organisasi kemahasiswaan di lingkungan Politeknik Elektronika Negeri Surabaya.",
  );
  const location = escapeHtml(data.location || "Kampus Politeknik Elektronika Negeri Surabaya");
  const dateStr = escapeHtml(
    data.date ||
      new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
  );
  const letterNumber = `042/UKKI-PENS/B/X/${new Date().getFullYear()}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pratinjau Dokumen · ${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Times+New+Roman&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #f1f5f9;
      color: #0f172a;
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.5;
      padding: 0;
      margin: 0;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #0B192C;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    .toolbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .toolbar-logo {
      width: 32px;
      height: 32px;
      background: #F8B602;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #0B192C;
      font-size: 16px;
    }
    .toolbar-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
    }
    .toolbar-subtitle {
      font-size: 11px;
      color: #94a3b8;
    }
    .toolbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-print {
      background: #F8B602;
      color: #0B192C;
    }
    .btn-print:hover {
      background: #fbbf24;
    }
    .btn-close {
      background: rgba(255,255,255,0.1);
      color: #ffffff;
    }
    .btn-close:hover {
      background: rgba(255,255,255,0.2);
    }
    .paper-container {
      padding: 30px 16px;
      display: flex;
      justify-content: center;
    }
    .paper {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      padding: 25mm 25mm 20mm 25mm;
      box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 42pt;
      font-weight: bold;
      color: rgba(148, 163, 184, 0.12);
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
      font-family: 'Plus Jakarta Sans', sans-serif;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    .letterhead {
      border-bottom: 3px double #000000;
      padding-bottom: 8px;
      margin-bottom: 18px;
      text-align: center;
    }
    .letterhead-ministry {
      font-size: 11pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .letterhead-institution {
      font-size: 13pt;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .letterhead-unit {
      font-size: 12pt;
      font-weight: bold;
      color: #1e3a8a;
      margin-top: 2px;
    }
    .letterhead-address {
      font-size: 8.5pt;
      color: #334155;
      margin-top: 4px;
    }
    .letter-meta {
      display: grid;
      grid-template-columns: 1fr auto;
      margin-bottom: 18px;
      font-size: 11pt;
    }
    .letter-meta-table td {
      padding: 2px 4px 2px 0;
      vertical-align: top;
    }
    .recipient {
      margin-bottom: 18px;
      line-height: 1.4;
    }
    .content {
      text-align: justify;
      margin-bottom: 24px;
      line-height: 1.6;
    }
    .content p {
      margin-bottom: 12px;
      text-indent: 28px;
    }
    .event-details {
      margin: 14px 0 14px 28px;
      border-collapse: collapse;
      width: calc(100% - 28px);
    }
    .event-details td {
      padding: 4px 6px;
      vertical-align: top;
    }
    .signatures {
      margin-top: 36px;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .sig-box {
      width: 45%;
      text-align: center;
      font-size: 10.5pt;
    }
    .sig-qr {
      margin: 12px auto;
      width: 80px;
      height: 80px;
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 8pt;
      color: #0369a1;
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .sig-name {
      font-weight: bold;
      text-decoration: underline;
    }
    .sig-nip {
      font-size: 10pt;
    }
    .footer-stamp {
      margin-top: 40px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 10px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    @media print {
      body { background: white; }
      .toolbar { display: none !important; }
      .paper-container { padding: 0 !important; }
      .paper {
        border: none !important;
        box-shadow: none !important;
        width: 100% !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Toolbar -->
  <div class="toolbar">
    <div class="toolbar-brand">
      <div class="toolbar-logo">S!</div>
      <div>
        <div class="toolbar-title">Pratinjau Dokumen Resmi SignIt!</div>
        <div class="toolbar-subtitle">Dokumen Draf Elektronik PENS · Status: Pratinjau Siap Tinjau</div>
      </div>
    </div>
    <div class="toolbar-actions">
      <button class="btn btn-print" onclick="window.print()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Cetak / Simpan PDF
      </button>
      <button class="btn btn-close" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <!-- A4 Paper Document -->
  <div class="paper-container">
    <div class="paper">
      <div class="watermark">DRAF PRATINJAU</div>

      <!-- Kop Surat -->
      <div class="letterhead">
        <div class="letterhead-ministry">KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI</div>
        <div class="letterhead-institution">POLITEKNIK ELEKTRONIKA NEGERI SURABAYA</div>
        <div class="letterhead-unit">${org.toUpperCase()}</div>
        <div class="letterhead-address">
          Kampus PENS, Jalan Raya ITS Sukolilo, Surabaya 60111<br>
          Telepon: (031) 5947280 · Faksimile: (031) 5946114 · Laman: www.pens.ac.id
        </div>
      </div>

      <!-- Metadata Surat -->
      <div class="letter-meta">
        <table class="letter-meta-table">
          <tr>
            <td width="80">Nomor</td>
            <td width="10">:</td>
            <td><strong>${letterNumber}</strong></td>
          </tr>
          <tr>
            <td>Lampiran</td>
            <td>:</td>
            <td>1 (satu) Berkas Proposal</td>
          </tr>
          <tr>
            <td>Perihal</td>
            <td>:</td>
            <td><strong>${title}</strong></td>
          </tr>
        </table>
        <div>Surabaya, ${dateStr}</div>
      </div>

      <!-- Penerima Surat -->
      <div class="recipient">
        Kepada Yth.<br>
        <strong>Wakil Direktur Bidang Kemahasiswaan dan Kerjasama</strong><br>
        Politeknik Elektronika Negeri Surabaya<br>
        di Tempat
      </div>

      <!-- Isi Surat -->
      <div class="content">
        <p>Dengan hormat,</p>
        <p>
          Sehubungan dengan program kerja dan agenda kegiatan yang diselenggarakan oleh <strong>${org}</strong>, bersama surat ini kami mengajukan permohonan persetujuan dan pengesahan atas pelaksanaan <strong>${title}</strong> dengan rincian agenda sebagai berikut:
        </p>

        <table class="event-details">
          <tr>
            <td width="180"><strong>Nama Kegiatan</strong></td>
            <td width="10">:</td>
            <td><strong>${activity}</strong></td>
          </tr>
          <tr>
            <td><strong>Penyelenggara</strong></td>
            <td>:</td>
            <td>${org}</td>
          </tr>
          <tr>
            <td><strong>Waktu Pelaksanaan</strong></td>
            <td>:</td>
            <td>${dateStr}</td>
          </tr>
          <tr>
            <td><strong>Tempat / Fasilitas</strong></td>
            <td>:</td>
            <td>${location}</td>
          </tr>
          <tr>
            <td><strong>Deskripsi Kegiatan</strong></td>
            <td>:</td>
            <td>${desc}</td>
          </tr>
        </table>

        <p>
          Besar harapan kami agar Bapak/Ibu dapat memberikan arahan, izin, serta pengesahan demi kelancaran kegiatan kemahasiswaan ini. Sebagai bahan pertimbangan, berkas pendukung terlampir bersama surat permohonan ini.
        </p>
        <p>
          Demikian permohonan ini kami sampaikan. Atas perhatian, arahan, dan perkenan yang diberikan, kami mengucapkan terima kasih.
        </p>
      </div>

      <!-- Tanda Tangan -->
      <div class="signatures">
        <div class="sig-box">
          <div>Ketua Pelaksana Kegiatan,</div>
          <div class="sig-qr">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span style="font-size:7pt;margin-top:2px;">TERVALIDASI</span>
          </div>
          <div class="sig-name">${ketupel}</div>
          <div class="sig-nip">NIM. 3122500015</div>
        </div>

        <div class="sig-box">
          <div>Ketua Organisasi (${org}),</div>
          <div class="sig-qr">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span style="font-size:7pt;margin-top:2px;">TERVALIDASI</span>
          </div>
          <div class="sig-name">${ketua}</div>
          <div class="sig-nip">NIM. 3121500003</div>
        </div>
      </div>

      <!-- Mengetahui Pembina -->
      <div style="margin-top:28px;text-align:center;">
        <div style="font-size:10.5pt;">Mengetahui,<br>Dosen Pembina Kemahasiswaan</div>
        <div class="sig-qr" style="margin:10px auto;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0369a1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
          <span style="font-size:7pt;margin-top:2px;">TERVALIDASI</span>
        </div>
        <div class="sig-name">Dr. Ir. Bambang Widodo, M.T.</div>
        <div class="sig-nip">NIP. 197508122001121001</div>
      </div>

      <!-- Footer Stamp -->
      <div class="footer-stamp">
        <div>Dokumen ini sah diterbitkan melalui Sistem Otomasi Persuratan SignIt! PENS</div>
        <div>ID Dokumen: ${escapeHtml(data.documentId)}</div>
      </div>
    </div>
  </div>

</body>
</html>`;
}
