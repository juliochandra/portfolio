# Portfolio Developer

CMS ringan (Next.js App Router) untuk mengelola portfolio developer:
project, tulisan, keahlian, tag, media, info kontak, dan pesan masuk.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript 7 (strict) · Tailwind CSS 4 ·
react-icons · Cloudflare D1 (SQLite) · Prisma 7 · Cloudflare R2 · Zod 4 ·
React Hook Form 7 · Vitest 4 · Playwright 1 · Biome 2.

## Prasyarat

- Node.js
- npm
- Akun [Cloudflare](https://dash.cloudflare.com/) dengan akses Workers dan D1
- Bucket [Cloudflare R2](https://developers.cloudflare.com/r2/) (sandbox/dev)

> Untuk `npm run preview` dan deploy, gunakan WSL atau CI Linux. OpenNext Cloudflare tidak sepenuhnya kompatibel dengan Windows native.

## Setup

```bash
npm install
cp .env.example .env
# isi R2_PUBLIC_URL, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_ACCESS_SECRET
# & JWT_REFRESH_SECRET di .env dengan nilai Anda sendiri

# Login ke Cloudflare, lalu buat database D1 kosong.
npx wrangler login
npx wrangler d1 create portfolio

# Salin database_id hasil perintah di atas ke wrangler.jsonc,
# kemudian hasilkan ulang tipe binding dan terapkan skema awal.
npm run cf-typegen
npm run d1:migrate:local
npm run d1:migrate:remote

# Membuat akun admin awal di D1 remote menggunakan sesi Wrangler yang aktif.
npm run d1:seed
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan di `http://localhost:3000` |
| `npm run build` | Build bundle OpenNext untuk Cloudflare Workers |
| `npm run next:build` | Build Next.js tanpa bundle Cloudflare |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Lint & cek format (Biome) |
| `npm run format` | Format kode (Biome) |
| `npm run type-check` | Cek tipe TypeScript |
| `npm run test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E test (Playwright) — build & start otomatis |
| `npx prisma generate` | Meng-generate Prisma Client (otomatis lewat `postinstall`) |
| `npm run cf-typegen` | Menghasilkan tipe binding dari `wrangler.jsonc` |
| `npm run cf:build` | Membuat bundle OpenNext untuk Cloudflare Workers |
| `npm run cf:deploy` | Deploy bundle OpenNext yang sudah dibuat |
| `npm run d1:migrate:local` | Menerapkan migrasi ke D1 lokal |
| `npm run d1:migrate:remote` | Menerapkan migrasi ke D1 Cloudflare |
| `npm run d1:seed` | Membuat akun admin awal pada D1 remote (aman diulang) |
| `npm run d1:seed:local` | Membuat akun admin awal pada D1 lokal (aman diulang) |
| `npm run preview` | Menjalankan aplikasi dalam runtime Workers lokal |
| `npm run deploy` | Build dan deploy ke Cloudflare Workers |

## Cloudflare Workers Builds

Untuk deploy melalui Git integration Cloudflare, buka **Settings > Build** pada Worker
dan gunakan konfigurasi berikut:

```text
Build command: npm run build
Deploy command: npx wrangler deploy
Production branch: main
```

`npm run build` menghasilkan `.open-next/worker.js`, sedangkan OpenNext menjalankan
`npm run next:build` secara internal untuk membangun aplikasi Next.js. Dengan demikian,
command default Workers Builds dapat langsung dipakai.

Bucket R2 media diakses melalui binding `PORTFOLIO_MEDIA`, bukan AWS S3 SDK.
Pastikan binding tersebut mengarah ke bucket `portfolio` pada Workers Dashboard.

## Struktur Folder

```
src/
├── app/        # route App Router
├── features/   # fitur (domain/application/infrastructure/presentation)
├── core/       # UI dasar lintas fitur (design system)
└── shared/     # util lintas aplikasi (env, klien Prisma, auth/JWT)

test/                # unit test (Vitest), struktur mengikuti path src/
e2e/                 # E2E test (Playwright)
```

Detail lengkap: `docs/techlead_04_folder_structure.md`.

## CI

Workflow GitHub Actions (`.github/workflows/ci.yml`) menjalankan lint,
type-check, test (Vitest + Playwright), dan build pada tiap push/PR ke
`main`.
