# Audit integrasi fitur dengan pilih akun

Pilih akun UAT menggunakan identitas backend. Otentikasi dan izin .NET tetap berlaku pada semua API. Daftar berikut adalah integrasi kode, bukan bukti pengujian deployment Azure.

| Fitur | Integrasi |
| --- | --- |
| Akun/assignment | `/me`, pemilih akun UAT terbatas, penanganan 401 dan perubahan akun antartab; Wadir II, Minat Bakat, pengaju organisasi dan penerima delegasi ditambahkan ke pemilih |
| Dashboard/Surat Saya | Daftar dan metrik berasal dari API; PDF final memakai endpoint finalization, bukan endpoint preview |
| Templates/Routing | Schema, organisasi, fasilitas dan eligible peserta dari API; backend menentukan chain |
| Assistant | Chat backend; bila gagal gunakan formulir, tanpa NLP lokal yang mengarang ID ruangan atau respons tersimpan |
| Letters | Draft, preview PDF, submit, edit/resubmit, pembatalan dengan alasan dan versi |
| Workflow | Sign, approve, acknowledge, request-revision, reject, defer, resume, delegate dan revoke-delegation melalui API; hanya allowedActions ditampilkan |
| QR/PDF | Dokumen tinjauan backend, signed-document, final PDF dan retry finalisasi; tidak membuat kop/isi surat pengganti ketika PDF tidak tersedia |
| Fasilitas | `/ruangan`: katalog, jadwal pending/confirmed dan cek benturan pada rentang WIB; reservasi surat tetap mengikuti workflow backend |
| Email | Diproses backend/outbox; keberhasilan aksi bukan bukti email terkirim. Tidak ada notifikasi in-app tambahan |

Belum tersedia: endpoint unggah lampiran/foto/PDF dan OCR, unduhan file sumber template, serta API daftar reservasi manual milik pengguna. Komponen wizard lama yang tidak dipakai route aktif tidak dianggap terintegrasi. Tidak ada pengujian email nyata atau mutasi data Azure pada audit ini. Jadwal standalone tidak menggantikan persetujuan surat.

Aktivasi/pengujian server tetap membutuhkan env UAT pada `UAT-account-picker.md`. Gunakan deployment testing terisolasi, HTTPS dan email test.
