# ISS-015 — [BE] Endpoint publik Contact: info kontak & kirim pesan

| | |
|---|---|
| **Label** | `backend` · `F-05` |
| **Ukuran** | M |
| **Blocked by** | ISS-011, ISS-010 |
| **Serves** | SA-28, SA-29 |
| **Covers** | AC-007-1, AC-008-1, AC-008-2 |

## Deskripsi

Baca publik info kontak (`SA-28` `getContactInfo`) dan kirim pesan
publik (`SA-29` `sendMessage`) untuk halaman Contact (SCR-07, F-05.1,
F-05.2). Berbeda dari `SA-24`..`27` (dua-duanya murni baca), `SA-29`
adalah satu-satunya Server Action baca-publik yang **menulis** data —
pengunjung mengirim pesan tanpa perlu sesi apa pun, sama seperti membaca
info kontak. Kedua Server Action melayani entitas & folder fitur berbeda
(`features/contact/` untuk `SA-28`, `features/messages/` untuk `SA-29`)
— digabung satu issue karena sama-sama membentuk satu halaman Contact
(SCR-07) yang tidak berguna dipecah lebih kecil (G-001/A-001 Issue
Planner). Dipanggil langsung dari Server Component/form (bukan `fetch`
ke Route Handler) — proyek ini murni Server Action, tanpa Route Handler
sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-28 — `getContactInfo`

| | |
|---|---|
| **Melayani** | SCR-07 · FLOW-08 |
| **Menopang** | AC-007-1 |
| **Entitas** | ENT-07 |

```ts
async function getContactInfo(): Promise<{
  data: { id: string; label: string; value: string; icon: string | null }[]
}>
```

**Hasil:** seluruh baris `ContactInfo`, tanpa urutan khusus (urut input
admin) — tabel flat kecil, tanpa parameter (AC-007-1).

### SA-29 — `sendMessage`

| | |
|---|---|
| **Melayani** | SCR-07 · FLOW-09 |
| **Menopang** | AC-008-1, AC-008-2 |
| **Entitas** | ENT-06 |

```ts
async function sendMessage(data: {
  name: string     // wajib — AC-008-2
  email: string    // wajib — AC-008-2
  message: string  // wajib — AC-008-2
}): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>
```

**Sukses:** pesan tersimpan berstatus `UNREAD` (default, pm_01 D008);
muncul di kotak pesan admin (AC-008-1, dibaca lewat `SA-34` — ISS-021).

**Gagal:** bagian wajib kosong → `error.fields`, per bagian yang salah
(AC-008-2).

> Salinan dari SA-28, SA-29 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `SA-28` — tanpa parameter; selalu membaca seluruh baris.
- `name` (`SA-29`) — wajib; teks maks. 100 karakter (AC-008-2).
- `email` (`SA-29`) — wajib; format email; teks maks. 255 karakter
  (AC-008-2).
- `message` (`SA-29`) — wajib; teks panjang, tanpa batas atas eksplisit
  (ENT-06).

## Aturan Bisnis

- `SA-28` tidak pernah gagal secara bisnis — baik terisi maupun kosong
  sama-sama respons sah (`{ data: [...] }`). Daftar kosong (belum ada
  baris `ContactInfo` tersimpan) bukan skenario yang diuji AC manapun di
  issue ini — beda dari Project/Post yang punya AC-003-2/AC-005-2 khusus
  status kosong, karena `ContactInfo` **tanpa** status Draf/Terbit (D-009,
  `docs/techlead_01_architecture.md`): begitu admin menyimpan satu baris,
  langsung tampil publik.
- `SA-29` selalu membuat pesan berstatus `UNREAD` — pengirim publik tidak
  pernah memilih status (server yang menetapkan, bukan parameter masuk).
  Tanpa Server Action ubah/hapus untuk pengirim — sekali terkirim, pesan
  sepenuhnya jadi milik alur kelola admin (`SA-13`/14/15 — ISS-021).
- `SA-29` **publik** meski bentuknya menulis data — Matriks Akses
  (`docs/techlead_03_api_contract.md`) menandainya dapat dipanggil tanpa
  maupun dengan sesi; "Server Action" di sini murni pilihan mekanisme
  pemanggilan (fungsi vs REST), bukan penanda otomatis "aksi admin"
  (§Konvensi techlead_03).
- Dipanggil langsung dari Server Component (`SA-28`) / form (`SA-29`) —
  bukan Route Handler, tidak melalui `fetch`/path HTTP (v2.9, D-022
  `docs/techlead_01_architecture.md`). Tanpa sesi apa pun — publik murni.

## Auth & Permission

- Kedua Server Action: **publik**, tanpa sesi (Matriks Akses,
  `docs/techlead_03_api_contract.md`).

## Perubahan Database

Tidak ada — tabel `ContactInfo` (ENT-07) sudah dibuat di ISS-011; tabel
`Message` (ENT-06) sudah dibuat di ISS-010. Issue ini murni membaca
`ContactInfo` yang sudah ada dan membuat satu baris baru `Message`,
tanpa mengubah skema.

## Catatan Performa

- `getContactInfo`: tanpa index relevan — tabel flat kecil (jumlah baris
  = jumlah saluran kontak), dibaca utuh tanpa filter.
- `sendMessage`: operasi insert tunggal — index majemuk `status,
  createdAt` pada `Message` (dari ISS-010) melayani baca daftar admin
  (`SA-34`, ISS-021), tidak relevan untuk penulisan di issue ini.

## Struktur File (referensi awal)

```
src/features/contact/
├── contact.action.ts                  ← getContactInfo ("use server")
├── contact.services.ts                ← use case (baca seluruh baris)
└── contact.repository.ts              ← akses Prisma
                                        (contact.schema.ts belum diisi di sini —
                                         SA-28 tanpa parameter; ditambahkan ISS-020
                                         utk validasi SA-10/11/12)
src/features/messages/
├── messages.action.ts                 ← sendMessage ("use server")
├── messages.services.ts               ← use case (set status UNREAD)
├── messages.repository.ts             ← akses Prisma (insert baris Message)
└── messages.schema.ts                 ← validasi Zod (name, email, message)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari kompilasi sebelumnya: **tidak ada**
`app/api/contact/route.ts` atau `app/api/messages/route.ts` — keduanya
digantikan Server Action di `features/contact/contact.action.ts` &
`features/messages/messages.action.ts` (v2.9, D-022; v2.10 D-023: kedua
folder fitur ini sendiri pindah dari
`domain/application/infrastructure/presentation` ke pola flat 4-file di
atas).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-28` `getContactInfo` — jalur daftar berisi & daftar kosong.
- [ ] `SA-29` `sendMessage` — jalur sukses & gagal (validasi wajib per
      bagian).

**Out of Scope**
- Server Action kelola Info Kontak (create/update/delete, `SA-10/11/12`)
  & baca admin (`SA-33`, daftar kelola) — ISS-020.
- Server Action baca daftar pesan admin (`SA-34`) & transisi status
  (`SA-13/14/15`) — ISS-021.
- Layar Contact (FE) yang mengonsumsi Server Action ini — issue
  frontend.
- Migrasi model `ContactInfo`/`Message` — sudah selesai (ISS-011,
  ISS-010).

## Acceptance Criteria

- [ ] Pengunjung membuka halaman Contact → info kontak yang dikelola
      admin tampil (AC-007-1).
- [ ] Pengunjung mengisi formulir dengan lengkap lalu mengirimnya →
      pengunjung melihat tanda pesan terkirim, dan pesan itu muncul di
      kotak pesan halaman admin (AC-008-1).
- [ ] Pengunjung mengirim formulir dengan isian wajib kosong → pesan
      tidak terkirim, pengunjung melihat pemberitahuan bagian yang harus
      diisi (AC-008-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Contact di peramban) jalur sukses &
      gagal `SA-28`/`SA-29`.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-28, SA-29 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-06, ENT-07 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-007-1, AC-008-1, AC-008-2 —
  `docs/ba_03_acceptance_criteria.md`
