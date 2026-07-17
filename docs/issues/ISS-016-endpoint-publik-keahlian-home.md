# ISS-016 — [BE] Endpoint publik keahlian untuk Home

| | |
|---|---|
| **Label** | `backend` · `F-01` |
| **Ukuran** | S |
| **Blocked by** | ISS-008 |
| **Serves** | SA-38 |
| **Covers** | AC-019-1, AC-019-3 |

## Deskripsi

Baca publik keahlian (`SA-38` `getSkills`) untuk bagian Keahlian di
halaman Home (SCR-01, F-01.2). Berbeda dari `SA-24`/`SA-26`
(Project/Tulisan, masing-masing melayani **dua** layar — sorotan Home +
halaman daftar penuh tersendiri, dibedakan parameter `limit`), `Skill`
**tidak** punya halaman daftar publik sendiri — Home satu-satunya
tempat publik membaca Keahlian, jadi `SA-38` selalu mengembalikan
seluruh baris tanpa parameter apa pun (pola D-006 tidak berlaku di sini
karena memang tidak ada dua kebutuhan yang perlu dibedakan). Melengkapi
`SA-32` (`getSkillsAdmin`, ISS-019) yang khusus admin — keduanya membaca
tabel yang sama, dipisah karena beda trust-boundary (publik vs admin),
bukan beda logika baca. Dipanggil langsung dari Server Component (bukan
`fetch` ke Route Handler) — proyek ini murni Server Action, tanpa Route
Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-38 — `getSkills` (publik)

| | |
|---|---|
| **Melayani** | SCR-01 · FLOW-02 |
| **Menopang** | AC-019-1, AC-019-3 |
| **Entitas** | ENT-04 |

*Melengkapi `SA-32` (`getSkillsAdmin`) yang admin-only.*

```ts
async function getSkills(): Promise<{
  data: { id: string; name: string; icon: string | null }[]
}>
```

**Hasil:** seluruh baris `Skill`, tanpa urutan khusus (urut input
admin); daftar kosong adalah respons sah — bagian Keahlian di Home
disembunyikan bersama sorotan lain saat kosong (AC-019-3).

> Salinan dari SA-38 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

Tidak ada — `SA-38` tidak menerima parameter apa pun.

## Aturan Bisnis

- Seluruh baris `Skill` tampil, tanpa filter status — `Skill` tidak
  punya kolom Draf/Terbit (beda dari Project/Post, ENT-04
  `docs/techlead_02_database.md`); begitu admin menyimpan satu baris,
  langsung tampil publik.
- Daftar kosong = hasil sah (array kosong), bukan error (AC-019-3) —
  bagian Keahlian di Home disembunyikan, pola sama dengan sorotan
  Project/Tulisan kosong (ISS-013, ISS-014).
- `icon` tidak `NOT NULL` di skema tapi wajib secara produk lewat
  validasi Zod saat admin menyimpan (`SA-07`/`SA-08` — ISS-019); publik
  hanya membaca apa adanya, dapat bernilai `null` untuk data yang belum
  lengkap.
- `slug` ada di skema `Skill` tapi **tidak** dikembalikan `SA-38` —
  field ini "disiapkan, belum ada route yang memakainya" (ENT-04,
  `docs/techlead_02_database.md`); dikeluarkan sengaja dari bentuk
  respons publik, bukan kelalaian.
- Dipanggil langsung dari Server Component — bukan Route Handler, tidak
  melalui `fetch`/path HTTP (v2.9, D-022
  `docs/techlead_01_architecture.md`). Tanpa sesi apa pun — publik
  murni.

## Auth & Permission

- `SA-38`: **publik**, tanpa sesi (Matriks Akses,
  `docs/techlead_03_api_contract.md`).

## Perubahan Database

Tidak ada — tabel `Skill` (ENT-04) sudah dibuat di ISS-008. Issue ini
murni membaca data yang sudah ada.

## Catatan Performa

Tidak ada — tabel kecil, `name`/`slug` sudah unik (index otomatis lewat
`@unique`, dari ISS-008); tanpa pagination.

## Struktur File (referensi awal)

```
src/features/skills/
├── skills.action.ts                   ← getSkills ("use server")
├── skills.services.ts                 ← use case (baca seluruh baris)
└── skills.repository.ts               ← akses Prisma
                                        (skills.schema.ts belum diisi di sini —
                                         SA-38 tanpa parameter; ditambahkan ISS-019
                                         utk validasi SA-07/08)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari kompilasi sebelumnya: **tidak ada lagi**
`app/api/skills/route.ts` — digantikan Server Action di
`features/skills/skills.action.ts` (asal `EP-17` v2.3, dicabut v2.9
D-022; v2.10 D-023: `features/skills/` sendiri pindah dari
`domain/application/infrastructure/presentation` ke pola flat 4-file di
atas).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-38` `getSkills` — jalur daftar berisi & daftar kosong.

**Out of Scope**
- Server Action kelola Keahlian (create/update/delete, `SA-07/08/09`) &
  baca admin (`SA-32`, daftar kelola) — ISS-019.
- Layar Home (FE) yang mengonsumsi Server Action ini — issue frontend.
- Migrasi model `Skill` — sudah selesai (ISS-008).

## Acceptance Criteria

- [ ] Sudah ada `Skill` tersimpan → bagian Keahlian di Home tampil —
      bagian Keahlian dari AC-019-1 (bagian Project/Tulisan ditopang
      ISS-013/ISS-014).
- [ ] Belum ada `Skill` tersimpan → bagian Keahlian di Home tidak
      tampil rusak/membingungkan — bagian Keahlian dari AC-019-3
      (bagian Project/Tulisan ditopang ISS-013/ISS-014).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Home di peramban) jalur `SA-38` berisi
      & kosong.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-38 — `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-04 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-019-1 (sebagian), AC-019-3 (sebagian) —
  `docs/ba_03_acceptance_criteria.md`
