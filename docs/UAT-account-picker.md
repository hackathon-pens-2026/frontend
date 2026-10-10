# Pilih akun dengan backend

Pemilih akun menggunakan login API yang sudah ada; JWT hanya disimpan dalam cookie HttpOnly. Tidak ada penghapusan otorisasi backend atau endpoint impersonasi publik.

Konfigurasi server frontend (bukan NEXT_PUBLIC):

```dotenv
BACKEND_URL=https://signit.indonesiacentral.cloudapp.azure.com
UAT_ACCOUNT_PICKER_ENABLED=false
UAT_ACCESS_KEY=
UAT_ACCOUNT_PASSWORD=
```

Aktifkan `UAT_ACCOUNT_PICKER_ENABLED=true` hanya pada deployment testing terisolasi. Gunakan kode akses acak minimal 32 karakter yang berbeda dari password akun; bagikan hanya kepada penguji berwenang. Password harus sesuai akun UAT yang telah diprovision di database backend. Semua akun dalam pemilih saat ini memakai password UAT yang sama, tetapi email dibatasi daftar akun pada `lib/auth/personas.ts`.

Penguji memasukkan kode akses pada panel Pilih akun, lalu memilih akun. Kode tidak disimpan di localStorage. Setelah refresh identitas dipulihkan dari `/me`; kode perlu dimasukkan lagi untuk mengganti akun. Kesalahan koneksi/kredensial tidak menghasilkan identitas palsu atau data simulasi.

Jangan aktifkan pada deployment publik produksi. Gunakan HTTPS, batasi jaringan/deployment dan matikan pengiriman email nyata untuk testing. Tidak ada env/secret server yang diubah otomatis oleh implementasi ini.

Draft lama dengan ID `draft-sim-*` bukan record database. Buat ulang sebagai draft backend. Preview baru berasal dari renderer template backend, bukan ringkasan field HTML.
