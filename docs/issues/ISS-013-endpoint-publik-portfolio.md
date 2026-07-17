# ISS-013 — [BE] Endpoint publik Portfolio: daftar & detail project

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-03` |
| **Ukuran** | M |
| **Blocked by** | ISS-005 |
| **Serves** | EP-01, EP-02 |
| **Covers** | AC-003-1, AC-003-2, AC-004-1, AC-019-1, AC-019-3 |

## Deskripsi

Endpoint baca publik untuk Portfolio: daftar project (EP-01) dan detail
satu project (EP-02). Endpoint yang sama melayani **dua kebutuhan
sekaligus** — sorotan 3 project terbaru di Home (F-01.2, AC-019-1,
AC-019-3) dan daftar penuh + detail di halaman Portfolio (F-03,
AC-003-1, AC-003-2, AC-004-1) — dibedakan lewat parameter query `limit`,
bukan endpoint terpisah (D-006, `docs/techlead_01_architecture.md`).
Hanya project berstatus **Terbit** yang pernah tampil ke pengunjung
publik.

## Spesifikasi Endpoint

### EP-01 — Daftar project

**Method & Path**

```
GET /api/projects
```

**Parameter** (query)

| Nama | Tipe | Wajib | Keterangan |
|------|------|-------|------------|
| limit | number | Tidak | Home: kirim `3` (AC-019-1); Portfolio: tanpa batas — parameter tidak dikirim (AC-003-1) |

**Request** — Tidak ada (body).

**Respons Sukses**

`200` — hanya `status: Terbit`, urut `publishedAt desc` (A-002); daftar
kosong adalah respons sah, bukan error (AC-003-2, AC-019-3).

```ts
{
  data: {
    id: string; title: string; slug: string; description: string | null
    thumbnailImage: string | null
    skills: { name: string; icon: string }[]
  }[]
}
```

**Respons Gagal** — Tidak ada jalur gagal khusus.

### EP-02 — Detail project

**Method & Path**

```
GET /api/projects/{slug}
```

**Request** — Tidak ada (body).

**Respons Sukses**

`200` — hanya `status: Terbit`; tautan (`demoUrl`/`repositoryUrl`) tampil
hanya bila diisi (AC-004-1).

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

**Respons Gagal**

| Kondisi | Respons |
|---------|---------|
| Slug tidak ditemukan, atau ditemukan tapi bukan `status: Terbit` | `404` — kedua kasus sama, tidak dibedakan (agar tidak membocorkan keberadaan project Draf/Arsip ke publik) |

> Salinan dari EP-01, EP-02 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `limit` (EP-01, query) — opsional; angka.
- `slug` (EP-02, path) — wajib (bagian path), teks.

## Aturan Bisnis

- Hanya `status: Terbit` yang pernah tampil ke publik — Draf/Arsip tidak
  ikut di daftar (AC-003-1) maupun detail (detail project Draf/Arsip →
  404, bukan tampil).
- Urut `publishedAt desc` (A-002) — konten yang sempat diarsipkan lalu
  diterbitkan ulang tidak "melompat" ke atas seolah baru
  (`docs/techlead_02_database.md` §Status & Transisi).
- Daftar kosong = respons `200` dengan array kosong, bukan error
  (AC-003-2, AC-019-3) — halaman (Home maupun Portfolio) tetap tampil
  wajar.
- `content` (deskripsi lengkap) dapat memuat "peran saya" bila ditulis
  admin di sana — digabung ke deskripsi bebas, bukan field terpisah
  (G-013 BA).
- `skills` & `tags` dikembalikan sebagai daftar ringkas (`name`
  [+`icon` untuk skills]) hasil join relasi m-n — bukan array id.

## Auth & Permission

- Kedua endpoint: **publik**, tanpa sesi (Matriks Akses,
  `docs/techlead_03_api_contract.md`).

## Perubahan Database

Tidak ada — tabel `Project` (ENT-01) sudah dibuat di ISS-005; relasi ke
`Skill`/`Tag` sudah terbentuk di ISS-005/007/008. Issue ini murni
membaca data yang sudah ada.

## Catatan Performa

- Query EP-01 memanfaatkan index majemuk `status, publishedAt` (dari
  ISS-005) — filter status + urut tanggal dalam satu index.
- Query EP-02 memanfaatkan index `slug` (dari ISS-005).
- Tanpa pagination — EP-01 di Portfolio mengembalikan daftar penuh tanpa
  batas (skala kecil, satu admin, jumlah project wajar untuk portfolio
  pribadi).

## Struktur File (referensi awal)

```
src/app/api/projects/route.ts          ← EP-01 (GET, ?limit)
src/app/api/projects/[slug]/route.ts   ← EP-02 (GET)
src/features/projects/
├── domain/
├── application/                       ← query baca (bukan Server Action)
├── infrastructure/                    ← akses Prisma
└── presentation/                      ← (bila ada bagian server-only)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] EP-01 `GET /api/projects` — jalur `limit` terisi, `limit` kosong,
      dan daftar kosong.
- [ ] EP-02 `GET /api/projects/{slug}` — jalur sukses & 404 (tidak
      ditemukan/bukan Terbit).

**Out of Scope**
- Server Action kelola Project (create/update/delete, SA-01/02/03) &
  endpoint baca admin (EP-09, daftar kelola semua status) — ISS-017.
- Layar Home & Portfolio (FE) yang mengonsumsi endpoint ini — issue
  frontend.
- Migrasi model `Project` — sudah selesai (ISS-005).

## Acceptance Criteria

- [ ] Sudah ada project Terbit → daftar tampil, tiap project menunjukkan
      nama & gambaran singkat; project Draf/Arsip tidak ikut (AC-003-1).
- [ ] Belum ada project Terbit (termasuk bila yang ada baru Draf/Arsip)
      → respons daftar kosong yang sah, bukan error (AC-003-2).
- [ ] Memilih satu project dari daftar → detail tampil: deskripsi
      (memuat peran pemilik bila ditulis admin) dan tautan bila ada
      (AC-004-1).
- [ ] Sorotan project di Home (`limit=3`) tampil bila sudah ada project
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
- [ ] Manual test (Postman/peramban) jalur sukses & gagal EP-01/EP-02.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** EP-01, EP-02 — `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-01 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-003-1, AC-003-2, AC-004-1, AC-019-1
  (sebagian), AC-019-3 (sebagian) — `docs/ba_03_acceptance_criteria.md`
