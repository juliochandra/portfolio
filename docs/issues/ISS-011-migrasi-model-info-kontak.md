# ISS-011 — [BE] Migrasi & model Info Kontak

| | |
|---|---|
| **Label** | `backend` · `F-05` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-07 |
| **Covers** | — |

## Deskripsi

Fondasi data halaman Contact: menambahkan model `ContactInfo` (ENT-07)
ke skema Prisma — menampung saluran kontak (email, LinkedIn, dst.) yang
tampil ke pengunjung (F-05.1) dan dikelola admin (F-06.5). Entitas
terakhir dari 8 migrasi backlog ini; endpoint publik (ISS-015), endpoint
baca admin & Server Action kelola (ISS-020), dan layar Info Kontak
(SCR-15) menunggu tabel ini tersedia. Issue ini **tidak** membuat
endpoint atau Server Action apa pun — murni skema & migrasi.

## Spesifikasi Endpoint

Tidak ada Server Action di issue ini — murni migrasi skema database.
Server Action baca publik (SA-28 — ISS-015); baca admin & kelola
create/update/delete (SA-33, SA-10/11/12 — ISS-020) yang memakai tabel
ini dikerjakan terpisah.

## Aturan Validasi

Divalidasi di lapisan Zod saat endpoint dibuat (bukan bagian issue ini),
dicatat di sini sebagai referensi skema:

- `label` — wajib; teks maks. 100 karakter — nama saluran, mis. "Email",
  "LinkedIn" (AC-007-1).
- `value` — wajib; teks maks. 255 karakter — alamat/tautan saluran
  (AC-007-1).
- `icon` — opsional; teks maks. 100 karakter.

## Aturan Bisnis

- Tabel **flat multi-baris** — setiap saluran (termasuk email) adalah
  baris biasa, tanpa field email khusus; mencabut desain singleton lama
  yang memisahkan `ContactInfo`+`ContactLink`.
- CRUD penuh lewat SCR-15 (Server Action tambah/ubah/hapus per baris,
  SA-10/11/12) — menggantikan pola "replace-all sekaligus" lama;
  halaman Contact publik menampilkan versi terbaru setelah admin
  menyimpan perubahan apa pun (AC-015-1).
- Tanpa kolom `createdAt`/`updatedAt` pada `ContactInfo` (D-009,
  `docs/techlead_02_database.md`) — beda dari 5 model lain proyek ini
  (sama seperti `User`, ISS-004): skala kecil, tidak ada kebutuhan
  produk/UI yang menampilkannya.

## Auth & Permission

Tidak ada — issue ini tidak membuka Server Action apa pun (murni
skema). Baca Info Kontak (`SA-28`) bersifat publik tanpa sesi; baca
daftar kelola (`SA-33`) & tambah/ubah/hapus (`SA-10/11/12`) hanya
`admin` ber-sesi. Diterapkan di ISS-015/ISS-020, mengikuti matriks
akses `docs/techlead_03_api_contract.md`.

## Perubahan Database

Model baru `ContactInfo` (ENT-07) ditambahkan ke `prisma/schema.prisma`:

```prisma
model ContactInfo {
  id    String  @id @default(cuid())
  label String  @db.VarChar(100) /// nama saluran (mis. "Email", "LinkedIn") — AC-007-1
  value String  @db.VarChar(255) /// alamat/tautan saluran — AC-007-1
  icon  String? @db.VarChar(100)
}
```

> Salinan dari ENT-07 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

Tanpa relasi ke model lain; tidak ada "Catatan urutan kerja" seperti
ISS-005..008, model ini berdiri sendiri dan aman dimigrasikan kapan pun
setelah ISS-002.

## Catatan Performa

Tidak ada — tabel flat kecil (jumlah baris = jumlah saluran kontak),
tanpa pagination.

## Struktur File (referensi awal)

```
prisma/
└── schema.prisma      ← + model ContactInfo
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `ContactInfo` (ENT-07) ditambahkan ke `schema.prisma`.
- [ ] Migrasi dijalankan.

**Out of Scope**
- Server Action baca publik (SA-28) — ISS-015.
- Server Action baca admin & kelola create/update/delete
  (SA-33, SA-10/11/12) — ISS-020.
- Layar Contact publik & halaman kelola (SCR-15) — issue frontend.
- Seed data Info Kontak — tidak ada Data Awal untuk entitas ini.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `ContactInfo` ada di database sesuai skema
      ENT-07.
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

- **Kontrak endpoint:** Tidak ada di issue ini (lihat ISS-015 untuk
  SA-28, ISS-020 untuk SA-33 & SA-10/11/12) —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-07 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** F-05.1, F-06.5 — `docs/ba_01_feature.md`
