# ISS-007 — [BE] Migrasi & model Tag

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-03 |
| **Covers** | — |

## Deskripsi

Fondasi data pengelompokan Project & Tulisan: menambahkan model `Tag`
(ENT-03) ke skema Prisma. Tag dikelola lewat halaman kelola tersendiri
(F-06.8) — referensi desain admin client, mencabut keputusan lama
"inline-only tanpa halaman kelola" (G-014 BA). Saat ini Tag berfungsi
sebagai metadata pendukung Project/Tulisan (belum ada story/AC yang
menuntut tampilan filter aktif di sisi publik). Issue ini **tidak**
membuat endpoint apa pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint di issue ini — murni migrasi skema database. Endpoint
kelola Tag (SCR-17) yang memakai tabel ini dikerjakan terpisah (fase
backend berikutnya).

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `name` — wajib; teks maks. 50 karakter; unik.
- `slug` — dibuat **otomatis** dari `name` (slugify), bukan isian manual
  admin (D-010); unik, maks. 60 karakter. Disiapkan meski belum ada route
  yang memakainya, agar siap bila kebutuhan filter/halaman-per-tag muncul
  (G-014 BA).

## Aturan Bisnis

- CRUD penuh lewat SCR-17 (tambah/ubah/hapus) — pola sama `Skill`,
  selalu konfirmasi sebelum hapus (AC-021-2).
- Menghapus tag yang masih dipakai `Project`/`Post` hanya melepas baris
  di tabel penghubung implisit (`_ProjectToTag`/`_PostToTag`) — Prisma
  menangani ini otomatis lewat `disconnect`, **tidak** menghapus
  `Project`/`Post` itu sendiri.
- Relasi ke `Project` & `Post` adalah m-n implisit Prisma (tabel
  penghubung otomatis) — tanpa model join manual.
- Tanpa kolom kategori/hierarki — Tag tetap datar (flat), sesuai
  cakupan kontrak saat ini.

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint kelola Tag (tambah/ubah/hapus) hanya `admin` ber-sesi —
diterapkan di issue endpoint terkait, mengikuti matriks akses
`docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Tag` (ENT-03) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique @db.VarChar(50)
  slug      String   @unique @db.VarChar(60) /// auto dari name; disiapkan, belum ada route yang memakainya
  createdAt DateTime @default(now())

  posts    Post[]
  projects Project[]
}
```

> Salinan dari ENT-03 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Catatan urutan kerja:** field relasi `posts`/`projects` mensyaratkan
model `Post` (ISS-006) & `Project` (ISS-005) juga ada di `schema.prisma`
— Prisma memvalidasi seluruh file sekaligus. Kedelapan migrasi entitas
*tidak* saling `blocked_by` (G-006/A-006 `docs/memory/issue.yaml`): model
boleh ditulis mengikuti nomor issue masing-masing, tetapi `prisma migrate
dev` yang sesungguhnya baru dijalankan setelah entitas-entitas yang
saling berelasi (Project, Post, Tag) lengkap di file — bukan satu migrate
terpisah per issue.

## Catatan Performa

Tidak ada — tabel kecil, tanpa pagination; `name`/`slug` sudah unik
(index otomatis lewat `@unique`).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Tag
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Tag` (ENT-03) ditambahkan ke `schema.prisma`.
- [ ] Migrasi dijalankan (setelah Project & Post juga ada di skema).

**Out of Scope**
- Endpoint kelola Tag (SCR-17) — issue backend berikutnya.
- Layar kelola Tag & form — issue frontend.
- Model `Project`/`Post` (sisi lain relasi m-n) — migrasi masing-masing
  (ISS-005, ISS-006).
- Filter/halaman-per-tag di sisi publik — tidak ada di kontrak saat ini
  (G-014 BA).
- Seed data Tag — tidak ada Data Awal untuk entitas ini.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Tag` ada di database sesuai skema ENT-03.
- [ ] `name` dan `slug` unik (constraint database aktif).
- [ ] Relasi m-n ke `Project` & `Post` terbentuk otomatis (tabel
      penghubung Prisma) tanpa model join manual.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test: migrasi dijalankan dari database kosong (bersama
      Project & Post), skema diverifikasi lewat Prisma Studio.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** Tidak ada — issue ini tanpa endpoint.
- **Skema & aturan data:** ENT-03 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-06.8 — `docs/ba_01_feature.md`
