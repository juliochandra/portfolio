# ISS-005 — [BE] Migrasi & model Project

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-03` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-01 |
| **Covers** | — |

## Deskripsi

Fondasi data halaman Portfolio: menambahkan model `Project` (ENT-01) ke
skema Prisma — entitas inti yang dilayani sorotan Home (F-01.2), daftar &
detail Portfolio (F-03), dan pengelolaan project oleh admin (F-06.2).
Seluruh endpoint publik (ISS-013), Server Action kelola (ISS-017), dan
layar Project (ISS-032 dst.) menunggu tabel ini tersedia. Issue ini
**tidak** membuat endpoint, Server Action, atau seed data apa pun —
murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint/Server Action di issue ini — murni migrasi skema
database. Endpoint baca publik (EP-01, EP-02 — ISS-013), endpoint baca
admin & Server Action kelola create/update/delete (EP-09, SA-01/02/03 —
ISS-017) yang memakai tabel ini dikerjakan terpisah.

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `title` — wajib; teks maks. 200 karakter.
- `slug` — dibuat **otomatis** dari `title` (slugify), bukan isian
  manual admin (D-010); unik, maks. 220 karakter.
- `description` — wajib secara produk (AC-003-1, AC-010-2) meski divalidasi
  di Zod, bukan `NOT NULL` skema — memungkinkan migrasi data lama tanpa
  pelanggaran constraint; maks. 300 karakter.
- `content` — wajib; teks panjang; dapat memuat "peran saya" (G-013 BA).
- `demoUrl`, `repositoryUrl` — opsional; tampil di UI hanya bila ada
  (AC-004-1); maks. 255 karakter.
- `thumbnailImage` — opsional; maks. 255 karakter.
- `status` — `Draf` (default, pm_01 D008) / `Terbit` / `Arsip`.

## Aturan Bisnis

- Hanya `status: Terbit` tampil di halaman publik (AC-003-1, AC-003-2);
  daftar publik urut `publishedAt desc`, daftar admin urut `createdAt
  desc`.
- `publishedAt` diisi otomatis sekali saat status pertama kali menyentuh
  `Terbit`, tidak berubah lagi setelahnya — dipakai sebagai kunci urut
  publik agar project yang sempat diarsipkan lalu diterbitkan ulang tidak
  "melompat" ke atas seolah baru.
- Penghapusan bersifat permanen (hard delete), selalu setelah konfirmasi
  UI (AC-011-2) — terpisah dari status `Arsip` (Assumption BA A-003,
  direvisi).
- `thumbnailImage` menyimpan URL string ke objek Cloudflare R2 (ISS-003),
  **bukan** isi biner di database, dan **bukan** foreign key ke `Media` —
  `Media` hanya katalog metadata unggahan (D-011,
  `docs/techlead_02_database.md`).
- Relasi ke `Tag` & `Skill` adalah m-n implisit Prisma (tabel penghubung
  otomatis) — tanpa model join manual.

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint baca Project (EP-01/02 publik, EP-09 admin) bersifat publik
untuk `status: Terbit`, admin untuk daftar kelola; Server Action
tambah/ubah/hapus (SA-01/02/03) hanya `admin` ber-sesi — mutasi admin
selalu Server Action, bukan endpoint REST (D-012,
`docs/techlead_01_architecture.md`). Diterapkan di issue endpoint
terkait, mengikuti matriks akses `docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Project` (ENT-01) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Project {
  id             String        @id @default(cuid())
  title          String        @db.VarChar(200) /// wajib — AC-010-2
  slug           String        @unique @db.VarChar(220) /// auto dari title (D-010)
  description    String?       @db.VarChar(300) /// gambaran singkat, wajib secara produk (AC-003-1, AC-010-2) — lihat catatan Aturan
  content        String        @db.Text /// deskripsi lengkap; dapat memuat "peran saya" (G-013 BA)
  demoUrl        String?       @db.VarChar(255) /// tampil hanya bila ada (AC-004-1)
  repositoryUrl  String?       @db.VarChar(255) /// "Tautan kode" di UI; tampil hanya bila ada (AC-004-1)
  thumbnailImage String?       @db.VarChar(255) /// opsional
  status         PublishStatus @default(DRAFT)  /// Draf/Terbit/Arsip (pm_01 D008)
  publishedAt    DateTime?                       /// diisi otomatis saat status pertama kali jadi PUBLISHED
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  tags   Tag[]
  skills Skill[]

  @@index([slug])
  @@index([status, publishedAt])
}
```

> Salinan dari ENT-01 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

Termasuk `enum PublishStatus` (`DRAFT`/`PUBLISHED`/`ARCHIVED`) bila belum
ada dari migrasi lain — dipakai bersama `Post` (ISS-006).

**Catatan urutan kerja:** field relasi `tags`/`skills` mensyaratkan model
`Tag` (ISS-007) & `Skill` (ISS-008) juga ada di `schema.prisma` — Prisma
memvalidasi seluruh file sekaligus. Kedelapan migrasi entitas *tidak*
saling `blocked_by` (G-006/A-006 `docs/memory/issue.yaml`): model boleh
ditulis mengikuti nomor issue masing-masing, tetapi `prisma migrate dev`
yang sesungguhnya baru dijalankan setelah entitas-entitas yang saling
berelasi (Project, Post, Tag, Skill) lengkap di file — bukan satu migrate
terpisah per issue.

## Catatan Performa

- Index `slug` (lookup detail Portfolio via URL).
- Index majemuk `status, publishedAt` (query daftar publik: filter
  status + urut tanggal terbit dalam satu index).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Project, enum PublishStatus
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Project` (ENT-01) ditambahkan ke `schema.prisma`.
- [ ] `enum PublishStatus` tersedia (dibuat di sini bila belum ada).
- [ ] Migrasi dijalankan; index `slug` dan `status, publishedAt` aktif.

**Out of Scope**
- Endpoint baca Project (EP-01, EP-02, EP-09) & Server Action kelola
  create/update/delete (SA-01/02/03) — issue backend berikutnya.
- Layar Portfolio (daftar/detail) & form kelola — issue frontend.
- Model `Tag`/`Skill` (sisi lain relasi m-n) — migrasi masing-masing.
- Seed data Project — tidak ada Data Awal untuk entitas ini (beda dari
  `User`, ISS-004).

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Project` ada di database sesuai skema
      ENT-01, termasuk `enum PublishStatus`.
- [ ] Index `slug` (unik) dan `status, publishedAt` (majemuk) terbentuk.
- [ ] Relasi m-n ke `Tag` & `Skill` terbentuk otomatis (tabel penghubung
      Prisma) tanpa model join manual.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test: migrasi dijalankan dari database kosong, skema
      diverifikasi lewat Prisma Studio.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** Tidak ada di issue ini (lihat ISS-013 untuk
  EP-01/02, ISS-017 untuk EP-09 & Server Action SA-01/02/03) —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-01 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-01.2, F-03, F-06.2 —
  `docs/ba_01_feature.md`
