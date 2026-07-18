# ISS-023 — [BE] Kelola media: galeri, unggah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-009, ISS-012 |
| **Serves** | SA-36, SA-19, SA-20 |
| **Covers** | AC-022-1, AC-022-2, AC-022-3 |

## Deskripsi

Kelola Media penuh untuk admin: galeri (`SA-36` `getMediaGallery`),
unggah (`SA-19` `uploadMedia`), dan hapus (`SA-20` `deleteMedia`) —
F-06.9. Sama seperti ISS-017..022, ketiga Server Action di sini
**admin ber-sesi**, memverifikasi token JWT secara independen di dalam
fungsinya masing-masing (D-012, `docs/techlead_01_architecture.md`) —
`blocked_by` mencakup `ISS-012` (fondasi Auth) selain `ISS-009` (tabel
`Media` sendiri). Issue ini **paling berbeda** dari seluruh issue
Kelola lainnya: `uploadMedia` adalah **satu-satunya** Server Action di
seluruh proyek yang benar-benar menyentuh Cloudflare R2 (S3 SDK, di
`media.repository.ts`) — sejak disederhanakan v2.12 (D-025),
`createProject`/`updateProject`/`createPost`/`updatePost` (ISS-017/018)
tidak lagi mengunggah berkas apa pun, hanya menyimpan `thumbnailImage`
sebagai URL yang admin pilih dari galeri yang dibangun issue ini.
Konsekuensinya, `uploadMedia` adalah **satu-satunya** Server Action
mutasi di proyek ini yang tetap memakai parameter `FormData` (bukan
objek biasa) — sesuai Konvensi "FormData khusus form dengan unggahan
berkas". Dipanggil langsung dari form admin (bukan `fetch` ke Route
Handler) — proyek ini murni Server Action, tanpa Route Handler sama
sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-36 — `getMediaGallery`

*v2.9 (D-022): menggantikan `EP-15` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-18 · FLOW-22 |
| **Menopang** | AC-022-2 |
| **Entitas** | ENT-05 |

```ts
async function getMediaGallery(): Promise<{
  data: { id: string; fileName: string; url: string; mimeType: string; size: number; createdAt: string }[]
}>
```

**Hasil:** urut `createdAt desc`; daftar kosong sah, bukan error
(AC-022-2).

### SA-19 — `uploadMedia`

| | |
|---|---|
| **Melayani** | SCR-18 · FLOW-22 |
| **Menopang** | AC-022-1 |
| **Entitas** | ENT-05 |

```ts
async function uploadMedia(formData: FormData): Promise<
  | { data: { id: string; url: string } }
  | { error: { fields: Record<string, string> } }
>
// FormData: file* (≤2MB jpg/png/webp)
```

**Sukses:** file diunggah ke Cloudflare R2 (S3 SDK, v2.4); satu baris
`Media` baru tercatat (`url` = URL objek R2); muncul di galeri
(AC-022-1). **Satu-satunya jalur unggahan berkas di seluruh proyek
ini** (v2.12, D-025 — sebelumnya `createProject`/`createPost` juga
bisa unggah inline, dicabut): hasilnya dipakai admin lain kali lewat
pemilih galeri di form Project/Tulisan, yang cuma mengirim
`thumbnailImage` sebagai URL string, bukan berkas.

### SA-20 — `deleteMedia`

```ts
async function deleteMedia(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-022-3 — menghapus baris `Media` + objek fisik di R2
(S3 delete, v2.4); selalu sesudah konfirmasi FE. **Tidak**
mengosongkan `thumbnailImage` di `Project`/`Post` yang mungkin masih
merujuk URL itu (tanpa FK, G-017 BA) — tautan jadi rusak bila admin
menghapus file yang masih dipakai; risiko diterima mengingat skala
kecil.

> Salinan dari SA-36, SA-19, SA-20 untuk kenyamanan. **Bila berbeda
> dengan `docs/techlead_03_api_contract.md`, dokumen kontrak yang
> berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `file` (`SA-19`, di dalam `FormData`) — wajib; jenis jpg/png/webp;
  ukuran ≤2MB (G-003, `docs/techlead_01_architecture.md`). Gagal
  (jenis/ukuran salah) → `error.fields`.
- `id` (`SA-20`) — wajib; merujuk baris `Media` yang sudah ada.
- Tanpa field lain yang divalidasi dari input admin — `fileName`/
  `objectKey`/`mimeType`/`extension`/`size` (ENT-05) **dihitung/diisi
  server-side** dari berkas yang diunggah, bukan isian admin.

## Aturan Bisnis

- `SA-36` mengembalikan **seluruh** baris `Media`, urut `createdAt
  desc` — tanpa pagination (skala kecil), tanpa filter (ENT-05).
- `uploadMedia` (`SA-19`) adalah **satu-satunya** Server Action di
  proyek ini yang menyentuh Cloudflare R2 secara langsung (v2.12,
  D-025) — alurnya: file diterima lewat `FormData` → divalidasi
  (jenis/ukuran) → diunggah ke bucket R2 lewat S3 SDK di
  `media.repository.ts` → satu baris `Media` dicatat dengan `url`
  hasil R2.
- `uploadMedia` **tetap** memakai parameter `FormData` (satu-satunya
  Server Action mutasi di proyek ini yang begitu) — beda dari
  `SA-01/02/04/05` (ISS-017/018, berhenti memakai `FormData` sejak
  v2.12 D-025 karena tidak lagi unggah apa pun) dan seluruh Server
  Action Kelola lainnya (ISS-019/020/022, objek biasa sejak awal).
- `deleteMedia` (`SA-20`) menghapus **dua tempat sekaligus**: baris
  `Media` di database DAN objek fisik di bucket R2 (S3 delete) — beda
  dari `delete*` lain di proyek ini (Project/Post/Skill/ContactInfo/
  Tag) yang hanya menghapus baris database.
- `Media` = katalog metadata, **bukan** foreign key relasional
  (D-011) — `thumbnailImage` di `Project`/`Post` adalah string URL
  bebas yang disalin saat admin memilih dari galeri, **tidak**
  terhubung lewat FK. Konsekuensinya: menghapus baris `Media` yang
  URL-nya masih dipakai `Project`/`Post` mana pun **tidak**
  mengosongkan rujukan itu — tautan gambar di halaman publik jadi
  rusak, risiko yang diterima sadar mengingat skala kecil, satu admin
  (G-017 BA).
- `deleteMedia` adalah **hard delete** permanen — tidak ada
  soft-delete/undo (beda dari `Message`, ISS-021, yang punya arsip
  reversibel); FE **wajib** memanggil sesudah `DialogKonfirmasi`
  (C-12), server sendiri tidak meminta konfirmasi apa pun (AC-022-3).
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-19`/`20`) atau Server
  Component (`SA-36`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022); tanpa presigned URL client-langsung
  (dipertimbangkan & ditolak user demi kesederhanaan, D-017) — berkas
  selalu transit lewat server lebih dulu.

## Auth & Permission

- `SA-36`, `SA-19`, `SA-20`: seluruhnya **admin ber-sesi** — tanpa
  sesi valid, ketiganya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-18 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Media` (ENT-05) sudah dibuat di ISS-009. Issue ini
murni membaca, menambah (setelah unggah berhasil), dan menghapus baris
yang sudah bisa disimpan skema tersebut.

## Catatan Performa

- `getMediaGallery` membaca seluruh baris tanpa filter — tabel kecil
  (skala admin tunggal), tanpa pagination.
- `uploadMedia`/`deleteMedia` — masing-masing operasi tunggal per
  berkas (satu unggah/satu hapus per panggilan); `objectKey` unik
  (dari ISS-009) mencegah nama objek bentrok di bucket R2.

## Struktur File (referensi awal)

```
src/features/media/
├── media.action.ts                    ← getMediaGallery, uploadMedia,
│                                          deleteMedia ("use server")
├── media.services.ts                  ← use case / aturan bisnis (validasi
│                                          file, verifikasi sesi)
├── media.repository.ts                ← akses Prisma + S3 SDK ke Cloudflare
│                                          R2 (satu-satunya di proyek ini,
│                                          v2.12 D-025)
└── media.schema.ts                    ← validasi Zod (jenis/ukuran file)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari `features/skills/`/`features/contact/`/
`features/messages/` (masing-masing sudah dibuka lebih dulu oleh issue
endpoint publik) — `features/media/` **belum pernah dibuka issue
manapun**, sama seperti `features/tags/` (ISS-022): `Media` tanpa
Server Action baca publik sama sekali, jadi seluruh 4 file dibuka utuh
di issue ini. `media.repository.ts` adalah **satu-satunya** file di
seluruh proyek yang mengimpor S3 SDK (v2.12, D-025 — dulu
`projects.repository.ts`/`posts.repository.ts` juga). Tanpa Route
Handler apa pun — seluruhnya Server Action di
`features/media/media.action.ts` (v2.9, D-022; v2.10 D-023: folder ini
sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-36` `getMediaGallery` — daftar seluruh berkas, termasuk
      galeri kosong.
- [ ] `SA-19` `uploadMedia` — jalur sukses & gagal (jenis/ukuran file
      salah), unggah fisik ke R2 + catat baris `Media`.
- [ ] `SA-20` `deleteMedia` — hapus objek R2 + baris `Media`.

**Out of Scope**
- Layar Media (galeri + unggah, FE) — issue frontend (ISS-039).
- Migrasi model `Media` — sudah selesai (ISS-009).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.
- Parameter `thumbnailImage` di `SA-01/02/04/05` (memilih URL dari
  galeri ini) — ISS-017/018, bukan issue ini.
- Bucket Cloudflare R2 itu sendiri (pembuatan, kredensial) — sudah
  selesai (ISS-003).
- Membersihkan `thumbnailImage` yang jadi tautan rusak setelah `Media`
  sumbernya dihapus — tanpa FK, tidak diminta AC manapun (D-011,
  G-017 BA); di luar cakupan proyek ini.

## Acceptance Criteria

- [ ] Admin berada di halaman Media, mengunggah gambar baru (jpg/png/
      webp ≤2MB) → gambar tersimpan (baris `Media` + objek R2) dan
      muncul di galeri (AC-022-1).
- [ ] Admin mengunggah berkas dengan jenis/ukuran tidak sesuai →
      berkas tidak tersimpan, admin melihat pemberitahuan bagian yang
      salah (AC-022-1, validasi G-003).
- [ ] Ada gambar yang pernah diunggah, admin membuka halaman Media →
      seluruh gambar tampil dalam galeri, urut terbaru; kondisi belum
      ada gambar ditangani wajar (AC-022-2).
- [ ] Ada gambar di galeri, admin menghapusnya → muncul konfirmasi
      dulu; setelah dikonfirmasi, gambar hilang dari galeri (objek R2
      + baris `Media` terhapus) (AC-022-3).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Media di peramban, admin masuk lebih
      dulu) jalur sukses & gagal ketiga Server Action, termasuk
      verifikasi berkas benar-benar hilang dari bucket R2 setelah
      hapus.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-36, SA-19, SA-20 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-05 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-022-1, AC-022-2, AC-022-3 —
  `docs/ba_03_acceptance_criteria.md`
