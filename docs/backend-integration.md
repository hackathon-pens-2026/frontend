# Integrasi backend

Frontend menggunakan `/api/backend/*` sebagai boundary same-origin. `BACKEND_URL` hanya dibaca server Next.js: lokal `http://localhost:8080`, Compose `http://backend:8080`. Salin `.env.example` menjadi `.env.local` untuk pengembangan lokal, lalu restart frontend.

`/pengajuan` menyediakan login akun provisioned, katalog schema empat template, organisasi yang diizinkan, kandidat Ketua Pelaksana/Ketua Organisasi, fasilitas/ruangan, simpan/edit draft, routing preview, Generate, polling dan download preview, lalu submit terpisah. Versi/revisi/hash serta slot PDF berasal dari backend. Idempotency-Key submit dipertahankan saat retry pada halaman yang sama.

Token akses disimpan sebagai cookie HttpOnly SameSite=Lax; mutasi memeriksa Origin. Token/refresh token tidak dikirim sebagai JSON ke browser dan tidak disimpan di localStorage. Cookie Secure digunakan untuk akses HTTPS. Sesi kedaluwarsa memerlukan login ulang; refresh otomatis belum diimplementasikan. Gunakan HTTPS untuk deployment publik.

Backend yang gagal startup JWT tidak dapat melayani integrasi ini. Katalog template membutuhkan aset template tersedia pada backend. Jangan menampilkan data contoh sebagai hasil API.

Belum terhubung: dashboard/riwayat surat (API list belum tersedia), UI tugas manajemen/delegasi, timeline, finalisasi/download final dan chatbot. Komponen desain sebelumnya tetap tersimpan, tetapi root sementara membuka alur pengajuan yang sudah menggunakan API.

Draft disimpan di backend setelah Generate ditekan. ID draft ditampilkan; pemulihan draft setelah reload belum tersedia melalui UI. Input yang belum disimpan akan hilang ketika halaman ditutup. Jadwal/bentrok reservasi mengikuti implementasi backend yang terpisah, bukan disimpulkan oleh frontend.
