# ISS-018 — [BE] Kelola tulisan: daftar, tulis, ubah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-006, ISS-012 |
| **Serves** | SA-31, SA-04, SA-05, SA-06 |
| **Covers** | AC-012-1, AC-012-2, AC-013-1, AC-013-2, AC-013-3, AC-013-4 |

## Deskripsi

Kelola Tulisan penuh untuk admin: daftar untuk halaman kelola (`SA-31`
`getPostsAdmin`), tulis (`SA-04` `createPost`), ubah (`SA-05`
`updatePost`), dan hapus (`SA-06` `deletePost`) — F-06.3. Sama seperti
ISS-017 (Kelola Project), keempat Server Action di sini **admin
ber-sesi**, memverifikasi token JWT secara independen di dalam
fungsinya masing-masing (D-012, `docs/techlead_01_architecture.md`) —
`blocked_by` mencakup `ISS-012` (fondasi Auth) selain `ISS-006` (tabel
`Post` sendiri). Status (`Draf`/`Terbit`/`Arsip`) dikelola penuh di
sini — mengubah status tulisan yang sudah tersimpan langsung berefek ke
tampilan Blog publik (AC-013-1, AC-013-3, AC-013-4), tanpa Server
Action transisi status terpisah (beda pola dari `Message` — `SA-13`..
`15`, ISS-021). Dipanggil langsung dari form admin (bukan `fetch` ke
Route Handler) — proyek ini murni Server Action, tanpa Route Handler
sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-31 — `getPostsAdmin`

| | |
|---|---|
| **Melayani** | SCR-12 · FLOW-13, FLOW-14 |
| **Entitas** | ENT-02 |

```ts
async function getPostsAdmin(): Promise<{
  data: { id: string; title: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[]
}>
```

**Hasil:** seluruh status (Draf/Terbit/Arsip), urut `createdAt desc` —
`createdAt` di sini yang mengisi kolom "tanggal terbit" pada baris
`BarisKelola` (C-11, `uiux_02_wireframe.md` SCR-12); berbeda dari
`publishedAt` yang dipakai publik (`SA-26`), `createdAt` selalu terisi
untuk tulisan berstatus apa pun, termasuk Draf yang belum pernah
terbit.

### SA-04 — `createPost`

| | |
|---|---|
| **Melayani** | SCR-13 · FLOW-13 |
| **Menopang** | AC-012-1, AC-012-2 |
| **Entitas** | ENT-02 |

```ts
async function createPost(data: {
  title: string
  description?: string
  content: string
  thumbnailImage?: string   // URL dipilih dari galeri Media — v2.12 D-025
  tagIds?: string[]
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED"   // default DRAFT
  // readingTime TIDAK di parameter — dihitung server-side dari content
}): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
```

*Parameter objek biasa, bukan `FormData` (v2.12, D-025) — sejak
`thumbnailImage` cuma URL string, Server Action ini tidak lagi
menyertakan unggahan berkas apa pun.*

**Sukses:** tulisan tersimpan; `slug` dibuat otomatis dari `title`
(D-010); `readingTime` dihitung dari panjang `content`; bila `status:
PUBLISHED`, tampil di Blog publik & `publishedAt` diisi (AC-012-1).

**Gagal:** `title` atau `content` kosong → `error.fields` — AC-012-2
secara harfiah hanya mencontohkan `judul` kosong, tapi `content` ikut
wajib mengikuti `NOT NULL` skema `Post` (ENT-02, pola sama ISS-017).

### SA-05 — `updatePost` · SA-06 — `deletePost`

```ts
async function updatePost(id: string, data: /* sama SA-04 */): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
// tanpa membuat slug baru kecuali title berubah;
// readingTime dihitung ulang bila content berubah

async function deletePost(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** `updatePost` → AC-013-1 (perubahan tampil di publik),
AC-013-3 (Draf→Terbit mulai tampil), AC-013-4 (Terbit→Arsip hilang
dari publik namun tetap ada di Kelola Tulisan, dapat dikembalikan
kapan saja); `deletePost` → AC-013-2 (hard delete permanen, FE selalu
memanggil sesudah `DialogKonfirmasi` C-12 — tidak ada konfirmasi di
lapisan server).

> Salinan dari SA-31, SA-04, SA-05, SA-06 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `title` (`SA-04`/`SA-05`) — wajib; teks maks. 200 karakter
  (AC-012-2).
- `content` (`SA-04`/`SA-05`) — wajib; teks panjang, isi tulisan —
  **`NOT NULL`** di skema (ENT-02, `docs/techlead_02_database.md`);
  AC-012-2 secara harfiah hanya mencontohkan `title` kosong, tapi
  `content` kosong sama-sama memicu `error.fields` (pola sama ISS-017).
- `description` (`SA-04`/`SA-05`) — **opsional**; cuplikan yang tampil
  di `ItemTulisan` (C-05); maks. 300 karakter — beda dari `description`
  Project yang "wajib secara produk" (ISS-017); Post membolehkannya
  kosong (ISS-006).
- `readingTime` — **tidak** dikirim FE; dihitung server-side dari
  panjang `content` setiap kali disimpan (create maupun update) —
  tidak pernah dihitung ulang saat sekadar dibaca (ENT-02).
- `thumbnailImage` — opsional; URL string, **bukan berkas** (v2.12,
  D-025) — dipilih admin dari galeri Media yang sudah diunggah lebih
  dulu lewat halaman Media (`SA-19` `uploadMedia`, ISS-023). `SA-04`/
  `SA-05` **tidak** menerima/mengunggah berkas apa pun; tanpa validasi
  ukuran/jenis file di sini (itu ada di `uploadMedia`, G-003,
  `docs/techlead_01_architecture.md`).
- `tagIds` — opsional; array id, dipilih dari daftar Tag yang sudah
  ada (`SA-35`) — bukan ketik-bebas (G-014 BA). Tulisan **tidak**
  punya `skillIds` (beda dari Project — ENT-02 tanpa relasi ke
  `Skill`).
- `status` — salah satu `DRAFT`/`PUBLISHED`/`ARCHIVED`; default
  `DRAFT` untuk tulisan baru (G-011 BA).

## Aturan Bisnis

- `SA-31` mengembalikan **seluruh** status (Draf/Terbit/Arsip) — beda
  dari `SA-26` publik yang hanya `Terbit`; urut `createdAt desc`
  (konsisten pola ISS-017/`SA-30`).
- `slug` dibuat otomatis dari `title` (D-010) — **tidak** dibuat ulang
  saat `updatePost` kecuali `title` berubah.
- `readingTime` dihitung ulang setiap kali `content` disimpan (baik
  saat `createPost` maupun `updatePost`) — "dihitung sekali saat
  simpan" (ENT-02) berarti sekali *per operasi simpan*, bukan sekali
  seumur hidup baris seperti `publishedAt`.
- `publishedAt` diisi **sekali** saat status pertama kali menyentuh
  `PUBLISHED` — tidak berubah lagi setelahnya, termasuk saat
  Arsip→Terbit lagi (AC-013-4) — mencegah tulisan lama "melompat" ke
  atas seolah baru di urutan publik (ISS-006, ISS-014).
- `deletePost` adalah **hard delete** permanen (ENT-02, ISS-006) —
  tidak ada soft-delete/undo; FE **wajib** memanggil sesudah
  `DialogKonfirmasi` (C-12), server sendiri tidak meminta konfirmasi
  apa pun (AC-013-2).
- Mengubah `status` tulisan yang sudah ada **langsung** berefek ke
  Blog publik pada request berikutnya — tanpa cache/delay, tanpa
  Server Action transisi status terpisah.
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-04`/`05`/`06`) atau Server
  Component (`SA-31`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-31`, `SA-04`, `SA-05`, `SA-06`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-12, SCR-13 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Post` (ENT-02) sudah dibuat di ISS-006, termasuk
relasi m-n ke `Tag`. Issue ini murni membaca, menambah, mengubah, dan
menghapus baris yang sudah bisa disimpan skema tersebut.

## Catatan Performa

- `getPostsAdmin` membaca seluruh baris tanpa filter status — tabel
  kecil (skala 1 admin), tanpa pagination; index `status, publishedAt`
  (dari ISS-006) tidak relevan di sini karena tanpa filter status.
- `create`/`update`/`deletePost` — operasi tunggal per baris; index
  `slug` (dari ISS-006) menjaga `slug` tetap unik saat tersimpan.

## Struktur File (referensi awal)

```
src/features/posts/
├── posts.action.ts                    ← getPostsAdmin, createPost,
│                                          updatePost, deletePost ("use server")
├── posts.services.ts                  ← use case / aturan bisnis (slug stabil,
│                                          readingTime, publishedAt sekali isi,
│                                          verifikasi sesi)
├── posts.repository.ts                ← akses Prisma (thumbnailImage disimpan
│                                          sbg string biasa — TANPA panggil R2,
│                                          v2.12 D-025)
└── posts.schema.ts                    ← validasi Zod (create/update)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Menyambung `features/posts/` yang sudah dibuka ISS-014
(`SA-26`/`27`) — file yang sama diperluas, bukan folder baru. Berbeda
dari kompilasi sebelumnya: **tidak ada**
`app/api/admin/posts/route.ts` maupun `[id]/route.ts` — seluruhnya
Server Action di `features/posts/posts.action.ts` (v2.9, D-022; v2.10
D-023: folder ini sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-31` `getPostsAdmin` — daftar seluruh status.
- [ ] `SA-04` `createPost` — jalur sukses & gagal (`title`/`content`
      kosong), `readingTime` terhitung otomatis, `thumbnailImage`
      opsional (URL, bukan unggahan).
- [ ] `SA-05` `updatePost` — jalur sukses & gagal, termasuk transisi
      status (Draf→Terbit, Terbit→Arsip, Arsip→Terbit) & `readingTime`
      terhitung ulang saat `content` berubah.
- [ ] `SA-06` `deletePost` — hard delete.

**Out of Scope**
- Server Action baca publik (`SA-26`, `SA-27`) — sudah selesai
  (ISS-014).
- Unggahan berkas gambar ke Cloudflare R2 (`SA-19` `uploadMedia`) —
  ISS-023, satu-satunya jalur unggahan di proyek ini (v2.12, D-025).
  Issue ini cuma menyimpan `thumbnailImage` sebagai URL string.
- Layar Kelola Tulisan & Form Tulisan (FE) — ISS-034. **Catatan:**
  `uiux_02_wireframe.md` SCR-13 belum mencantumkan field input
  `description`/cuplikan (gap non-blocking `G-011`,
  `docs/memory/issue.yaml`) — perlu ditambal sebelum ISS-034
  dikompilasi; tidak menghambat issue backend ini.
- Migrasi model `Post` — sudah selesai (ISS-006).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.

## Acceptance Criteria

- [ ] Admin menulis tulisan baru (judul & isi), memilih status Terbit,
      lalu menyimpan → tulisan langsung tampil di Blog publik sebagai
      yang terbaru; bila status Draf, tersimpan namun belum tampil
      publik (AC-012-1).
- [ ] Admin menyimpan tanpa mengisi judul → tulisan tidak tersimpan,
      admin melihat pemberitahuan bagian yang harus diisi (AC-012-2).
- [ ] Admin mengubah tulisan yang sudah terbit lalu menyimpan → Blog
      publik menampilkan versi terbaru tulisan itu (AC-013-1).
- [ ] Admin menghapus tulisan → muncul konfirmasi dulu; setelah
      dikonfirmasi, tulisan hilang dari halaman publik (AC-013-2).
- [ ] Admin mengubah status tulisan Draf jadi Terbit lalu menyimpan →
      tulisan mulai tampil di Blog publik (AC-013-3).
- [ ] Admin mengubah status tulisan Terbit jadi Arsip lalu menyimpan →
      tulisan hilang dari Blog publik namun tetap ada di Kelola
      Tulisan, status dapat dikembalikan ke Terbit kapan saja
      (AC-013-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Kelola Tulisan & Form Tulisan di
      peramban, admin masuk lebih dulu) jalur sukses & gagal keempat
      Server Action.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-31, SA-04, SA-05, SA-06 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-02 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-012-1, AC-012-2, AC-013-1, AC-013-2,
  AC-013-3, AC-013-4 — `docs/ba_03_acceptance_criteria.md`
