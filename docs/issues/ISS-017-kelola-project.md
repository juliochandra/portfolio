# ISS-017 — [BE] Kelola project: daftar, tambah, ubah & hapus

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-005, ISS-012 |
| **Serves** | SA-30, SA-01, SA-02, SA-03 |
| **Covers** | AC-010-1, AC-010-2, AC-011-1, AC-011-2, AC-011-3, AC-011-4 |

## Deskripsi

Kelola Project penuh untuk admin: daftar untuk halaman kelola (`SA-30`
`getProjectsAdmin`), tambah (`SA-01` `createProject`), ubah (`SA-02`
`updateProject`), dan hapus (`SA-03` `deleteProject`) — F-06.2. Issue
backend **pertama** yang membutuhkan sesi admin aktif: berbeda dari
ISS-013 s.d. ISS-016 (baca publik, tanpa sesi sama sekali), keempat
Server Action di sini **admin ber-sesi**, memverifikasi token JWT secara
independen di dalam fungsinya masing-masing (D-012,
`docs/techlead_01_architecture.md`) — karena itu `blocked_by` bertambah
satu: `ISS-012` (fondasi Auth), selain `ISS-005` (tabel `Project`
sendiri). Status (`Draf`/`Terbit`/`Arsip`) dikelola penuh di sini —
mengubah status project yang sudah tersimpan langsung berefek ke
tampilan Portfolio publik (AC-011-1, AC-011-3, AC-011-4), tanpa Server
Action transisi status terpisah (beda pola dari `Message` yang punya
`SA-13`..`15` tersendiri — ISS-021). Dipanggil langsung dari form admin
(bukan `fetch` ke Route Handler) — proyek ini murni Server Action,
tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-30 — `getProjectsAdmin`

| | |
|---|---|
| **Melayani** | SCR-10 · FLOW-11, FLOW-12 |
| **Entitas** | ENT-01 |

```ts
async function getProjectsAdmin(): Promise<{
  data: { id: string; title: string; description: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" }[]
}>
```

**Hasil:** seluruh status (Draf/Terbit/Arsip), urut `createdAt desc` —
beda dari `SA-24` (`getProjects`, publik) yang hanya `status: Terbit`
urut `publishedAt desc`.

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
// FormData: title*, description, content*, demoUrl, repositoryUrl,
//           thumbnail?: File (≤2MB jpg/png/webp), skillIds: string[],
//           tagIds: string[], status: "DRAFT"|"PUBLISHED"|"ARCHIVED" (default DRAFT)
```

**Sukses:** project tersimpan; `slug` dibuat otomatis dari `title`
(D-010); bila `status: PUBLISHED`, tampil di Portfolio publik &
`publishedAt` diisi (AC-010-1).

**Gagal:** `title` atau `content` kosong → `error.fields`, per bagian
yang salah (AC-010-2) — lihat catatan `content` di Aturan Validasi.

### SA-02 — `updateProject` · SA-03 — `deleteProject`

```ts
async function updateProject(id: string, formData: FormData): Promise<
  | { data: { id: string; slug: string } }
  | { error: { fields: Record<string, string> } }
>
// FormData: sama SA-01 (tanpa membuat slug baru kecuali title berubah)

async function deleteProject(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** `updateProject` → AC-011-1 (perubahan tampil di publik),
AC-011-3 (Draf→Terbit mulai tampil), AC-011-4 (Terbit→Arsip hilang dari
publik namun tetap ada di Kelola Project, dapat dikembalikan kapan
saja); `deleteProject` → AC-011-2 (hard delete permanen, FE selalu
memanggil sesudah `DialogKonfirmasi` C-12 — tidak ada konfirmasi di
lapisan server).

> Salinan dari SA-30, SA-01, SA-02, SA-03 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `title` (`SA-01`/`SA-02`) — wajib; teks maks. 200 karakter
  (AC-010-2).
- `content` (`SA-01`/`SA-02`) — wajib; teks panjang, dapat memuat
  "peran saya" (G-013 BA) — **`NOT NULL`** di skema (ENT-01,
  `docs/techlead_02_database.md`), tetap divalidasi wajib di Zod meski
  contoh singkat `techlead_03` sebelumnya cuma menandai `title*` — sama
  sekali tidak berarti `content` boleh kosong (AC-010-2).
- `description` (`SA-01`/`SA-02`) — wajib **secara produk** (Zod),
  meski nullable di skema (`String?`) — memungkinkan migrasi data lama
  tanpa pelanggaran constraint (ENT-01); maks. 300 karakter.
- `demoUrl`, `repositoryUrl` — opsional; maks. 255 karakter; tampil di
  UI hanya bila ada (AC-004-1).
- `thumbnail` — opsional; berkas gambar (jpg/png/webp) ≤ 2MB (G-003,
  `docs/techlead_01_architecture.md`); diunggah ke R2, URL hasil
  disalin ke `thumbnailImage`.
- `skillIds`, `tagIds` — opsional; array id, dipilih dari daftar yang
  sudah ada (`SA-32`/`SA-35` masing-masing) — bukan ketik-bebas
  (G-014 BA).
- `status` — salah satu `DRAFT`/`PUBLISHED`/`ARCHIVED`; default
  `DRAFT` untuk project baru (G-011 BA).

## Aturan Bisnis

- `SA-30` mengembalikan **seluruh** status (Draf/Terbit/Arsip) — beda
  dari `SA-24` publik yang hanya `Terbit`; urut `createdAt desc`, bukan
  `publishedAt desc` (admin perlu melihat project yang baru dibuat/
  diubah duluan, termasuk yang belum pernah terbit sama sekali dan
  `publishedAt`-nya masih `null`).
- `slug` dibuat otomatis dari `title` (D-010) — **tidak** dibuat ulang
  saat `updateProject` kecuali `title` berubah, menjaga URL Portfolio
  publik tetap stabil selama admin cuma mengubah bagian lain.
- `publishedAt` diisi **sekali** saat status pertama kali menyentuh
  `PUBLISHED` — tidak berubah lagi setelahnya, termasuk saat
  Arsip→Terbit lagi (AC-011-4) — mencegah project lama "melompat" ke
  atas seolah baru di urutan publik (ISS-005, ISS-013).
- `deleteProject` adalah **hard delete** permanen (ENT-01, ISS-005) —
  tidak ada soft-delete/undo; FE **wajib** memanggil sesudah
  `DialogKonfirmasi` (C-12), server sendiri tidak meminta konfirmasi
  apa pun (AC-011-2).
- Mengubah `status` project yang sudah ada **langsung** berefek ke
  Portfolio publik pada request berikutnya — tanpa cache/delay, tanpa
  Server Action transisi status terpisah.
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari form admin (`SA-01`/`02`/`03`) atau Server
  Component (`SA-30`) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-30`, `SA-01`, `SA-02`, `SA-03`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-10, SCR-11 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Project` (ENT-01) sudah dibuat di ISS-005, termasuk
relasi m-n ke `Tag`/`Skill`. Issue ini murni membaca, menambah,
mengubah, dan menghapus baris yang sudah bisa disimpan skema tersebut.

## Catatan Performa

- `getProjectsAdmin` membaca seluruh baris tanpa filter status — tabel
  kecil (skala 1 admin), tanpa pagination; index `status, publishedAt`
  (dari ISS-005) tidak relevan di sini karena tanpa filter status.
- `create`/`update`/`deleteProject` — operasi tunggal per baris; index
  `slug` (dari ISS-005) menjaga `slug` tetap unik saat tersimpan.

## Struktur File (referensi awal)

```
src/features/projects/
├── projects.action.ts                 ← getProjectsAdmin, createProject,
│                                          updateProject, deleteProject ("use server")
├── projects.services.ts               ← use case / aturan bisnis (slug stabil,
│                                          publishedAt sekali isi, verifikasi sesi)
├── projects.repository.ts             ← akses Prisma + unggahan R2 (thumbnail)
└── projects.schema.ts                 ← validasi Zod (create/update)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Menyambung `features/projects/` yang sudah dibuka ISS-013
(`SA-24`/`25`) — file yang sama diperluas, bukan folder baru. Berbeda
dari kompilasi sebelumnya: **tidak ada**
`app/api/admin/projects/route.ts` maupun `[id]/route.ts` — seluruhnya
Server Action di `features/projects/projects.action.ts` (v2.9, D-022;
v2.10 D-023: folder ini sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-30` `getProjectsAdmin` — daftar seluruh status.
- [ ] `SA-01` `createProject` — jalur sukses & gagal (`title`/`content`
      kosong), unggahan thumbnail opsional.
- [ ] `SA-02` `updateProject` — jalur sukses & gagal, termasuk transisi
      status (Draf→Terbit, Terbit→Arsip, Arsip→Terbit).
- [ ] `SA-03` `deleteProject` — hard delete.

**Out of Scope**
- Server Action baca publik (`SA-24`, `SA-25`) — sudah selesai
  (ISS-013).
- Layar Kelola Project & Form Project (FE) — ISS-033.
- Migrasi model `Project` — sudah selesai (ISS-005).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.

## Acceptance Criteria

- [ ] Admin menambah project baru dengan lengkap, memilih status
      Terbit, lalu menyimpan → project tampil di Portfolio publik;
      bila status Draf, tersimpan namun belum tampil publik
      (AC-010-1).
- [ ] Admin menyimpan project baru tanpa mengisi bagian wajib → project
      tidak tersimpan, admin melihat pemberitahuan bagian yang harus
      diisi (AC-010-2).
- [ ] Admin mengubah project yang sudah tersimpan lalu menyimpan →
      Portfolio publik menampilkan versi terbaru (AC-011-1).
- [ ] Admin menghapus project → muncul konfirmasi dulu; setelah
      dikonfirmasi, project hilang dari halaman publik (AC-011-2).
- [ ] Admin mengubah status project Draf jadi Terbit lalu menyimpan →
      project mulai tampil di Portfolio publik (AC-011-3).
- [ ] Admin mengubah status project Terbit jadi Arsip lalu menyimpan →
      project hilang dari Portfolio publik namun tetap ada di Kelola
      Project, status dapat dikembalikan ke Terbit kapan saja
      (AC-011-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Kelola Project & Form Project di
      peramban, admin masuk lebih dulu) jalur sukses & gagal keempat
      Server Action.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-30, SA-01, SA-02, SA-03 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-01 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-010-1, AC-010-2, AC-011-1, AC-011-2,
  AC-011-3, AC-011-4 — `docs/ba_03_acceptance_criteria.md`
