# ISS-002 — [SETUP] Koneksi PostgreSQL & kerangka migrasi Prisma

| | |
|---|---|
| **Label** | `setup` |
| **Ukuran** | S |
| **Blocked by** | ISS-001 |
| **Serves** | Database, ORM |
| **Covers** | — |

## Tujuan

Setelah issue ini selesai, aplikasi terhubung ke database PostgreSQL (Neon)
lewat Prisma, dan tim backend bisa langsung menulis migrasi/model entitas
pertama (ISS-004 dst.) tanpa perlu menyiapkan koneksi database dari nol.

## Deskripsi

Fondasi lapisan data proyek Portfolio Developer: instalasi Prisma ORM,
konfigurasi koneksi ke PostgreSQL 18 (Neon — TEAM_STACK.md), dan kerangka
alur migrasi (`prisma migrate`) yang akan dipakai seluruh 8 migrasi entitas
berikutnya (ISS-004..011). Issue ini **tidak** membuat model entitas apa
pun — hanya menyiapkan pipa koneksi & mekanisme migrasi supaya siap dipakai.

## Definition of Ready

- [ ] ISS-001 selesai (kerangka Next.js + `src/` tersedia).
- [ ] Akun/akses proyek Neon tersedia untuk membuat database pengembangan.

## Langkah

### 1. Database Neon

- [ ] Buat project/database PostgreSQL 18 di Neon untuk lingkungan
      pengembangan (dev).
- [ ] Salin connection string Neon ke variabel `DATABASE_URL` lokal
      (`.env`, tidak ikut commit).

*Referensi: `docs/techlead_01_architecture.md` §Tech Stack, §Environment & Deployment*

### 2. Prisma

- [ ] Pasang Prisma 7 (`prisma` + `@prisma/client`).
- [ ] Jalankan `prisma init` — hasilkan `prisma/schema.prisma` + `.env`
      (`DATABASE_URL`).
- [ ] Konfigurasi `datasource db` (`provider = "postgresql"`) &
      `generator client` di `schema.prisma` sesuai Konvensi (id `String
      @default(cuid())`, tanpa `@map`/`@@map` — D-014).

*Referensi: `docs/techlead_02_database.md` §Konvensi*

### 3. Verifikasi Koneksi & Migrasi

- [ ] Buktikan koneksi jalan: `npx prisma db pull` atau `npx prisma studio`
      berhasil terhubung ke database Neon tanpa error.
- [ ] Jalankan satu migrasi percobaan kosong (`npx prisma migrate dev
      --name init`) untuk memastikan alur migrasi berfungsi dari nol —
      model percobaan dihapus lagi setelah terbukti jalan (digantikan model
      nyata di ISS-004 dst.).
- [ ] Tambahkan `prisma generate` ke langkah build/postinstall proyek
      supaya Prisma Client selalu ter-generate ulang.

## Catatan — Jangan Lakukan

Issue ini hanya menyiapkan koneksi & kerangka migrasi. Jangan membuat:

- Model/tabel entitas nyata (`Project`, `Post`, `Tag`, dst.) — ISS-004..011.
- Seed data — bagian dari ISS-004 (seed akun admin).
- Docker Compose / kontainerisasi apa pun — ISS-003.

## Konfigurasi

- `DATABASE_URL` — connection string PostgreSQL (Neon), nilai
  development/sandbox milik masing-masing environment lokal, tidak ikut ke
  repositori (`.env` masuk `.gitignore`).
- Nilai produksi `DATABASE_URL` = titipan DevOps
  (`docs/techlead_01_architecture.md` §Open Questions).

## Hasil yang Diharapkan

```
prisma/
├── schema.prisma
└── migrations/
    └── <timestamp>_init/
.env.example
```

## Verifikasi

- `npx prisma migrate dev` berjalan tanpa error dari kondisi database kosong.
- `npx prisma studio` berhasil membuka & terhubung ke database.
- `npx prisma generate` sukses tanpa error.
- Aplikasi (`npm run dev`, dari ISS-001) tetap berjalan normal dengan
  Prisma Client terpasang.

## Checklist Review (untuk reviewer)

1. `npm install`
2. Salin `.env.example` → `.env`, isi `DATABASE_URL` sendiri.
3. `npx prisma generate`
4. `npx prisma migrate dev`
5. `npx prisma studio` — pastikan bisa terhubung.
6. Review `prisma/schema.prisma` (datasource/generator sesuai Konvensi).

## In Scope / Out of Scope

**In Scope**
- [ ] Prisma terpasang & terkonfigurasi (`datasource`, `generator`).
- [ ] Koneksi ke database PostgreSQL (Neon) terbukti jalan.
- [ ] Alur migrasi (`prisma migrate`) terbukti jalan dari nol.
- [ ] `.env.example` didokumentasikan.

**Out of Scope**
- Model/skema 8 entitas — ISS-004..011.
- Docker Compose, Caddy, Cloudflare, bucket R2 — ISS-003.
- Seed data — ISS-004.
- Nilai kredensial produksi — titipan DevOps.

## Acceptance Criteria

- [ ] `npx prisma migrate dev` berjalan tanpa error dari database kosong.
- [ ] `npx prisma generate` sukses tanpa error.
- [ ] `npx prisma studio` berhasil terhubung ke database.
- [ ] `prisma/schema.prisma` berisi `datasource`/`generator` sesuai
      Konvensi (`docs/techlead_02_database.md`).
- [ ] `.env.example` tersedia & terdokumentasi di README.
- [ ] Langkah terdokumentasi & bisa diulang orang lain (README repositori).

## Deliverables

- `prisma/schema.prisma` (kerangka datasource/generator, tanpa model
  entitas).
- `.env.example`.
- Migrasi percobaan awal (`prisma/migrations/`).

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Verifikasi manual dilakukan.
- [ ] Tidak ada kredensial/rahasia yang ikut ke repositori.

## Completion Checklist

- [ ] `.env` tidak ikut ke repositori (ada di `.gitignore`).
- [ ] Tidak ada model/tabel percobaan tertinggal di `schema.prisma`.
- [ ] Tidak ada warning Prisma saat `generate`/`migrate`.

## Referensi

- **Stack & konvensi data:** `docs/techlead_01_architecture.md` §Tech Stack, §Environment & Deployment
- **Konvensi skema:** `docs/techlead_02_database.md` §Konvensi
