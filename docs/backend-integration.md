# Integrasi dan routing

Frontend memakai BFF same-origin `/api/v1/*`; `/api/backend/*` merupakan alias kompatibilitas dengan cookie dan refresh yang sama. `BACKEND_URL` hanya dibaca server Next.js. Konfigurasi proyek ini menunjuk backend Azure; tidak ada fallback otomatis ke localhost. Browser tetap memanggil origin frontend, lalu Next.js meneruskan permintaan ke Azure.

Login memakai akun provisioned. Cookie `signit_at` dan `signit_rt` bersifat HttpOnly, SameSite=Lax, Secure pada production. Token tidak diberikan sebagai JSON ke browser dan tidak disimpan di localStorage. Mutasi BFF memeriksa Origin. Refresh single-flight dipisahkan berdasarkan hash token sesi; tiap response menulis cookie hasil rotasi sendiri. Koordinasi ini berlaku dalam satu proses Next.js; deployment multi-instance membutuhkan koordinasi bersama sebelum mengklaim refresh serentak lintas instance aman.

| Route | Tujuan |
|---|---|
| `/login` | Login; `next` internal diperiksa sebelum navigasi |
| `/` | Dashboard mahasiswa/Dagri; manajemen dialihkan ke `/manajemen` |
| `/manajemen` | BAAK/manajemen; mahasiswa dialihkan ke dashboard sendiri |
| `/persetujuan` | Inbox mahasiswa dengan capability Signer/Approver, termasuk Dagri |
| `/staff` | Alias lama: menuju `/manajemen` atau `/persetujuan` sesuai sesi |
| `/surat`, `/surat/[id]` | Daftar/detail berizin; backend memeriksa akses per objek |
| `/surat/baru` | Asisten/form dari schema backend; Generate dan Ajukan terpisah |
| `/pengajuan` | Alias ke `/surat/baru`, tanpa formulir login kedua |
| `/forgot-password`, `/reset-password` | Pemulihan akun |

SessionProvider mengecek ulang `/me` saat pathname berubah, mengabaikan hasil dari halaman lama, dan menahan halaman privat sampai sesi diperiksa. Hanya 401 berarti perlu login; kegagalan jaringan/server menampilkan Coba lagi. Guard navigasi UI bukan pengganti otorisasi backend. Kategori tidak memberikan hak bertindak pada tugas orang lain.

Routing persetujuan tetap dihitung backend: Proposal/LPJ lima tahap; barang enam tahap; Pasca/SAW enam tahap tanpa Dagri; D3/D4/lapangan tujuh tahap dengan Dagri. Himpunan memakai Kemahasiswaan, Organisasi memakai Tim Pembina Minat dan Bakat. Semua pejabat approver diblokir dari self-approval. Peserta Ketua Pelaksana/Ketua Organisasi dipilih dari akun eligible, tidak otomatis sama dengan pengaju.

Assignment UAT mulai 10 Oktober 2026 pukul 00.00 WIB. Seed awal keliru memakai 00.00 UTC (07.00 WIB); koreksi ter-audit tersedia dalam `backend/provisioning/uat-assignment-start.sql`. Backend server harus diperbarui dan seed yang direvisi dijalankan sebelum menguji perubahan backend/master data di Azure. Password lama tidak direset.

Gunakan HTTPS untuk deployment publik. Alamat `.example` tidak menerima email; tes notifikasi memerlukan sandbox/alamat terkontrol. Jangan menganggap build atau tes routing sebagai bukti seluruh fitur PRD (misalnya OCR dan reservasi barang) sudah selesai.
