# SignIt! — PRD Aplikasi Web & Backend Requirements v2.6

> Digital Campus Worker: pengajuan surat, tanda tangan elektronik, dan pencarian informasi kampus.
> Revisi: 9 Oktober 2026. Stack: Next.js, ASP.NET Core, PostgreSQL.
> Target deployment: frontend Vercel, backend Microsoft Azure; email transaksi Resend.
> MVP: dua UI, akun/config seed tim, chatbot pengisi template, notifikasi email saja.
> Tanda tangan: QR per pengguna digenerate backend, siap digunakan melalui akun login; tanpa upload QR, PIN/OTP signing atau verifikasi tambahan.
> Status: rancangan produk; contoh pejabat dan alur harus divalidasi dengan kampus.

## 1. Keputusan MVP dan Pemeriksaan PRD

Pembaruan v2.6: fitur pengelola konfigurasi dihapus; akun/master data disiapkan tim melalui seed. Chatbot menjadi alur utama pengisian prasyarat lalu generate surat sesuai template. Notifikasi email saja tanpa halaman in-app/SignalR. Dua UI, empat kategori, chain 5/7/6 dan QR otomatis tetap dipakai.

Dokumen yang diperiksa adalah `SignIt-Backend-Requirements.md`, satu-satunya PRD yang dilampirkan. Semua bagian awal diperiksa. Dokumen awal merupakan kebutuhan backend, belum mencakup PRD web secara lengkap. Versi ini memperluas produk dan menyelaraskan alur, data, API, UI, keamanan, serta pengujian.

| Bagian awal | Hasil pemeriksaan dan perubahan |
|---|---|
| Ringkasan dan aktor | Ditambah petugas unit, peserta penandatangan, serta pemisahan pemilik pengajuan dengan nama pada surat |
| Tech stack | Tetap .NET + PostgreSQL; Next.js, pemrosesan scan/OCR dan adapter LLM ditambahkan |
| Arsitektur | Modular monolith dipertahankan; worker dokumen, routing bidang dan chatbot ditambahkan |
| Autentikasi | Akun internal seeded oleh tim, login email/password dan reset; tanpa registrasi/panel akun |
| Approval chain | Tidak dibatasi delapan tahap; routing berdasarkan tujuan/bidang, versi kebijakan dan penandatangan wajib |
| Template | Ditambah katalog, file sumber/unduhan, beberapa jenis surat, blok tanda tangan dan versioning |
| Tanda tangan QR | Backend generate QR per akun; tindakan akun login, evidence/audit dan PDF overlay; halaman verifikasi publik opsional |
| Reminder | Mengikuti tugas aktif, termasuk pengganti; delegasi tidak menghilangkan kewajiban reminder |
| Delegasi dan skip | Tahap wajib tidak boleh dilompati menuju surat final; penundaan tidak berarti persetujuan |
| Audit | Aksi surat, draft chat, generate, QR, delegasi dan script perubahan; audit tetap disimpan tanpa UI audit |
| Model data | Ditambah revisi immutable, peran surat, bidang, routing, job OCR, antrean dan reservasi ruangan |
| Otorisasi | Akses per surat/task/unit, kategori/assignment dari seed; tidak ada capability konfigurasi MVP |
| Endpoint | Ditambah katalog template, scan/OCR, peran tanda tangan, queue, ruangan dan chatbot |
| Non-fungsional | Target performa dinyatakan sebagai target yang harus diukur; limit OCR dan LLM terpisah |
| Integrasi/deployment | Lokal untuk development; frontend Vercel, backend/worker Azure; autentikasi internal, email, aset QR dan LLM |
| Testing/prioritas | Acceptance criteria seluruh fitur baru; MVP inti dipisah dari kemampuan lanjutan |
| Asumsi | Kebijakan kampus yang belum diketahui dicatat, tidak dianggap sebagai aturan resmi |

Masalah logika utama pada versi awal: persetujuan tidak selalu sama dengan tanda tangan; revisi berpotensi memakai persetujuan dokumen lama; `Skipped` dapat membuat surat terlihat selesai padahal tanda tangan belum lengkap; hash server tidak otomatis menjadi signature pribadi yang tertanam dalam PDF; antrean surat belum menangani benturan jadwal ruangan.

## 2. Tujuan Produk dan Ruang Lingkup

SignIt memudahkan mahasiswa, dosen, staf dan organisasi membuat atau mengunggah surat, menentukan orang yang bertanda tangan, mendapatkan persetujuan dari bidang yang tepat, serta melacak penyelesaian. Pengguna dapat bertanya kepada chatbot mengenai data yang memang boleh mereka akses.

Kebutuhan utama:

1. Katalog template surat undangan, peminjaman tempat/ruangan, proposal kegiatan, LPJ dan peminjaman barang serta jenis lain yang disiapkan tim melalui seed template.
2. Pembuatan surat lewat form, unggah PDF, atau foto/scan beberapa halaman menjadi PDF.
3. Penandatangan dinamis untuk label Mengajukan, Hormat Kami, Mengetahui; pejabat Menyetujui mengikuti routing tujuan/bidang.
4. Antrean tugas, progres, revisi, penolakan, delegasi, reminder, notifikasi email dan audit.
5. PDF dengan QR tiap penandatangan yang dibuat backend dan digunakan langsung dari akun login; audit persetujuan per surat.
6. Chatbot LLM bertanya jenis surat, mengumpulkan prasyarat/field dari input pengguna dan mengisi template untuk generate draft/PDF otomatis; pencarian menjadi fungsi tambahan.

Ukuran keberhasilan pilot: waktu median penyelesaian, proporsi pengajuan selesai dalam SLA, pengajuan tertahan per bidang, tingkat revisi, keberhasilan generate PDF/OCR dan ketepatan jawaban chatbot pada kumpulan pertanyaan uji. Baseline dan target persentase ditetapkan setelah pilot, bukan diklaim sebelum pengukuran.

Di luar MVP: keputusan approve otomatis oleh AI, editor dokumen setara Word, pengenalan tulisan tangan yang dijamin akurat, integrasi kalender kampus penuh, sertifikasi vendor eksternal dan klaim legalitas yang belum dievaluasi kampus.

## 3. Aktor, Peran Surat dan Hak Akses

### 3.1 Empat kategori pengguna, dua UI

Kategori pengguna mengatur pengalaman UI. Kewenangan menandatangani ditentukan assignment jabatan, organisasi, bidang dan task; kategori UI tidak otomatis memberi hak menyetujui.

| Kategori akun | UI | Kemampuan dasar dan tambahan |
|---|---|---|
| Mahasiswa umum | UI mahasiswa | Membuat/mengajukan surat, memilih template, scan/upload, melacak surat sendiri; sign bila ditugaskan sebagai Ketupel/Ketua Organisasi |
| Pengurus Dagri BEM PENS | UI mahasiswa | Seluruh kemampuan mahasiswa + inbox persetujuan Dagri untuk tugas dalam scope dan masa jabatan yang sah |
| BAAK (kesekretariatan) | UI manajemen | Antrean/validasi administrasi, persetujuan dan tanda tangan BAAK pada tahap yang ditugaskan; akses unit sesuai izin |
| Manajemen/Kemahasiswaan | UI manajemen | Penugasan Pembina, Minat Bakat/Kemahasiswaan, Wadir 3 dan Wadir 2 sesuai jabatan aktual; bukan seluruh pejabat dapat bertindak pada semua tahap |

Pembina/dosen dan Wadir berada dalam kategori manajemen untuk pemetaan dua UI ini, dengan assignment jabatan tersendiri. Ini keputusan desain sementara agar empat kategori tetap lengkap; mapping akun internal dan jabatan kampus perlu dikonfirmasi. BAAK tidak otomatis menjadi penandatangan Proposal/LPJ atau peminjaman barang karena tidak ada pada chain yang diberikan.

Tidak ada UI ketiga khusus Dagri. Pada UI mahasiswa tampilkan tab `Pengajuan Saya` dan `Persetujuan Saya`; tab persetujuan hanya aktif bila akun memiliki assignment/task yang sah. Pengurus Dagri boleh mengajukan surat seperti mahasiswa lain, tetapi tidak boleh memakai privilege Dagri untuk menyetujui pengajuannya sendiri tanpa kebijakan yang sah. Penggantinya harus mempunyai mandat sesuai scope; jika tidak tersedia, proses diblokir dengan alasan.

UI manajemen menampilkan `Inbox Saya`, `Antrean Unit`, `Arsip Berizin`, `Jadwal/Resource` dan chatbot sesuai scope. MVP hanya memiliki dua surface dan tidak menyediakan panel konfigurasi. Akun/katalog/chain disiapkan oleh tim melalui seed di luar UI. Verifier publik opsional bukan akun internal kelima.

Saat login, `/me` mengembalikan `UserCategory`, `UiSurface`, jabatan/assignment dan capabilities. Frontend menggunakan data itu untuk navigasi; backend tetap melakukan object/task authorization pada tiap aksi. Mengakses URL UI manajemen secara manual tidak menaikkan hak pengguna. Riwayat tetap menggunakan actor aktual walaupun masa jabatan selesai.

| Capability | Hak |
|---|---|
| Requester | Membuat/submit/revisi/batal pada surat sendiri |
| Signer / Approver | Bertindak hanya pada task aktif yang assigned dan berwenang |
| UnitOperator | Melihat antrean/resource dalam unit yang ditugaskan |
| PublicVerifier | Metadata publik signature; tidak mendapat file/isi surat atau NIM/NIP/IP |

### 3.2 Akun internal yang disiapkan tim

Untuk MVP, akun dibuat sendiri oleh tim melalui seed/script deployment, bukan melalui UI registrasi, undangan akun atau panel pengelolaan akun. Seed mencakup mahasiswa umum, Dagri BEM, BAAK, Pembina/Kemahasiswaan dan Wadir yang dibutuhkan chain. Kategori tetap empat; jabatan merupakan assignment dalam kategori yang sesuai.

Pengguna login dengan email/password yang telah disiapkan. Password di-hash dengan adaptive hashing + salt; nilai awal berasal dari konfigurasi secret yang tidak disimpan di repository. Seed idempoten berdasarkan email/ID stabil, tidak membuat akun ganda atau mereset password saat aplikasi restart. Script provisioning dijalankan eksplisit oleh tim dan bukan endpoint web umum. QR pengguna digenerate backend setelah provisioning.

Kategori, jabatan/scope/masa berlaku, organisasi, ruangan/barang, template dan chain disiapkan melalui seed/migration/config versioned. Mengubah data seed yang sudah dipakai tidak menulis ulang snapshot surat lama. Data yang salah diperbaiki tim melalui script terkontrol. Tidak ada kategori, capability, halaman atau API khusus pengelola konfigurasi dalam MVP.

Tidak ada role picker di login. Backend tetap mengecek role/assignment dan hak per task; akun manajemen tidak mendapat kemampuan CRUD konfigurasi hanya karena memakai UI manajemen. Reset password melalui email dapat dipertahankan untuk akun yang disiapkan tim; responsnya netral, token sekali pakai dan sesi dapat dicabut. Verifikasi email/aktivasi publik bukan prasyarat provisioning MVP; tim menyediakan alamat email uji yang benar dan dapat menerima pesan.

### 3.3 Orang yang muncul pada surat

| Peran surat | Siapa yang menentukan | Aturan |
|---|---|---|
| `SubmittedBy` | Akun pembuat/pengirim | Metadata sistem; tidak otomatis sama dengan penandatangan Mengajukan |
| `Applicant` — Mengajukan | Dipilih per surat | Bisa ketua pelaksana atau pemohon yang berbeda dari pengunggah |
| `ClosingSignatory` — Hormat Kami | Dipilih per surat | Bisa sekretaris, ketua organisasi, atau pihak lain sesuai template |
| `AcknowledgingSignatory` — Mengetahui | Dipilih per surat | Memiliki tindakan tanda tangan/acknowledge sendiri bila wajib |
| `ApprovingSignatory` — Menyetujui | Resolver routing bidang | Kandidat hanya berasal dari jabatan/otoritas yang sah untuk tujuan tersebut |

Mengajukan, Hormat Kami dan Mengetahui boleh berbeda orang untuk setiap surat. Pemilihan orang tidak otomatis berarti persetujuan: orang tersebut harus menerima tugas dan melakukan tindakan sendiri. Label Hormat Kami merupakan blok penutup surat; kewajiban tanda tangannya mengikuti template.

Template menentukan slot, label tampilan, jumlah minimum/maksimum, wajib/opsional, aturan kandidat, dan tahap tugas. Nama, jabatan dan organisasi di-snapshot saat submit untuk menjaga riwayat. MVP mengutamakan akun kampus aktif; penandatangan eksternal membutuhkan alur undangan dan verifikasi identitas tersendiri pada fase lanjutan.

Jika satu orang mengisi beberapa slot, sistem menampilkan semua slot dan meminta konfirmasi yang jelas. Default satu tindakan per tugas; penggabungan tugas hanya melalui kebijakan template yang eksplisit. Self-approval tidak diizinkan secara default jika pengaju juga menjadi pejabat Menyetujui; resolver mencari pengganti sah atau memblokir submit.

## 4. Alur Pengguna dan Halaman Web

### 4.1 Alur pembuatan surat melalui chatbot

1. Pengguna membuka Buat Surat; bot pertama kali bertanya: **“Ingin membuat tipe surat apa?”** Pilihan berasal dari katalog template seeded.
2. Pengguna memilih/mengetik Undangan, Proposal, LPJ, Peminjaman Ruangan atau Peminjaman Barang. Jika ambigu, bot meminta klarifikasi sebelum memilih template.
3. Backend memberikan field/prasyarat template dan bot meminta data yang diperlukan. Pengguna boleh menjawab beberapa field sekaligus, misalnya “Nama Kegiatan: Buka Bersama; Nama Ketua Pelaksana: aaaaaa”.
4. LLM mengekstrak input menjadi field terstruktur; backend memvalidasi nilai, lookup ID peserta/resource dan daftar field yang belum lengkap.
5. Bot menanyakan data yang kurang atau perlu diperjelas. Nama Ketua Pelaksana harus dipetakan ke akun seeded yang sah sebelum menjadi penandatangan; nama bebas tidak membuat akun atau kewenangan baru.
6. Setelah data lengkap, bot menampilkan ringkasan terstruktur yang bisa diedit dan tombol Generate surat. Pengguna meninjau/koreksi input.
7. Backend menyimpan draft dan mengisi template versi yang dipilih secara deterministik; renderer menghasilkan PDF preview. LLM tidak mengubah kop, chain, field wajib atau nomor surat sendiri.
8. Pengguna melihat PDF, peserta/rute dan posisi QR; dapat mengoreksi draft atau menambahkan scan/lampiran. Ajukan surat adalah tindakan eksplisit pada halaman preview, bukan otomatis saat chat selesai.
9. Peserta aktif klik Gunakan tanda tangan/Setujui & tanda tangani melalui sesi login; backend memakai QR mereka otomatis. Sistem mengirim email ke penerima yang relevan.
10. Setelah semua tugas wajib dan syarat resource selesai, backend menerbitkan final PDF, mengirim email selesai dan menyediakan unduhan pada detail surat.

Form terstruktur tetap tersedia sebagai koreksi/fallback jika LLM tidak tersedia. Dokumen upload/manual mengikuti validasi peserta/routing yang sama. Pengajuan dan tanda tangan tidak dijalankan hanya karena pesan chat mengandung kata “setujui”.

### 4.2 Halaman minimum

| Halaman | Isi dan perilaku |
|---|---|
| Profil Tanda Tangan QR | Menampilkan QR yang digenerate backend; siap digunakan tanpa upload/PIN/OTP |
| Dashboard | Surat saya, tugas saya, status tertahan, reminder dan shortcut buat surat |
| Katalog template | Filter jenis/tujuan, contoh preview, unduh template dan mulai pengajuan |
| Wizard surat | Jenis/tujuan → dokumen/data → peserta → preview/rute → submit |
| Scan dokumen | Unggah PDF/foto, kamera bila browser mendukung, urutkan halaman, putar/crop, proses OCR dan koreksi |
| Detail surat | Versi, PDF, peserta, progres, alasan revisi, timeline dan tombol tindakan sesuai hak |
| Antrean tugas | Tugas aktif, urutan lokal, waktu masuk, due date, filter bidang dan status |
| Jadwal ruangan | Kalender akses terbatas, jadwal terkonfirmasi dan pengajuan yang masih pending dengan label berbeda |
| Chatbot pembuat surat | Pertanyaan awal jenis surat, input prasyarat, ringkasan/koreksi dan generate PDF preview |
| Status publik opsional (P2) | Riwayat/status minimal melalui QR dokumen terpisah bila fitur diaktifkan |

Tampilan responsif desktop/mobile, Bahasa Indonesia, label status berbasis teks dan warna, navigasi keyboard. Unggahan dan job panjang menampilkan progres, kegagalan dan retry. Aksi approve/sign menampilkan revisi dokumen yang akan disetujui; tombol tidak aktif bila tugas sudah berubah.

## 5. Katalog Template dan Dokumen

### 5.1 Jenis, tujuan dan penerima

`LetterType` adalah bentuk surat; `SubmissionPurpose` adalah tujuan proses; `Recipient` adalah pihak yang dituju dalam isi surat; `ApprovalDomain` adalah bidang otoritas. Keempatnya disimpan terpisah.

| Jenis awal | Data penting | Contoh bidang routing, bukan aturan resmi kampus |
|---|---|---|
| Undangan | Kegiatan, pihak yang diundang, waktu, tempat, agenda | Kemahasiswaan atau unit penyelenggara |
| Peminjaman tempat/ruangan | RoomId, tujuan kegiatan, waktu mulai/selesai, kapasitas, penanggung jawab | Sarana/prasarana atau pengelola ruangan |
| Proposal kegiatan | Nama kegiatan, latar belakang, tujuan, anggaran, jadwal, proposal lampiran | Kemahasiswaan; keuangan bila memenuhi aturan anggaran |
| LPJ | Referensi kegiatan/proposal, realisasi, periode dan lampiran laporan | Chain Proposal/LPJ lima tahap pada bagian 7.3 |
| Peminjaman barang | Inventaris/item, jumlah, periode pinjam, kondisi, penanggung jawab dan unit pengelola | Chain enam tahap, berakhir Wadir 2 |
| Jenis tambahan | Skema form dan lampiran yang dikonfigurasi | Bidang sesuai kebijakan kampus |

### 5.2 Template sebagai file dan form

- Tim menyertakan file template DOCX/PDF, schema field dan layout render melalui seed/config versioned. Pengguna hanya memilih template yang disediakan, bukan membuat/mengedit master template.
- MVP menghasilkan surat dari layout terkontrol (QuestPDF atau HTML→PDF) dan menyediakan file template siap unduh. DOCX arbitrer tidak otomatis menjadi form/render template.
- Jika template DOCX dipakai langsung sebagai sumber generasi, parser placeholder dan converter harus ditambahkan serta diuji; tidak diasumsikan tersedia pada MVP.
- Proposal dapat berupa surat pengantar yang dihasilkan aplikasi dengan PDF proposal sebagai lampiran, atau dokumen utama yang diunggah jika jenisnya mengizinkan.
- Skema field: key, label, type, required, pilihan, aturan validasi dan sumber data. `room-picker`, `user-picker`, tanggal/jam dan organisasi menggunakan ID valid.
- Template menyimpan kop, struktur isi, format nomor, aturan slot tanda tangan dan requirement lampiran.
- Siklus versi: `Draft → Published → Retired`. Hanya Published dapat dipakai submit. Surat lama mempertahankan versi yang dipakai.
- Penghapusan template yang pernah dipakai tidak menghapus riwayat; gunakan retire.
- Nomor surat unik dialokasikan secara transaksional saat submit valid, dengan seri sesuai unit/jenis/tahun. Revisi mempertahankan nomor dan mempunyai nomor revisi; nomor surat batal tidak dipakai ulang.

### 5.3 PDF yang diunggah

- PDF asli disimpan immutable sebagai dokumen sumber. Metadata dan daftar lampiran dicatat bersama revision hash.
- Untuk PDF unggahan, pengguna menempatkan slot pada halaman yang dipilih lewat preview. Koordinat dinormalisasi terhadap ukuran halaman, mempertimbangkan rotasi dan ukuran halaman berbeda.
- Backend memvalidasi halaman, bounds, ukuran slot, tabrakan antarblok serta ruang untuk QR. Jika ruang tidak cukup, gunakan halaman pengesahan tambahan yang disetujui pada preview.
- PDF terenkripsi atau rusak ditolak dengan pesan yang jelas pada MVP.
- PDF yang sudah memiliki signature sertifikat tidak diproses ulang/ditimpa diam-diam. Gunakan mode lampiran yang mempertahankan file asli atau jalur khusus yang memahami signature tersebut.

## 6. Scan Dokumen PDF dan OCR

Interpretasi fitur scan: mengunggah PDF hasil scanner atau foto beberapa halaman dari kamera/browser, membentuk PDF, mengekstrak teks, dan membantu mengisi metadata. Integrasi perangkat scanner fisik tidak termasuk MVP browser.

### Alur

1. Unggah PDF/JPG/PNG atau ambil foto melalui UI browser bila didukung.
2. Susun halaman; lakukan rotate, crop dan penyesuaian dasar sebelum submit.
3. Backend memvalidasi file, mengisolasi proses, menyimpan sumber dan membuat `DocumentProcessingJob`.
4. PDF dengan teks memakai ekstraksi teks; halaman gambar memakai OCR bahasa Indonesia/Inggris. Hasil per halaman menyertakan lokasi dan indikator confidence bila engine menyediakan.
5. Sistem menyarankan field seperti tanggal kegiatan, nama organisasi dan judul. Pengguna harus memeriksa/mengonfirmasi; OCR tidak menandatangani atau mengajukan surat.
6. Simpan PDF hasil normalisasi, teks OCR dan mapping field sebagai turunan yang terhubung ke sumber; file asli tetap disimpan.

Status job: `Queued`, `Processing`, `Completed`, `Failed`, `Cancelled`. Retry aman tidak membuat sumber atau halaman ganda. OCR gagal tidak menghapus sumber; pengguna dapat mengisi metadata manual dan melanjutkan bila validasi jenis surat terpenuhi.

Limit rancangan awal: satu unggahan maks. 10 MiB, total pengajuan 25 MiB, dokumen utama maks. 30 halaman. Semua limit terkonfigurasi dan ditampilkan sebelum unggah. Validasi MIME dari isi, bukan ekstensi saja; batasi decompression, resolusi gambar, waktu proses dan jumlah job per pengguna. File template DOCX disediakan tim melalui seed; tidak ada jalur upload master template di UI MVP.

Hasil OCR merupakan data tidak tepercaya. Instruksi di dalam dokumen tidak menjadi perintah aplikasi/chatbot. MVP OCR tidak menjamin akurasi tulisan tangan.

## 7. Routing Persetujuan Berdasarkan Tujuan dan Bidang

### 7.1 Aturan resolver

Input: jenis surat, tujuan, organisasi/unit, lokasi/ruangan, periode dan atribut relevan seperti anggaran. Output: versi kebijakan, tahap berurutan, pejabat/kandidat sah, masa jabatan dan penjelasan penentuan.

Tim menyiapkan `ApprovalDomain`, `ApproverAssignment` dan `RoutingPolicy` melalui seed/config versioned. Penugasan memuat jabatan, user, lingkup, masa berlaku, delegasi dan kewenangan. Contoh: pengelola gedung A tidak otomatis menjadi approver ruangan di gedung B.

| Kondisi | Perilaku wajib |
|---|---|
| Satu rute sah | Tampilkan kandidat dan chain preview |
| Lebih dari satu pejabat, boleh dipilih | Pengguna memilih hanya dari daftar eligible yang diberikan backend |
| Lebih dari satu rute tanpa prioritas yang jelas | Blokir submit; tim memperbaiki seed/config |
| Tidak ada approver aktif | Blokir submit; jelaskan bidang yang belum memiliki penugasan |
| Pergantian jabatan | Riwayat tetap; tugas belum selesai perlu reassignment sah dan audit |
| Tujuan/ruangan berubah saat revisi | Hitung ulang routing dan minta tanda tangan ulang pada revisi baru |

Pengguna tidak boleh mengirim `ApproverUserId` arbitrer untuk melewati resolver. Dropdown frontend adalah preview; backend mengecek ulang pada submit. Snapshot rute membekukan aturan, tetapi kewenangan akun dan delegasi tetap dicek saat bertindak. Reassignment tidak mengubah siapa yang pernah bertindak pada versi terdahulu.

### 7.2 Approval dan tanda tangan sebagai tugas

`WorkflowTask` menyatukan tugas dengan `ActionType = Sign | Acknowledge | ApproveAndSign | Review`. Role pada blok surat tetap terpisah dari urutan tugas. Pada ketiga chain bagian 7.3, seluruh tahap memerlukan persetujuan dengan QR personal pemilik: Ketupel/Ketua Organisasi memakai Sign, Pembina dan pejabat berikutnya memakai ApproveAndSign. Acknowledge tanpa signature atau Review administrasi tidak menggantikan tahap TTD wajib.

Urutan tugas memakai chain kebutuhan pengguna pada bagian 7.3, menggantikan contoh empat tahap pada versi awal. Semua task tanda tangan memakai QR otomatis actor dan tindakan actor sendiri dari sesi login. `ApproveAndSign` selesai setelah bukti persetujuan dan snapshot QR tersimpan secara transaksional; komentar review saja tidak memenuhi task sign wajib.

Urutan berikut menjadi seed workflow dari kebutuhan pengguna. Semua tahap wajib dan sequential; grup paralel fase berikutnya. Perubahan urutan menghasilkan versi workflow baru melalui script tim terkontrol, tidak mengubah surat yang sudah diajukan.

### 7.3 Chain tanda tangan yang diberikan pengguna

| Urutan | Proposal / LPJ | Ruangan Gedung Pasca & SAW | Peminjaman Barang |
|---|---|---|---|
| 1 | Ketupel | Ketupel | Ketupel |
| 2 | Ketua Organisasi | Ketua Organisasi | Ketua Organisasi |
| 3 | Pembina | Pembina Organisasi | Pembina Organisasi |
| 4 | Minat Bakat/Kemahasiswaan | Minat Bakat/Kemahasiswaan | Minat Bakat/Kemahasiswaan |
| 5 | Wadir 3 | Dagri BEM | Wadir 3 |
| 6 | — | BAAK | Wadir 2 |
| 7 | — | Wadir 3 | — |

Proposal dan LPJ memiliki jenis/form/template berbeda tetapi dapat memakai chain lima tahap yang sama. Untuk peminjaman ruangan, chain tujuh tahap hanya otomatis diterapkan pada scope Gedung Pasca dan SAW; rute gedung lain harus dikonfigurasi, bukan diasumsikan sama. Peminjaman barang memiliki resource dan chain sendiri, bukan routing RoomId.

Ketupel dan Ketua Organisasi dipilih per surat dari kandidat sesuai organisasi/kegiatan. Pembina dapat berbeda antar surat/organisasi tetapi harus cocok dengan assignment pembina yang sah. Pejabat berikutnya di-resolve dari jabatan, bidang dan scope aktif. Minat Bakat/Kemahasiswaan diperlakukan sebagai satu tahap pada seed ini; jika sebenarnya dua pejabat terpisah, perlu versi chain yang dikonfirmasi.

Label Mengajukan, Hormat Kami, Mengetahui dan Menyetujui adalah label tampilan slot, bukan kategori akun atau pengganti chain. Default mapping Ketupel → Mengajukan, Ketua Organisasi → Hormat Kami, Pembina → Mengetahui, tahap pejabat berikutnya → Menyetujui. Template boleh memakai label resmi lain. Jangan otomatis menambah satu tahap baru hanya karena label Hormat Kami muncul. Orang yang dipilih tetap harus mempunyai penugasan yang cocok dan melakukan konfirmasi sendiri.

Dagri adalah task approver mahasiswa pada tahap kelima peminjaman ruangan Pasca/SAW. Surat Proposal/LPJ dan barang tidak masuk inbox Dagri atau BAAK untuk sign jika chain tidak memuat jabatan tersebut. Memberi akses arsip/administrasi adalah policy terpisah dari hak sign.

### 7.4 Peminjaman barang dan LPJ

Tambahkan katalog LPJ dan peminjaman barang. LPJ memuat referensi kegiatan/proposal sebelumnya, periode, realisasi dan lampiran pertanggungjawaban; keterkaitan LPJ tidak mengubah signature proposal lama.

Peminjaman barang memuat item/inventaris, jumlah, tanggal mulai/akhir, unit pengelola, kondisi awal, penanggung jawab dan rencana pengembalian. Status persetujuan surat terpisah dari status serah-terima/pengembalian barang. Saat keputusan akhir, validasi stok/availability untuk periode terkait melalui transaksi yang mencegah overbooking; setelah sign akhir berhasil, reservasi dapat dikonfirmasi. Jika data inventaris belum tersedia, tampilkan pemeriksaan manual petugas dan jangan menyatakan stok terjamin. Modul stok/serah-terima rinci dapat dikembangkan sesudah alur surat, tetapi input barang dan chain enam tahap termasuk cakupan inti.

## 8. Tanda Tangan, Revisi dan Keaslian

### 8.1 QR tanda tangan dibuat otomatis oleh backend

Keputusan pengguna: SignIt membuat QR tanda tangan untuk setiap akun secara otomatis. Pengguna tidak perlu mengunggah QR, membuat QR sendiri, mengurus sertifikat atau melewati verifikasi tanda tangan tambahan. QR siap dipakai pada tugas sign/approve melalui akun yang sedang login.

QR adalah representasi tanda tangan dalam aplikasi. Bukti siapa yang menyetujui surat berasal dari tindakan akun dan audit per revisi. Sistem tidak mengklaim bahwa gambar QR merupakan signature sertifikat PDF. Tidak ada requirement CA internal, X.509, vendor sertifikasi, PIN signing atau OTP signing pada versi ini.

### 8.2 Pembuatan dan penyimpanan QR per pengguna

1. Saat akun internal dibuat/diaktifkan, backend membuat `UserSignatureQr` untuk akun tersebut. Akun lama yang belum memiliki QR mendapat QR melalui lazy provisioning saat membuka profil/tugas.
2. Payload memakai kode acak/opaque stabil yang terhubung ke UserId pada database, bukan password, token login, NIM/NIP atau data pribadi lengkap. Kode QR hanya identitas aset; bukan kredensial akses atau token persetujuan.
3. Backend merender QR sebagai PNG dengan generator QR dan menyimpan file/hash/versi. Unique constraint per akun/versi dan operasi idempoten mencegah dua QR aktif akibat retry/race.
4. Profil menampilkan QR otomatis dalam menu “Tanda Tangan Saya”. Tidak ada upload, input payload, pemeriksaan ownership QR atau status PendingReview.
5. QR dapat digunakan kembali pada beberapa surat setelah tindakan pemilik. Snapshot versi/gambar/hash yang digunakan setiap task disimpan agar perubahan aset tidak mengubah surat lama.

Pembuatan ulang hanya melalui recovery tim melalui script yang ter-audit bila file rusak/asset perlu rotasi; pengguna tidak perlu mengelolanya dalam alur normal. QR tidak berubah setiap kali login. Regenerasi aset tidak menghapus riwayat atau membatalkan surat lama.

Tidak perlu halaman validasi publik untuk QR personal. Saat dipindai, payload hanya identifier QR internal yang telah ditentukan aplikasi. Jika halaman lookup/riwayat QR dikembangkan kemudian, izin metadata dan tujuan tautannya ditetapkan terpisah; pemindaian tidak mengubah status surat.

### 8.3 Menggunakan tanda tangan dan posisi pada PDF

Pada giliran aktif, peserta membuka surat, meninjau isi/revisi dan slot, lalu klik “Gunakan tanda tangan” atau “Setujui & tanda tangani”. Backend mengambil QR milik actor dari sesi secara otomatis; tidak ada isian PIN/OTP atau upload aset. Task yang belum aktif tidak dapat ditandatangani.

Next.js menyediakan preview PDF dan drag/drop slot pada halaman. Simpan page index, X/Y, width/height dan rotasi; backend memetakan koordinat ke halaman PDF dan menjaga rasio/quiet zone QR. Template dapat memberi posisi default. Semua lokasi dibekukan saat submit; perubahan lokasi/isi/peserta setelah submit menjadi revisi baru dan membutuhkan persetujuan ulang.

Pengaju menyiapkan slot dan memilih peserta, tetapi tidak bisa mengonfirmasi tugas orang lain. Backend menentukan actor dari sesi, memeriksa assignment/scope, task aktif, expected revision/content hash dan idempotency key; jangan menerima ActorUserId/QrOwnerId arbitrer dari client. Login serta task authorization tetap digunakan; memindai/menyalin QR bukan tindakan menyetujui.

### 8.4 Evidence dan penerbitan PDF final

Dalam transaksi sign/approve, simpan TaskId, RevisionId, actor aktual, role/jabatan snapshot, QrAssetId/Version/Hash, ContentHash, waktu UTC, IP dan user-agent; selesaikan task lalu aktifkan tahap berikutnya. Jangan mencatat Signed/Approved jika transaksi evidence gagal. Untuk delegasi, gunakan QR pengganti yang benar-benar bertindak serta keterangan mandat; jangan memakai QR pemberi mandat seolah ia yang melakukan tindakan.

Semua chain 5/7/6 tetap sequential. Preview progres hanya menampilkan QR actor yang telah menyelesaikan task; slot belum selesai dilabeli menunggu. Pada final approval, availability dan reservasi ruangan/barang diperiksa/di-commit secara atomik; render PDF berjalan sesudah commit.

Setelah semua tahap wajib selesai, worker merender/overlay final dari revisi immutable, snapshot QR masing-masing actor serta nama/jabatan/waktu tindakan. Sumber dan artifact lama tetap disimpan. PDF unggahan dengan signature sertifikat yang sudah ada tidak dimodifikasi diam-diam; gunakan lampiran immutable atau tolak jalur modifikasi tersebut.

Final bytes di-hash SHA-256 untuk identitas file internal dan disimpan immutable. Completed hanya setelah final tersedia. Kegagalan renderer → ProcessingFailed dan retry idempoten tanpa meminta peserta menandatangani ulang. Penggantian aset QR profil tidak mengubah PDF lama.

Perubahan isi, jadwal, peserta, posisi slot atau lampiran membuat revisi baru dan task baru. Evidence lama tetap historis, bukan persetujuan untuk isi yang berubah.

### 8.5 Status surat dan verifikasi opsional

Tanda tangan QR tidak membutuhkan proses verifikasi tambahan. Halaman utama tetap detail/progres surat bagi pihak berizin, dengan nama, jabatan dan waktu actor yang bertindak. Tidak ada pemeriksaan sertifikat atau upload PDF untuk menyelesaikan tugas sign.

QR status dokumen dan halaman publik yang ada pada rancangan awal dipindahkan menjadi fitur opsional P2. Jika diaktifkan, QR dokumen dibuat terpisah dari QR per pengguna dan menampilkan status/riwayat internal, bukan klaim signature tersertifikasi. Pencocokan hash lewat upload PDF juga opsional; scan QR saja tidak mencocokkan isi file.

Publikasi opsional hanya memuat metadata yang diizinkan; NIM/NIP, email, IP dan isi surat tidak dipublikasikan. Revoked tetap dicatat oleh pihak berwenang dan tersedia pada detail surat, terlepas dari apakah fitur halaman publik digunakan.

### 8.6 Pemrosesan QR/PDF

Backend memakai generator QR (misalnya QRCoder), private asset storage, renderer/overlay PDF serta SHA-256 untuk fingerprint internal. Tidak diperlukan decoder QR upload atau library certificate signing. Pemilihan renderer mengikuti kebutuhan PDF sumber serta lisensi yang sesuai.

QA memeriksa provisioning idempoten, pemetaan QR ke akun, task authorization, snapshot aset, posisi halaman/rotasi, keterbacaan QR pada file/cetak, finalization retry serta absence PIN/OTP/upload pada alur sign.

## 9. State Machine, Antrean dan Delegasi

### 9.1 Status surat dan tugas

| Status surat | Makna |
|---|---|
| Draft | Dapat diedit; belum masuk antrean |
| InProgress | Tugas tanda tangan/persetujuan sedang berjalan |
| NeedsRevision | Pengaju harus membuat revisi baru |
| AwaitingResourceResolution | Benturan jadwal/ruangan perlu diselesaikan sebelum persetujuan akhir |
| Finalizing | Semua tugas wajib selesai; penerbitan PDF berlangsung |
| ProcessingFailed | Finalisasi gagal; retry tanpa meminta approve ulang |
| Completed | Final PDF tersedia dan semua syarat terpenuhi |
| Rejected | Ditolak dengan alasan wajib |
| Cancelled | Dibatalkan sebelum finalisasi sesuai kebijakan |
| Revoked | Surat yang pernah terbit dicabut oleh pihak berwenang |

Transisi utama: Draft → InProgress → Finalizing → Completed. InProgress dapat menjadi NeedsRevision, Rejected, Cancelled atau AwaitingResourceResolution. NeedsRevision → InProgress melalui resubmit revisi baru. AwaitingResourceResolution → NeedsRevision bila jadwal/ruangan harus diubah, atau → InProgress bila konflik hilang dan revisi yang sama masih valid. Finalizing → ProcessingFailed → Finalizing melalui retry. Completed → Revoked; pembatalan surat terbit memakai pencabutan, bukan menghapus surat.

Status tugas: `Pending`, `Active`, `Signed`, `Acknowledged`, `Approved`, `RevisionRequested`, `Rejected`, `Deferred`, `Cancelled`, `Superseded`. Delegasi adalah assignment/event, bukan status persetujuan. Task terakhir menjadi Approved hanya setelah tindakan pengguna login dan QR otomatis, bukti persetujuan, pemeriksaan resource dan commit reservasi berhasil; konflik menunda keputusan tersebut.

### 9.2 Antrean pengajuan

- Nomor pengajuan global adalah identitas, sedangkan posisi antrean dihitung per inbox/pejabat/bidang.
- Hanya tugas Active masuk antrean tindakan; tahap berikutnya ditampilkan sebagai belum aktif.
- Default FIFO berdasarkan `ActivatedAt`, dengan ID sebagai tie-breaker. Jangan mengurutkan tugas pejabat dari SubmittedAt karena bisa baru tiba setelah beberapa tahap.
- Filter: jenis, tujuan, bidang, status, rentang tanggal, ruangan dan organisasi; pengaju melihat posisi tugas suratnya tanpa membaca surat orang lain.
- Tampilkan due date dan overdue; posisi adalah urutan saat ini, bukan janji waktu selesai atau satu antrean global seluruh kampus.
- Perubahan prioritas hanya oleh role berwenang dengan alasan dan audit; prioritas tidak menjadi auto-approve. MVP cukup FIFO.
- Pagination dan pengurutan stabil; double-submit/double-approve dicegah dengan idempotency key, transaksi dan optimistic concurrency.

### 9.3 Delegasi dan penundaan

Delegasi memiliki pemberi/penerima, bidang/lingkup, masa berlaku dan alasan. Penerima harus memiliki kewenangan yang diizinkan kebijakan; maksimal satu tingkat, tidak ke diri sendiri. Tindakan mencatat pemberi mandat dan actor aktual; tampilan “a.n.” mengikuti format yang disetujui kampus.

Tahap wajib tidak boleh di-skip untuk menerbitkan Completed. Deferred menunda tugas dan menampilkan alasan; tidak menghitungnya selesai. Skip hanya untuk tahap opsional dengan kebijakan eksplisit dan audit. Jika fitur persetujuan sementara dibutuhkan, gunakan status dan dokumen provisional tersendiri; jangan menyebutnya final.

Reminder mengikuti assignment aktif, termasuk delegasi; berhenti ketika tugas selesai, superseded atau surat terminal. Penundaan memerlukan due date baru atau eskalasi, bukan mematikan reminder tanpa jejak.

## 10. Ruangan, Jadwal dan Benturan

Tambahan ini diperlukan agar pertanyaan mengenai peminjaman ruangan memiliki data yang terstruktur. Sistem membedakan surat pengajuan dengan reservasi yang telah dikonfirmasi.

- `Room`: ID stabil, kode, nama, gedung, unit pengelola, kapasitas dan status aktif.
- `RoomBookingRequest`: request/revision, RoomId, StartsAt, EndsAt, jenis kegiatan dan status pengajuan.
- `RoomReservation`: waktu terkonfirmasi dan sumber pengajuan. Pengajuan pending tidak menjamin ketersediaan; reservasi confirmed dibuat pada transaksi final approval yang sah.
- Waktu disimpan sebagai instant UTC, input/output menggunakan Asia/Jakarta. Validasi StartsAt < EndsAt dan kapasitas sesuai aturan.
- Benturan memakai interval setengah terbuka `[start, end)`; kegiatan yang berakhir tepat saat kegiatan lain mulai tidak bentrok, kecuali ada buffer yang dikonfigurasi.
- Pada draft/submit tampilkan benturan reservasi confirmed serta pengajuan pending secara terpisah.
- Pada final approval, database harus menjamin reservasi confirmed tidak overlap untuk RoomId yang sama, misalnya exclusion constraint rentang waktu atau transaksi locking yang benar; pemeriksaan availability di luar transaksi saja tidak cukup.
- Dua pengajuan bersamaan tidak boleh sama-sama lolos hanya karena pemeriksaan aplikasi dilakukan sebelum transaksi. Yang kalah masuk AwaitingResourceResolution tanpa mendapatkan final approval.
- Pencabutan surat peminjaman melepaskan reservasi bila kebijakan unit mengizinkan; semuanya tercatat. Perubahan jadwal pada surat final menggunakan pengajuan/revisi pengganti yang disetujui ulang, bukan mengubah file final.

## 11. Chatbot LLM untuk Pengisian Surat Otomatis

### 11.1 Tujuan dan percakapan awal

Chatbot adalah antarmuka utama pembuatan draft surat. Pesan awal wajib **“Ingin membuat tipe surat apa?”**, disertai pilihan jenis yang tersedia dari seed. Bot meminta prasyarat template, mengolah jawaban pengguna menjadi data field, menanyakan kekurangan dan membantu generate surat sesuai format template.

Contoh percakapan ilustratif peminjaman ruangan:

> Bot: Ingin membuat tipe surat apa?
>
> Pengguna: Peminjaman ruangan SAW.
>
> Bot: Mohon isi nama kegiatan, ketua pelaksana, organisasi, tanggal kegiatan, waktu mulai/selesai, ruangan dan jumlah peserta. Data penandatangan yang belum lengkap akan saya tanyakan berikutnya.
>
> Pengguna: Nama Kegiatan: Buka Bersama. Nama Ketua Pelaksana: aaaaaa. Organisasi: BEM.
>
> Bot: Nama kegiatan sudah terisi. Pilih akun ketua pelaksana dari hasil yang sesuai, lalu isi tanggal, jam, ruangan dan jumlah peserta yang belum tersedia.
>
> Setelah seluruh field terpenuhi: bot menampilkan ringkasan, kandidat peserta dan Generate surat. Preview PDF menyediakan Koreksi data dan Ajukan surat.

“aaaaaa” adalah nama contoh input, bukan akun yang otomatis diciptakan. Bot tidak menebak orang, jadwal, lokasi, anggaran atau ID ketika tidak diberikan. Field opsional yang tidak diberikan tetap kosong/default template yang sah, bukan fakta buatan.

### 11.2 Sumber prasyarat dan validasi

Setiap LetterTemplate seeded menyimpan `FieldSchemaJson`, requirement lampiran, label peserta dan renderer layout. Field memuat key, label, tipe, required, constraints, options/data source serta contoh input. Katalog yang diberikan backend merupakan daftar authoritative, bukan template yang dibuat model sendiri.

| Jenis | Contoh field/prasyarat |
|---|---|
| Undangan | Nama kegiatan, penerima, tanggal, waktu, tempat, agenda, organisasi dan penandatangan |
| Proposal | Nama kegiatan, latar belakang/tujuan, ketupel, organisasi, jadwal, anggaran, peserta dan lampiran proposal sesuai template |
| LPJ | Referensi kegiatan/proposal, periode, realisasi/hasil, pengeluaran dan lampiran sesuai skema |
| Peminjaman ruangan | Nama kegiatan, ketupel, organisasi, RoomId/gedung, tanggal-jam, kapasitas dan peserta chain |
| Peminjaman barang | Nama kegiatan, ketupel, organisasi, ItemId, jumlah, periode pinjam/kembali dan penanggung jawab |

Bot dapat menerima bahasa natural atau daftar “label: nilai”. Output ekstraksi memakai schema JSON ketat: template/version yang sah, values, unresolved references, missing fields dan validation issues. Backend memvalidasi required field, tanggal/jam Asia/Jakarta, jumlah/anggaran, format, batas panjang, ID seeded, eligibility peserta dan resource. Field tak dikenal tidak ditambahkan ke surat.

Nama yang cocok dengan beberapa akun memunculkan pilihan nama + organisasi/jabatan. Nama tanpa kecocokan menampilkan “Akun belum tersedia” dan pilihan akun sah/koreksi input; konfigurasi akun baru dilakukan tim di luar aplikasi. Pejabat Menyetujui tetap ditentukan resolver tujuan/bidang, bukan karangan atau kehendak model.

“Tanggal besok” dikonversi berdasarkan Asia/Jakarta lalu ditampilkan kembali sebagai tanggal eksplisit. Ruangan/jam tanpa kejelasan memicu pertanyaan. Bot menanyakan 2–5 field terkait per giliran atau menyediakan form ringkas agar percakapan tidak terlalu panjang; jawaban multi-field tetap didukung.

### 11.3 State, penyimpanan draft dan generate

State sesi pembuatan: `ChoosingType`, `CollectingFields`, `ResolvingReferences`, `ReadyToReview`, `GeneratingPreview`, `PreviewReady`, `GenerationFailed`. State chat tidak menggantikan status LetterRequest.

Data draft terstruktur disimpan server per sesi/request milik pengguna, beserta TemplateVersionId, field yang sudah dikonfirmasi dan unresolved fields. Field baru mengisi patch draft, bukan menghapus jawaban sebelumnya. Koreksi “Nama kegiatan ubah menjadi …” hanya mengubah field terkait. Pergantian jenis/template memerlukan konfirmasi, memetakan field kompatibel dan menjalankan ulang validation; data yang tidak kompatibel dijelaskan.

Generate hanya tersedia setelah validator backend menyatakan lengkap. Simpan/ringkasan draft boleh dibuat selama pengumpulan data; perubahan dari chat ditampilkan pada ringkasan sehingga dapat diperiksa pengguna. Backend menghasilkan preview dari data + template, tidak menerima arbitrary HTML/PDF/path dari LLM. Escape input pengguna dan batasi panjang; render tidak menjalankan script/remote fetch yang diusulkan chat.

Template mengisi kop, nomor/format sesuai policy, isi dan blok peserta. Nomor resmi dialokasikan saat submit; preview sebelum submit memakai label draft/nomor belum terbit. QR actor belum dicatat selesai sebelum masing-masing bertindak. GenerationFailed dapat retry dari draft yang sama, tanpa membuat surat/nomor ganda.

Konfirmasi Generate membuat draft/preview, bukan submit atau tanda tangan. Ajukan surat, sign, approve, reject, cancel dan revoke adalah action UI eksplisit dengan authorization. Chatbot tidak menjalankan action tersebut secara otonom. Draft yang sudah diajukan tidak diubah melalui chat; flow revisi membuat revisi baru sesuai policy.

### 11.4 Tools dan batas akses

| Tool allowlist | Fungsi |
|---|---|
| `list_letter_types` | Katalog aktif dari seed untuk pertanyaan awal |
| `get_template_requirements` | Schema/prasyarat template versi yang dipilih |
| `extract_letter_fields` | Ekstraksi nilai dari input pengguna ke schema; tidak langsung menulis database |
| `resolve_seeded_references` | Lookup peserta/resource/organisasi eligible dalam scope |
| `validate_letter_draft` | Required/constraint/eligibility/routing dan daftar kekurangan |
| `upsert_my_letter_draft` | Simpan draft milik pengguna setelah validasi field yang diisi; hanya draft editable |
| `generate_my_letter_preview` | Render draft valid setelah tombol Generate dikonfirmasi |
| `search_letter_requests` / `get_request_status` | Fitur pencarian/status tambahan yang berizin |
| `get_room_schedule` / `list_eligible_approvers` | Ketersediaan dan routing yang authoritative |

Backend memasukkan actor/scope dari sesi, memvalidasi tiap tool dan memakai query terparameterisasi. Model tidak mendapat SQL bebas, kredensial DB, hak edit seed atau akses surat lintas user. Batasi tool calls, token, timeout dan hasil; input percakapan/OCR adalah konten tidak tepercaya yang tidak mengubah izin.

LLM hanya membantu ekstraksi/percakapan; aturan validasi dan render tetap deterministik. Provider timeout/output JSON invalid memunculkan retry/form manual dengan data draft sebelumnya; jangan mengarang field untuk memaksa generate. Retensi chat dan payload log dibatasi, data sensitif tidak dicatat seluruhnya.

### 11.5 Pencarian tambahan

Pertanyaan “siapa yang mengajukan ruangan ini hari ini” tetap dapat didukung sebagai fitur tambahan. RoomId diambil dari konteks/picker; jika tidak ada, minta pilih. Diajukan hari ini memakai SubmittedAt, dipakai hari ini memakai overlap jadwal. Rentang hari Asia/Jakarta adalah [00:00, 00:00 hari berikutnya) dikonversi ke UTC. Hasil/count hanya scope berizin; sumber, tanggal/filter dan pagination ditampilkan. Pencarian tidak menggantikan percakapan pembuatan surat sebagai fungsi utama.

## 12. Backend, Frontend dan Integrasi

### 12.1 Stack dan modul

| Kategori | Rancangan |
|---|---|
| Frontend | Next.js App Router + React TypeScript, chat pengisian surat, form koreksi, PDF preview, kamera/upload, fetch/poll status |
| API | ASP.NET Core Web API, C#, satu gaya Controllers/Minimal API yang konsisten |
| Runtime | .NET 10 sesuai environment tim; seluruh paket EF/Npgsql mengikuti versi kompatibel yang diuji |
| Persistence | PostgreSQL + EF Core/Npgsql; JSONB untuk skema/data, relasional untuk routing/antrean/jadwal |
| Auth | Empat kategori akun/dua UiSurface + assignment capabilities; login akun internal email/password; password hashing, lockout dan reset token sekali pakai; default BFF/cookie bila satu origin, JWT pendek bila API terpisah |
| Otorisasi | Akses per surat/task/unit, kategori/assignment dari seed; tidak ada capability konfigurasi MVP |
| Validasi/mapping | FluentValidation atau validator eksplisit; mapping manual/Mapster sesuai kebutuhan |
| Jobs | Hangfire + PostgreSQL, outbox, retry dan failed-job handling yang eksplisit |
| Email | Resend REST API via backend/worker Azure; EmailDelivery/outbox/retry/webhook; email saja, tanpa halaman notifikasi |
| Refresh status | Fetch saat membuka halaman/manual refresh; polling terbatas saat job berlangsung; tanpa notification hub |
| Template | QuestPDF untuk layout terkontrol; Scriban + Gotenberg bila memilih HTML render; pilih satu jalur utama |
| PDF unggahan | Adapter inspection/overlay gambar QR + drag/drop page/rotation mapping; renderer template saja tidak mencukupi |
| Scan/OCR | Worker terisolasi; adapter ekstraksi teks + Tesseract atau engine lain yang diuji bahasa Indonesia |
| Tanda tangan QR | QRCoder/generator QR per akun, private storage, evidence akun login, PDF overlay dan SHA-256 internal |
| Storage | Volume lokal development atau MinIO; S3-compatible melalui adapter jika provider mendukungnya; Supabase Storage melalui API/SDK yang sesuai |
| LLM | Typed HttpClient/provider adapter; schema extraction + draft tools + deterministic template renderer; mock/local untuk development |
| Logging/health | Serilog, correlation ID, OpenTelemetry bila diperlukan, health/readiness endpoints |
| API docs | OpenAPI + UI dokumentasi yang kompatibel dengan stack tim |
| Tests | xUnit, integration PostgreSQL (Testcontainers bila tersedia), browser tests untuk alur kritis |
| Local/CI/hosting | Docker Compose development; CI build/check/test; Next.js di Vercel, API dan worker di Azure |

Pilihan pustaka PDF/signature/OCR dan lisensinya harus diverifikasi sebelum implementasi. Dokumen ini tidak menganggap semua provider memiliki API/protokol yang identik atau semua pustaka bebas biaya untuk semua penggunaan.

Modular monolith: `SignIt.Api`, `SignIt.Application`, `SignIt.Domain`, `SignIt.Infrastructure`. Modul aplikasi: Auth, Letters, Templates, Workflow, Signatures/UserSignatureQr, DocumentProcessing, Routing, Queues, Rooms, Chat/LetterDraftAssistant, Email, Audit. Worker berjalan sebagai proses terpisah bila OCR/PDF mengganggu respons API. Modular monolith tidak menuntut microservice.

### 12.2 Notifikasi Email dan SLA

Satu-satunya channel notifikasi MVP adalah email Resend. Tidak ada halaman/pusat notifikasi in-app, bell badge notifikasi, read/unread notification, Telegram atau web push. Dashboard, detail surat dan inbox approval tetap ada sebagai fitur transaksi untuk pengguna melihat tugas, bukan channel notifikasi terpisah.

Event email: submit/resubmit, giliran actor aktif, revisi/reject, overdue/reminder, selesai, konflik resource dan pencabutan. Keputusan domain dan EmailDelivery/outbox disimpan atomik; worker Azure mengirim setelah commit dengan deduplication dan retry. Email gagal tidak membatalkan persetujuan; tugas tetap dapat diperiksa melalui inbox/detail biasa. Aplikasi tidak menampilkan fallback popup notifikasi in-app.

Reminder mengikuti SLA/DueAt tugas aktif; job misalnya tiap 15 menit dengan cooldown/jam kirim Asia/Jakarta. Gagal/kuota penuh tercatat pada log worker dan record delivery yang dapat diperiksa tim melalui alat operasional, tanpa halaman khusus operasional dalam aplikasi. Pengiriman tidak bergantung pada traffic pengguna.

Refresh detail/tugas menggunakan fetch saat navigasi, tombol Muat ulang dan polling ringan pada halaman proses bila dibutuhkan. SignalR/notification hub bukan requirement MVP. Aturan deliverability email tetap mengikuti bagian 12.4.

### 12.3 Lokal dan deployment

Compose development memuat frontend Next.js, API, PostgreSQL, worker, storage lokal/MinIO serta OCR/render service bila dipakai. Mailpit dapat dipakai untuk melihat email dummy lokal. Pengiriman ke inbox email nyata tetap membutuhkan SMTP/provider yang dapat dijangkau; menjalankan aplikasi secara lokal tidak menjamin email masuk inbox.

Development menggunakan akun seed per kategori tanpa bypass autentikasi. LLM provider belum tersedia → mock tools/pencarian biasa. Mock tidak boleh aktif pada production. Secret signing, LLM dan email disimpan di environment/secret store. Gunakan readiness/health checks, volume persisten, migration terkontrol dan recovery test; `depends_on` saja bukan jaminan database siap.

### Deployment Vercel + Microsoft Azure

Keputusan pengguna: Next.js di Vercel, ASP.NET Core di Microsoft Azure. Baseline rancangan backend menggunakan Azure App Service; tier dipilih berdasarkan kebutuhan worker dan anggaran. Azure Container Apps menjadi alternatif bila API/OCR/renderer dikemas dalam container. Layanan Azure yang dipilih belum dianggap telah dibuat atau dikonfigurasi.

| Komponen | Target | Ketentuan |
|---|---|---|
| Frontend Next.js | Vercel | UI, SSR/BFF bila dipilih; tidak menjalankan Hangfire/OCR worker persisten |
| API ASP.NET Core | Azure App Service | Auth, workflow, database, routing, chatbot draft tools dan webhook Resend |
| Worker | Azure dengan proses yang tetap berjalan, atau scheduled/event job | Mengirim outbox, reminder, OCR dan finalisasi; tidak bergantung pada kunjungan pengguna |
| PostgreSQL | Database PostgreSQL persisten; Azure Database for PostgreSQL sebagai opsi default | Biaya dan akses network diperiksa; browser tidak mempunyai koneksi database |
| PDF/lampiran | Azure Blob Storage privat melalui adapter Azure SDK | File final/sumber tidak disimpan hanya di filesystem ephemeral host |
| Email | Resend REST API | Dipanggil API/worker Azure lewat HTTPS, API key hanya server |

Jika Hangfire Server di-host bersama API, App Service harus memakai tier yang mendukung Always On dan Always On diaktifkan. Jangan menganggap tier gratis/sleeping dapat memenuhi SLA reminder. Alternatif Container Apps yang scale-to-zero memerlukan pemicu job independen; proses timer dalam API yang tidur tidak cukup. Scheduled Container Apps Jobs memakai cron UTC; aturan jam kirim tetap dihitung sebagai Asia/Jakarta. Jika memilih worker/job terpisah, jangan menjalankan dua scheduler independen tanpa locking/deduplication.

Contoh domain placeholder: `app.signit.example` untuk Vercel, `api.signit.example` untuk Azure, `notify.signit.example` untuk pengirim email. Domain ini hanya ilustrasi, bukan domain siap dipakai. Gunakan domain yang dimiliki tim atau subdomain kampus yang mendapat izin dan akses DNS. Domain pengirim perlu dapat diatur DNS-nya; URL hosting bawaan tidak otomatis menyediakan domain email milik tim.

Autentikasi lintas hosting harus ditetapkan sebelum coding. Pilihan utama: custom domain app/API di bawah domain induk yang sama, cookie host-only pada API, fetch credentials dan CORS exact origin dengan CSRF protection. Jika memakai domain bawaan lintas situs, pilih Next.js BFF agar browser tidak bergantung pada third-party cookies; token/refresh disimpan aman di server BFF, sesi browser memakai cookie HttpOnly. Jangan memindahkan token refresh ke localStorage untuk mengatasi masalah cross-site. Jika memakai JWT, tetap implementasikan alur rotasi/pencabutan pada server.

Status pengajuan/task di-refresh melalui API; polling job dihentikan saat terminal/halaman ditutup. Tidak perlu hosting SignalR/WebSocket untuk notifikasi MVP karena email menjadi satu-satunya channel.

Frontend hanya menyimpan alamat API publik dan konfigurasi UI yang aman; rahasia Resend/database/LLM/signing berada di Azure App Settings/Key Vault. Preview deployment Vercel menggunakan backend staging/mock dengan recipient allowlist; jangan mengizinkan wildcard origin atau mengirim email nyata setiap preview build.

Sebelum go-live: domain/TLS, login/verification/reset password, CORS/session/CSRF, private storage, worker health, database migration/backup, webhook URL, DNS email dan pengujian lintas akun selesai. Resend free tier tidak membuat semua komponen Vercel/Azure/database/domain otomatis gratis; hitung biaya resource dan limit masing-masing saat provisioning.

### 12.4 Email Transaksi dan Pengurangan Risiko Spam

**Keputusan rancangan:** Resend menjadi provider utama melalui `IEmailSender` + typed HttpClient ASP.NET Core. Nama yang disebut pengguna belum pasti: Resend dan Sender adalah produk berbeda. Sender dapat menjadi alternatif melalui adapter bila tim memilihnya nanti. Tidak ada perubahan provider otomatis saat kuota habis.

#### Provider dan batas free tier

Pemeriksaan sumber resmi pada 9 Oktober 2026:

| Provider | Free tier yang dipublikasikan | Implikasi untuk SignIt |
|---|---|---|
| Resend | 3.000 email/bulan, 100/hari, 3 domain terverifikasi; 1 webhook endpoint | Default email transaksi API; kuota bersama seluruh domain, hitung tiap penerima |
| Sender | 15.000 email/bulan, 2.500 subscribers; mencakup transactional email dan branding Sender | Alternatif; validasi akses API/SMTP serta ketentuan akun sebelum mengganti adapter |

Batas paket dapat berubah; sinkronkan konfigurasi sebelum rilis. Free tier provider tidak mencakup pembelian domain atau pengadaan mailbox untuk Reply-To. Domain/subdomain kampus hanya dipakai setelah pengelola DNS kampus mengizinkan DNS; jangan memakai alamat From domain yang tidak dikuasai tim.

#### Event dan penerima

| Event | Penerima email | Kebijakan |
|---|---|---|
| Submit/resubmit berhasil | SubmittedBy | Konfirmasi nomor dan progres awal |
| Task menjadi Active | Penandatangan/approver aktual, termasuk delegasi aktif | Ajakan meninjau versi yang ditugaskan |
| NeedsRevision atau Rejected | SubmittedBy | Ringkasan aman + tautan catatan lengkap setelah login |
| Reminder overdue | Assignee aktif | Default maks. 1 email per tugas per 24 jam, batas total terkonfigurasi |
| Completed | SubmittedBy dan pihak terkait yang ditetapkan policy | Tautan unduh di aplikasi setelah login |
| Revoked atau konflik ruangan | Pengaju dan petugas terkait sesuai scope | Status dan langkah selanjutnya, tanpa seluruh isi surat |

Tidak mengirim setiap transisi intermediate ke semua orang. Beberapa task milik orang yang sama dapat dirangkum untuk menekan volume. Penerima ditentukan backend dari identitas/scope yang sah, bukan alamat arbitrer dari client/chatbot. Penggantian email memerlukan verifikasi ulang; alamat akun internal harus diverifikasi; penugasan pejabat diverifikasi terpisah oleh tim melalui script terkontrol.

#### Domain dan deliverability

Tujuan: email terautentikasi, relevan dan dapat dipantau agar peluang masuk inbox meningkat. Tidak ada jaminan 100% bebas spam atau selalu masuk tab Utama; penyedia inbox dan preferensi penerima menentukan klasifikasi akhir.

1. Verifikasi sending subdomain, misalnya `notify.<domain-tim>`, dan gunakan nama pengirim konsisten seperti `SignIt Kampus`. Alamat From misalnya `surat@notify.<domain-tim>`; Reply-To menuju mailbox bantuan yang benar-benar dipantau.
2. Terapkan DNS SPF/DKIM persis yang diterbitkan dashboard provider, pada hostname yang diminta. Jangan membuat dua SPF TXT pada hostname yang sama atau menimpa DNS mailbox kampus; koordinasikan dengan pengelola DNS.
3. Terapkan DMARC pada domain From yang relevan; pastikan alignment SPF atau DKIM. Mulai policy monitoring `p=none`, tinjau laporan, lalu naikkan enforcement bila seluruh pengirim sah lolos. Record DKIM/SPF tidak ditebak atau di-hardcode dari contoh.
4. Gunakan HTML sederhana dan versi plain text, subjek jelas, serta tautan HTTPS menuju aplikasi dengan domain yang konsisten. Hindari URL shortener, gambar sebagai seluruh isi pesan dan PDF besar; dokumen sensitif diunduh setelah login.
5. Mulai pilot dengan penerima uji yang valid dan volume kecil; jangan mengirim burst ratusan pesan dari domain baru. Hentikan pengiriman ke alamat hard-bounce/complaint dan hindari pengiriman berulang yang tidak diperlukan.
6. Matikan open/click tracking default untuk email transaksi. Status membaca dokumen/tindakan pengguna hanya berasal dari aplikasi; pixel open bukan bukti pengguna membaca surat.

Tidak ada auto-approve atau auto-sign melalui kunjungan tautan email. Tombol “Tinjau surat” membuka halaman berizin; tindakan tetap memerlukan login, pengecekan revision/hash dan konfirmasi pengguna. Email aman dibuka oleh pemindai tautan inbox tanpa mengubah status surat.

#### Outbox, retry dan kuota

- Transaksi workflow menyimpan `EmailDelivery`/outbox secara atomik. Worker Azure mengirim setelah commit; API tidak menunggu inbox menerima pesan.
- Satu delivery per event + recipient + template version; simpan deduplication key dan provider message ID. Kirim `Idempotency-Key` konsisten pada retry Resend; jendela idempotency provider saat ini 24 jam, sedangkan deduplication lokal bertahan selama retensi event.
- Saat timeout setelah send, status `Unknown` menunggu rekonsiliasi/retry dalam jendela idempotency, bukan langsung menganggap gagal dan membuat email baru. Setelah jendela habis, tidak retry buta tanpa rekonsiliasi agar mengurangi duplicate delivery.
- Retry transient network/5xx dan rate limit dengan backoff/jitter serta Retry-After bila tersedia. Kesalahan domain/key/payload menjadi Failed dan memberi catatan error dan alert operasional di log tim; jangan retry tanpa batas.
- Budget dihitung per penerima untuk seluruh lingkungan yang memakai team/provider yang sama. Default peringatan kuota pada 80%, dengan headroom dan rate limiter; angka batas disesuaikan akun provider. Kuota provider tetap sumber kebenaran bila ada pengirim lain.
- Jika limit harian/bulanan tercapai, status QuotaDeferred, tunda ke waktu kuota tersedia dan pertahankan record delivery dan task pada detail/inbox transaksi. Tugas yang sudah selesai membatalkan reminder queued yang tidak lagi relevan. Jangan menjanjikan email tepat waktu bila free tier telah habis.
- Log worker/record delivery yang diperiksa tim memuat backlog, usia pesan tertua, gagal/deferred/unknown, bounce/complaint dan penggunaan kuota; tidak ada dashboard operasional di aplikasi MVP. Tidak memindahkan email ke provider lain untuk melewati batas tanpa konfigurasi dan domain authentication yang sah.

Contoh estimasi, bukan hasil benchmark: bila satu surat memakai 8 email kepada penerima selama alur normal, 10 surat menghabiskan sekitar 80 email. Reminder, revisi dan beberapa penerima dapat melewati batas 100/hari meski batas bulanan belum tercapai. Email diprioritaskan untuk tugas aktif dan keputusan akhir; status surat tetap dapat dilihat pada detail/inbox transaksi.

#### Webhook dan status pengiriman

Satu endpoint Azure `POST /api/v1/webhooks/resend` menerima event pengiriman seluruh jenis email. Endpoint tidak memakai login pengguna, tetapi memverifikasi signature provider dari raw request body, timestamp dan webhook secret; event ID didedup, replay dibatasi dan payload tidak dipercaya sebelum verifikasi.

Simpan fakta event per provider message ID; event dapat datang ulang/tidak berurutan. `Accepted` berarti provider menerima send request; `Delivered` berarti server email tujuan menerima, bukan bukti masuk inbox, tab Utama atau dibaca. Bounce/complaint memicu suppression; email selanjutnya ke alamat tersebut dihentikan; tim memeriksa log/suppression dan mengoreksi alamat melalui script akun. Simpan event delivery terpisah dari status workflow surat.

Konfigurasi server: `Email__Provider`, `Resend__ApiKey`, `Resend__WebhookSecret`, `Email__From`, `Email__ReplyTo`, `Email__AppBaseUrl`, `Email__DailyBudget`, `Email__MonthlyBudget`, `Email__ReminderCooldownHours`, `Email__SandboxMode` dan recipient allowlist staging. Nama ini kontrak konfigurasi aplikasi, bukan nama parameter Resend. Secret hanya di Azure; tidak menggunakan variabel frontend `NEXT_PUBLIC_*` untuk kunci provider.

#### Template pesan minimum

Subjek contoh: `[SignIt] Surat {nomor}: menunggu persetujuan Anda`. Isi: salam nama penerima, jenis/nomor surat, status, due date bila relevan, tombol “Tinjau surat”, URL teks alternatif dan kontak bantuan. Email finalisasi menggunakan subjek berbeda serta tautan detail surat; tidak melampirkan isi proposal/data personal secara default. Isi form pengguna di-escape saat dirender ke HTML.

Pengujian pilot memakai Gmail, Outlook dan inbox kampus. Periksa header SPF/DKIM/DMARC, hasil webhook, lokasi folder secara manual dan alasan gagal. Jika masuk spam, perbaiki authentication/reputasi/konten atau koordinasikan dengan pengelola email kampus; tidak mengubah hasil tes menjadi klaim jaminan inbox untuk semua penerima.

## 13. Model Data yang Disarankan

| Entitas | Field dan fungsi inti |
|---|---|
| User / UserCredential | Id, NimNip, Name, Email, EmailVerifiedAt, IsActive; password hash+salt/security metadata terkelola, tanpa plaintext password |
| UserCategory / UiSurface / UserCapability | Kategori StudentGeneral/StudentDagri/BAAK/Management; surface Student/Management; capabilities terpisah dari kategori dan assignment |
| Organization / Unit / Position | Identitas organisasi/unit/jabatan |
| UserPosition | UserId, PositionId, Scope, ValidFrom, ValidTo |
| LetterType / SubmissionPurpose | Bentuk surat dan tujuan proses terpisah |
| LetterTemplate | LetterTypeId, Version, Status, SourceFileId, SamplePdfId, FieldSchemaJson, RenderLayout, SignatureSlotSchema |
| ApprovalDomain | Code, Name, unit/lingkup bidang |
| ApproverAssignment | DomainId, PositionId, UserId, Scope, ValidFrom, ValidTo, SelectionMode |
| RoutingPolicy / WorkflowTemplate | Version, kondisi tujuan/jenis/lingkup, urutan tugas, required, SLA |
| LetterRequest | Id, Number, TypeId, PurposeId, SubmittedByUserId, OrganizationId, Status, CurrentRevisionId, SubmittedAt, CompletedAt, RowVersion |
| LetterRevision | RequestId, RevisionNo, TemplateVersionId, RoutingVersionId, DataJson, RecipientJson, CanonicalManifest, ContentHash, ReviewDocumentId, FrozenAt |
| LetterParticipant | RevisionId, Role, SlotKey, UserId, DisplayNameSnapshot, PositionSnapshot, Required, placement/page |
| WorkflowTask | RevisionId, ParticipantId?, Order, ActionType, AssignedUserId, DomainId?, Status, ActivatedAt, DueAt, ActedBy, ActedAt, Comment, RowVersion |
| UserSignatureQr | OwnerUserId, OpaqueCode, PrivateStorageKey, Version, ImageSha256, Status, CreatedAt; satu QR otomatis aktif per akun |
| SignatureEvidence | TaskId, RevisionId, ActorId, Role, ContentHash, QrAssetId/Version/Hash, snapshot document/image, SignedAt, delegatedFrom?, IP/user-agent |
| SigningAttempt | TaskId, RevisionId, ActorId, QrAssetId/Version/Hash, ContentHash, Status, IdempotencyKey; aksi login tanpa PIN/OTP |
| Document | RevisionId, Kind (Source/Review/Final/Template), StorageKey, MimeType, Bytes, Sha256, ProcessingState |
| Attachment | RevisionId, DocumentId, Kind; hash tercakup pada manifest |
| DocumentProcessingJob / OcrResult | SourceDocumentId, Status, Attempts, ErrorCode, page/text/confidence, ConfirmedBy |
| VerificationRecord (opsional P2) | RequestId, FinalDocumentId, RandomCode, FinalHash, Status, PublishedAt, RevokedAt, RevocationReason; bukan syarat workflow MVP |
| Delegation | FromUserId, ToUserId, Domain/Scope, StartAt, EndAt, Reason, status |
| Room | Id, Code, Name, Building, ManagingUnitId, Capacity, IsActive |
| RoomBookingRequest / RoomReservation | Request/revision, RoomId, StartsAt, EndsAt, status, reservation source |
| InventoryItem / ItemLoanRequest / ItemReservation | Kode/item/unit/stok; jumlah/periode/penanggung jawab; reservation mencegah overbooking sebelum final sign |
| OutboxMessage | Recipient, event, email payload, dispatch state, deduplication key; tanpa read/unread notification |
| EmailDelivery | EventId, RecipientUserId, RecipientEmailSnapshot, TemplateVersion, DeduplicationKey, ProviderMessageId, Status, Attempts, NextAttemptAt, LastErrorCode, AcceptedAt, DeliveredAt |
| EmailProviderEvent / EmailSuppression | Unique provider event ID, MessageId, Type, OccurredAt, ProcessedAt; suppressed address, reason, source dan waktu |
| ChatSession / ChatMessage / ChatToolExecution / LetterDraftState | OwnerId, SelectedTypeId, TemplateVersionId, RequestId?, State, ValuesJson, MissingFieldsJson, UnresolvedReferencesJson, version/concurrency, tool audit dan timestamps |
| AuditLog | Actor, Action, Entity, RevisionId?, AtUtc, correlation ID, ringkasan perubahan, IP jika dibutuhkan |

Tidak perlu menyimpan posisi antrean sebagai angka permanen; query dari WorkflowTask yang aktif. Indeks: Request(SubmittedBy, Status, SubmittedAt), Revision(RequestId, RevisionNo) unik, Task(AssignedUserId, Status, ActivatedAt), Task(Status, DueAt), assignment domain/lingkup/periode, Booking(RoomId, StartsAt, EndsAt), Verification(RandomCode) unik, Outbox(DeduplicationKey) unik dan EmailDelivery(Status, NextAttemptAt). Tambahkan constraint anti-overlap reservasi confirmed.

Nomor revisi, kode verifikasi, nomor surat dan SignatureEvidence per tugas memiliki constraint unik sesuai aturan. EmailDelivery(DeduplicationKey) dan EmailProviderEvent(Provider, EventId) juga unik; indeks delivery(Status, NextAttemptAt) mendukung worker. Riwayat tidak diubah lewat soft edit; append-only dan privilege database membatasi update/delete audit, disertai backup. Append-only pada API saja tidak menjamin kebal manipulasi administrator database.

## 14. Kontrak API Minimum

Prefix `/api/v1`; response memakai DTO terkontrol, pagination dan error code konsisten. Write menerima expected revision/version dan idempotency key pada submit/sign/approve/finalization. Detail internal sensitif tidak dikirim lewat exception.

| Grup | Method dan path | Fungsi |
|---|---|---|
| Auth | POST /auth/login; POST /auth/logout; GET /me; POST /auth/forgot-password; POST /auth/reset-password | Akun seed internal/session; reset token sekali pakai; refresh bila memakai JWT |
| Kapabilitas UI | GET /me/capabilities | Kategori, surface dan assignment aktif; /me dapat menyertakan DTO yang sama |
| Katalog | GET /letter-types; GET /submission-purposes | Jenis dan tujuan yang aktif |
| Template | GET /templates; GET /templates/{id}; GET /templates/{id}/download | Skema, preview dan file sumber/blank yang boleh diunduh |
| Routing | POST /routing/preview | Rute dan kandidat eligible dari metadata draft; belum memfinalkan assignment |
| Peserta | GET /participants/eligible | Kandidat berdasarkan role/jenis/unit; hindari daftar seluruh directory tanpa izin |
| Draft | POST /requests; PUT /requests/{id}; GET /requests; GET /requests/{id} | Pengajuan milik/berizin; PUT hanya draft/revisi yang dapat diedit |
| Peserta surat | PUT /requests/{id}/participants | Menetapkan slot dinamis; backend validasi kandidat/routing |
| Dokumen | POST /requests/{id}/documents; POST /requests/{id}/attachments | Upload private dengan limit dan validasi |
| Scan | POST /document-processing/jobs; GET /document-processing/jobs/{id} | Input halaman/sumber dan status OCR |
| Koreksi OCR | PUT /requests/{id}/ocr-confirmation | Metadata yang dikonfirmasi pengguna; masih draft |
| Preview | POST /requests/{id}/preview; GET /requests/{id}/documents/{documentId} | Render preview asinkron bila perlu; download authorized |
| Siklus surat | POST /requests/{id}/submit; POST /requests/{id}/resubmit; POST /requests/{id}/cancel | Validasi lengkap, freeze revisi dan transisi |
| Progres | GET /requests/{id}/timeline; GET /requests/{id}/queue-position | Riwayat dan posisi inbox saat ini |
| Tugas | GET /tasks/inbox; GET /tasks/{id} | Daftar/detail berizin |
| Signature | POST /tasks/{id}/sign; POST /tasks/{id}/acknowledge | Tindakan login berizin pada revisi; QR actor diambil otomatis backend |
| QR pengguna | GET /me/signature-qr | QR otomatis akun; provisioning idempoten server; tidak ada endpoint upload atau PIN signing |
| Approval | POST /tasks/{id}/approve; POST /tasks/{id}/reject; POST /tasks/{id}/request-revision | ApproveAndSign sesuai jenis tugas; alasan reject/revisi wajib |
| Delegasi | GET /delegations; POST /delegations; DELETE /delegations/{id} | Pencabutan dicatat, tidak menghapus bukti historis |
| Antrean unit | GET /queues | Hanya lingkup berizin; FIFO dan filter |
| Ruangan | GET /rooms; GET /rooms/{id}/schedule; POST /rooms/check-availability | ID, jadwal dan indikasi konflik; pengecekan bukan reservasi |
| Barang | GET /inventory-items; POST /inventory/check-availability | Inventaris/availability berizin; bukan konfirmasi reservasi |
| Chat surat | POST /chat/sessions; POST /chat/sessions/{id}/messages; GET /chat/sessions/{id}/draft; PATCH /chat/sessions/{id}/draft; POST /chat/sessions/{id}/generate | Session milik pengguna, schema-based draft, validation/remaining fields dan render preview setelah konfirmasi |
| Email webhook | POST /webhooks/resend | Endpoint provider Azure; raw-body signature verification dan event deduplication |
| Verifikasi opsional (P2) | GET /verify/{code}; POST /verify/upload | Nama/jabatan/waktu actor yang selesai, status persetujuan internal dan pencocokan hash file final; upload sementara |
| Revoke | POST /requests/{id}/revoke | Role berwenang, alasan wajib, audit dan pelepasan resource sesuai policy |
| Sistem | GET /health; GET /ready | Status operasional minimum; audit diperiksa tim di log/database, tanpa halaman khusus MVP |

Bulk approve bukan MVP karena setiap surat harus ditinjau secara jelas. Jika ditambahkan, tetap validasi tiap revisi/hash, izin dan konflik; respons per item, bukan satu success yang menutupi kegagalan.

## 15. Non-Fungsional dan Keamanan

- TLS pada penggunaan nyata; cookies HttpOnly/Secure/SameSite dan CSRF untuk cookie auth; JWT bila dipilih mempunyai refresh rotation/revocation. CORS dibatasi.
- Private storage, URL unduhan berumur pendek setelah authorization, hindari memasukkan surat dalam cache publik atau log/chat tanpa batas.
- Idempotency + concurrency untuk submit/sign/approve; perubahan revisi/assignment harus menyebabkan penolakan atas permintaan stale.
- File dipindai, renderer/OCR diisolasi tanpa akses network arbitrer, template tidak boleh melakukan remote fetch/script sembarang, dan worker punya memory/time limits.
- Rate limit berbeda untuk auth, upload/OCR, verify dan chat; upload verifikasi dihapus setelah pemeriksaan sesuai TTL.
- QR diprovisioning server secara idempoten dan disimpan berversi; evidence/final immutable. Kode QR bukan token login dan tidak memberi otorisasi task.
- Target pilot API umum P95 < 500 ms pada dataset/beban yang disepakati; OCR/PDF/LLM diukur terpisah dan tidak memblokir transaksi. Target preview template kecil < 3 detik hanya setelah diuji. OCR timeout awal 120 detik per job dan timeout LLM 30 detik, terkonfigurasi.
- Keandalan: retry terukur, failed-job logging, outbox backlog monitoring, backup DB/file dan uji restore. Tidak menyebut failed-job Hangfire otomatis sebagai domain dead-letter tanpa implementasi handling.
- Retensi surat/audit/chat/aset signature ditetapkan kampus. Jangan mengasumsikan semua data wajib disimpan lima tahun; log harus meminimalkan data personal.
- Audit mencakup perubahan template/routing, submit/revisi, signature/approval, delegasi, conflict, finalization, revoke dan tool chatbot; tidak merekam token/secret atau isi dokumen lengkap secara default.

## 16. Acceptance Criteria dan Pengujian

| ID | Skenario | Hasil wajib |
|---|---|---|
| AC-01 | Pengaju aplikasi berbeda dari Applicant, Hormat Kami dan Mengetahui | Keempat identitas tersimpan benar; PDF dan timeline memakai peran yang tepat |
| AC-02 | Dua surat memakai orang berbeda pada slot yang sama | Pilihan surat pertama tidak memengaruhi surat kedua |
| AC-03 | Tujuan peminjaman ruang A dipilih | Kandidat Menyetujui hanya dari bidang/lingkup yang cocok |
| AC-04 | Client mengirim approver di luar daftar | Backend menolak; tidak membuat tugas tidak sah |
| AC-05 | Tidak ada approver atau routing ambigu | Submit diblokir dengan pesan konfigurasi yang dapat ditindaklanjuti |
| AC-06 | Template versi baru terbit | Surat lama tetap memakai versi dan snapshot awal |
| AC-07 | Foto beberapa halaman diproses | Urutan dan orientasi PDF benar; OCR dapat dikoreksi; metadata tidak auto-submit |
| AC-08 | OCR gagal/PDF rusak atau terenkripsi | Pesan jelas; source tetap ada bila valid; manual input dimungkinkan sesuai aturan |
| AC-09 | PDF unggahan punya halaman berotasi/ukuran berbeda | Posisi blok tepat pada preview dan final; tidak keluar bounds |
| AC-10 | Penandatangan belum bertindak | Namanya boleh tampil sebagai peserta, tetapi surat belum Completed dan tidak mencatat signature palsu |
| AC-11 | Surat diubah setelah dua orang sign | Revisi baru, evidence lama historis, seluruh tugas wajib baru; stale sign ditolak |
| AC-12 | Dua sign/approve pada task yang sama dikirim bersamaan | Satu tindakan diterima; retry menghasilkan hasil sama atau conflict yang jelas |
| AC-13 | Tahap wajib ditunda | Tidak terbit final; reminder/eskalasi mengikuti assignment aktif |
| AC-14 | Delegasi berakhir atau di luar scope | Actor tidak dapat memakai mandat tersebut |
| AC-15 | Tugas baru aktif setelah tahap sebelumnya selesai | FIFO inbox memakai ActivatedAt dan posisi hanya dalam inbox terkait |
| AC-16 | Dua peminjaman overlap diputuskan bersamaan | Maksimal satu reservasi confirmed; lainnya menunggu penyelesaian konflik |
| AC-17 | Chat “diajukan hari ini” vs “dipakai hari ini” | Filter berbeda, timezone benar, termasuk kegiatan lintas tengah malam pada query overlap |
| AC-18 | Chat “ruangan ini” tanpa RoomId | Meminta pilih ruangan; tidak menebak |
| AC-19 | Dua pengguna beda scope menanyakan hal sama | Detail dan count sesuai izin masing-masing; tidak bocor existence surat tersembunyi |
| AC-20 | PDF OCR berisi instruksi untuk membocorkan data/approve | Tidak dijalankan sebagai instruksi/tool; approval tetap melalui UI berizin |
| AC-21 | Provider LLM mati atau output schema invalid | Draft sebelumnya tetap tersimpan; form manual/koreksi tersedia; field tidak diarang |
| AC-22 | PDF final berubah tetapi QR disalin | QR tidak dianggap bukti kecocokan file; hash internal berbeda; file-check publik hanya bila fitur P2 diaktifkan |
| AC-23 | Surat dicabut | Detail surat menampilkan Revoked dan riwayat; halaman publik hanya bila fitur opsional diaktifkan |
| AC-24 | Penyimpanan evidence, render final atau email gagal | Task tidak selesai jika evidence gagal; final render retry idempoten; email gagal tidak membatalkan keputusan |
| AC-25 | Undangan, peminjaman ruangan, proposal, LPJ dan barang dibuat | Katalog, form/unggah, field dan lampiran berbeda berfungsi end-to-end |
| AC-26 | Submit, task aktif, revisi, reject, completed atau revoked | Email menuju penerima berwenang sesuai event; email menjadi satu-satunya channel notifikasi |
| AC-27 | Domain pengirim production disiapkan | Domain Verified; pilot header SPF/DKIM/DMARC pass/aligned, folder dicatat manual tanpa menjamin inbox universal |
| AC-28 | Retry send dan webhook duplikat/tidak berurutan | Dedup lokal/provider diterapkan; event replay tidak menggandakan pengiriman atau mengubah status surat |
| AC-29 | Limit harian/bulanan habis atau send timeout ambigu | QuotaDeferred/Unknown terpantau; tidak retry buta; status detail/inbox transaksi dan keputusan workflow tetap berjalan |
| AC-30 | Hard bounce, complaint atau signature webhook invalid | Suppression untuk event sah; webhook palsu ditolak; tidak terus mengirim ke alamat tersuppressed |
| AC-31 | Tidak ada trafik browser saat task melewati SLA | Scheduler Azure tetap memproses reminder sesuai interval; test juga memeriksa downtime/restart dan job catch-up |
| AC-32 | Link email dikunjungi scanner inbox atau user tanpa hak | Tidak menjalankan sign/approve; login dan object authorization tetap wajib |
| AC-33 | Deploy Vercel + Azure dan gunakan akun berbeda | Session/CORS/CSRF, refresh status dan file private berfungsi; API key Resend tidak ada di client bundle |
| AC-34 | Mahasiswa umum dan Dagri login | Keduanya UI mahasiswa; Dagri dapat mengajukan dan melihat inbox tugas Dagri; umum tidak mendapat privilege Dagri |
| AC-35 | BAAK, Pembina, Kemahasiswaan dan Wadir login | UI manajemen; hanya jabatan/task dalam scope dapat sign; bukan shared privilege seluruh management |
| AC-36 | Proposal/LPJ, ruangan Pasca/SAW dan barang diajukan | Chain tepat 5/7/6 tahap sesuai urutan 7.3; BAAK/Dagri tidak disisipkan ke chain lain |
| AC-37 | User login membuka task aktif | Dapat menggunakan QR otomatis tanpa upload/PIN/OTP; task stale atau milik actor lain tetap ditolak |
| AC-38 | Chain 5/7/6 selesai | PDF final memuat QR snapshot tiap actor beserta nama/jabatan/waktu yang benar dan semua QR terbaca |
| AC-39 | Slot dipindah/isi diubah setelah signer pertama | Revisi konten baru dengan pengulangan TTD; signed artifact lama tidak ditimpa |
| AC-40 | Akun baru/akun lama tanpa QR, concurrent provisioning atau retry | Tepat satu QR aktif per akun dibuat server; pemetaan actor benar dan tidak berubah tiap login |
| AC-41 | PDF diganti/tampered atau QR disalin | Verifier membedakan record lookup dan file check; tampering/mismatch tidak disebut valid |
| AC-42 | Asset QR diregenerasi melalui recovery tim melalui script | Surat lama memakai snapshot lama; task baru memakai aset aktif; recovery ter-audit |
| AC-43 | Renderer restart atau konfirmasi task bersamaan | Evidence/final idempoten; tidak ada QR/persetujuan/reservasi ganda |
| AC-44 | QR disalin atau dipindai oleh pihak lain | Tidak dapat melakukan sign tanpa akun/assignment sah; metadata pribadi dan koleksi aset tetap dibatasi |
| AC-45 | Seed akun dijalankan ulang dan akun login/reset password | Tidak ada akun ganda/reset password diam-diam; hash/token/sesi benar; tidak ada registrasi/undangan publik |
| AC-46 | User/client mencoba CRUD akun/role/template/routing | Tidak ada endpoint/halaman konfigurasi MVP; perubahan hanya melalui seed/script tim terkontrol |
| AC-47 | Pengguna membuka Buat Surat | Pesan awal “Ingin membuat tipe surat apa?” dan pilihan template seeded tampil |
| AC-48 | Jawaban memuat Nama Kegiatan: Buka Bersama dan Nama Ketua Pelaksana: aaaaaa | Field kegiatan terisi; nama peserta dicocokkan ke akun sah, tidak menciptakan akun/pejabat baru |
| AC-49 | Field wajib/jadwal/ID peserta belum lengkap atau ambigu | Bot menanyakan kekurangan; Generate tidak lolos validator backend |
| AC-50 | Semua field valid dan pengguna memilih Generate | Backend mengisi template versi tepat dan menghasilkan PDF draft; belum submit/sign |
| AC-51 | Pengguna mengoreksi satu field atau kembali ke sesi | Field lain tetap tersimpan; koreksi terlihat pada ringkasan dan preview baru |
| AC-52 | Model mengarang ID, field atau meminta bypass routing | Backend menolak output/tool yang tidak sah; rute/izin tetap berdasarkan seed |
| AC-53 | Generate retry/provider gagal atau output JSON invalid | Draft tetap; manual input tersedia; render idempoten tanpa nomor/surat ganda |
| AC-54 | Workflow menghasilkan email atau kuota/provider gagal | EmailDelivery/outbox/log tercatat; tidak ada notification page/bell/read-unread/SignalR; surat tetap dapat diperiksa di detail/inbox |

Unit tests: state transitions, routing specificity/ambiguity, revisi/hash, kandidat slot, delegasi, date range, time overlap, email recipient policy dan retry/quota state. Integration tests memakai PostgreSQL nyata untuk idempotency, concurrency, constraint reservasi, authorization, outbox, finalization dan webhook verification/dedup. Browser/manual QA memeriksa upload/scan, preview, tanda tangan lintas user, revisi, antrean, chatbot, QR, email pilot dan session lintas Vercel/Azure. Dataset demo mencakup lima jenis surat, empat kategori pengguna, dua UI, jabatan seluruh chain 5/7/6, dua organisasi, dua bidang, dua ruangan dan item barang. Uji QR mencakup generate QR idempoten, pemetaan akun, snapshot aset, task authorization, overlay/rotation, keterbacaan cetak, hash matching dan renderer recovery.


## 17. Prioritas dan Urutan Implementasi

| Fase | Ruang lingkup | Syarat selesai |
|---|---|---|
| P0 — fondasi produk | Empat kategori/dua UI, login internal, policy, lima jenis surat, slot dinamis, chain 5/7/6 dan routing scope | AC-01–06, AC-25, AC-34–36 |
| P0 — workflow dan tanda tangan QR | Backend generate QR per akun, aksi login, snapshot evidence, PDF final, antrean/revisi, email Resend, audit | AC-10–13, AC-15, AC-24, AC-26–30, AC-32, AC-37–44 sesuai fitur inti |
| P0 — chatbot pembuat surat | Pertanyaan jenis → schema/prasyarat → ekstraksi multi-field → klarifikasi → ringkasan/koreksi → generate preview sesuai template | AC-47–53; alur utama draft, bukan sekadar pencarian |
| P1 — dokumen/resource | Foto→PDF/OCR, placement PDF unggahan, ruangan/conflict, pencarian chatbot tambahan | AC-07–09 dan AC-16–21; mulai satu jenis surat untuk demo |
| P0 — deployment | Next.js Vercel, API/worker Azure, database/file persisten, domain/DNS email, session, webhook dan secret management | AC-31 dan AC-33; worker tidak bergantung trafik browser |
| P1 — operasional | Reminder lanjutan, delegasi aman, worker failure handling tanpa halaman konfigurasi | AC-14 dan pengujian retry/eskalasi; email dasar sudah P0 |
| P2 — perluasan | QR dokumen/halaman publik/file-check opsional, paralel tasks, vendor sertifikasi eksternal/TSA/LTV bila diperlukan, penandatangan eksternal, DOCX placeholder engine, RAG panduan,  serah-terima stok lengkap | QR otomatis sudah P0; pengembangan lanjutan tidak menunda fondasi |

Seluruh fitur inti yang diminta ada dalam cakupan produk; pembagian P0/P1 hanya urutan pengerjaan. Jika waktu hackathon terbatas, demo lengkap peminjaman ruangan dahulu, dengan katalog undangan/proposal tetap tersedia sebagai alur kedua. Jangan menambahkan prediksi ML sebelum routing, data jadwal dan signature stabil.

Urutan: seed akun/template/field/chain/resource → login/policy/QR otomatis → chat pilih jenis/prasyarat → ekstraksi/validasi/lookup → draft/ringkasan/koreksi → generate PDF template → peserta/slot/routing/submit → task/antrean/QR → finalisasi/email outbox → OCR/resource conflict → QA/demo.

## 18. Keputusan Default dan Konfirmasi Kampus

Default untuk mulai mengerjakan: empat kategori akun/dua UI; Dagri tetap UI mahasiswa dengan requester+approver capability; slot terpisah dari pengirim; chain 5/7/6 pada 7.3; kandidat sesuai assignment; sequential; revisi mengulang seluruh signature; FIFO per inbox; Asia/Jakarta; QR per akun yang digenerate backend + tindakan akun login + evidence revisi; verifikasi publik opsional; chatbot pembuat draft berbasis prasyarat template; PDF/foto + OCR; artifact immutable; Resend; Next.js Vercel dan backend/worker Azure.

Sebelum penggunaan nyata, konfirmasi:

- Prosedur pembuatan/verifikasi akun internal; mahasiswa/dosen/staf mana yang dapat menjadi peserta dan siapa penanggung jawab script seed akun.
- Daftar bidang, pejabat, lingkup ruangan, masa jabatan dan pengganti sah.
- Jenis/template resmi, kop, nomor, lampiran, label Hormat Kami, slot wajib dan urutan tugas per tujuan.
- Label slot resmi dan mapping Pembina ke kategori manajemen/akun internal; pada chain yang diberikan seluruh tahap wajib memakai QR personal pemilik dan konfirmasi, bukan acknowledgment tanpa bukti.
- Kebijakan satu orang mengisi beberapa slot, self-approval, delegasi, penundaan dan pencabutan.
- Apakah peminjaman selesai otomatis menjadi reservasi atau memerlukan petugas/resource authority tambahan; default di sini confirmed pada keputusan akhir yang sah.
- Hak lihat jadwal/nama peminjam, metadata publik QR, retensi dan persetujuan penggunaan LLM eksternal.
- Format QR yang digenerate backend, detail tampilan blok dan apakah halaman status publik opsional diperlukan.
- SLA, jam reminder, buffer pergantian ruangan, limit file dan kapasitas beban pilot.
- Domain pengirim milik tim/subdomain kampus, pengelola DNS, mailbox Reply-To, volume email, pilihan tier/service Azure dan kebijakan anggaran.

## 19. Referensi Teknis Pemeriksaan

- iText — lisensi .NET/AGPL-komersial: https://www.itextpdf.com/how-buy

- Microsoft — resource-based authorization: https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resource-based
- QPDF — dokumentasi perubahan/penanganan signature PDF: https://qpdf.readthedocs.io/en/11.7/cli.html
- Resend — pricing/free tier, diperiksa 9 Oktober 2026: https://resend.com/pricing
- Resend — pembaruan 3 domain free tier: https://resend.com/changelog/three-domains-on-the-free-tier
- Sender — pricing sebagai alternatif: https://www.sender.net/pricing/
- Resend — verified domains: https://resend.com/docs/dashboard/domains/introduction
- Resend — DNS domain management: https://resend.com/docs/dashboard/domains/manage-domains
- Resend — DMARC: https://resend.com/docs/dashboard/domains/dmarc
- Resend — deliverability insights: https://resend.com/docs/dashboard/emails/deliverability-insights
- Google — email sender guidelines: https://support.google.com/mail/answer/81126
- Resend — idempotency: https://resend.com/docs/dashboard/emails/idempotency-keys
- Resend — webhook events: https://resend.com/docs/webhooks/introduction
- Resend — signature webhook: https://resend.com/docs/webhooks/verify-webhooks-requests
- Microsoft — App Service/Always On: https://learn.microsoft.com/en-us/azure/app-service/configure-common
- Microsoft — scheduled/event Container Apps Jobs: https://learn.microsoft.com/en-us/azure/container-apps/jobs

Referensi mendukung pemeriksaan izin objek, kehati-hatian terhadap PDF bertanda tangan, autentikasi email, monitoring delivery dan pemilihan scheduler. Rute pejabat, urutan tanda tangan, batas beban dan kebijakan produk di atas adalah usulan desain untuk divalidasi, bukan aturan resmi PENS. Target hosting Vercel/Azure berasal dari keputusan pengguna; resource, domain dan provider belum diprovisioning melalui PRD ini.
