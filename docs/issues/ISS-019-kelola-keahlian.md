# ISS-019 — [BE] Kelola keahlian: daftar, tambah, ubah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-008, ISS-012 |
| **Serves** | SA-32, SA-07, SA-08, SA-09 |
| **Covers** | AC-014-1, AC-014-2 |

## Deskripsi

Kelola Keahlian penuh untuk admin: daftar untuk halaman kelola (`SA-32`
`getSkillsAdmin`), tambah (`SA-07` `createSkill`), ubah (`SA-08`
`updateSkill`), dan hapus (`SA-09` `deleteSkill`) — F-06.4. Sama seperti
ISS-017 (Kelola Project) dan ISS-018 (Kelola Tulisan), keempat Server
Action di sini **admin ber-sesi**, memverifikasi token JWT secara
independen di dalam fungsinya masing-masing (D-012,
`docs/techlead_01_architecture.md`) — `blocked_by` mencakup `ISS-012`
(fondasi Auth) selain `ISS-008` (tabel `Skill` sendiri). Berbeda dari
ISS-017/018, `Skill` **tidak** punya status Draf/Terbit/Arsip — begitu
tersimpan, langsung tampil di ringkasan Keahlian Home lewat `SA-38`
(ISS-016, publik, di luar cakupan issue ini). Dipanggil langsung dari
form admin (bukan `fetch` ke Route Handler) — proyek ini murni Server
Action, tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-32 — `getSkillsAdmin`

*v2.9 (D-022): menggantikan `EP-11` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-14 · FLOW-15 |
| **Entitas** | ENT-04 |

```ts
async function getSkillsAdmin(): Promise<{
  data: { id: string; name: string; icon: string | null }[]
}>
```

**Hasil:** seluruh baris `Skill`, urut input admin. Berbeda dari `SA-38`
(`getSkills`, ISS-016) yang publik — dipisah karena beda
trust-boundary, bukan beda logika baca.

### SA-07 — `createSkill` · SA-08 — `updateSkill` · SA-09 — `deleteSkill`

```ts
async function createSkill(data: { name: string; icon: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>
// name* & icon* wajib (AC-014-1)

async function updateSkill(id: string, data: { name: string; icon: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>

async function deleteSkill(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-014-1 (tambah), AC-014-2 (ubah/hapus, selalu sesudah
konfirmasi FE) — ringkasan Home menampilkan versi terbaru setelah
revalidate.

> Salinan dari SA-32, SA-07, SA-08, SA-09 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `name` (`SA-07`/`SA-08`) — wajib; teks maks. 50 karakter; **unik**
  (AC-014-1, ENT-04) — beda dari `title` Project/Post yang tidak unik.
- `icon` (`SA-07`/`SA-08`) — wajib secara produk ("nama + ikon",
  AC-014-1) meski divalidasi di Zod, bukan `NOT NULL` skema — konsisten
  pola `description` Project/Post (ISS-017/018); teks maks. 100
  karakter, nama ikon dari daftar tech-stack (SCR-14).
- `slug` — **tidak** jadi parameter `SA-07`/`SA-08` — dibuat otomatis
  dari `name` (D-010), disiapkan di skema tapi belum ada route yang
  memakainya (ENT-04); tidak diminta maupun ditampilkan ke admin.

## Aturan Bisnis

- `SA-32` mengembalikan **seluruh** baris `Skill`, urut input admin —
  tanpa filter status karena `Skill` tidak punya kolom Draf/Terbit/Arsip
  (beda dari `SA-30`/`SA-31` Project/Post, ISS-017/018).
- `slug` dibuat otomatis dari `name` (D-010) saat `createSkill`/
  `updateSkill` — disiapkan di skema, **tidak** diekspos ke FE maupun
  diminta dari admin (ENT-04, konsisten `SA-38` yang juga tidak
  mengembalikannya).
- Menyimpan (`createSkill`/`updateSkill`) langsung berefek ke ringkasan
  Keahlian di Home publik (`SA-38`, ISS-016) pada request berikutnya —
  tanpa cache/delay, tanpa status tayang terpisah (beda dari
  Project/Post yang perlu status `PUBLISHED` dulu).
- `deleteSkill` adalah **hard delete** permanen (ENT-04, ISS-008) —
  tidak ada soft-delete/undo; FE **wajib** memanggil sesudah
  `DialogKonfirmasi` (C-12), server sendiri tidak meminta konfirmasi
  apa pun (AC-014-2).
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-07`/`08`/`09`) atau Server
  Component (`SA-32`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-32`, `SA-07`, `SA-08`, `SA-09`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-14 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Skill` (ENT-04) sudah dibuat di ISS-008. Issue ini
murni membaca, menambah, mengubah, dan menghapus baris yang sudah bisa
disimpan skema tersebut.

## Catatan Performa

- `getSkillsAdmin` membaca seluruh baris tanpa filter — tabel kecil
  (skala portofolio pribadi), tanpa pagination.
- `create`/`update`/`deleteSkill` — operasi tunggal per baris; index
  `name`/`slug` (dari ISS-008) menjaga keduanya tetap unik saat
  tersimpan.

## Struktur File (referensi awal)

```
src/features/skills/
├── skills.action.ts                   ← getSkillsAdmin, createSkill,
│                                          updateSkill, deleteSkill ("use server")
├── skills.services.ts                 ← use case / aturan bisnis (verifikasi
│                                          sesi, slug otomatis)
├── skills.repository.ts               ← akses Prisma
└── skills.schema.ts                   ← validasi Zod (create/update) —
                                           belum diisi di ISS-016 (SA-38
                                           tanpa parameter), dilengkapi di sini
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Menyambung `features/skills/` yang sudah dibuka ISS-016
(`SA-38` — `skills.action.ts`/`skills.services.ts`/`skills.repository.ts`)
— file yang sama diperluas + `skills.schema.ts` baru, bukan folder baru.
Tanpa Route Handler apa pun — seluruhnya Server Action di
`features/skills/skills.action.ts` (v2.9, D-022; v2.10 D-023: folder ini
sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-32` `getSkillsAdmin` — daftar seluruh baris.
- [ ] `SA-07` `createSkill` — jalur sukses & gagal (`name`/`icon`
      kosong atau `name` duplikat).
- [ ] `SA-08` `updateSkill` — jalur sukses & gagal, sama seperti
      create.
- [ ] `SA-09` `deleteSkill` — hard delete.

**Out of Scope**
- Server Action baca publik (`SA-38`) — sudah selesai (ISS-016).
- Layar Skills & form (FE) — issue frontend (ISS-035).
- Migrasi model `Skill` — sudah selesai (ISS-008).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.

## Acceptance Criteria

- [ ] Admin menambah keahlian baru (nama + ikon) lalu menyimpan →
      keahlian tersimpan dan tampil di ringkasan Keahlian pada halaman
      Home (AC-014-1).
- [ ] Admin menyimpan tanpa mengisi nama atau ikon → keahlian tidak
      tersimpan, admin melihat pemberitahuan bagian yang harus diisi
      (AC-014-1 — secara harfiah hanya mencontohkan jalur sukses, tapi
      `SA-07` tech lead eksplisit mengaitkan validasi "name*/icon*
      wajib" ke AC ini; pola sama ISS-017/018).
- [ ] Admin mengubah keahlian yang sudah tersimpan lalu menyimpan →
      ringkasan Home menampilkan versi terbaru (AC-014-2).
- [ ] Admin menghapus keahlian → muncul konfirmasi dulu; setelah
      dikonfirmasi, keahlian hilang dari ringkasan Home (AC-014-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Skills di peramban, admin masuk lebih
      dulu) jalur sukses & gagal keempat Server Action.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-32, SA-07, SA-08, SA-09 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-04 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-014-1, AC-014-2 —
  `docs/ba_03_acceptance_criteria.md`
