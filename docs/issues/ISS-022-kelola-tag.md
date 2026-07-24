# ISS-022 — [BE] Kelola tag: daftar, tambah, ubah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-007, ISS-012 |
| **Serves** | SA-35, SA-16, SA-17, SA-18 |
| **Covers** | AC-021-1, AC-021-2 |

## Deskripsi

Kelola Tag penuh untuk admin: daftar untuk halaman kelola (`SA-35`
`getTagsAdmin`), tambah (`SA-16` `createTag`), ubah (`SA-17`
`updateTag`), dan hapus (`SA-18` `deleteTag`) — F-06.8, referensi
desain admin client (pm_01 D009) yang mencabut keputusan lama
"inline-only tanpa halaman kelola" (G-014 BA). Sama seperti
ISS-017/018/019/020, keempat Server Action di sini **admin ber-sesi**,
memverifikasi token JWT secara independen di dalam fungsinya
masing-masing (D-012, `docs/techlead_01_architecture.md`) —
`blocked_by` mencakup `ISS-012` (fondasi Auth) selain `ISS-007` (tabel
`Tag` sendiri). Seperti `Skill`/`ContactInfo`, `Tag` **tidak** punya
status Draf/Terbit/Arsip. Berbeda dari seluruh entitas kelola
sebelumnya, `Tag` **dipakai bersama** dua fitur lain (`tagIds` di
`Project`/`Post`, ISS-017/018) — menghapus tag yang masih terpakai
hanya melepas keterkaitannya (Prisma `disconnect` m-n implisit), tidak
menghapus Project/Tulisan itu sendiri (AC-021-2). Tanpa Server Action
baca publik sama sekali — beda dari `Skill`/`ContactInfo` (masing-
masing punya `SA-38`/`SA-28`) — Tag murni metadata pendukung, belum
ada kebutuhan filter publik (G-014 BA). Dipanggil langsung dari form
admin (bukan `fetch` ke Route Handler) — proyek ini murni Server
Action, tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-35 — `getTagsAdmin`

*v2.9 (D-022): menggantikan `EP-14` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-17 · FLOW-21 |
| **Entitas** | ENT-03 |

```ts
async function getTagsAdmin(): Promise<{
  data: { id: string; name: string }[]
}>
```

**Hasil:** seluruh baris `Tag`, urut input admin.

### SA-16 — `createTag` · SA-17 — `updateTag` · SA-18 — `deleteTag`

```ts
async function createTag(data: { name: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>
// name* wajib (AC-021-1); slug dibuat otomatis dari name (D-010)

async function updateTag(id: string, data: { name: string }): Promise<
  | { data: { id: string } }
  | { error: { fields: Record<string, string> } }
>

async function deleteTag(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
// Melepas relasi dari Project/Post yang memakainya (Prisma disconnect
// otomatis via implicit m-n) — tidak menghapus Project/Post itu sendiri
```

**Menopang:** AC-021-1 (tambah), AC-021-2 (ubah/hapus, selalu sesudah
konfirmasi FE) — daftar Tag di form Project/Tulisan menampilkan versi
terbaru setelah revalidate.

> Salinan dari SA-35, SA-16, SA-17, SA-18 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `name` (`SA-16`/`SA-17`) — wajib; teks maks. 50 karakter; **unik**
  (AC-021-1, ENT-03).
- `slug` — **tidak** jadi parameter `SA-16`/`SA-17` — dibuat otomatis
  dari `name` (D-010), disiapkan di skema tapi belum ada route yang
  memakainya (ENT-03); tidak diminta maupun ditampilkan ke admin.

## Aturan Bisnis

- `SA-35` mengembalikan **seluruh** baris `Tag`, urut input admin —
  tabel flat tanpa status Draf/Terbit/Arsip (pola sama Skill/
  ContactInfo, ISS-019/020).
- `slug` dibuat otomatis dari `name` (D-010) saat `createTag`/
  `updateTag` — disiapkan di skema, **tidak** diekspos ke FE maupun
  diminta dari admin, agar siap bila kebutuhan filter/halaman-per-tag
  publik muncul nanti (G-014 BA) — belum ada di kontrak saat ini.
- `deleteTag` **tidak** menghapus `Project`/`Post` yang memakai tag
  tsb — hanya melepas baris di tabel penghubung implisit
  (`_ProjectToTag`/`_PostToTag`) lewat `disconnect` otomatis Prisma
  (AC-021-2, ENT-03); baris `Tag` itu sendiri tetap **hard delete**
  permanen (bukan soft-delete) — yang "dilepas, bukan dihapus" adalah
  keterkaitannya, bukan Tag itu sendiri.
- Menyimpan (`createTag`/`updateTag`/`deleteTag`) langsung membuat
  daftar Tag di form Project/Tulisan menampilkan versi terbaru pada
  request berikutnya — tanpa cache/delay (AC-021-1, AC-021-2).
- FE **wajib** memanggil `deleteTag` sesudah `DialogKonfirmasi`
  (C-12), server sendiri tidak meminta konfirmasi apa pun (AC-021-2,
  pola sama ISS-017/018/019/020).
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-16`/`17`/`18`) atau Server
  Component (`SA-35`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-35`, `SA-16`, `SA-17`, `SA-18`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-17 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Tag` (ENT-03) sudah dibuat di ISS-007. Issue ini
murni membaca, menambah, mengubah, dan menghapus baris yang sudah bisa
disimpan skema tersebut (termasuk melepas relasi m-n implisit ke
`Project`/`Post` saat hapus, ditangani otomatis oleh Prisma, tanpa
migrasi tambahan).

## Catatan Performa

- `getTagsAdmin` membaca seluruh baris tanpa filter — tabel kecil,
  tanpa pagination; `name`/`slug` sudah unik (index otomatis lewat
  `@unique`, dari ISS-007).
- `deleteTag` — selain menghapus baris `Tag`, Prisma juga menghapus
  baris terkait di tabel penghubung implisit (`_ProjectToTag`/
  `_PostToTag`) dalam operasi yang sama — tanpa query tambahan dari
  sisi aplikasi.

## Struktur File (referensi awal)

```
src/features/tags/
├── tags.action.ts                     ← getTagsAdmin, createTag,
│                                          updateTag, deleteTag ("use server")
├── tags.services.ts                   ← use case / aturan bisnis (verifikasi
│                                          sesi, slug otomatis)
├── tags.repository.ts                 ← akses Prisma
└── tags.schema.ts                     ← validasi Zod (create/update)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari `features/skills/`/`features/contact/` (sudah
dibuka lebih dulu oleh ISS-016/ISS-015 lewat Server Action baca
publik) — `features/tags/` **belum pernah dibuka issue manapun**:
`Tag` tidak punya Server Action baca publik sama sekali (G-014 BA,
belum ada kebutuhan filter publik), jadi seluruh 4 file dibuka utuh di
issue ini. Tanpa Route Handler apa pun — seluruhnya Server Action di
`features/tags/tags.action.ts` (v2.9, D-022; v2.10 D-023: folder ini
sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-35` `getTagsAdmin` — daftar seluruh baris.
- [ ] `SA-16` `createTag` — jalur sukses & gagal (`name` kosong atau
      duplikat).
- [ ] `SA-17` `updateTag` — jalur sukses & gagal, sama seperti create.
- [ ] `SA-18` `deleteTag` — hard delete baris `Tag` + disconnect
      otomatis dari `Project`/`Post` terkait.

**Out of Scope**
- Layar Tags & form (FE) — issue frontend (ISS-038).
- Migrasi model `Tag` — sudah selesai (ISS-007).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.
- Filter/halaman-per-tag di sisi publik — tidak ada di kontrak saat
  ini (G-014 BA); `slug` disiapkan tapi belum dipakai route mana pun.
- Validasi `tagIds` yang dikirim dari form Project/Tulisan — bagian
  `SA-01/02` (ISS-017) & `SA-04/05` (ISS-018), bukan issue ini.

## Acceptance Criteria

- [ ] Admin menambah tag baru (nama) lalu menyimpan → tag tersimpan
      dan tersedia dipilih di form Project/Tulisan (AC-021-1).
- [ ] Admin menyimpan tanpa mengisi nama → tag tidak tersimpan, admin
      melihat pemberitahuan bagian yang harus diisi (AC-021-1, pola
      sama ISS-017/018/019).
- [ ] Admin mengubah tag yang sudah tersimpan lalu menyimpan → daftar
      tag menampilkan versi terbaru (AC-021-2).
- [ ] Admin menghapus tag → muncul konfirmasi dulu; setelah
      dikonfirmasi, tag hilang dari daftar (AC-021-2).
- [ ] Admin menghapus tag yang sedang dipakai satu atau lebih
      Project/Tulisan → keterkaitannya terlepas dari Project/Tulisan
      itu, tapi Project/Tulisan itu sendiri tetap ada, tidak ikut
      terhapus (AC-021-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Tags di peramban, admin masuk lebih
      dulu) jalur sukses & gagal keempat Server Action, termasuk hapus
      tag yang sedang dipakai project/tulisan.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-35, SA-16, SA-17, SA-18 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-03 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-021-1, AC-021-2 —
  `docs/ba_03_acceptance_criteria.md`
