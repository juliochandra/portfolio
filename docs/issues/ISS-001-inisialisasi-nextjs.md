# ISS-001 — [SETUP] Inisialisasi proyek Next.js & repositori

| | |
|---|---|
| **Label** | `setup` |
| **Ukuran** | M |
| **Blocked by** | — |
| **Serves** | Framework, UI Library, Bahasa, Styling, Icon, Runtime, API Layer, Validasi, Form, Test, CI/CD, Linter/Formatter |
| **Covers** | — |

## Tujuan

Setelah issue ini selesai, developer dapat menjalankan aplikasi, melakukan
lint, menjalankan test, build, dan siap mengembangkan fitur pertama tanpa
perlu melakukan setup tambahan.

## Deskripsi

Fondasi teknis proyek Portfolio Developer — kerangka aplikasi Next.js 15
(App Router) sesuai Tech Stack baku tim, lengkap dengan seluruh tooling
wajib (TypeScript strict mode, Tailwind CSS, validasi Zod, form React Hook
Form, test Vitest + Playwright, linter Biome, CI/CD GitHub Actions) sebelum
baris kode fitur pertama ditulis. Seluruh issue backend & frontend proyek
ini menunggu fondasi ini selesai — tanpa kerangka aplikasi, use case dan
Server Action tidak punya tempat berjalan.

## Definition of Ready

Sebelum mulai issue ini, pastikan:

- [ ] Node.js 22 (LTS) sudah terpasang di mesin pengerja.
- [ ] Git sudah terpasang & dikonfigurasi (nama, email).
- [ ] Akun & akses GitHub tersedia (untuk repositori dan GitHub Actions).

## Langkah

### 1. Inisialisasi Proyek

- [ ] Buat proyek Next.js 15 (App Router) + TypeScript 7 (strict mode) —
      `create-next-app` atau setara.
- [ ] Pastikan `npm run dev` berhasil menjalankan halaman default.
- [ ] Kunci runtime proyek ke Node.js 22 LTS (`.nvmrc` / `package.json`
      `engines`).
- [ ] Inisialisasi repositori Git (bila belum ada) + commit awal.

*Referensi: `docs/techlead_01_architecture.md` §Tech Stack*

### 2. UI Foundation

- [ ] Pasang & konfigurasi Tailwind CSS 4.
- [ ] Pasang react-icons (paket ikon `react-icons/si`).

*Referensi: `docs/techlead_01_architecture.md` §Tech Stack*

### 3. API Layer (verifikasi bawaan)

- [ ] Konfirmasi Route Handlers & Server Actions (App Router) berfungsi —
      bawaan Next.js, tanpa paket tambahan; dibuktikan lewat satu rute/aksi
      percobaan sederhana (dihapus lagi setelah terbukti jalan, atau
      digantikan issue fitur pertama).

### 4. Development Tools

- [ ] Pasang & konfigurasi Zod 4 (validasi).
- [ ] Pasang & konfigurasi React Hook Form 7.
- [ ] Pasang & konfigurasi Biome 2 (linter/formatter).

*Referensi: `docs/techlead_01_architecture.md` §Tech Stack*

### 5. Testing

- [ ] Pasang & konfigurasi Vitest 4 (unit test) + tambahkan satu smoke test.
- [ ] Pasang & konfigurasi Playwright 1 (E2E test) + tambahkan satu smoke
      test.

### 6. Struktur Proyek

- [ ] Susun kerangka folder dasar kosong: `src/app/`, `src/features/`,
      `src/core/`.

*Referensi: `docs/techlead_04_folder_structure.md`*

### 7. CI/CD

- [ ] Susun workflow GitHub Actions dasar: jalankan lint, type-check, test,
      dan build pada tiap push/PR.

## Catatan — Jangan Lakukan

Issue ini hanya menyiapkan fondasi. Jangan membuat/mengerjakan:

- Halaman Home atau layar publik lain.
- Endpoint API atau Server Action fitur nyata.
- Koneksi database / migrasi Prisma — ISS-002.
- Docker, Caddy, Cloudflare, bucket R2 — ISS-003.
- Authentication / logika login.

## Konfigurasi

Tidak ada variabel env/kredensial di issue ini — `DATABASE_URL`,
`JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, dan `R2_*` (penyimpanan berkas)
disiapkan masing-masing di ISS-002 (koneksi database) & ISS-003 (kerangka
deploy), bukan bagian inisialisasi proyek ini.

## Hasil yang Diharapkan

Setelah issue selesai, repositori memiliki:

```
src/app/
src/features/
src/core/
.github/workflows/ci.yml
biome.json
playwright.config.ts
vitest.config.ts
package.json
README.md
```

## Verifikasi

- `npm run dev` menjalankan aplikasi tanpa error; halaman default tampil di
  browser lokal.
- `npm run build` sukses tanpa error.
- `npm run lint` (Biome) lulus tanpa error.
- `npm run test` (Vitest) & test Playwright berjalan tanpa error (boleh
  masih smoke test kosong — belum ada fitur nyata untuk diuji).
- Workflow GitHub Actions berjalan hijau pada push/PR percobaan.

## Checklist Review (untuk reviewer)

1. `npm install`
2. `npm run dev`
3. `npm run lint`
4. `npm run test`
5. `npm run build`
6. Review struktur folder (`src/app`, `src/features`, `src/core`).
7. Review workflow GitHub Actions (jalan hijau pada push/PR percobaan).

## In Scope / Out of Scope

**In Scope**
- [ ] Kerangka Next.js + React + TypeScript + Tailwind + Icon terpasang.
- [ ] Zod, React Hook Form, Vitest, Playwright, Biome terpasang & terkonfigurasi dasar.
- [ ] Struktur folder dasar kosong (`src/app/`, `src/features/`, `src/core/`).
- [ ] Workflow CI dasar (lint + type-check + test + build).

**Out of Scope**
- Koneksi database & migrasi Prisma — ISS-002.
- Docker Compose, Caddy, Cloudflare, bucket R2 — ISS-003.
- Implementasi fitur, layar, atau endpoint apa pun — seluruh issue lain.
- Nilai kredensial/produksi apa pun — titipan DevOps.

## Acceptance Criteria

- [ ] `npm run dev` menjalankan aplikasi tanpa error; halaman default Next.js tampil.
- [ ] `npm run build` sukses tanpa error.
- [ ] Job lint (Biome) pada CI sukses.
- [ ] Job type-check pada CI sukses.
- [ ] Job test (Vitest + Playwright) pada CI sukses.
- [ ] Job build pada CI sukses.
- [ ] Workflow CI berhasil (hijau) pada push/PR percobaan pertama.
- [ ] Struktur folder dasar (`src/app`, `src/features`, `src/core`) sudah ada.
- [ ] Langkah terdokumentasi & bisa diulang orang lain (README repositori).

## Deliverables

- Source code kerangka aplikasi.
- README repositori (langkah setup terdokumentasi).
- Workflow CI (`.github/workflows/ci.yml`).
- Smoke test (Vitest + Playwright).

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Verifikasi manual dilakukan.
- [ ] Tidak ada kredensial/rahasia yang ikut ke repositori.

## Completion Checklist

- [ ] Tidak ada warning TypeScript.
- [ ] Tidak ada error lint.
- [ ] Semua dependency yang terpasang benar-benar dipakai.
- [ ] Tidak ada file sementara/percobaan tertinggal (kecuali sengaja
      digantikan issue fitur pertama).
- [ ] Tidak ada kredensial/rahasia yang ikut ke repositori.

## Referensi

- **Stack & deployment:** `docs/techlead_01_architecture.md` §Tech Stack, §Environment & Deployment
- **Struktur folder:** `docs/techlead_04_folder_structure.md`
