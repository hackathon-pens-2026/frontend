# SignIt! — Alur Pengerjaan Frontend

Versi 1.1 — 9 Oktober 2026.

Acuan: `SignIt-Backend-Requirements.md` v2.6, `SignIt-UI-UX-Specification.md` v1.1 dan `AGENTS.md` terbaru. Dokumen ini mengatur urutan implementasi frontend, bukan mengubah kontrak backend. Status pekerjaan di bawah masih rencana; belum ada implementasi yang dinyatakan selesai.

## 1. Batas Tanggung Jawab

Frontend menggunakan Next.js 16+, TypeScript dan Tailwind v4. Seluruh aturan bisnis berada di backend .NET: schema surat, kandidat peserta, routing, izin, konflik resource, LLM, generate PDF/QR dan email. Frontend mengirim input, menampilkan hasil dan mengelola interaksi.

OOP digunakan jika diperlukan untuk API client atau adapter dengan dependensi yang jelas. Komponen React tetap function components. Jangan membuat domain workflow, approval engine atau template renderer di frontend.

Dua surface: mahasiswa untuk mahasiswa umum dan Dagri BEM; manajemen untuk BAAK/manajemen/kemahasiswaan. Tidak ada admin, registrasi, SSO, upload QR, PIN/OTP signing atau pusat notifikasi. Akun disiapkan tim; email dikirim backend.

## 2. Alur Utama — Kode UI/UX ke Frontend

Setiap tampilan dimulai dari kode mentah hasil UI/UX yang diberikan tim, kemudian diintegrasikan ke direktori `frontend/`. Kode sumber itu menjadi acuan tampilan dan interaksi; hasil ekspor belum dianggap siap produksi. Jika kode tampilan belum diberikan, tandai sebagai dependency dan lanjutkan pekerjaan lain yang tidak bergantung padanya. Jangan mengaku telah memindahkan tampilan hanya berdasarkan dokumen desain.

| Urutan | Pekerjaan | Hasil yang diperiksa |
|---|---|---|
| 1. Ambil sumber | Identifikasi layar, kode mentah, asset dan interaksi UI/UX | Sumber lengkap dan tujuan route jelas |
| 2. Periksa sumber | Temukan dependency, warna hardcoded, data demo, pola framework lama dan masalah tampilan | Daftar perubahan yang diperlukan sebelum integrasi |
| 3. Integrasikan | Pindahkan ke route/module/component dalam `frontend/` mengikuti struktur proyek | Layar dapat dibuka; asset/import/alias benar |
| 4. Rapikan kode | Terapkan clean code dan batas OOP; pecah tanggung jawab, pindahkan warna ke palet, keluarkan data demo dari produksi | Komponen presentasi, state UI dan API adapter terpisah |
| 5. Review AI slop | Bandingkan hasil dengan sumber UI/UX dan checklist visual di bawah | Masalah konkret diperbaiki; tidak sekadar memberi label “bukan AI slop” |
| 6. Integrasikan API | Ganti fixture dengan kontrak backend, tampilkan state dan tindakan berizin | Layar memakai data nyata tanpa keputusan bisnis lokal |
| 7. Verifikasi | Periksa browser, responsif, aksesibilitas, lint/type/build dan diff | Bukti pemeriksaan serta blocker dicatat |

Siklus ini wajib untuk **setiap pemindahan tampilan**, termasuk dialog, mobile layout dan halaman pendukung. Review pertama dilakukan sesudah komponen dirapikan, lalu diulang setelah API terhubung karena data nyata dapat mengubah layout. Jangan menyalin seluruh kode ekspor ke satu page lalu menunda perapian sampai akhir proyek.

### Clean code dan OOP saat pemindahan

- Periksa file yang sudah ada; gunakan komponen dan adapter bersama sebelum membuat salinan baru.
- Jadikan route file sebagai penyusun halaman, komponen sebagai presentasi, hooks sebagai state/interaksi, dan API adapter sebagai komunikasi backend. Aturan bisnis tetap di .NET.
- Terapkan encapsulation, single responsibility dan composition pada adapter/service bila ada perilaku atau dependency. Gunakan class/interface hanya untuk kebutuhan nyata; fungsi murni dan function components tidak perlu dibungkus class.
- Rapikan nama dan tipe, hapus import/dependency/kode mati, dan tangani loading/empty/error. Hindari `any`, manipulasi DOM langsung yang melawan React dan handler panjang yang mencampur banyak tanggung jawab.
- Pusatkan semua nilai warna di `frontend/app/globals.css`, atau `frontend/src/app/globals.css` jika proyek memang memakai `src/`. Gunakan satu file yang benar-benar dipakai proyek, bukan keduanya. Path `app/globals.css` di dokumen lain mengacu pada root aplikasi frontend.
- Jangan membuat service frontend untuk routing persetujuan, validasi konflik, pemrosesan LLM atau generate PDF. Adapter hanya mengirim request dan memetakan respons backend.

### Checklist review AI slop

AI slop dinilai dari masalah visual dan interaksi yang dapat ditunjukkan, bukan dari asal kode atau selera semata.

- Tidak ada statistik, nama, progres atau aktivitas demo yang terlihat sebagai transaksi nyata.
- Judul, tombol dan teks menyebut tindakan/status yang relevan; hapus slogan atau paragraf generik yang tidak membantu pekerjaan pengguna.
- Ukuran heading, card, ikon dan whitespace mengikuti hierarki UI/UX; tidak ada area kosong besar atau card berlapis tanpa fungsi.
- Tidak ada gradient, glow, shadow berlebihan, emoji dekoratif, animasi atau chart tanpa tujuan pada desain putih/hijau yang telah disepakati.
- Warna, radius, spacing dan typography konsisten; tidak ada palet kedua dari kode ekspor.
- Tombol utama jelas dan bekerja. Tidak ada tombol mati, tautan `#`, interaksi pura-pura atau status sukses sebelum server merespons.
- Label panjang, data kosong, error dan konten nyata tidak merusak layout. Mobile bukan sekadar versi desktop yang diperkecil.
- Hasil masih sesuai sumber UI/UX. Jika sumber mengandung masalah di atas, catat perubahan dan alasannya; jangan mendesain ulang bagian yang tidak bermasalah.

Catat hasil review per layar sebagai: **masalah → lokasi/elemen → perbaikan → hasil pemeriksaan**. Bila tampilan belum dibuka di browser, status review visual masih belum terverifikasi.

## 3. Urutan dan Hasil per Tahap

Setiap tahap halaman memakai siklus pemindahan kode UI/UX pada bagian 2. Selesaikan satu alur yang dapat digunakan dari awal sampai akhir sebelum memperluas jenis surat. Mulai dengan peminjaman ruangan Pasca/SAW, kemudian proposal/LPJ, barang dan undangan. Dashboard dibangun setelah daftar/detail bekerja agar tidak menjadi kumpulan angka contoh.

| Tahap | Pekerjaan | Hasil yang harus tersedia | Ketergantungan |
|---|---|---|---|
| 0 | Kumpulkan kode UI/UX, baca acuan dan sepakati kontrak | Sumber layar/asset, peta route, data, auth, error dan API yang belum tersedia | Kode UI/UX + dokumen + OpenAPI backend |
| 1 | Fondasi proyek dan palet | Build dasar, komponen umum, warna terpusat | Tahap 0 |
| 2 | Login dan dua shell | Session, navigasi berdasarkan izin, protected routes | API auth/me |
| 3 | API client dan katalog | DTO, adapter, template/schema dan daftar surat | Session + API katalog/draft |
| 4 | Chatbot pengisi surat | Pilih jenis → isi → klarifikasi → review data | API chat/schema/referensi |
| 5 | Preview dan pengajuan | PDF draft → review peserta/rute → Ajukan | API preview/routing/submit |
| 6 | Detail dan persetujuan | Inbox → review → sign/revisi/tolak → final | API tasks/timeline/documents |
| 7 | Dashboard dan antrean | Ringkasan, surat terbaru, inbox prioritas, antrean berizin | Alur transaksi sudah bekerja |
| 8 | Perluasan surat/resource | Lima jenis surat, chain 5/7/6, jadwal dan barang | Alur ruangan lolos pemeriksaan |
| 9 | Dokumen dan bantuan P1 | Scan/OCR, posisi QR PDF upload, pencarian, delegasi | API pendukung tersedia |
| 10 | Integrasi dan rilis | Alur lintas akun, mobile, lint/type/build, deployment | Tahap MVP selesai |

Fitur P1 tetap termasuk cakupan produk, tetapi tidak menghalangi demo awal alur inti. Halaman status publik dan pemeriksaan file adalah P2; tidak dikerjakan sebagai syarat signing.

## 4. Tahap 0 — Persiapan Kontrak

1. Baca `AGENTS.md`, PRD dan UI/UX. Periksa package, lockfile, alias, `next.config.ts`, CSS dan struktur proyek yang benar-benar ada.
2. Identifikasi versi Next.js yang terpasang dan baca dokumentasi yang sesuai sebelum memakai API. Pertahankan config Tailwind/Turbopack yang sudah ada; jangan menyalin konfigurasi proyek lain.
3. Tentukan pola session bersama backend sebelum membuat login: cookie/BFF atau API terpisah sesuai kontrak. Catat origin development/production, CSRF, CORS, expiry dan perilaku logout. Jangan menyimpan kredensial secara ad hoc.
4. Cocokkan OpenAPI dengan PRD: pagination, error code, field error, kemampuan pengguna, schema draft, reference picker, dokumen private, job status, expected revision dan idempotency key.
5. Konfirmasi hubungan chat session, draft dan request ID agar generate dari chat tidak membuat pengajuan kedua. Sepakati indikator preview sudah usang setelah draft diubah.
6. Konfirmasi kontrak simpan koordinat QR, ringkasan dashboard dan pencarian chatbot tambahan. PRD tidak merinci seluruh endpoint/DTO tersebut; jangan membuat nama endpoint atau menghitung metrik global dari satu halaman data.

Jika API belum tersedia, gunakan fixture yang sesuai kontrak di mode development dengan label demo. Pisahkan adapter fixture dari produksi. Catat fitur terblokir; fixture tidak dihitung sebagai integrasi selesai.

## 5. Tahap 1 — Fondasi dan Design System

- Pulihkan dependency dengan npm dan cek proyek bisa berjalan. Jangan upgrade Next.js tanpa kebutuhan.
- Gunakan `app/globals.css` sebagai satu-satunya palet: background, surface, foreground, muted, border, ring, primary, hover, subtle, success, warning, danger dan info beserta foreground pasangannya.
- Ekspos token lewat `@theme inline`. Komponen, SVG dan chart menggunakan token tersebut; tidak ada kode warna atau utility warna tetap di file lain.
- Buat hanya komponen yang dibutuhkan tahap berikutnya: tombol, input, select/picker, dialog, tabs, badge, loading/empty/error dan page header. Gunakan shadcn/ui bila dipilih tim, dengan token yang sama.
- Siapkan sidebar/drawer dan grid responsif. Ikuti padding/breakpoint UI/UX; uji 360 px, desktop dan zoom 200% sejak awal.

**Selesai jika:** mengganti token primary mengubah semua pemakaiannya; focus/hover/disabled terbaca; komponen dapat digunakan dengan keyboard; fondasi lolos lint/type/build.

## 6. Tahap 2 — Login dan Shell

Implementasikan `/login`, `/forgot-password`, `/reset-password`, kemudian shell mahasiswa dan manajemen. Ambil kategori, surface dan assignment dari `/me` atau `/me/capabilities` sesuai kontrak.

- Tidak ada pemilih role, daftar akun atau registrasi.
- Dagri tetap memakai shell mahasiswa dan dapat membuka inbox tugasnya.
- Menu mengikuti capability; membuka URL langsung tetap mendapat pemeriksaan akses backend.
- Session expired mengarahkan ke login tanpa menandai draft yang belum tersimpan sebagai tersimpan.
- Tautan dari email mempertahankan tujuan internal yang aman, lalu membuka surat/task setelah login dan pemeriksaan izin. Hindari redirect bebas ke URL eksternal.

**Selesai jika:** akun dari empat kategori masuk ke surface yang tepat; akun tanpa izin ditolak saat membuka detail/task langsung; logout membersihkan data pengguna sebelumnya.

## 7. Tahap 3 — API Client, Template dan Draft

Pisahkan request transport, DTO mapping dan tampilan. Buat API client/adapters per kebutuhan; jangan menambah lapisan repository atau DI container tanpa alasan. Server-only client tidak boleh masuk bundle browser.

Implementasikan katalog `/template`, detail `/template/[id]` dan daftar `/mahasiswa/surat`. Ambil jenis, tujuan, schema, preview dan field wajib dari backend. Unduh template tetap berbeda dari memulai pengajuan.

Tangani pagination, filter, loading, data kosong, kegagalan dan akses ditolak. Batalkan request pencarian lama saat filter berubah. Hasil kosong tidak boleh diganti data demo pada produksi.

**Selesai jika:** katalog menampilkan data backend; memilih template membuka alur chatbot dengan pilihan terlihat; draft milik akun lain tidak bisa diakses.

## 8. Tahap 4 — Chatbot Pengisi Template

Route utama: `/surat/baru`; koreksi draft/revisi: `/surat/[id]/edit`.

1. Tampilkan pertanyaan pertama: **“Ingin membuat tipe surat apa?”** beserta jenis template tersedia.
2. Setelah pilihan, tampilkan prasyarat dari schema backend.
3. Terima input multiline, misalnya “Nama Kegiatan: Buka Bersama; Nama Ketua Pelaksana: aaaaaa”. Kirim ke backend; frontend tidak memanggil provider LLM langsung.
4. Tampilkan hasil ekstraksi pada ringkasan editable dan field wajib yang kurang. Nilai tidak diberikan tetap kosong.
5. Tampilkan pilihan kandidat backend untuk nama/resource ambigu. Jika nama tidak ditemukan, minta pengguna memilih akun tersedia; jangan membuat akun.
6. Terapkan respons koreksi pada field terkait. Pertahankan data lainnya, tampilkan status simpan berdasarkan respons server, dan cegah respons lama menimpa input terbaru.
7. Saat backend menyatakan data valid, tampilkan review dan tombol **Generate surat**. Bila LLM gagal, gunakan form schema yang sama dengan nilai draft yang sudah ada.

Desktop: percakapan 60% / ringkasan 40%. Mobile: tab Percakapan/Data/Preview; input sticky tidak menutupi field atau keyboard. Riwayat sesi menggunakan drawer.

**Selesai jika:** input beberapa field dikenali melalui API; field kurang/ambigu ditangani; draft dapat dilanjutkan; fallback tidak kehilangan nilai; chatbot tidak otomatis submit/sign.

## 9. Tahap 5 — Preview, Peserta dan Pengajuan

- Generate memanggil API chat generate/preview sesuai kontrak, lalu menampilkan job state dan PDF draft.
- Tampilkan peserta dan routing dari backend. Bedakan akun yang mengirim dengan orang yang tercantum sebagai Mengajukan, Hormat Kami dan Mengetahui.
- Candidate picker hanya menampilkan akun eligible. Pejabat yang menyetujui mengikuti tujuan/bidang dan routing backend.
- Gunakan slot template sebagai default. Slot sebelum signing berupa placeholder nama/jabatan, bukan QR yang terlihat sudah ditandatangani.
- Perubahan draft setelah generate membuat preview perlu diperbarui. Jangan mengizinkan pengajuan memakai preview/routing lama.
- **Ajukan surat** adalah konfirmasi terpisah setelah review. Kirim version/revision dan idempotency key sesuai kontrak; cegah klik ganda dan tangani konflik versi.
- Setelah respons sukses, buka detail surat. Timeout tidak boleh dianggap pasti gagal atau pasti sukses; periksa hasil menggunakan kontrak backend sebelum mencoba lagi.

Desktop preview: PDF 67% / ringkasan 33%. Dokumen private dimuat melalui akses berizin; jangan membuat URL publik permanen.

**Selesai jika:** generate tetap menghasilkan draft; submit membentuk satu pengajuan; peserta/routing tampil benar; error validasi menunjuk field dan data pengguna tidak hilang.

## 10. Tahap 6 — Detail, Inbox dan Persetujuan

Implementasikan `/surat/[id]`, `/tugas` dan `/tugas/[id]` dengan komponen bersama untuk kedua surface. Detail menampilkan PDF, status surat, tahap aktif, timeline, revisi, lampiran dan posisi antrean jika tersedia.

- Inbox hanya menampilkan tugas berizin. Tidak ada approve langsung atau bulk approve dari tabel.
- Review memperlihatkan isi surat, peran actor, tahap, due date dan QR milik actor dari backend.
- Aksi mengikuti jenis tugas dan izin backend: Gunakan tanda tangan, Setujui & tanda tangani, Minta revisi atau Tolak. Alasan revisi/penolakan wajib sesuai API.
- Tahap berikutnya berlabel Belum giliran; frontend tidak menghitung atau memajukan workflow sendiri.
- QR otomatis, tanpa upload/PIN/OTP. Setelah aksi, muat ulang detail/timeline dari server; jangan menampilkan tahap selesai sebelum respons berhasil.
- Stale assignment/revision menahan aksi dan meminta muat ulang. Task pending tidak bisa dikirim ulang lewat klik ganda.
- Revisi mempertahankan riwayat versi lama. Label Final dan Unduh final hanya untuk hasil final yang tersedia; Finalizing/ProcessingFailed punya tampilan tersendiri.

Desktop review: PDF 70% / tindakan 30%. Mobile: ringkasan atas, tabs dan action bar bawah dengan safe-area.

**Selesai jika:** peminjaman ruangan berjalan lintas akun sampai final; Dagri approve di UI mahasiswa; revisi/tolak/stale ditangani; akses akun lain tetap dibatasi.

## 11. Tahap 7 — Dashboard dan Antrean

Bangun dashboard dari data transaksi yang sudah terintegrasi. Mahasiswa: pengajuan terbaru 67% / tugas dan bantuan 33%. Manajemen: inbox prioritas 75% / SLA dan agenda 25%.

Angka ringkasan harus berasal dari API yang disepakati. Jika metrik belum tersedia, hilangkan kartu itu sampai kontraknya tersedia. Jangan menyebut jumlah halaman pertama sebagai jumlah keseluruhan.

Antrean `/antrean` hanya untuk scope berizin. Bedakan posisi surat sendiri dengan daftar unit yang lebih luas. Urutan antrean bukan estimasi waktu selesai. Perbarui status saat navigasi, refresh manual dan polling terbatas untuk job aktif; hentikan polling saat selesai/unmount. Tidak ada bell, feed atau halaman notifikasi.

**Selesai jika:** count/filter sesuai scope, refresh mempertahankan data lama sambil loading, dan tugas tetap terlihat meskipun email gagal dikirim backend.

## 12. Tahap 8 — Jenis Surat dan Resource

| Alur | Urutan tanda tangan yang ditampilkan dari backend |
|---|---|
| Proposal/LPJ | Ketupel → Ketua Organisasi → Pembina → Minat Bakat/Kemahasiswaan → Wadir 3 |
| Ruang Pasca/SAW | Ketupel → Ketua Organisasi → Pembina Organisasi → Minat Bakat/Kemahasiswaan → Dagri BEM → BAAK → Wadir 3 |
| Barang | Ketupel → Ketua Organisasi → Pembina Organisasi → Minat Bakat/Kemahasiswaan → Wadir 3 → Wadir 2 |
| Undangan | Routing yang disiapkan backend untuk tujuan terkait; jangan mengarang chain |

Implementasikan `/ruangan`, jadwal ruangan dan `/barang`. Kalender desktop 75% / detail 25%; mobile memakai agenda harian. Bedakan pengajuan pending dan confirmed dengan label. Data peminjam hanya tampil sesuai izin. Availability bukan jaminan reservasi; konflik final tetap diputuskan backend.

Untuk barang, tampilkan jumlah tersedia hanya bila backend menyediakannya. LPJ memakai referensi kegiatan sesuai schema. Semua jenis memakai workspace chatbot/review yang sama; tidak perlu menyalin halaman untuk setiap template.

**Selesai jika:** lima jenis memakai schema backend yang benar, chain 5/7/6 sesuai respons, dan konflik/tanggal/jumlah salah ditampilkan tanpa keputusan bisnis lokal.

## 13. Tahap 9 — Fitur Pendukung P1

| Fitur | Pekerjaan frontend | Pemeriksaan penting |
|---|---|---|
| Scan/OCR | Upload foto/PDF, urut/putar/crop halaman, job status, konfirmasi metadata | OCR gagal, izin kamera ditolak, input manual; hasil OCR tidak otomatis submit |
| Posisi QR PDF upload | PDF viewer, slot drag, halaman/X/Y/ukuran dan alternatif keyboard | Zoom, rotasi, ukuran halaman, bounds; koordinat disimpan lewat kontrak backend |
| Pencarian chatbot | Input, klarifikasi ruangan/tanggal, sumber berizin | Tanggal pengajuan vs kegiatan, pagination, scope, hasil kosong |
| Profil QR | Identitas dan QR otomatis | Provisioning pending/gagal tanpa QR palsu |
| Delegasi | Daftar mandat, form kandidat/periode/alasan dan pencabutan | Policy dari backend; tidak menyelesaikan tahap otomatis |

Kerjakan setelah alur inti stabil. Jika endpoint belum tersedia, catat dependency dan lanjutkan pekerjaan independen; jangan menutupi dengan aksi success lokal.

## 14. Cara Mengerjakan Setiap Fitur

1. Pilih satu layar/fitur, ambil kode mentah UI/UX dan asset terkait, lalu tentukan route tujuan dalam `frontend/`.
2. Baca bagian PRD/UI/UX terkait, kode yang akan berubah dan dokumentasi Next.js sesuai versi.
3. Pastikan API/DTO/error/izin tersedia. Catat kekurangan kontrak sebelum mengimplementasikan integrasi.
4. Integrasikan kode UI/UX ke `frontend/` sambil merapikan komponen, tipe, hooks, API adapter dan token warna. Terapkan clean code dan prinsip OOP sesuai batas frontend pada setiap pemindahan.
5. Buka layar dan review AI slop dengan checklist bagian 2. Perbaiki masalah konkret tanpa mengganti desain yang sudah tepat. Integrasikan API, lalu periksa ulang dengan data nyata.
6. Periksa happy path, error, data kosong, permission dan session expired yang relevan. Untuk mutation, periksa klik ganda serta respons stale.
7. Jalankan lint, `npx next typegen`, `npx tsc --noEmit` dan build mengikuti scripts proyek. Jangan mengklaim test otomatis tersedia jika runner belum dipasang.
8. Tinjau diff, lalu catat hasil aktual dan blocker. Beri commit dengan satu perubahan yang dapat ditinjau; lanjutkan fitur berikutnya setelah pemeriksaan sesuai perubahan selesai.

Tambahkan tes otomatis hanya untuk perilaku yang membutuhkan perlindungan, misalnya draft tidak hilang pada kegagalan dan submit tidak terkirim ganda. Gunakan alat yang sudah tersedia; penambahan runner adalah keputusan proyek tersendiri.

## 15. Tahap 10 — Pemeriksaan Integrasi dan Rilis

- Jalankan pengajuan ruangan melalui chatbot → review → generate → submit → seluruh 7 tahap → unduh PDF final menggunakan akun seed masing-masing actor.
- Periksa proposal/LPJ 5 tahap, barang 6 tahap dan undangan dengan route backend yang tersedia.
- Periksa revisi, penolakan, konflik resource, LLM/PDF gagal, session expiry dan akses langsung ke URL tidak berizin.
- Periksa email → login → detail/task. Pengiriman dan reminder diverifikasi backend; frontend tidak mengintegrasikan Resend atau menyimpan API key email.
- Periksa mobile 360/390 px, desktop, zoom 200%, keyboard, reduced motion, kontras serta bar sticky yang tidak menutup konten.
- Pastikan setiap layar yang dipindahkan dari UI/UX mempunyai hasil review clean code/OOP dan AI slop; pemeriksaan visual yang belum dilakukan tetap tercatat.
- Periksa satu perubahan token warna berlaku di seluruh UI; tidak ada palet kedua atau hardcoded color di komponen.
- Periksa auth, CSRF/CORS sesuai pola session, dokumen private dan redirect pada Vercel → Azure menggunakan konfigurasi production. Secret backend tidak masuk bundle atau environment publik.
- Jalankan lint/type/build dan browser checks yang relevan. Catat pemeriksaan yang tidak dapat dijalankan beserta sebabnya.

**Kriteria rilis:** P0 bekerja dengan API nyata, alur lintas akun mencapai PDF final, blocker material telah dicatat/ditangani, dan tidak ada state demo yang tampil sebagai transaksi produksi. Dokumen rencana ini tidak membuktikan kriteria tersebut sudah terpenuhi.
