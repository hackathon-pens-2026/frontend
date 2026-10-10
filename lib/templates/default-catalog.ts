import type {
  LetterTemplateDto,
  RoutingOrganizationDto,
  RoutingCandidateDto,
  RoutingFacilityDto,
  RoutingResourceDto,
} from '@/lib/api/types';

export const DEFAULT_TEMPLATES: LetterTemplateDto[] = [
  {
    "typeId": "peminjaman-ruangan",
    "templateId": "TEMPLATE-PEMINJAMAN-RUANGAN-01",
    "name": "Surat Permohonan Peminjaman Ruangan",
    "version": "1.1.0",
    "sourceDocument": "Template - Peminjaman Ruangan.docx",
    "fields": [
      {
        "key": "nomor_surat",
        "label": "Nomor Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "server",
        "defaultValue": "6.1/INT/PMH/BPM/UKKI-PENS/IX/2026"
      },
      {
        "key": "perihal",
        "label": "Perihal Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "Permohonan Peminjaman Ruangan"
      },
      {
        "key": "lampiran",
        "label": "Lampiran",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "-"
      },
      {
        "key": "kota_surat",
        "label": "Kota Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "Surabaya"
      },
      {
        "key": "tanggal_surat",
        "label": "Tanggal Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "23 September 2026"
      },
      {
        "key": "tujuan_surat_baris_1",
        "label": "Tujuan Surat (Baris 1)",
        "type": "string",
        "required": true,
        "group": "penerima_surat",
        "valueSource": "user",
        "defaultValue": "Wadir II Perancangan, Keuangan, dan Umum"
      },
      {
        "key": "tujuan_surat_baris_2",
        "label": "Tujuan Surat (Baris 2)",
        "type": "string",
        "required": true,
        "group": "penerima_surat",
        "valueSource": "user",
        "defaultValue": "Kepala Bagian Akademik dan Kemahasiswaan Politeknik Elektronika Negeri Surabaya"
      },
      {
        "key": "jenis_permohonan",
        "label": "Jenis Permohonan",
        "type": "string",
        "required": true,
        "group": "pengantar_surat",
        "valueSource": "user",
        "defaultValue": "peminjaman ruangan"
      },
      {
        "key": "keperluan_tujuan",
        "label": "Keperluan atau Tujuan",
        "type": "string",
        "required": true,
        "group": "pengantar_surat",
        "valueSource": "user",
        "defaultValue": "kegiatan Sekolah Mentor 2 UKKI PENS"
      },
      {
        "key": "nama_kegiatan",
        "label": "Nama Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_peminjaman",
        "valueSource": "user",
        "defaultValue": "Sekolah Mentor 2"
      },
      {
        "key": "hari_tanggal_kegiatan",
        "label": "Hari & Tanggal Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_peminjaman",
        "valueSource": "user",
        "defaultValue": "Jum'at, 25 September 2026"
      },
      {
        "key": "waktu_kegiatan",
        "label": "Waktu Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_peminjaman",
        "valueSource": "user",
        "defaultValue": "13.00 – 17.00 WIB"
      },
      {
        "key": "ruangan_kegiatan",
        "label": "Ruangan yang Dipinjam",
        "type": "string",
        "required": true,
        "group": "detail_peminjaman",
        "valueSource": "resource",
        "defaultValue": "Theater D3 PENS HH-101"
      },
      {
        "key": "fasilitas_tambahan",
        "label": "Fasilitas Tambahan",
        "type": "string",
        "required": false,
        "group": "detail_peminjaman",
        "valueSource": "user",
        "defaultValue": "beserta Videotron dan Sound"
      },
      {
        "key": "jabatan_pemohon_1",
        "label": "Jabatan Pemohon 1 (Organisasi)",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Umum UKKI PENS"
      },
      {
        "key": "nama_pemohon_1",
        "label": "Nama Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Yusuf Ramadhani Arianto"
      },
      {
        "key": "nrp_pemohon_1",
        "label": "NRP Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600056"
      },
      {
        "key": "qr_pemohon_1",
        "label": "QR Tanda Tangan Pemohon 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 1]"
      },
      {
        "key": "jabatan_pemohon_2",
        "label": "Jabatan Pemohon 2 (Kepanitiaan)",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Pelaksana"
      },
      {
        "key": "nama_pemohon_2",
        "label": "Nama Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Fadhil Muhammad Daffa"
      },
      {
        "key": "nrp_pemohon_2",
        "label": "NRP Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600118"
      },
      {
        "key": "qr_pemohon_2",
        "label": "QR Tanda Tangan Pemohon 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 2]"
      },
      {
        "key": "jabatan_mengetahui_1",
        "label": "Jabatan Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Tim Pembinaan Minat dan Bakat Mahasiswa"
      },
      {
        "key": "nama_mengetahui_1",
        "label": "Nama Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Grezio Arifian Primajaya, S.Kom., M.Kom."
      },
      {
        "key": "nip_mengetahui_1",
        "label": "NIP Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "199208262022031007"
      },
      {
        "key": "qr_mengetahui_1",
        "label": "QR Tanda Tangan Mengetahui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 1]"
      },
      {
        "key": "jabatan_mengetahui_2",
        "label": "Jabatan Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Pembina UKKI PENS"
      },
      {
        "key": "nama_mengetahui_2",
        "label": "Nama Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST., M.Sc., Ph.D"
      },
      {
        "key": "nip_mengetahui_2",
        "label": "NIP Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198509102012121003"
      },
      {
        "key": "qr_mengetahui_2",
        "label": "QR Tanda Tangan Mengetahui 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 2]"
      },
      {
        "key": "jabatan_menyetujui_1",
        "label": "Jabatan Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Wakil Direktur Bidang Kemahasiswaan dan Alumni"
      },
      {
        "key": "nama_menyetujui_1",
        "label": "Nama Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ir. Kholid Fathoni, S.Kom., M.T., IPM."
      },
      {
        "key": "nip_menyetujui_1",
        "label": "NIP Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198012262008121000"
      },
      {
        "key": "qr_menyetujui_1",
        "label": "QR Tanda Tangan Menyetujui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Menyetujui 1]"
      }
    ]
  },
  {
    "typeId": "peminjaman-barang",
    "templateId": "TEMPLATE-PEMINJAMAN-BARANG-01",
    "name": "Surat Permohonan Peminjaman Alat / Barang",
    "version": "1.1.0",
    "sourceDocument": "Template - Peminjaman Barang.docx",
    "fields": [
      {
        "key": "nomor_surat",
        "label": "Nomor Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "server",
        "defaultValue": "6.4/INT/PMH/BPM/UKKI-PENS/X/2026"
      },
      {
        "key": "perihal",
        "label": "Perihal",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "Permohonan Peminjaman Alat"
      },
      {
        "key": "lampiran",
        "label": "Lampiran",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "-"
      },
      {
        "key": "kota_surat",
        "label": "Kota Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "Surabaya"
      },
      {
        "key": "tanggal_surat",
        "label": "Tanggal Surat",
        "type": "string",
        "required": true,
        "group": "metadata_surat",
        "valueSource": "user",
        "defaultValue": "5 Oktober 2026"
      },
      {
        "key": "tujuan_surat",
        "label": "Tujuan Surat",
        "type": "string",
        "required": true,
        "group": "penerima_surat",
        "valueSource": "user",
        "defaultValue": "Kepala Departemen Eksternal"
      },
      {
        "key": "jenis_permohonan",
        "label": "Jenis Permohonan",
        "type": "string",
        "required": true,
        "group": "pengantar_surat",
        "valueSource": "user",
        "defaultValue": "peminjaman alat / barang"
      },
      {
        "key": "keperluan_tujuan",
        "label": "Keperluan atau Tujuan",
        "type": "string",
        "required": true,
        "group": "pengantar_surat",
        "valueSource": "user",
        "defaultValue": "kegiatan Grand Opening Mentoring"
      },
      {
        "key": "nama_kegiatan",
        "label": "Nama Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_kegiatan",
        "valueSource": "user",
        "defaultValue": "Grand Opening Mentoring"
      },
      {
        "key": "hari_tanggal_kegiatan",
        "label": "Hari & Tanggal Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_kegiatan",
        "valueSource": "user",
        "defaultValue": "Rabu, 7 Oktober 2026"
      },
      {
        "key": "waktu_kegiatan",
        "label": "Waktu Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_kegiatan",
        "valueSource": "user",
        "defaultValue": "17.00 – 21.00 WIB"
      },
      {
        "key": "tempat_kegiatan",
        "label": "Tempat Kegiatan",
        "type": "string",
        "required": true,
        "group": "detail_kegiatan",
        "valueSource": "user",
        "defaultValue": "Lapangan Merah"
      },
      {
        "key": "nama_barang_1",
        "label": "Nama Barang 1",
        "type": "string",
        "required": true,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "Tandu"
      },
      {
        "key": "jumlah_barang_1",
        "label": "Jumlah Barang 1",
        "type": "string",
        "required": true,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "1"
      },
      {
        "key": "pengambilan_barang_1",
        "label": "Waktu Pengambilan Barang 1",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "07/10/2026 16.00"
      },
      {
        "key": "pengembalian_barang_1",
        "label": "Waktu Pengembalian Barang 1",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "07/10/2026 21.30"
      },
      {
        "key": "nama_barang_2",
        "label": "Nama Barang 2",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "P3K"
      },
      {
        "key": "jumlah_barang_2",
        "label": "Jumlah Barang 2",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "1 Set"
      },
      {
        "key": "pengambilan_barang_2",
        "label": "Waktu Pengambilan Barang 2",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "07/10/2026 16.00"
      },
      {
        "key": "pengembalian_barang_2",
        "label": "Waktu Pengembalian Barang 2",
        "type": "string",
        "required": false,
        "group": "daftar_barang",
        "valueSource": "user",
        "defaultValue": "07/10/2026 21.30"
      },
      {
        "key": "jabatan_pemohon_1",
        "label": "Jabatan Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Umum UKKI PENS"
      },
      {
        "key": "nama_pemohon_1",
        "label": "Nama Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Yusuf Ramadhani Arianto"
      },
      {
        "key": "nrp_pemohon_1",
        "label": "NRP Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600056"
      },
      {
        "key": "qr_pemohon_1",
        "label": "QR Tanda Tangan Pemohon 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 1]"
      },
      {
        "key": "jabatan_pemohon_2",
        "label": "Jabatan Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Pelaksana"
      },
      {
        "key": "nama_pemohon_2",
        "label": "Nama Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Fadhil Muhammad Daffa"
      },
      {
        "key": "nrp_pemohon_2",
        "label": "NRP Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600118"
      },
      {
        "key": "qr_pemohon_2",
        "label": "QR Tanda Tangan Pemohon 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 2]"
      },
      {
        "key": "jabatan_mengetahui_1",
        "label": "Jabatan Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Tim Pembinaan Minat dan Bakat Mahasiswa"
      },
      {
        "key": "nama_mengetahui_1",
        "label": "Nama Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Grezio Arifian Primajaya, S.Kom., M.Kom."
      },
      {
        "key": "nip_mengetahui_1",
        "label": "NIP Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "199208262022031007"
      },
      {
        "key": "qr_mengetahui_1",
        "label": "QR Tanda Tangan Mengetahui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 1]"
      },
      {
        "key": "jabatan_mengetahui_2",
        "label": "Jabatan Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Pembina UKKI PENS"
      },
      {
        "key": "nama_mengetahui_2",
        "label": "Nama Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST., M.Sc., Ph.D"
      },
      {
        "key": "nip_mengetahui_2",
        "label": "NIP Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198509102012121003"
      },
      {
        "key": "qr_mengetahui_2",
        "label": "QR Tanda Tangan Mengetahui 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 2]"
      },
      {
        "key": "jabatan_menyetujui_1",
        "label": "Jabatan Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Wakil Direktur Bidang Kemahasiswaan dan Alumni"
      },
      {
        "key": "nama_menyetujui_1",
        "label": "Nama Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ir. Kholid Fathoni, S.Kom., M.T., IPM."
      },
      {
        "key": "nip_menyetujui_1",
        "label": "NIP Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198012262008121000"
      },
      {
        "key": "qr_menyetujui_1",
        "label": "QR Tanda Tangan Menyetujui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Menyetujui 1]"
      }
    ]
  },
  {
    "typeId": "proposal",
    "templateId": "TEMPLATE-PROPOSAL-01",
    "name": "Proposal Kegiatan",
    "version": "1.0.0",
    "sourceDocument": "Template - Proposal.docx",
    "fields": [
      {
        "key": "nama_kegiatan",
        "label": "Nama Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "GRAND OPENING MENTORING"
      },
      {
        "key": "tahun_kegiatan",
        "label": "Tahun Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "2026"
      },
      {
        "key": "nama_divisi_pelaksana",
        "label": "Divisi Pelaksana",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "Badan Pelaksana Mentoring"
      },
      {
        "key": "nama_ormawa",
        "label": "Nama Ormawa",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "organization",
        "defaultValue": "UNIT KEGIATAN KEROHANIAN ISLAM"
      },
      {
        "key": "nama_kampus",
        "label": "Nama Kampus",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "server",
        "defaultValue": "POLITEKNIK ELEKTRONIKA NEGERI SURABAYA"
      },
      {
        "key": "hari_tanggal_kegiatan",
        "label": "Hari & Tanggal Kegiatan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "Rabu, 7 Oktober 2026"
      },
      {
        "key": "waktu_kegiatan",
        "label": "Waktu Kegiatan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "18.00 s/d 21.00 WIB"
      },
      {
        "key": "tempat_kegiatan",
        "label": "Tempat Kegiatan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "Lapangan Basket PENS"
      },
      {
        "key": "kota_surat",
        "label": "Kota Pengesahan",
        "type": "string",
        "required": true,
        "group": "pengesahan",
        "valueSource": "user",
        "defaultValue": "Surabaya"
      },
      {
        "key": "tanggal_pengesahan",
        "label": "Tanggal Pengesahan",
        "type": "string",
        "required": true,
        "group": "pengesahan",
        "valueSource": "user",
        "defaultValue": "23 September 2026"
      },
      {
        "key": "jabatan_pemohon_1",
        "label": "Jabatan Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Umum UKKI PENS"
      },
      {
        "key": "nama_pemohon_1",
        "label": "Nama Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Yusuf Ramadhani Arianto"
      },
      {
        "key": "nrp_pemohon_1",
        "label": "NRP Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600056"
      },
      {
        "key": "qr_pemohon_1",
        "label": "QR Tanda Tangan Pemohon 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 1]"
      },
      {
        "key": "jabatan_pemohon_2",
        "label": "Jabatan Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Badan Pelaksana Mentoring"
      },
      {
        "key": "nama_pemohon_2",
        "label": "Nama Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Fadhil Muhammad Daffa"
      },
      {
        "key": "nrp_pemohon_2",
        "label": "NRP Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600118"
      },
      {
        "key": "qr_pemohon_2",
        "label": "QR Tanda Tangan Pemohon 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 2]"
      },
      {
        "key": "jabatan_mengetahui_1",
        "label": "Jabatan Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Tim Pembina Minat dan Bakat Mahasiswa"
      },
      {
        "key": "nama_mengetahui_1",
        "label": "Nama Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Grezio Arifiyan P, S.Kom., M.Kom."
      },
      {
        "key": "nip_mengetahui_1",
        "label": "NIP Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "199208262022031007"
      },
      {
        "key": "qr_mengetahui_1",
        "label": "QR Tanda Tangan Mengetahui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 1]"
      },
      {
        "key": "jabatan_mengetahui_2",
        "label": "Jabatan Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Pembina UKKI PENS"
      },
      {
        "key": "nama_mengetahui_2",
        "label": "Nama Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST., M.Sc. Ph.D"
      },
      {
        "key": "nip_mengetahui_2",
        "label": "NIP Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198509102012121003"
      },
      {
        "key": "qr_mengetahui_2",
        "label": "QR Tanda Tangan Mengetahui 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 2]"
      },
      {
        "key": "jabatan_menyetujui_1",
        "label": "Jabatan Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Wakil Direktur III"
      },
      {
        "key": "unit_menyetujui_1",
        "label": "Unit Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Bidang Kemahasiswaan dan Alumni PENS"
      },
      {
        "key": "nama_menyetujui_1",
        "label": "Nama Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ir. Kholid Fathoni, S.Kom., MT., IPM."
      },
      {
        "key": "nip_menyetujui_1",
        "label": "NIP Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "19801226 200812 1003"
      },
      {
        "key": "qr_menyetujui_1",
        "label": "QR Tanda Tangan Menyetujui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Menyetujui 1]"
      },
      {
        "key": "nama_pelindung",
        "label": "Nama Pelindung (Direktur PENS)",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Dr.-Ing. Ir. Arif Irwansyah, S.T., M.T."
      },
      {
        "key": "nama_penasehat",
        "label": "Nama Penasehat (Wadir Kemahasiswaan)",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Ir. Kholid Fathoni, S.Kom., MT., IPM."
      },
      {
        "key": "nama_pembina_minat_bakat",
        "label": "Tim Pembina Minat & Bakat",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Grezio Arifiyan P, S.Kom., M.Kom."
      },
      {
        "key": "nama_pembina_ormawa",
        "label": "Pembina Ormawa",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST., M.Sc. Ph.D"
      },
      {
        "key": "nama_penanggung_jawab",
        "label": "Nama Penanggung Jawab",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Yusuf Ramadhani Arianto"
      },
      {
        "key": "nama_ketua_pelaksana",
        "label": "Nama Ketua Pelaksana",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Fadhil Muhammad Daffa"
      },
      {
        "key": "nama_bendahara",
        "label": "Nama Bendahara",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Muhammad ‘Abid Muhtarom"
      },
      {
        "key": "nama_sekretaris",
        "label": "Nama Sekretaris",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Muhammad Fajrul Fatih"
      }
    ]
  },
  {
    "typeId": "lpj",
    "templateId": "TEMPLATE-LPJ-01",
    "name": "Lembar Pertanggungjawaban (LPJ) Kegiatan",
    "version": "1.0.0",
    "sourceDocument": "Template - LPJ.docx",
    "fields": [
      {
        "key": "nama_kegiatan",
        "label": "Nama Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "INTENSIF AN-NAHL 1"
      },
      {
        "key": "tahun_kegiatan",
        "label": "Tahun Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "2025"
      },
      {
        "key": "nama_divisi_pelaksana",
        "label": "Divisi Pelaksana",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "Pengembangan Sumber Daya Manusia"
      },
      {
        "key": "nama_ormawa",
        "label": "Nama Ormawa",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "organization",
        "defaultValue": "UNIT KEGIATAN KEROHANIAN ISLAM"
      },
      {
        "key": "nama_kampus",
        "label": "Nama Kampus",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "server",
        "defaultValue": "POLITEKNIK ELEKTRONIKA NEGERI SURABAYA"
      },
      {
        "key": "tema_kegiatan",
        "label": "Tema Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "TSABATUL QALB, yang memiliki arti: Keteguhan hati."
      },
      {
        "key": "tagline_kegiatan",
        "label": "Tagline Kegiatan",
        "type": "string",
        "required": true,
        "group": "identitas_kegiatan",
        "valueSource": "user",
        "defaultValue": "Menguatkan Hati, Meneguhkan Iman."
      },
      {
        "key": "hari_kegiatan",
        "label": "Hari Pelaksanaan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "Sabtu - Minggu"
      },
      {
        "key": "tanggal_kegiatan",
        "label": "Tanggal Pelaksanaan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "29 - 30 November 2025"
      },
      {
        "key": "waktu_kegiatan",
        "label": "Waktu Kegiatan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "08.00 s/d Selesai"
      },
      {
        "key": "tempat_kegiatan",
        "label": "Tempat Kegiatan",
        "type": "string",
        "required": true,
        "group": "pelaksanaan",
        "valueSource": "user",
        "defaultValue": "Villa Puncak Trawas, Mojokerto"
      },
      {
        "key": "kota_surat",
        "label": "Kota Pengesahan",
        "type": "string",
        "required": true,
        "group": "pengesahan",
        "valueSource": "user",
        "defaultValue": "Surabaya"
      },
      {
        "key": "tanggal_pengesahan",
        "label": "Tanggal Pengesahan",
        "type": "string",
        "required": true,
        "group": "pengesahan",
        "valueSource": "user",
        "defaultValue": "2 Desember 2025"
      },
      {
        "key": "jabatan_pemohon_1",
        "label": "Jabatan Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Umum UKKI PENS"
      },
      {
        "key": "nama_pemohon_1",
        "label": "Nama Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Muhammad Labib Al Zuhry"
      },
      {
        "key": "nrp_pemohon_1",
        "label": "NRP Pemohon 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3223600049"
      },
      {
        "key": "qr_pemohon_1",
        "label": "QR Tanda Tangan Pemohon 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 1]"
      },
      {
        "key": "jabatan_pemohon_2",
        "label": "Jabatan Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Ketua Pelaksana"
      },
      {
        "key": "nama_pemohon_2",
        "label": "Nama Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Muhammad Fajrul Fatih A. I."
      },
      {
        "key": "nrp_pemohon_2",
        "label": "NRP Pemohon 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "3124600040"
      },
      {
        "key": "qr_pemohon_2",
        "label": "QR Tanda Tangan Pemohon 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Pemohon 2]"
      },
      {
        "key": "jabatan_mengetahui_1",
        "label": "Jabatan Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Tim Pembinaan Minat dan Bakat Mahasiswa"
      },
      {
        "key": "nama_mengetahui_1",
        "label": "Nama Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Grezio Arifian Primajaya, S.Kom., M.Kom."
      },
      {
        "key": "nip_mengetahui_1",
        "label": "NIP Mengetahui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "199208262 02203 1007"
      },
      {
        "key": "qr_mengetahui_1",
        "label": "QR Tanda Tangan Mengetahui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 1]"
      },
      {
        "key": "jabatan_mengetahui_2",
        "label": "Jabatan Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Pembina UKKI PENS"
      },
      {
        "key": "nama_mengetahui_2",
        "label": "Nama Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST, M.Sc, Ph.D."
      },
      {
        "key": "nip_mengetahui_2",
        "label": "NIP Mengetahui 2",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198509102 01212 1003"
      },
      {
        "key": "qr_mengetahui_2",
        "label": "QR Tanda Tangan Mengetahui 2",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Mengetahui 2]"
      },
      {
        "key": "jabatan_menyetujui_1",
        "label": "Jabatan Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Wakil Direktur III"
      },
      {
        "key": "unit_menyetujui_1",
        "label": "Unit Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Bidang Kemahasiswaan dan Alumni PENS"
      },
      {
        "key": "nama_menyetujui_1",
        "label": "Nama Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "Kholid Fathoni, S.Kom, M.T."
      },
      {
        "key": "nip_menyetujui_1",
        "label": "NIP Menyetujui 1",
        "type": "string",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "participant",
        "defaultValue": "198012262 00812 1003"
      },
      {
        "key": "qr_menyetujui_1",
        "label": "QR Tanda Tangan Menyetujui 1",
        "type": "image_or_text",
        "required": true,
        "group": "tanda_tangan",
        "valueSource": "signatureEvidence",
        "defaultValue": "[QR Code Tanda Tangan Menyetujui 1]"
      },
      {
        "key": "nama_penasehat",
        "label": "Nama Penasehat (Wadir Kemahasiswaan)",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Kholid Fathoni, S.Kom., M.T."
      },
      {
        "key": "nama_pembina_ormawa",
        "label": "Pembina Ormawa",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Adnan Rachmat Anom Besari, S.ST, M.Sc, Ph.D"
      },
      {
        "key": "nama_penanggung_jawab",
        "label": "Nama Penanggung Jawab",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Muhammad Labib Al Zuhry"
      },
      {
        "key": "nama_ketua_pelaksana",
        "label": "Nama Ketua Pelaksana",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "participant",
        "defaultValue": "Muhammad Fajrul Fatih Abul ‘Ilmi"
      },
      {
        "key": "nama_sekretaris",
        "label": "Nama Sekretaris",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Ahmad Farhan"
      },
      {
        "key": "nama_bendahara",
        "label": "Nama Bendahara",
        "type": "string",
        "required": true,
        "group": "susunan_panitia",
        "valueSource": "user",
        "defaultValue": "Siti Nurhaliza"
      }
    ]
  }
];

export const DEFAULT_ORGANIZATIONS: RoutingOrganizationDto[] = [
  { id: 'org-himit', name: 'Himpunan Mahasiswa Informatika (HIMIT)', kind: 'Himpunan' },
  { id: 'org-bem', name: 'Badan Eksekutif Mahasiswa (BEM)', kind: 'Organisasi' },
  { id: 'org-ukki', name: 'Unit Kegiatan Kerohanian Islam (UKKI)', kind: 'Organisasi' },
  { id: 'org-himatek', name: 'Himpunan Mahasiswa Telekomunikasi (HIMATEK)', kind: 'Himpunan' },
  { id: 'org-himaelka', name: 'Himpunan Mahasiswa Elektronika (HIMA ELKA)', kind: 'Himpunan' },
  { id: 'org-himameka', name: 'Himpunan Mahasiswa Mekatronika (HIMA MEKA)', kind: 'Himpunan' },
];

export const DEFAULT_CANDIDATES: RoutingCandidateDto[] = [
  {
    userId: 'cand-ketupel',
    name: 'Budi Santoso',
    positionCode: 'Ketupel',
    positionName: 'Ketua Pelaksana',
  },
  {
    userId: 'cand-ketua-org',
    name: 'Citra Lestari',
    positionCode: 'KetuaOrganisasi',
    positionName: 'Ketua Organisasi',
  },
];

export const DEFAULT_FACILITIES: RoutingFacilityDto[] = [
  { id: 'fac-d4', code: 'GD-D4', name: 'Gedung D4 PENS' },
  { id: 'fac-pasca', code: 'GD-PASCASARJANA', name: 'Gedung Pascasarjana PENS' },
  { id: 'fac-d3', code: 'GD-D3', name: 'Gedung D3 PENS' },
  { id: 'fac-outdoor', code: 'FAS-OUTDOOR', name: 'Fasilitas Terbuka & Olahraga' },
];

export const DEFAULT_RESOURCES: RoutingResourceDto[] = [
  { id: 'res-teater-d4', facilityId: 'fac-d4', code: 'Ruang Teater D4', floor: 2 },
  { id: 'res-hall-d4', facilityId: 'fac-d4', code: 'Hall Utama D4', floor: 1 },
  { id: 'res-lab-d4-1', facilityId: 'fac-d4', code: 'Lab Pemrograman C-201', floor: 2 },
  { id: 'res-lab-d4-2', facilityId: 'fac-d4', code: 'Lab Jaringan Komputer', floor: 3 },
  { id: 'res-auditorium', facilityId: 'fac-pasca', code: 'Auditorium Pascasarjana', floor: 6 },
  { id: 'res-seminar-pasca', facilityId: 'fac-pasca', code: 'Ruang Seminar Pascasarjana', floor: 2 },
  { id: 'res-hall-d3', facilityId: 'fac-d3', code: 'Hall Gedung D3', floor: 1 },
  { id: 'res-lap-futsal', facilityId: 'fac-outdoor', code: 'Lapangan Futsal Kampus', floor: 1 },
  { id: 'res-lap-basket', facilityId: 'fac-outdoor', code: 'Lapangan Basket Kampus', floor: 1 },
];
