# ISS-006 — [BE] Migrasi & model Tulisan

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-04` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-02 |
| **Covers** | — |

## Deskripsi

Fondasi data halaman Blog: menambahkan model `Post` (ENT-02) ke skema
Prisma — entitas inti yang dilayani sorotan Home (F-01.2), daftar &
baca tulisan Blog (F-04), dan pengelolaan tulisan oleh admin (F-06.3).
Seluruh endpoint & layar Tulisan (ISS-014, ISS-033 dst.) menunggu tabel
ini tersedia. Issue ini **tidak** membuat endpoint atau seed data apa
pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint di issue ini — murni migrasi skema database. Endpoint
baca/kelola Tulisan yang memakai tabel ini dikerjakan terpisah (fase
backend berikutnya).

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `title` — wajib; teks maks. 200 karakter.
- `slug` — dibuat **otomatis** dari `title` (slugify), bukan isian
  manual admin (D-010); unik, maks. 220 karakter.
- `description` — opsional; cuplikan yang tampil di komponen `ItemTulisan`
  (C-05); maks. 300 karakter.
- `content` — wajib; teks panjang; isi tulisan.
- `readingTime` — wajib; angka; **dihitung sekali saat simpan**
  (create/update) dari panjang `content` — tidak dihitung ulang tiap
  dibaca.
- `thumbnailImage` — opsional; maks. 255 karakter.
- `status` — `Draf` (default, pm_01 D008) / `Terbit` / `Arsip`.

## Aturan Bisnis

- `status` menggantikan asumsi lama "tersimpan = langsung tayang"
  (Assumption BA A-006, direvisi pm_01 D008) — hanya `status: Terbit`
  tampil di Blog publik (AC-005-1, AC-005-2), urut `publishedAt desc`;
  daftar admin urut `createdAt desc`.
- Tanpa konsep kategori — tag melengkapi tanpa mengubah tampilan daftar
  (Assumption BA A-002).
- `publishedAt` diisi otomatis sekali saat status pertama kali menyentuh
  `Terbit`, tidak berubah lagi setelah diedit.
- Penghapusan bersifat permanen (hard delete), selalu setelah konfirmasi
  UI (AC-013-2) — terpisah dari status `Arsip`.
- `thumbnailImage` = thumbnail kanan di list `ItemTulisan` (C-05) &
  pratinjau saat dibagikan; **tidak** tampil di isi tulisan itu sendiri.
  Menyimpan URL string ke objek Cloudflare R2 (ISS-003), bukan isi biner
  di database, dan bukan foreign key ke `Media` (D-011,
  `docs/techlead_02_database.md`).
- Relasi ke `Tag` adalah m-n implisit Prisma (tabel penghubung otomatis)
  — tanpa model join manual.

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint baca Tulisan bersifat publik untuk `status: Terbit`; endpoint
kelola (tambah/ubah/hapus) hanya `admin` ber-sesi — diterapkan di issue
endpoint terkait, mengikuti matriks akses `docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Post` (ENT-02) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Post {
  id             String        @id @default(cuid())
  title          String        @db.VarChar(200) /// wajib — AC-012-2
  slug           String        @unique @db.VarChar(220) /// auto dari title (D-010)
  description    String?       @db.VarChar(300) /// cuplikan, tampil di ItemTulisan
  content        String        @db.Text /// isi tulisan
  readingTime    Int                             /// dihitung sekali saat simpan (create/update) dari panjang content — tidak dihitung ulang tiap dibaca
  thumbnailImage String?       @db.VarChar(255) /// opsional — thumbnail kanan di list (C-05) & pratinjau saat dibagikan; TIDAK tampil di isi tulisan
  status         PublishStatus @default(DRAFT)   /// Draf/Terbit/Arsip (pm_01 D008)
  publishedAt    DateTime?                        /// diisi otomatis saat status pertama kali jadi PUBLISHED; tidak berubah saat diedit setelahnya
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  tags Tag[]

  @@index([slug])
  @@index([status, publishedAt])
}
```

> Salinan dari ENT-02 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

`enum PublishStatus` dipakai bersama `Project` (ENT-01) — sudah dibuat
di ISS-005; issue ini hanya memakainya ulang, tidak membuat lagi.

## Catatan Performa

- Index `slug` (lookup detail Tulisan via URL).
- Index majemuk `status, publishedAt` (query daftar publik: filter
  status + urut tanggal terbit dalam satu index).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Post
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Post` (ENT-02) ditambahkan ke `schema.prisma`.
- [ ] Migrasi dijalankan; index `slug` dan `status, publishedAt` aktif.

**Out of Scope**
- Endpoint baca/kelola Tulisan — issue backend berikutnya.
- Layar Blog (daftar/detail) & form kelola — issue frontend.
- Model `Tag` (sisi lain relasi m-n) — migrasi tersendiri.
- Perhitungan `readingTime` di kode aplikasi — logika kalkulasi bagian
  issue endpoint kelola Tulisan, bukan migrasi ini.
- Seed data Tulisan — tidak ada Data Awal untuk entitas ini (beda dari
  `User`, ISS-004).

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Post` ada di database sesuai skema ENT-02.
- [ ] Index `slug` (unik) dan `status, publishedAt` (majemuk) terbentuk.
- [ ] Relasi m-n ke `Tag` terbentuk otomatis (tabel penghubung Prisma)
      tanpa model join manual.
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

- **Kontrak endpoint:** Tidak ada — issue ini tanpa endpoint.
- **Skema & aturan data:** ENT-02 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-01.2, F-04, F-06.3 —
  `docs/ba_01_feature.md`
