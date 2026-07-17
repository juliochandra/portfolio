# ISS-010 — [BE] Migrasi & model Pesan

| | |
|---|---|
| **Label** | `backend` · `F-05` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-06 |
| **Covers** | — |

## Deskripsi

Fondasi data kotak pesan: menambahkan model `Message` (ENT-06) ke skema
Prisma — menampung pesan yang dikirim pengunjung lewat formulir Contact
(F-05.2) dan dibaca/diarsipkan admin (F-06.7). Seluruh endpoint & layar
Pesan (ISS-021, kelola pesan masuk) menunggu tabel ini tersedia. Issue
ini **tidak** membuat endpoint apa pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada endpoint di issue ini — murni migrasi skema database. Endpoint
kirim (publik) & kelola/baca (admin) Pesan yang memakai tabel ini
dikerjakan terpisah (ISS-021).

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `name` — wajib; teks maks. 100 karakter (AC-008-1, AC-018-1).
- `email` — wajib; format email; teks maks. 255 karakter (AC-008-1,
  AC-018-1).
- `message` — wajib; teks panjang (AC-008-1, AC-018-1).
- `status` — `UNREAD` (default, pm_01 D008) / `READ` / `ARCHIVED`.

## Aturan Bisnis

- Pesan hanya dibuat (publik, tanpa pilihan status — selalu `UNREAD`)
  dan dibaca/diarsipkan admin — **tanpa** story ubah isi (Scope
  Validation). Tanpa relasi ke `User`: pengirim adalah pengunjung publik
  yang tidak pernah masuk sebagai admin.
- Transisi status: `UNREAD → READ` otomatis saat admin membuka pesan
  (AC-018-3); `UNREAD|READ → ARCHIVED` saat admin menekan Arsipkan
  (AC-018-4); `ARCHIVED → READ` saat admin menekan Kembalikan.
- Tampil terbaru dulu berdasar `createdAt` (AC-018-1), disaring per tab
  Aktif (`UNREAD`+`READ`) / Arsip (`ARCHIVED`).

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema).
Endpoint kirim pesan bersifat publik tanpa sesi; endpoint
baca/arsip/kembalikan hanya `admin` ber-sesi — diterapkan di issue
endpoint terkait, mengikuti matriks akses
`docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `Message` (ENT-06) ditambahkan ke `prisma/schema.prisma`:

```prisma
model Message {
  id        String        @id @default(cuid())
  name      String        @db.VarChar(100) /// AC-008-1, AC-018-1
  email     String        @db.VarChar(255) /// AC-008-1, AC-018-1
  message   String        @db.Text         /// AC-008-1, AC-018-1
  status    MessageStatus @default(UNREAD) /// pm_01 D008
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([status, createdAt])
}
```

> Salinan dari ENT-06 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

Termasuk `enum MessageStatus` (`UNREAD`/`READ`/`ARCHIVED`) — entitas ini
satu-satunya pemakainya, dibuat di sini. Tanpa relasi ke model lain;
tidak ada "Catatan urutan kerja" seperti ISS-005..008, model ini berdiri
sendiri dan aman dimigrasikan kapan pun setelah ISS-002.

## Catatan Performa

Index majemuk `status, createdAt` (query daftar admin: filter tab
Aktif/Arsip + urut terbaru dalam satu index).

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model Message, enum MessageStatus
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `Message` (ENT-06) ditambahkan ke `schema.prisma`.
- [ ] `enum MessageStatus` tersedia.
- [ ] Migrasi dijalankan; index `status, createdAt` aktif.

**Out of Scope**
- Endpoint kirim (publik) & kelola/baca (admin) Pesan — ISS-021.
- Layar formulir Contact & kotak pesan admin — issue frontend.
- Story ubah isi pesan — tidak ada di kontrak (Scope Validation).
- Seed data Pesan — tidak ada Data Awal untuk entitas ini.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `Message` ada di database sesuai skema
      ENT-06, termasuk `enum MessageStatus`.
- [ ] Index majemuk `status, createdAt` terbentuk.
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
- **Skema & aturan data:** ENT-06 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-05.2, F-06.7 — `docs/ba_01_feature.md`
