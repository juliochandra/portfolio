# ISS-008 — [BE] Migrasi & model Keahlian

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-04 |
| **Covers** | — |

## Deskripsi

Fondasi data Keahlian: menambahkan model `Skill` (ENT-04) ke skema
Prisma — dilayani sorotan Home (F-01.2, ringkasan keahlian ke pengunjung)
dan pengelolaan oleh admin (F-06.4, tambah/ubah/hapus nama + ikon).
Seluruh endpoint publik (ISS-016), endpoint baca admin & Server Action
kelola (ISS-019), dan layar Keahlian (SCR-14) menunggu tabel ini
tersedia. Issue ini **tidak** membuat endpoint atau Server Action apa
pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint/Server Action di issue ini — murni migrasi skema
database. Endpoint baca publik (EP-17 — ISS-016), endpoint baca admin &
Server Action kelola create/update/delete (EP-11, SA-07/08/09 —
ISS-019) yang memakai tabel ini dikerjakan terpisah.

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `name` — wajib; teks maks. 50 karakter; unik (AC-014-1).
- `slug` — dibuat **otomatis** dari `name` (slugify), bukan isian manual
  admin (D-010); unik, maks. 60 karakter. Disiapkan meski belum ada route
  yang memakainya.
- `icon` — wajib secara produk ("nama + ikon", AC-014-1) meski divalidasi
  di Zod, bukan `NOT NULL` skema — konsisten pola `description` Project
  (ISS-005); teks maks. 100 karakter, nama ikon dari daftar tech-stack
  (SCR-14).

## Aturan Bisnis

- CRUD penuh lewat SCR-14 (Server Action tambah/ubah/hapus,
  SA-07/08/09), selalu konfirmasi sebelum hapus (AC-014-2).
- Dibaca publik lewat EP-17 — bagian Keahlian di Home (SCR-01)
  menampilkan seluruh baris ke pengunjung, terpisah dari EP-11 (baca
  daftar kelola) yang khusus admin. Kedua endpoint di luar cakupan
  issue ini.
- Relasi ke `Project` adalah m-n implisit Prisma (tabel penghubung
  otomatis) — tanpa model join manual.
- Data identitas pemilik (About Hero, Engineering Principles,
  Development Workflow, Current Focus, Beyond Code) **tidak** dikelola
  dari tabel ini — bersifat statis di kode (pm_01 D007).

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint baca daftar kelola (EP-11) & Server Action tambah/ubah/hapus
(SA-07/08/09) hanya `admin` ber-sesi — mutasi admin selalu Server
Action, bukan endpoint REST (D-012,
`docs/techlead_01_architecture.md`); endpoint baca publik (EP-17) tanpa
sesi. Diterapkan di ISS-016/ISS-019, mengikuti matriks akses
`docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Skill` (ENT-04) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Skill {
  id        String   @id @default(cuid())
  name      String   @unique @db.VarChar(50) /// wajib — AC-014-1
  slug      String   @unique @db.VarChar(60) /// auto dari name; disiapkan, belum ada route yang memakainya
  icon      String?  @db.VarChar(100)        /// nama ikon dari daftar tech-stack (SCR-14) — wajib secara produk, lihat Aturan
  createdAt DateTime @default(now())

  projects Project[]
}
```

> Salinan dari ENT-04 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Catatan urutan kerja:** field relasi `projects` mensyaratkan model
`Project` (ISS-005) juga ada di `schema.prisma` — Prisma memvalidasi
seluruh file sekaligus. Kedelapan migrasi entitas *tidak* saling
`blocked_by` (G-006/A-006 `docs/memory/issue.yaml`): model boleh ditulis
mengikuti nomor issue masing-masing, tetapi `prisma migrate dev` yang
sesungguhnya baru dijalankan setelah entitas-entitas yang saling
berelasi (Project, Skill) lengkap di file — bukan satu migrate terpisah
per issue.

## Catatan Performa

Tidak ada — tabel kecil, tanpa pagination; `name`/`slug` sudah unik
(index otomatis lewat `@unique`).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Skill
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Skill` (ENT-04) ditambahkan ke `schema.prisma`.
- [ ] Migrasi dijalankan (setelah Project juga ada di skema).

**Out of Scope**
- Endpoint baca publik (EP-17 — ISS-016), endpoint baca admin & Server
  Action kelola create/update/delete (EP-11, SA-07/08/09 — ISS-019).
- Layar kelola Keahlian & form — issue frontend.
- Model `Project` (sisi lain relasi m-n) — migrasi tersendiri (ISS-005).
- Data identitas pemilik (About Hero dst.) — statis di kode (pm_01 D007).
- Seed data Keahlian — tidak ada Data Awal untuk entitas ini.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Skill` ada di database sesuai skema
      ENT-04.
- [ ] `name` dan `slug` unik (constraint database aktif).
- [ ] Relasi m-n ke `Project` terbentuk otomatis (tabel penghubung
      Prisma) tanpa model join manual.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test: migrasi dijalankan dari database kosong (bersama
      Project), skema diverifikasi lewat Prisma Studio.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** Tidak ada di issue ini (lihat ISS-016 untuk
  EP-17, ISS-019 untuk EP-11 & Server Action SA-07/08/09) —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-04 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-01.2, F-06.4 — `docs/ba_01_feature.md`
