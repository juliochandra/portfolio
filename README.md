# Portfolio Developer

CMS ringan (Next.js App Router) untuk mengelola portfolio developer:
project, tulisan, keahlian, tag, media, info kontak, dan pesan masuk.

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript 7 (strict) · Tailwind CSS 4 ·
react-icons · Zod 4 · React Hook Form 7 · Vitest 4 · Playwright 1 · Biome 2.

## Prasyarat

- Node.js (runtime dikunci lewat Docker — lihat ISS-003)
- npm

## Setup

```bash
npm install
```

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan server pengembangan di `http://localhost:3000` |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan build produksi |
| `npm run lint` | Lint & cek format (Biome) |
| `npm run format` | Format kode (Biome) |
| `npm run type-check` | Cek tipe TypeScript |
| `npm run test` | Unit test (Vitest) |
| `npm run test:e2e` | E2E test (Playwright) — build & start otomatis |

## Struktur Folder

```
src/
├── app/        # route App Router
├── features/   # fitur (domain/application/infrastructure/presentation)
└── core/       # shared lintas fitur (UI dasar, config, dsb.)
```

Detail lengkap: `docs/techlead_04_folder_structure.md`.

## CI

Workflow GitHub Actions (`.github/workflows/ci.yml`) menjalankan lint,
type-check, test (Vitest + Playwright), dan build pada tiap push/PR ke
`main`.
