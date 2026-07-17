# ISS-009 — [BE] Migrasi & model Media

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-05 |
| **Covers** | — |

## Deskripsi

Fondasi katalog berkas: menambahkan model `Media` (ENT-05) ke skema
Prisma — mencatat metadata tiap gambar yang pernah diunggah admin, baik
lewat halaman Media tersendiri (F-06.9, galeri mandiri) maupun inline
dari form Project/Tulisan. Bukan relasi wajib entitas manapun — murni
katalog agar admin bisa melihat & mengelola daftar file dari satu tempat
(D-011, `docs/techlead_02_database.md`). Issue ini **tidak** membuat
endpoint atau logika unggah apa pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint di issue ini — murni migrasi skema database. Endpoint
unggah/kelola Media (SCR-18) yang memakai tabel ini dikerjakan terpisah;
logika unggah pertama kali ditulis di ISS-017 (Kelola Project), dipakai
ulang ISS-018/ISS-023 (D-007 `docs/memory/issue.yaml`).

## Aturan Validasi

Divalidasi di lapisan Zod/handler unggah saat endpoint dibuat (bukan
bagian issue ini), dicatat di sini sebagai referensi skema:

- `fileName` — wajib; teks maks. 255 karakter.
- `objectKey` — wajib; teks maks. 255 karakter; unik (kunci objek di
  bucket Cloudflare R2, ISS-003).
- `url` — wajib; teks maks. 500 karakter.
- `mimeType` — wajib; teks maks. 100 karakter.
- `extension` — wajib; teks maks. 20 karakter.
- `size` — wajib; angka (byte).
- Batas ukuran & jenis file (diterapkan di endpoint unggah, bukan
  constraint skema): gambar (jpg/png/webp) ≤ 2MB (G-003,
  `docs/techlead_01_architecture.md`).

## Aturan Bisnis

- Satu baris dibuat tiap kali admin mengunggah file — baik lewat halaman
  Media (SCR-18, galeri mandiri) maupun inline dari form Project/Tulisan
  (G-016 BA).
- Path hasil unggahan disalin ke field string terkait (`thumbnailImage`,
  dst. di `Project`/`Post`) bila diunggah inline, atau dipilih dari
  galeri saat mengisi form.
- Menghapus baris `Media` (SCR-18) **tidak** mengosongkan rujukan
  `thumbnailImage` yang sudah tersalin ke `Project`/`Post` lain — tanpa
  foreign key (G-017 BA, risiko diterima karena skala kecil).
- `Media` = katalog, bukan sumber kebenaran relasional (D-011): field
  gambar di `Project`/`Post` adalah string path langsung, **bukan**
  foreign key ke `Media`.

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint unggah/kelola Media hanya `admin` ber-sesi — diterapkan di
issue endpoint terkait, mengikuti matriks akses
`docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Media` (ENT-05) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Media {
  id        String   @id @default(cuid())
  fileName  String   @db.VarChar(255)
  objectKey String   @unique @db.VarChar(255)
  url       String   @db.VarChar(500)
  mimeType  String   @db.VarChar(100)
  extension String   @db.VarChar(20)
  size      Int
  createdAt DateTime @default(now())
}
```

> Salinan dari ENT-05 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

Tanpa relasi ke model lain (lihat Konvensi — katalog, bukan FK); tidak
ada "Catatan urutan kerja" seperti ISS-005..008, model ini berdiri
sendiri dan aman dimigrasikan kapan pun setelah ISS-002.

## Catatan Performa

Tidak ada — tabel kecil, tanpa pagination; `objectKey` sudah unik
(index otomatis lewat `@unique`).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Media
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Media` (ENT-05) ditambahkan ke `schema.prisma`.
- [ ] Migrasi dijalankan.

**Out of Scope**
- Endpoint unggah/kelola Media (SCR-18) — issue backend berikutnya.
- Layar Media (galeri + unggah) — issue frontend.
- Logika unggah ke Cloudflare R2 (util `shared/`, S3 SDK) — ditulis
  pertama kali di ISS-017 (D-007), bukan bagian migrasi ini.
- Seed data Media — tidak ada Data Awal untuk entitas ini.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Media` ada di database sesuai skema
      ENT-05.
- [ ] `objectKey` unik (constraint database aktif).
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
- **Skema & aturan data:** ENT-05 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-06.9 — `docs/ba_01_feature.md`
