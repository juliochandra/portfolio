# ISS-004 — [BE] Migrasi & model User + seed akun admin

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-002 |
| **Serves** | ENT-08 |
| **Covers** | — |

## Deskripsi

Fondasi kredensial admin Portfolio Developer: menambahkan model `User`
(ENT-08) ke skema Prisma dan mengisinya lewat seed Data Awal dengan **tepat
satu akun** — tanpa halaman/endpoint registrasi publik (Assumption BA
A-005, `docs/ba_01_feature.md` F-06.10). Seluruh issue Auth (ISS-012) dan
endpoint terlindung lainnya menunggu tabel ini tersedia. `User` murni
kredensial login — **tidak** menyimpan data identitas pemilik (nama/bio/
foto/dst., yang statis di kode, pm_01 D007).

## Spesifikasi Endpoint

Tidak ada endpoint/Server Action di issue ini — murni migrasi skema
database & seed data. Autentikasi (SA-22 masuk, SA-23 keluar, SA-21
ubah kata sandi) yang memakai tabel ini dikerjakan terpisah di ISS-012
— seluruhnya Server Action, termasuk masuk & keluar (v2.8, D-021
`docs/techlead_01_architecture.md`; sebelum v2.8, masuk/keluar sempat
berupa Route Handler EP-07/EP-08, kini dicabut).

## Aturan Validasi

- `username` — wajib; teks maks. 50 karakter; unik (`@unique` di database).
- `passwordHash` — wajib; teks; **hash Bcrypt** (TEAM_STACK.md) — kata
  sandi polos tidak pernah disimpan, hanya dipakai sesaat di seed script
  sebelum di-hash.

## Aturan Bisnis

- Tepat satu akun admin, dibuat lewat seed Data Awal — **tanpa
  endpoint/halaman registrasi publik** (Assumption BA A-005). Jangan
  menambah jalur pendaftaran mandiri.
- Kata sandi awal disiapkan developer saat serah terima (F-06.10); nilai
  di seed ini adalah nilai **awal pengembangan**, bukan nilai produksi —
  pemilik dapat menggantinya sendiri lewat ISS-012 (SCR-19) setelah
  proyek berjalan.
- `User` tidak menyimpan data identitas pemilik apa pun — seluruhnya
  statis di kode (pm_01 D007), bukan di tabel ini.
- Tanpa kolom `createdAt`/`updatedAt` pada `User` (D-009,
  `docs/techlead_02_database.md`) — beda dari 7 model lain proyek ini.

## Auth & Permission

Tidak ada — issue ini tidak membuka endpoint apa pun (murni skema &
seed). Pelindung sesi/otorisasi seluruh route admin (`middleware.ts`,
JWT) dikerjakan di ISS-012.

## Perubahan Database

Model baru `User` (ENT-08) ditambahkan ke `prisma/schema.prisma`:

```prisma
model User {
  id           String @id @default(cuid())
  username     String @unique @db.VarChar(50) /// data masuk — AC-009-1
  passwordHash String                          /// hash Bcrypt (TEAM_STACK.md)
}
```

> Salinan dari ENT-08 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_02_database.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

Migrasi dijalankan lewat `prisma migrate dev` (kerangka sudah tersedia
dari ISS-002). Ditambah satu seed script (Data Awal) yang membuat tepat
satu akun admin dengan `passwordHash` hasil Bcrypt dari nilai sandi awal
pengembangan — aman dijalankan ulang (tidak membuat akun ganda bila satu
akun sudah ada).

## Catatan Performa

Tidak ada — tabel 1 baris, tanpa query kompleks/pagination.

## Struktur File (referensi awal)

```
prisma/
├── schema.prisma      ← + model User
└── seed.ts            ← seed Data Awal (1 akun admin)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] Model `User` (ENT-08) ditambahkan ke `schema.prisma` & migrasi
      dijalankan.
- [ ] Seed script (Data Awal) membuat tepat satu akun admin dengan
      `passwordHash` ter-hash Bcrypt.

**Out of Scope**
- Server Action masuk/keluar/ubah kata sandi (SA-22, SA-23, SA-21) &
  pelindung sesi (`middleware.ts`) — ISS-012.
- Halaman Masuk & Password (SCR-08, SCR-19) — ISS-031, ISS-040.
- Registrasi akun publik/mandiri — tidak ada di kontrak (Assumption BA
  A-005).
- Data identitas pemilik (nama/bio/foto) — statis di kode (pm_01 D007),
  bukan di tabel `User`.

## Acceptance Criteria

- [ ] Setelah migrasi, tabel `User` ada di database sesuai skema ENT-08.
- [ ] Setelah seed dijalankan, tepat satu baris akun admin tersimpan;
      `passwordHash` berupa hash Bcrypt (bukan teks polos).
- [ ] Seed hanya membuat akun bila tabel `User` masih kosong — dijalankan
      ulang tidak menghasilkan akun ganda.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test: migrasi & seed dijalankan dari database kosong, akun
      admin diverifikasi lewat Prisma Studio.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** Tidak ada — issue ini tanpa endpoint/Server
  Action (lihat ISS-012 untuk kontrak Server Action SA-21/SA-22/SA-23).
- **Skema & aturan data:** ENT-08 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** Assumption BA A-005, F-06.10 —
  `docs/ba_01_feature.md`
