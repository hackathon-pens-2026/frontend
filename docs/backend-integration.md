# Integrasi backend

Frontend menggunakan `/api/backend/*` sebagai boundary same-origin. `BACKEND_URL` hanya dibaca server Next.js: lokal `http://localhost:8080`, Compose `http://backend:8080`. Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal, lalu restart frontend.

`/pengajuan` menyediakan login akun provisioned, katalog schema empat template, organisasi yang diizinkan, kandidat Ketua Pelaksana/Ketua Organisasi, fasilitas/ruangan, simpan/edit draft, routing preview, Generate, polling dan download preview, lalu submit terpisah. Versi/revisi/hash serta slot PDF berasal dari backend. Idempotency-Key submit dipertahankan saat retry pada halaman yang sama.

Token akses disimpan sebagai cookie HttpOnly SameSite=Lax; mutasi memeriksa Origin. Token/refresh token tidak dikirim sebagai JSON ke browser dan tidak disimpan di localStorage. Cookie Secure digunakan untuk akses HTTPS. Sesi kedaluwarsa memerlukan login ulang pada BFF `/api/backend` ini; refresh otomatis tersedia pada BFF utama `/api/v1`. Gunakan HTTPS untuk deployment publik.

Backend yang gagal startup JWT tidak dapat melayani integrasi ini. Katalog template membutuhkan aset template tersedia pada backend. Jangan menampilkan data contoh sebagai hasil API.

Alur `/pengajuan` ini tetap tersedia sebagai katalog/ajuan ringkas. Area utama aplikasi (`/`, `/surat`, `/surat/[id]`, `/staff`, `/manajemen`) memakai BFF `/api/v1` (cookie HttpOnly access+refresh dengan single-flight refresh) dan mencakup dashboard, daftar/detail surat, inbox tugas, serta unduhan dokumen; integrasi chatbot/LLM di frontend belum dihubungkan.

Draft disimpan di backend setelah Generate ditekan. ID draft ditampilkan; pemulihan draft setelah reload belum tersedia melalui UI. Input yang belum disimpan akan hilang ketika halaman ditutup. Jadwal/bentrok reservasi mengikuti implementasi backend yang terpisah, bukan disimpulkan oleh frontend.
