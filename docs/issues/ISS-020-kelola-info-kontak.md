# ISS-020 — [BE] Kelola info kontak: daftar, tambah, ubah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-011, ISS-012 |
| **Serves** | SA-33, SA-10, SA-11, SA-12 |
| **Covers** | AC-015-1 |

## Deskripsi

Kelola Info Kontak penuh untuk admin: daftar untuk halaman kelola
(`SA-33` `getContactInfoAdmin`), tambah (`SA-10` `createContactInfo`),
ubah (`SA-11` `updateContactInfo`), dan hapus (`SA-12`
`deleteContactInfo`) — F-06.5. Sama seperti ISS-017/018/019, keempat
Server Action di sini **admin ber-sesi**, memverifikasi token JWT
secara independen di dalam fungsinya masing-masing (D-012,
`docs/techlead_01_architecture.md`) — `blocked_by` mencakup `ISS-012`
(fondasi Auth) selain `ISS-011` (tabel `ContactInfo` sendiri). Seperti
`Skill` (ISS-019), `ContactInfo` **tidak** punya status
Draf/Terbit/Arsip — begitu tersimpan, langsung tampil di halaman
Contact publik lewat `SA-28` (ISS-015, di luar cakupan issue ini). Beda
dari Project/Tulisan/Keahlian, tabel ini **flat multi-baris**: setiap
saluran kontak (termasuk email) adalah baris `ContactInfo` berdiri
sendiri, CRUD per baris (`BarisKelola`, SCR-15) menggantikan pola
"replace-all sekaligus" versi lama. Dipanggil langsung dari form admin
(bukan `fetch` ke Route Handler) — proyek ini murni Server Action,
tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-33 — `getContactInfoAdmin`

*v2.9 (D-022): menggantikan `EP-12` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-15 · FLOW-16 |
| **Entitas** | ENT-07 |

```ts
async function getContactInfoAdmin(): Promise<{
  data: { id: string; label: string; value: string; icon: string | null }[]
}>
```

**Hasil:** seluruh baris `ContactInfo`, urut input admin. Bentuk sama
dengan `SA-28` (`getContactInfo`, publik, ISS-015) — dipisah agar
konsisten pola publik/admin terpisah di seluruh dokumen ini, meski
isinya identik.

### SA-10 — `createContactInfo` · SA-11 — `updateContactInfo` · SA-12 — `deleteContactInfo`

```ts
async function createContactInfo(data: { label: string; value: string; icon?: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>

async function updateContactInfo(id: string, data: { label: string; value: string; icon?: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>

async function deleteContactInfo(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-015-1 — halaman Contact publik menampilkan versi
terbaru setelah admin menambah/mengubah/menghapus baris mana pun
(menggantikan pola "replace-all sekaligus" v1.0; CRUD per baris
konsisten dengan `BarisKelola`).

> Salinan dari SA-33, SA-10, SA-11, SA-12 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `label` (`SA-10`/`SA-11`) — wajib; teks maks. 100 karakter — nama
  saluran, mis. "Email", "LinkedIn" (ENT-07) — **`NOT NULL`** di skema,
  beda dari `icon` Skill (ISS-019) yang "wajib secara produk" lewat Zod
  saja. Tanpa constraint unik — dua baris berlabel sama diizinkan
  (beda dari `name` Skill yang unik).
- `value` (`SA-10`/`SA-11`) — wajib; teks maks. 255 karakter —
  alamat/tautan saluran; sama-sama **`NOT NULL`** di skema (ENT-07).
- `icon` (`SA-10`/`SA-11`) — opsional; teks maks. 100 karakter — murni
  opsional tanpa AC yang mensyaratkannya, beda dari `icon` Skill yang
  wajib secara produk.

## Aturan Bisnis

- `SA-33` mengembalikan **seluruh** baris `ContactInfo`, urut input
  admin — tanpa filter status karena entitas ini tidak punya kolom
  Draf/Terbit/Arsip (pola sama `Skill`, ISS-019).
- Tabel **flat multi-baris** — setiap saluran (termasuk email) adalah
  baris `ContactInfo` biasa, tanpa field email khusus; menggantikan
  desain singleton `ContactInfo`+`ContactLink` versi lama (ENT-07).
- CRUD per baris (`SA-10`/`11`/`12`) menggantikan pola "replace-all
  sekaligus" versi lama — setiap operasi hanya menyentuh satu baris,
  bukan menulis ulang seluruh daftar (ENT-07).
- Menyimpan (`createContactInfo`/`updateContactInfo`/
  `deleteContactInfo`) langsung berefek ke halaman Contact publik
  (`SA-28`, ISS-015) pada request berikutnya — tanpa cache/delay, tanpa
  status tayang terpisah. AC-015-1 (BA) literal Given/When/Then hanya
  mencontohkan "mengubah", tapi techlead_03 (§Menopang di atas) eksplisit
  membaca AC ini mencakup ketiga operasi CRUD (tambah/ubah/hapus) —
  dipakai apa adanya di sini, bukan penafsiran baru Issue Planner.
- `deleteContactInfo` adalah **hard delete** permanen (ENT-07) — tidak
  ada soft-delete/undo; FE **wajib** memanggil sesudah
  `DialogKonfirmasi` (C-12), server sendiri tidak meminta konfirmasi
  apa pun (pola sama ISS-017/018/019, meski BA tidak menuliskan AC
  konfirmasi terpisah untuk entitas ini — konvensi UI global, bukan
  per-AC).
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-10`/`11`/`12`) atau Server
  Component (`SA-33`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-33`, `SA-10`, `SA-11`, `SA-12`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-15 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `ContactInfo` (ENT-07) sudah dibuat di ISS-011. Issue
ini murni membaca, menambah, mengubah, dan menghapus baris yang sudah
bisa disimpan skema tersebut.

## Catatan Performa

- `getContactInfoAdmin` membaca seluruh baris tanpa filter — tabel
  flat kecil (jumlah baris = jumlah saluran kontak), tanpa pagination.
- `create`/`update`/`deleteContactInfo` — operasi tunggal per baris;
  tanpa kolom unik selain `id` (beda dari `Skill`/`Project`/`Post` yang
  punya `slug`/`name` unik) — tidak ada index tambahan yang relevan.

## Struktur File (referensi awal)

```
src/features/contact/
├── contact.action.ts                  ← getContactInfoAdmin, createContactInfo,
│                                          updateContactInfo, deleteContactInfo
│                                          ("use server")
├── contact.services.ts                ← use case / aturan bisnis (verifikasi
│                                          sesi)
├── contact.repository.ts              ← akses Prisma
└── contact.schema.ts                  ← validasi Zod (create/update) — belum
                                           diisi di ISS-015 (SA-28 tanpa
                                           parameter), dilengkapi di sini
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Menyambung `features/contact/` yang sudah dibuka ISS-015
(`SA-28` — `contact.action.ts`/`contact.services.ts`/
`contact.repository.ts`) — file yang sama diperluas + `contact.schema.ts`
baru, bukan folder baru. Tanpa Route Handler apa pun — seluruhnya
Server Action di `features/contact/contact.action.ts` (v2.9, D-022;
v2.10 D-023: folder ini sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-33` `getContactInfoAdmin` — daftar seluruh baris.
- [ ] `SA-10` `createContactInfo` — jalur sukses & gagal (`label`/
      `value` kosong).
- [ ] `SA-11` `updateContactInfo` — jalur sukses & gagal, sama seperti
      create.
- [ ] `SA-12` `deleteContactInfo` — hard delete.

**Out of Scope**
- Server Action baca publik (`SA-28`) — sudah selesai (ISS-015).
- Layar Contact Info & form (FE) — issue frontend (ISS-036).
- Migrasi model `ContactInfo` — sudah selesai (ISS-011).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.

## Acceptance Criteria

- [ ] Admin menambah saluran kontak baru (label + alamat/tautan) lalu
      menyimpan → saluran baru tampil di halaman Contact publik
      (AC-015-1 — dibaca luas oleh techlead_03 mencakup tambah/ubah/
      hapus, lihat Aturan Bisnis).
- [ ] Admin mengubah saluran kontak yang sudah tersimpan lalu
      menyimpan → halaman Contact publik menampilkan versi terbaru
      (AC-015-1).
- [ ] Admin menghapus saluran kontak → muncul konfirmasi dulu; setelah
      dikonfirmasi, saluran itu hilang dari halaman Contact publik
      (AC-015-1, pola `DialogKonfirmasi` C-12 sama ISS-017/018/019).
- [ ] Admin menyimpan tanpa mengisi label atau alamat/tautan → saluran
      tidak tersimpan, admin melihat pemberitahuan bagian yang harus
      diisi (`label`/`value` **`NOT NULL`** skema ENT-07).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Contact Info di peramban, admin masuk
      lebih dulu) jalur sukses & gagal keempat Server Action.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-33, SA-10, SA-11, SA-12 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-07 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-015-1 — `docs/ba_03_acceptance_criteria.md`
