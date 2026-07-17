# ISS-013 — [BE] Endpoint publik Portfolio: daftar & detail project

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-03` |
| **Ukuran** | M |
| **Blocked by** | ISS-005 |
| **Serves** | SA-24, SA-25 |
| **Covers** | AC-003-1, AC-003-2, AC-004-1, AC-019-1, AC-019-3 |

## Deskripsi

Baca publik untuk Portfolio: daftar project (`SA-24` `getProjects`) dan
detail satu project (`SA-25` `getProjectBySlug`). Server Action yang
sama melayani **dua kebutuhan sekaligus** — sorotan 3 project terbaru di
Home (F-01.2, AC-019-1, AC-019-3) dan daftar penuh + detail di halaman
Portfolio (F-03, AC-003-1, AC-003-2, AC-004-1) — dibedakan lewat
parameter `limit`, bukan fungsi terpisah (D-006,
`docs/techlead_01_architecture.md`). Hanya project berstatus **Terbit**
yang pernah tampil ke pengunjung publik. Dipanggil langsung dari Server
Component (bukan `fetch` ke Route Handler) — proyek ini murni Server
Action, tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-24 — `getProjects`

| | |
|---|---|
| **Melayani** | SCR-01, SCR-03 · FLOW-02, FLOW-04 |
| **Menopang** | AC-003-1, AC-003-2, AC-019-1, AC-019-3 |
| **Entitas** | ENT-01 |

```ts
async function getProjects(params?: {
  limit?: number   // Home: 3 (AC-019-1); Portfolio: tanpa batas (AC-003-1)
}): Promise<{
  data: {
    id: string; title: string; slug: string; description: string | null
    thumbnailImage: string | null
    skills: { name: string; icon: string }[]
  }[]
}>
```

**Hasil:** hanya `status: Terbit`, urut `publishedAt desc` (A-002);
daftar kosong adalah respons sah, bukan error (AC-003-2, AC-019-3).

### SA-25 — `getProjectBySlug`

| | |
|---|---|
| **Melayani** | SCR-04 · FLOW-05 |
| **Menopang** | AC-004-1 |
| **Entitas** | ENT-01 |

```ts
async function getProjectBySlug(slug: string): Promise<
  | {
      data: {
        id: string; title: string; slug: string; description: string | null
        content: string   // deskripsi lengkap, dapat memuat "peran saya" (G-013 BA)
        demoUrl: string | null; repositoryUrl: string | null
        thumbnailImage: string | null
        skills: { name: string; icon: string }[]
        tags: { name: string }[]
      }
    }
  | { error: { message: string } }
>
```

**Sukses:** hanya `status: Terbit`; tautan (`demoUrl`/`repositoryUrl`)
tampil hanya bila diisi (AC-004-1).

**Gagal:** slug tidak ditemukan atau berstatus bukan `Terbit` →
`{ error: { message: string } }` — kedua kasus sama, tidak dibedakan
(agar tidak membocorkan keberadaan project Draf/Arsip ke publik).

> Salinan dari SA-24, SA-25 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `limit` (`SA-24`, parameter opsional) — opsional; angka.
- `slug` (`SA-25`, parameter) — wajib; teks.

## Aturan Bisnis

- Hanya `status: Terbit` yang pernah tampil ke publik — Draf/Arsip tidak
  ikut di daftar (AC-003-1) maupun detail (detail project Draf/Arsip →
  `error`, bukan tampil).
- Urut `publishedAt desc` (A-002) — konten yang sempat diarsipkan lalu
  diterbitkan ulang tidak "melompat" ke atas seolah baru
  (`docs/techlead_02_database.md` §Status & Transisi).
- Daftar kosong = hasil sah (array kosong), bukan error (AC-003-2,
  AC-019-3) — halaman (Home maupun Portfolio) tetap tampil wajar.
- `content` (deskripsi lengkap) dapat memuat "peran saya" bila ditulis
  admin di sana — digabung ke deskripsi bebas, bukan field terpisah
  (G-013 BA).
- `skills` & `tags` dikembalikan sebagai daftar ringkas (`name`
  [+`icon` untuk skills]) hasil join relasi m-n — bukan array id.
- Dipanggil langsung dari Server Component (baca) — bukan Route Handler,
  tidak melalui `fetch`/path HTTP (v2.9, D-022
  `docs/techlead_01_architecture.md`). Tanpa sesi apa pun — publik murni.

## Auth & Permission

- Kedua Server Action: **publik**, tanpa sesi (Matriks Akses,
  `docs/techlead_03_api_contract.md`).

## Perubahan Database

Tidak ada — tabel `Project` (ENT-01) sudah dibuat di ISS-005; relasi ke
`Skill`/`Tag` sudah terbentuk di ISS-005/007/008. Issue ini murni
membaca data yang sudah ada.

## Catatan Performa

- `getProjects` memanfaatkan index majemuk `status, publishedAt` (dari
  ISS-005) — filter status + urut tanggal dalam satu index.
- `getProjectBySlug` memanfaatkan index `slug` (dari ISS-005).
- Tanpa pagination — `getProjects` di Portfolio mengembalikan daftar
  penuh tanpa batas (skala kecil, satu admin, jumlah project wajar
  untuk portfolio pribadi).

## Struktur File (referensi awal)

```
src/features/projects/
├── projects.action.ts                 ← getProjects, getProjectBySlug ("use server")
├── projects.services.ts               ← use case / aturan bisnis (status Terbit, urutan)
├── projects.repository.ts             ← akses Prisma
└── projects.schema.ts                 ← validasi Zod (limit, slug)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari kompilasi sebelumnya: **tidak ada**
`app/api/projects/route.ts` atau `[slug]/route.ts` — keduanya digantikan
Server Action di `features/projects/projects.action.ts` (v2.9, D-022;
v2.10 D-023: `features/projects/` sendiri pindah dari
`domain/application/infrastructure/presentation` ke pola flat 4-file di
atas).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-24` `getProjects` — jalur `limit` terisi, `limit` kosong, dan
      daftar kosong.
- [ ] `SA-25` `getProjectBySlug` — jalur sukses & gagal (tidak
      ditemukan/bukan Terbit).

**Out of Scope**
- Server Action kelola Project (create/update/delete, `SA-01/02/03`) &
  baca admin (`SA-30`, daftar kelola semua status) — ISS-017.
- Layar Home & Portfolio (FE) yang mengonsumsi Server Action ini — issue
  frontend.
- Migrasi model `Project` — sudah selesai (ISS-005).

## Acceptance Criteria

- [ ] Sudah ada project Terbit → daftar tampil, tiap project menunjukkan
      nama & gambaran singkat; project Draf/Arsip tidak ikut (AC-003-1).
- [ ] Belum ada project Terbit (termasuk bila yang ada baru Draf/Arsip)
      → hasil daftar kosong yang sah, bukan error (AC-003-2).
- [ ] Memilih satu project dari daftar → detail tampil: deskripsi
      (memuat peran pemilik bila ditulis admin) dan tautan bila ada
      (AC-004-1).
- [ ] Sorotan project di Home (`limit: 3`) tampil bila sudah ada project
      Terbit, mengarah ke halaman Portfolio lengkap — bagian Project
      dari AC-019-1 (bagian Tulisan ditopang ISS-014).
- [ ] Belum ada project Terbit → sorotan project di Home tidak tampil
      rusak/membingungkan — bagian Project dari AC-019-3 (bagian
      Tulisan ditopang ISS-014).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Home & Portfolio di peramban) jalur
      sukses & gagal `SA-24`/`SA-25`.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-24, SA-25 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-01 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-003-1, AC-003-2, AC-004-1, AC-019-1
  (sebagian), AC-019-3 (sebagian) — `docs/ba_03_acceptance_criteria.md`
