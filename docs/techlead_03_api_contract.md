# API CONTRACT: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-17 |
| **Versi** | 2.8 |
| **Sumber** | Set BA v6.0 + Set UI/UX v1.8 |
| **Konteks** | docs/pm_01_project.md v1.6 |
| **Disusun oleh** | Tech Lead Agent |
| **Set dokumen** | techlead_01_architecture.md · techlead_02_database.md · techlead_03_api_contract.md · techlead_04_folder_structure.md |

## Ringkasan

**15 Route Handler** (baca publik & baca admin) + **23 Server Action**
(mutasi admin + autentikasi masuk/keluar) — revisi total dari v1.0 (21
Route Handler, tanpa Server Action).
**v2.2** (referensi desain admin client, pm_01 D009) menambah 3 Route
Handler (EP-14 Tags, EP-15 Media, EP-16 Dashboard) + 6 Server Action
(Tag CRUD, Media unggah/hapus, ubah kata sandi) — tanpa tabel baru, lihat
techlead_02_database.md v2.2. **v2.3** menambah **EP-17** (`GET /api/skills`,
baca publik) — celah kontrak ditemukan Issue Planner: SCR-01 Home menampilkan
bagian Keahlian ke publik (AC-019-1), tapi sebelumnya hanya ada
`GET /api/admin/skills` (EP-11, khusus admin) — pengunjung publik tidak
pernah punya jalur baca data itu (D-016). Perubahan bentuk terbesar dari v1.0:

- **Seluruh mutasi admin (create/update/delete) jadi Server Action**, bukan
  Route Handler REST — permintaan eksplisit user saat perancangan skema.
  Route Handler dipertahankan untuk baca publik, baca admin (list layar
  kelola), dan masuk/keluar (form autentikasi di luar sesi).
- **EP-05 (`GET /api/profile`) dan EP-06 (`GET /api/profile/cv`) dihapus
  total** — tidak ada lagi entitas Profil; identitas pemilik statis di
  kode/JSX, dan CV jadi tautan unduh langsung ke berkas statis (`<a href
  download>`), bukan endpoint (pm_01 D007). Ini juga menghapus satu-satunya
  respons biner v1.0 — **seluruh respons v2.0 adalah JSON**.
- **Skill & ContactInfo dapat Server Action CRUD penuh** — v1.0 hanya punya
  `PUT /api/admin/profile` (ubah sebagian skills) dan `PUT /api/admin/contact`
  (replace-all); v2.0 keduanya jadi entitas tersendiri dengan
  create/update/delete per baris (F-06.4, F-06.5).
- **Project & Post dapat parameter status** — mutasi menyertakan
  `status: DRAFT|PUBLISHED|ARCHIVED`; baca publik selalu tersaring
  `status: PUBLISHED` (pm_01 D008).
- **Message dapat Server Action baca-otomatis & arsip** — `markMessageRead`,
  `archiveMessage`, `unarchiveMessage` baru.
- Slug (`projects`, `posts`) menggantikan `id` numerik di path publik
  (`/api/projects/{slug}`, dst.) — konsisten dengan keputusan URL berbasis
  slug (`/portfolio/[slug]`, `/blog/[slug]`).

**v2.4** (perubahan kapabilitas tim, D-017 techlead_01): tidak ada
endpoint/Server Action baru — penyimpanan berkas pindah dari filesystem
lokal ke Cloudflare R2, murni perubahan `infrastructure`. Bentuk request/
respons SA-01/02/04/05/19 sama sekali tidak berubah (masih `FormData` in,
URL string out); lihat Konvensi § Unggahan berkas.

**v2.5** (D-018 techlead_01, route group `app/(public)/`): dokumen ini
sama sekali tidak tersentuh — perubahan murni struktur folder presentation
(`techlead_04_folder_structure.md`), tidak ada endpoint/Server Action yang
berubah. Versi dibump mengikuti "versi sama, dibaca bersama" set Tech Lead.

**v2.6** (D-019 techlead_01, `login/` dipindah keluar dari `admin/`):
dokumen ini juga sama sekali tidak tersentuh — `EP-07 POST /api/admin/login`
tidak berubah (jalur API terpisah dari path halaman FE); murni struktur
folder presentation.

**v2.7** (D-020 techlead_01, folder `core/` diganti nama jadi `shared/`):
dokumen ini juga sama sekali tidak tersentuh — tidak ada endpoint/Server
Action yang berubah; murni rename folder presentation/shared.

**v2.8** (D-021 techlead_01, permintaan eksplisit user): `EP-07` (`POST
/api/admin/login`) & `EP-08` (`POST /api/admin/logout`) **dicabut** sebagai
Route Handler, digantikan **`SA-22` (`login`)** & **`SA-23` (`logout`)**
sebagai Server Action — dipanggil langsung dari form (React Hook Form +
action), konsisten dengan seluruh form admin lain. Route Handler kini
murni baca (publik & admin), tanpa pengecualian untuk autentikasi. `SA-22`
jadi satu-satunya Server Action yang **tidak** memverifikasi sesi yang
sudah ada — ia justru membuat sesi baru (lihat Konvensi § Auth).
`EP-07`/`EP-08` tidak dipakai ulang untuk ID lain; `EP-09` dst. tidak
berubah nomor.

## Konvensi

- **Route Handler (baca & auth):** respons JSON `{ data }` / `{ error }` —
  kontrak ditulis sebagai **object shape TypeScript**
  ([07_CONTRACT_RULES.md](../techlead-agent/07_CONTRACT_RULES.md) §4.1);
  schema Zod & handler diturunkan BE 1:1 dari shape.
- **Server Action (mutasi admin):** fungsi async di `"use server"`, dipanggil
  langsung dari form (React Hook Form + `action`) atau handler klien — tidak
  melalui `fetch`/path HTTP. Kontrak ditulis sebagai **signature fungsi
  TypeScript**: parameter masuk & bentuk hasil (`Result<T>`), memakai
  `FormData` untuk form yang menyertakan unggahan berkas, objek biasa untuk
  sisanya.
- **Auth:** JWT access token (httpOnly cookie) untuk seluruh operasi admin;
  tanpa token valid → `401` (Route Handler) / `{ error: { message:
  "UNAUTHORIZED" } }` (Server Action). Refresh token (httpOnly cookie
  terpisah) memperbarui access token; keduanya diset oleh `SA-22` (`login`)
  dan dihapus oleh `SA-23` (`logout`) — v2.8, D-021. Middleware `/admin/*`
  menolak akses tanpa sesi sebelum halaman dirender (AC-009-3); **setiap
  Server Action tetap memverifikasi sesi ulang secara independen** di dalam
  fungsinya (tidak semata mengandalkan middleware — praktik baku Next.js
  Server Actions, karena action dapat dipanggil langsung tanpa lewat render
  halaman) — **kecuali `SA-22` (`login`)**, satu-satunya pengecualian: ia
  dipanggil justru untuk *membuat* sesi baru, bukan memverifikasi yang sudah
  ada, sehingga tidak ada sesi untuk diverifikasi ulang saat dipanggil.
- **Bentuk error validasi:** `{ error: { fields: Record<string, string> } }`
  (Route Handler: HTTP `422`; Server Action: dikembalikan sebagai nilai
  `Result` biasa, bukan exception) — konsisten dengan state error-validasi
  di uiux_02_wireframe.md.
- **Unggahan berkas:** Server Action yang menerima gambar (`createProject`,
  `updateProject`, `createPost`, `updatePost`) memakai `FormData`; batas
  ukuran & jenis: gambar (jpg/png/webp) ≤ 2MB (G-003,
  techlead_01_architecture.md). File diunggah ke Cloudflare R2 lewat S3 SDK
  di lapisan `infrastructure` (v2.4, D-017 techlead_01) — Server Action tetap
  satu-satunya jalur, tanpa endpoint/presigned-URL terpisah. Tiap unggahan
  sukses mencatat satu baris baru di `Media` (katalog); URL R2 hasil disalin
  ke field `thumbnailImage`.
- **Tag** dikirim sebagai `tagIds: string[]` — dipilih dari daftar Tag yang
  sudah ada (dikelola lewat SA-16..18), bukan lagi ketik-bebas/upsert-by-name
  (G-014 BA, direvisi bersama G-010 uiux — Tag kini punya halaman kelola
  sendiri, pola sama `skillIds`).
- **Slug** dibuat otomatis di server dari `title`/`name` (slugify) — tidak
  ada di parameter masuk `create*`/`update*` manapun (D-010).

## Matriks Akses

| Permukaan | Publik | admin |
|-----------|:------:|:-----:|
| Baca publik: EP-01 s.d. EP-05, EP-17 | ✅ | ✅ |
| Kirim pesan: EP-06 | ✅ | ✅ |
| Baca admin: EP-09 s.d. EP-16 | — | ✅ |
| Masuk: SA-22 (`login`) | ✅ | — |
| Keluar: SA-23 (`logout`) | — | ✅ |
| Server Action lain: SA-01 s.d. SA-21 | — | ✅ |

## Route Handlers — Publik

### EP-01 — Daftar project

| | |
|---|---|
| **Method & Path** | `GET /api/projects` |
| **Melayani** | SCR-01, SCR-03 · FLOW-02, FLOW-04 |
| **Menopang** | AC-003-1, AC-003-2, AC-019-1, AC-019-3 |
| **Akses** | public |
| **Entitas** | ENT-01 |

**Request (query):**

```ts
{
  limit?: number   // Home: 3 (AC-019-1); Portfolio: tanpa batas (AC-003-1)
}
```

**Respons sukses `200`:** hanya `status: PUBLISHED`, urut `publishedAt desc`
(A-002); daftar kosong adalah respons sah, bukan error (AC-003-2, AC-019-3).

```ts
{
  data: {
    id: string; title: string; slug: string; description: string | null
    thumbnailImage: string | null
    skills: { name: string; icon: string }[]
  }[]
}
```

### EP-02 — Detail project

| | |
|---|---|
| **Method & Path** | `GET /api/projects/{slug}` |
| **Melayani** | SCR-04 · FLOW-05 |
| **Menopang** | AC-004-1 |
| **Akses** | public |
| **Entitas** | ENT-01 |

**Respons sukses `200`:** hanya `status: PUBLISHED`; tautan tampil hanya bila
diisi (AC-004-1).

```ts
{
  data: {
    id: string; title: string; slug: string; description: string | null
    content: string   // deskripsi lengkap, dapat memuat "peran saya" (G-013 BA)
    demoUrl: string | null; repositoryUrl: string | null
    thumbnailImage: string | null
    skills: { name: string; icon: string }[]
    tags: { name: string }[]
  }
}
```

**Respons gagal:**
- `404` — project tidak ditemukan atau berstatus bukan `PUBLISHED`.

### EP-03 — Daftar tulisan · EP-04 — Detail tulisan

*Bentuk & aturan identik EP-01/EP-02, menggantikan `demoUrl`/`repositoryUrl`/
`skills` dengan tidak ada (Tulisan tidak punya field itu); EP-04 tambah
`readingTime: number`. Daftar kosong sah (AC-005-2, AC-019-3); detail `404`
bila tidak ditemukan/bukan `PUBLISHED`.*

```
GET /api/posts        → SCR-01, SCR-05 · FLOW-02, FLOW-06 · AC-005-1, AC-005-2, AC-019-1, AC-019-3
GET /api/posts/{slug} → SCR-06 · FLOW-07 · AC-006-1
```

### EP-05 — Info kontak

| | |
|---|---|
| **Method & Path** | `GET /api/contact` |
| **Melayani** | SCR-07 · FLOW-08 |
| **Menopang** | AC-007-1 |
| **Akses** | public |
| **Entitas** | ENT-07 |

**Respons sukses `200`:** seluruh baris `ContactInfo`, tanpa urutan khusus
(urut input admin).

```ts
{ data: { id: string; label: string; value: string; icon: string | null }[] }
```

### EP-06 — Kirim pesan

| | |
|---|---|
| **Method & Path** | `POST /api/contact/messages` |
| **Melayani** | SCR-07 · FLOW-09 |
| **Menopang** | AC-008-1, AC-008-2 |
| **Akses** | public |
| **Entitas** | ENT-06 |

**Request:**

```ts
{
  name: string     // wajib — AC-008-2
  email: string    // wajib — AC-008-2
  message: string  // wajib — AC-008-2
}
```

**Respons sukses `201`:** pesan tersimpan berstatus `UNREAD`; muncul di
kotak pesan admin (AC-008-1, EP-11).

```ts
{ data: { id: string } }
```

**Respons gagal:**
- `422` — bagian wajib kosong, per bagian (AC-008-2): bentuk error Konvensi.

## Route Handlers — Baca Admin

*Kelima endpoint berikut hanya membaca (list untuk layar kelola); tanpa
request body; `401`/redirect bila tanpa sesi (AC-009-3).*

### EP-09 — Daftar project (kelola)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/projects` |
| **Melayani** | SCR-10 · FLOW-11, FLOW-12 |
| **Akses** | admin |
| **Entitas** | ENT-01 |

**Respons sukses `200`:** seluruh status, urut `createdAt desc`.

```ts
{ data: { id: string; title: string; description: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }[] }
```

### EP-10 — Daftar tulisan (kelola)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/posts` |
| **Melayani** | SCR-12 · FLOW-13, FLOW-14 |
| **Akses** | admin |
| **Entitas** | ENT-02 |

```ts
{ data: { id: string; title: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[] }
```

### EP-11 — Daftar keahlian (kelola)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/skills` |
| **Melayani** | SCR-14 · FLOW-15 |
| **Akses** | admin |
| **Entitas** | ENT-04 |

```ts
{ data: { id: string; name: string; icon: string | null }[] }
```

### EP-12 — Daftar info kontak (kelola)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/contact` |
| **Melayani** | SCR-15 · FLOW-16 |
| **Akses** | admin |
| **Entitas** | ENT-07 |

```ts
{ data: { id: string; label: string; value: string; icon: string | null }[] }
```

### EP-13 — Daftar pesan masuk

| | |
|---|---|
| **Method & Path** | `GET /api/admin/messages` |
| **Melayani** | SCR-16 · FLOW-18 |
| **Menopang** | AC-018-1, AC-018-2 |
| **Akses** | admin |
| **Entitas** | ENT-06 |

**Request (query):**

```ts
{ tab?: "aktif" | "arsip" }  // default "aktif" (UNREAD+READ); "arsip" = ARCHIVED
```

**Respons sukses `200`:** urut `createdAt desc`; daftar kosong sah, bukan
error (AC-018-2).

```ts
{
  data: { id: string; name: string; email: string; message: string; status: "UNREAD" | "READ" | "ARCHIVED"; createdAt: string }[]
}
```

### EP-14 — Daftar tag (kelola)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/tags` |
| **Melayani** | SCR-17 · FLOW-21 |
| **Akses** | admin |
| **Entitas** | ENT-03 |

```ts
{ data: { id: string; name: string }[] }
```

### EP-15 — Daftar media (galeri)

| | |
|---|---|
| **Method & Path** | `GET /api/admin/media` |
| **Melayani** | SCR-18 · FLOW-22 |
| **Menopang** | AC-022-2 |
| **Akses** | admin |
| **Entitas** | ENT-05 |

**Respons sukses `200`:** urut `createdAt desc`; daftar kosong sah, bukan
error (AC-022-2).

```ts
{ data: { id: string; fileName: string; url: string; mimeType: string; size: number; createdAt: string }[] }
```

### EP-16 — Ringkasan Dashboard

| | |
|---|---|
| **Method & Path** | `GET /api/admin/dashboard` |
| **Melayani** | SCR-09 |
| **Akses** | admin |
| **Entitas** | ENT-01, ENT-02, ENT-03, ENT-04 |

**Respons sukses `200`:** hitungan agregat + 5 item terbaru tiap Project &
Post (semua status) — murni pemanis tampilan, non-blocking (pm_01 D009, G-009 uiux).

```ts
{
  data: {
    totalPosts: number; publishedPosts: number
    totalProjects: number; publishedProjects: number
    totalTags: number; totalSkills: number
    recentPosts: { id: string; title: string; thumbnailImage: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[]
    recentProjects: { id: string; title: string; thumbnailImage: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[]
  }
}
```

### EP-17 — Daftar keahlian (publik)

| | |
|---|---|
| **Method & Path** | `GET /api/skills` |
| **Melayani** | SCR-01 · FLOW-02 |
| **Menopang** | AC-019-1, AC-019-3 |
| **Akses** | public |
| **Entitas** | ENT-04 |

*(Ditambahkan v2.3 — nomor mengikuti aturan penomoran append-only §penambahan
EP-14..16 sebelumnya; secara akses tetap publik meski nomornya jatuh setelah
kelompok Baca Admin.)*

**Respons sukses `200`:** seluruh baris `Skill`, tanpa urutan khusus (urut
input admin); daftar kosong adalah respons sah — bagian Keahlian di Home
disembunyikan bersama sorotan lain saat kosong (AC-019-3).

```ts
{ data: { id: string; name: string; icon: string | null }[] }
```

## Server Actions — Autentikasi (F-06.1, F-06.6)

*v2.8 (D-021): menggantikan `EP-07`/`EP-08` (Route Handler, dicabut).*

### SA-22 — `login`

| | |
|---|---|
| **Melayani** | SCR-08 · FLOW-10 |
| **Menopang** | AC-009-1, AC-009-2 |
| **Entitas** | ENT-08 |

```ts
async function login(data: {
  username: string
  password: string
}): Promise<
  | { data: { username: string } }
  | { error: { message: string } }
>
```

**Sukses:** `username`/`password` cocok dengan `User` tersimpan (Bcrypt
compare) → access & refresh token diset sebagai httpOnly cookie; admin
diarahkan ke Dashboard (AC-009-1).

**Gagal:** data masuk salah → `{ error: { message: string } }`, pesan
generik tanpa merinci bagian mana yang salah (AC-009-2).

> **Pengecualian sesi:** berbeda dari seluruh Server Action lain di
> dokumen ini, `login` **tidak** memverifikasi sesi yang sudah ada — ia
> dipanggil justru untuk membuat sesi baru, dari halaman `/login` yang
> memang publik (D-019).

### SA-23 — `logout`

| | |
|---|---|
| **Melayani** | SCR-09 · FLOW-17 |
| **Menopang** | AC-016-1 |
| **Entitas** | ENT-08 |

```ts
async function logout(): Promise<{ data: { success: true } }>
```

**Sukses:** cookie access & refresh token dihapus; sesi berakhir, halaman
admin tidak lagi dapat diakses tanpa masuk kembali (AC-016-1).

## Server Actions — Kelola Project (F-06.2)

### SA-01 — `createProject`

| | |
|---|---|
| **Melayani** | SCR-11 · FLOW-11 |
| **Menopang** | AC-010-1, AC-010-2 |
| **Entitas** | ENT-01 |

```ts
async function createProject(formData: FormData): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
// FormData: title*, description, content, demoUrl, repositoryUrl,
//           thumbnail?: File (≤2MB jpg/png/webp), skillIds: string[],
//           tagIds: string[], status: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default DRAFT)
```

**Sukses:** project tersimpan; slug dibuat otomatis dari `title`; bila
`status: PUBLISHED`, tampil di Portfolio publik & `publishedAt` diisi
(AC-010-1). **Gagal:** `title` kosong → `error.fields` (AC-010-2).

### SA-02 — `updateProject` · SA-03 — `deleteProject`

```ts
async function updateProject(id: string, formData: FormData): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
// FormData: sama SA-01 (tanpa membuat slug baru kecuali title berubah)

async function deleteProject(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** `updateProject` → AC-011-1, AC-011-3, AC-011-4 (perubahan
`status` langsung berlaku ke tampilan publik); `deleteProject` → AC-011-2
(hard delete permanen, FE selalu memanggil sesudah dialog konfirmasi
DialogKonfirmasi C-12 — tidak ada konfirmasi di lapisan server).

## Server Actions — Kelola Tulisan (F-06.3)

### SA-04 — `createPost` · SA-05 — `updatePost` · SA-06 — `deletePost`

```ts
async function createPost(formData: FormData): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
// FormData: title*, description, content*, thumbnail?: File (≤2MB),
//           tagIds: string[], status: "DRAFT" | "PUBLISHED" | "ARCHIVED" (default DRAFT)
// readingTime dihitung server-side dari content, tidak dikirim FE

async function updatePost(id: string, formData: FormData): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>

async function deletePost(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** `createPost` → AC-012-1, AC-012-2; `updatePost` → AC-013-1,
AC-013-3, AC-013-4; `deletePost` → AC-013-2 (hard delete permanen, selalu
sesudah konfirmasi FE).

## Server Actions — Kelola Keahlian (F-06.4)

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
konfirmasi FE) — ringkasan Home menampilkan versi terbaru setelah revalidate.

## Server Actions — Kelola Info Kontak (F-06.5)

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

**Menopang:** AC-015-1 — halaman Contact publik menampilkan versi terbaru
setelah admin menambah/mengubah/menghapus baris mana pun (menggantikan pola
"replace-all sekaligus" v1.0; CRUD per baris konsisten dengan BarisKelola).

## Server Actions — Pesan (F-06.7)

### SA-13 — `markMessageRead`

```ts
async function markMessageRead(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-018-3 — dipanggil otomatis oleh FE saat kartu pesan
UNREAD dibuka/ditampilkan, tanpa aksi klik terpisah dari admin.

### SA-14 — `archiveMessage` · SA-15 — `unarchiveMessage`

```ts
async function archiveMessage(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
async function unarchiveMessage(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-018-4 — `archiveMessage` (dari tab Aktif) memindahkan
`status` ke `ARCHIVED`; `unarchiveMessage` (dari tab Arsip) mengembalikan ke
`READ`. Keduanya tanpa hapus data (Scope Validation — tanpa story
hapus pesan).

## Server Actions — Kelola Tag (F-06.8)

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
konfirmasi FE) — daftar Tag di form Project/Tulisan menampilkan versi terbaru
setelah revalidate.

## Server Actions — Kelola Media (F-06.9)

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

**Sukses:** file diunggah ke Cloudflare R2 (S3 SDK, v2.4); satu baris `Media`
baru tercatat (`url` = URL objek R2); muncul di galeri (AC-022-1). Berbeda
dari unggahan inline `createProject`/`createPost` (yang menyalin URL R2
langsung ke `thumbnailImage`) — `uploadMedia` berdiri sendiri, hasilnya baru
dipakai admin lain kali lewat pemilih galeri di form Project/Tulisan.

### SA-20 — `deleteMedia`

```ts
async function deleteMedia(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-022-3 — menghapus baris `Media` + objek fisik di R2 (S3
delete, v2.4); selalu sesudah konfirmasi FE. **Tidak** mengosongkan
`thumbnailImage` di `Project`/`Post` yang mungkin masih merujuk URL itu
(tanpa FK, G-017 BA) — tautan jadi rusak bila admin menghapus file yang
masih dipakai; risiko diterima mengingat skala kecil.

## Server Actions — Ubah Kata Sandi (F-06.10)

### SA-21 — `changePassword`

| | |
|---|---|
| **Melayani** | SCR-19 · FLOW-23 |
| **Menopang** | AC-023-1, AC-023-2 |
| **Entitas** | ENT-08 |

```ts
async function changePassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<
  | { data: { success: true } }
  | { error: { fields: Record<string, string> } }
>
```

**Sukses:** `oldPassword` cocok dengan `passwordHash` tersimpan (Bcrypt
compare) dan `newPassword === confirmPassword` → `passwordHash` diperbarui
(AC-023-1). **Gagal:** `oldPassword` tidak cocok, atau `newPassword` ≠
`confirmPassword` → `error.fields` (AC-023-2) — sesi admin TIDAK diakhiri
paksa (tetap login dengan sesi berjalan).

## Handoff

- Dokumen ini bagian dari **set blueprint Tech Lead** proyek Portfolio Developer:
  techlead_01_architecture.md + techlead_02_database.md + techlead_03_api_contract.md +
  techlead_04_folder_structure.md (versi sama, dibaca bersama).
- **Sumber:** set BA v6.0 (FEATURE + USER_STORY + ACCEPTANCE_CRITERIA) +
  set UI/UX v1.8 (USER_FLOW + WIREFRAME + DESIGN_SYSTEM),
  konteks docs/pm_01_project.md v1.6 (+ TEAM_STACK.md sebagai sumber stack).
- **Penerima:** FE & BE Agent (via Issue Planner); QA memakai API_CONTRACT
  sebagai acuan uji.
- **Pertanyaan hilir** tentang stack/data/API yang tak terjawab set ini =
  kekurangan dokumen Tech Lead → dikembalikan ke Tech Lead; pertanyaan tentang
  tampilan/alur → ke UI/UX; tentang requirement → ke BA.
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → BA → UI/UX → set ini
  terbit versi baru. Tidak diedit langsung.
