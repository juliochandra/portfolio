# Portfolio

CMS portfolio pribadi berbasis Next.js untuk mengelola project, tulisan, keahlian, tag, media, informasi kontak, dan pesan masuk.

Pengunjung memakai halaman public; admin mengelola konten melalui `/admin` setelah login.

## Fitur

- Halaman public: Home, About, Portfolio, Blog, dan Contact.
- CMS admin untuk project, tulisan, skill, tag, media, contact info, pesan, dan kata sandi.
- Rich-text editor Tiptap dengan konten JSON yang disanitasi sebelum ditampilkan.
- Autentikasi JWT access/refresh token dalam cookie httpOnly.
- D1 untuk data aplikasi dan R2 untuk media.
- Sinkronisasi media R2-D1 harian melalui Cloudflare Worker cron.

## Tech stack

Next.js 15 · React 19 · TypeScript strict · Tailwind CSS 4 · Prisma 7 · Cloudflare D1 · Cloudflare R2 · OpenNext Cloudflare · Zod 4 · Tiptap 3 · Vitest 4 · Playwright 1 · Biome 2.

## Prasyarat

- Node.js versi LTS dan npm.
- Akun Cloudflare dengan akses ke D1, R2, Workers, dan DNS/domain.
- Wrangler yang sudah terautentikasi: `npx wrangler login`.
- Database D1 dan bucket R2 yang sesuai dengan binding di `wrangler.jsonc`.

## Instalasi

```bash
npm install
```

`postinstall` otomatis menjalankan `prisma generate` dan menghasilkan Prisma Client di `src/generated/prisma`.

Buat `.env` di root project:

```dotenv
ADMIN_USERNAME=admin
ADMIN_PASSWORD=ganti-dengan-password-yang-kuat
JWT_ACCESS_SECRET=ganti-dengan-secret-minimum-32-karakter
JWT_REFRESH_SECRET=ganti-dengan-secret-minimum-32-karakter
R2_PUBLIC_URL=https://media.example.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, dan `R2_PUBLIC_URL` divalidasi oleh aplikasi. Jangan commit `.env` atau secret Cloudflare.

## Database dan seed

Project membedakan database untuk Prisma CLI dan runtime aplikasi:

| Konteks | Database |
| --- | --- |
| `prisma migrate dev` dan Prisma Studio | SQLite lokal `prisma/dev.db` |
| Next.js/Worker runtime | Cloudflare D1 melalui binding `portfolio_db` |

Buat atau ubah migration lokal:

```bash
npx prisma migrate dev --name nama-migration
npx prisma generate
```

Untuk melihat database SQLite lokal:

```bash
npx prisma studio
```

Terapkan seluruh migration yang belum diterapkan ke D1 remote. Wrangler membaca lokasi migration dari konfigurasi, jadi tidak perlu menyebut file SQL satu per satu:

```bash
npx wrangler d1 migrations apply portfolio-db --remote
```

Buat atau perbarui akun admin awal:

```bash
node --env-file=.env prisma/seed.mts
```

Seed menggunakan binding D1 dari Wrangler. Periksa target database pada output Wrangler sebelum menjalankannya.

## Menjalankan lokal

```bash
npm run dev
```

Buka http://localhost:3000. Development Next.js menginisialisasi Cloudflare context agar runtime Prisma D1 dan R2 tetap dapat digunakan.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan development server dengan Turbopack |
| `npm run build` | Build produksi Next.js saja |
| `npm run start` | Menjalankan build Next.js |
| `npm run build:worker` | Build Next.js lalu menghasilkan Worker OpenNext |
| `npm run deploy:worker:dry-run` | Validasi build dan deploy Worker tanpa upload |
| `npm run deploy:worker` | Build dan deploy Worker ke Cloudflare |
| `npm run lint` | Lint dan pemeriksaan Biome |
| `npm run format` | Format file dengan Biome |
| `npm run format-unsafe` | Terapkan safe dan unsafe fix Biome |
| `npm run type-check` | Cek TypeScript tanpa emit |
| `npm run test` | Unit/component test Vitest |
| `npm run test:e2e` | Menjalankan Playwright; lihat catatan E2E di bawah |

## Deploy ke Cloudflare Workers

1. Pastikan binding D1/R2 dan domain di `wrangler.jsonc` sesuai akun Cloudflare Anda.
2. Tambahkan environment variable production di Cloudflare Workers.
3. Terapkan migration D1 remote.
4. Jalankan dry run.
5. Deploy dari branch `main` yang sudah di-merge.

```bash
npx wrangler d1 migrations apply portfolio-db --remote
npm run deploy:worker:dry-run
npm run deploy:worker
```

Worker memakai custom domain yang didefinisikan pada `wrangler.jsonc`; `workers.dev` dan preview URL sengaja dinonaktifkan. `worker.ts` juga mengalihkan `www.julio.my.id` ke `julio.my.id`.

## Media R2

- Format upload: JPEG, PNG, atau WebP.
- Ukuran gambar maksimum: 2 MB.
- Server Action menerima body maksimum: 3 MB.
- Metadata media berada di D1; object gambar berada di R2.

> Bucket R2 harus khusus untuk project ini. Cron reconciliation memindai seluruh bucket dan menghapus object tanpa record `Media` di D1. Jangan menyimpan file aplikasi lain atau mengunggah file manual ke bucket yang sama.

## Struktur project

```text
src/
├── app/                 # Route dan layout Next.js
├── components/
│   ├── admin/           # UI khusus CMS
│   ├── public/          # UI halaman pengunjung
│   ├── ui/              # Komponen UI lintas area
│   └── ...
├── features/            # Action, service, repository, schema, dan type per domain
├── generated/prisma/    # Prisma Client hasil generate
└── lib/                 # Auth, database, validation, exception, Tiptap, utility

prisma/                  # Schema, migration, dan seed
test/                    # Unit/component test Vitest
e2e/                     # Playwright test
worker.ts                # Wrapper OpenNext dan cron reconciliation
wrangler.jsonc           # Binding Cloudflare dan domain
```

Detail arsitektur, peta route, data model, security boundary, dan known limitation tersedia di `architecture-design.md`.

## Pengujian

Untuk perubahan biasa, jalankan:

```bash
npm run lint
npm run type-check
npm run test
```

Saat ini konfigurasi Playwright memanggil script `build:next`, tetapi script tersebut belum tersedia di `package.json`. Perbaiki konfigurasi tersebut sebelum mengandalkan `npm run test:e2e` pada clean environment.

## Alur Git

1. Buat branch baru dari `development`.
2. Jalankan pemeriksaan yang relevan.
3. Commit dan push branch.
4. Buat PR ke `development`.
5. Release melalui PR `development` ke `main`.
6. Deploy Worker dari `main` yang sudah up-to-date.

Jangan push perubahan langsung ke `development` atau `main`.
