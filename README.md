This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Integrasi backend (SignIt API)

Frontend memakai pola **BFF**: route handler `app/api/v1/[...path]` meneruskan
request ke backend ASP.NET Core, sementara token JWT disimpan di cookie
HttpOnly (`signit_at`, `signit_rt`). Browser tidak pernah memegang token.

Konfigurasi yang dibutuhkan (server-only, jangan pakai prefix `NEXT_PUBLIC_`):

| Variabel | Contoh | Keterangan |
|---|---|---|
| `SIGNIT_API_BASE_URL` | `http://localhost:5217` | Base URL backend, tanpa `/api/v1` |

- Lokal: buat `.env.local` berisi `SIGNIT_API_BASE_URL=http://localhost:5217`
  (backend `dotnet run --launch-profile http`).
- Deployment (Vercel): set `SIGNIT_API_BASE_URL` ke URL HTTPS backend publik.
- Route terproteksi: `proxy.ts` mengarahkan pengunjung tanpa cookie sesi ke
  `/login?next=...`; otorisasi sebenarnya tetap divalidasi backend per request.
- Login/logout/forgot/reset memakai Server Action di `lib/auth/actions.ts`.
- Klien API bertipe ada di `lib/api/*` (DTO, error `problem+json`, unduhan blob).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
