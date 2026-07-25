# Portfolio Developer

CMS ringan (Next.js App Router) untuk mengelola portfolio developer:
project, tulisan, keahlian, tag, media, info kontak, dan pesan masuk.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript 7 (strict) · Tailwind CSS 4 ·
react-icons · Neon PostgreSQL · Prisma 7 · Cloudflare R2 · Zod 4 ·
React Hook Form 7 · Vitest 4 · Playwright 1 · Biome 2.

## Prasyarat

- Node.js
- npm
- Database [Neon](https://neon.tech/) PostgreSQL
- Bucket [Cloudflare R2](https://developers.cloudflare.com/r2/) (sandbox/dev)

## Setup

```bash
npm install
cp .env.example .env
# isi DATABASE_URL, R2_PUBLIC_URL, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_ACCESS_SECRET
# & JWT_REFRESH_SECRET di .env dengan nilai Anda sendiri

# Terapkan migrasi PostgreSQL, lalu buat akun admin awal.
npm run db:migrate
npm run db:seed
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan di `http://localhost:3000` |
| `npm run build` | Build produksi Next.js |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Lint & cek format (Biome) |
| `npm run format` | Format kode (Biome) |
| `npm run type-check` | Cek tipe TypeScript |
| `npm run test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E test (Playwright) — build & start otomatis |
| `npx prisma generate` | Meng-generate Prisma Client (otomatis lewat `postinstall`) |
| `npm run db:migrate` | Menerapkan migrasi ke Neon PostgreSQL |
| `npm run db:seed` | Membuat akun admin awal di Neon (aman diulang) |

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
