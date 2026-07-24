# ISS-014 — [BE] Endpoint publik Blog: daftar & detail tulisan

| | |
|---|---|
| **Label** | `backend` · `F-01` · `F-04` |
| **Ukuran** | M |
| **Blocked by** | ISS-006 |
| **Serves** | SA-26, SA-27 |
| **Covers** | AC-005-1, AC-005-2, AC-006-1, AC-019-1, AC-019-3 |

## Deskripsi

Baca publik untuk Blog: daftar tulisan (`SA-26` `getPosts`) dan detail
satu tulisan (`SA-27` `getPostBySlug`). Server Action yang sama melayani
**dua kebutuhan sekaligus** — sorotan 3 tulisan terbaru di Home (F-01.2,
AC-019-1, AC-019-3) dan daftar penuh + detail di halaman Blog (F-04,
AC-005-1, AC-005-2, AC-006-1) — dibedakan lewat parameter `limit`, bukan
fungsi terpisah (D-006, `docs/techlead_01_architecture.md`). Hanya
tulisan berstatus **Terbit** yang pernah tampil ke pengunjung publik.
Dipanggil langsung dari Server Component (bukan `fetch` ke Route
Handler) — proyek ini murni Server Action, tanpa Route Handler sama
sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-26 — `getPosts`

| | |
|---|---|
| **Melayani** | SCR-01, SCR-05 · FLOW-02, FLOW-06 |
| **Menopang** | AC-005-1, AC-005-2, AC-019-1, AC-019-3 |
| **Entitas** | ENT-02 |

```ts
async function getPosts(params?: {
  limit?: number   // Home: 3 (AC-019-1); Blog: tanpa batas (AC-005-1)
}): Promise<{
  data: {
    id: string; title: string; slug: string; description: string | null
    thumbnailImage: string | null
    publishedAt: string   // ISO date — "tanggal" di ItemTulisan (C-05, uiux_03)
  }[]
}>
```

**Hasil:** hanya `status: Terbit`, urut `publishedAt desc` (A-002,
direvisi pm_01 D008); daftar kosong adalah respons sah, bukan error
(AC-005-2, AC-019-3).

### SA-27 — `getPostBySlug`

| | |
|---|---|
| **Melayani** | SCR-06 · FLOW-07 |
| **Menopang** | AC-006-1 |
| **Entitas** | ENT-02 |

```ts
async function getPostBySlug(slug: string): Promise<
  | {
      data: {
        id: string; title: string; slug: string; description: string | null
        content: string   // isi lengkap tulisan
        readingTime: number
        thumbnailImage: string | null
        publishedAt: string   // ISO date
        tags: { name: string }[]
      }
    }
  | { error: { message: string } }
>
```

**Sukses:** hanya `status: Terbit`; `readingTime` sudah dihitung sekali
saat tulisan disimpan (bukan dihitung ulang tiap dibaca, ENT-02).

**Gagal:** slug tidak ditemukan atau berstatus bukan `Terbit` →
`{ error: { message: string } }` — kedua kasus sama, tidak dibedakan
(agar tidak membocorkan keberadaan tulisan Draf/Arsip ke publik).

> Salinan dari SA-26, SA-27 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `limit` (`SA-26`, parameter opsional) — opsional; angka.
- `slug` (`SA-27`, parameter) — wajib; teks.

## Aturan Bisnis

- Hanya `status: Terbit` yang pernah tampil ke publik — Draf/Arsip tidak
  ikut di daftar (AC-005-1) maupun detail (detail tulisan Draf/Arsip →
  `error`, bukan tampil).
- Urut `publishedAt desc` (A-002, direvisi pm_01 D008) — konten yang
  sempat diarsipkan lalu diterbitkan ulang tidak "melompat" ke atas
  seolah baru (`docs/techlead_02_database.md` §Status & Transisi); beda
  dari daftar admin yang urut `createdAt desc` (ENT-02).
- Daftar kosong = hasil sah (array kosong), bukan error (AC-005-2,
  AC-019-3) — halaman (Home maupun Blog) tetap tampil wajar dengan
  keterangan belum ada tulisan.
- `readingTime` dihitung sekali saat tulisan disimpan (create/update) dari
  panjang `content` — tidak dihitung ulang tiap kali dibaca (ENT-02,
  `docs/techlead_02_database.md`).
- `tags` dikembalikan sebagai daftar ringkas (`name`) hasil join relasi
  m-n — bukan array id. Tulisan **tidak** punya relasi `skills` (beda
  dari Project — ENT-02 tidak punya field itu).
- `publishedAt` dijamin terisi (bukan `null`) pada setiap baris yang
  dikembalikan — field ini hanya kosong untuk tulisan berstatus Draf,
  yang memang tidak pernah lolos filter `status: Terbit` (v2.11, D-024).
- Dipanggil langsung dari Server Component (baca) — bukan Route Handler,
  tidak melalui `fetch`/path HTTP (v2.9, D-022
  `docs/techlead_01_architecture.md`). Tanpa sesi apa pun — publik murni.

## Auth & Permission

- Kedua Server Action: **publik**, tanpa sesi (Matriks Akses,
  `docs/techlead_03_api_contract.md`).

## Perubahan Database

Tidak ada — tabel `Post` (ENT-02) sudah dibuat di ISS-006; relasi ke
`Tag` sudah terbentuk di ISS-006/007. Issue ini murni membaca data yang
sudah ada.

## Catatan Performa

- `getPosts` memanfaatkan index majemuk `status, publishedAt` (dari
  ISS-006) — filter status + urut tanggal dalam satu index.
- `getPostBySlug` memanfaatkan index `slug` (dari ISS-006).
- Tanpa pagination — `getPosts` di Blog mengembalikan daftar penuh tanpa
  batas (skala kecil, satu admin, jumlah tulisan wajar untuk blog
  pribadi).

## Struktur File (referensi awal)

```
src/features/posts/
├── posts.action.ts                    ← getPosts, getPostBySlug ("use server")
├── posts.services.ts                  ← use case / aturan bisnis (status Terbit, urutan)
├── posts.repository.ts                ← akses Prisma
└── posts.schema.ts                    ← validasi Zod (limit, slug)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari kompilasi sebelumnya: **tidak ada**
`app/api/posts/route.ts` atau `[slug]/route.ts` — keduanya digantikan
Server Action di `features/posts/posts.action.ts` (v2.9, D-022; v2.10
D-023: `features/posts/` sendiri pindah dari
`domain/application/infrastructure/presentation` ke pola flat 4-file di
atas).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-26` `getPosts` — jalur `limit` terisi, `limit` kosong, dan
      daftar kosong.
- [ ] `SA-27` `getPostBySlug` — jalur sukses & gagal (tidak
      ditemukan/bukan Terbit).

**Out of Scope**
- Server Action kelola Tulisan (create/update/delete, `SA-04/05/06`) &
  baca admin (`SA-31`, daftar kelola semua status) — ISS-018.
- Layar Home & Blog (FE) yang mengonsumsi Server Action ini — issue
  frontend.
- Migrasi model `Post` — sudah selesai (ISS-006).

## Acceptance Criteria

- [ ] Sudah ada tulisan Terbit → daftar tampil urut terbaru, tiap
      tulisan menunjukkan judul & cuplikan; tulisan Draf/Arsip tidak
      ikut tampil (AC-005-1).
- [ ] Belum ada tulisan Terbit (termasuk bila yang ada baru Draf/Arsip)
      → halaman tetap tampil wajar dengan keterangan belum ada tulisan,
      bukan error (AC-005-2).
- [ ] Memilih satu tulisan dari daftar → isi tulisan tampil utuh dan
      dapat dibaca (AC-006-1).
- [ ] Sorotan tulisan di Home (`limit: 3`) tampil bila sudah ada tulisan
      Terbit, mengarah ke halaman Blog lengkap — bagian Tulisan dari
      AC-019-1 (bagian Project ditopang ISS-013).
- [ ] Belum ada tulisan Terbit → sorotan tulisan di Home tidak tampil
      rusak/membingungkan — bagian Tulisan dari AC-019-3 (bagian Project
      ditopang ISS-013).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Home & Blog di peramban) jalur sukses &
      gagal `SA-26`/`SA-27`.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-26, SA-27 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-02 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-005-1, AC-005-2, AC-006-1, AC-019-1
  (sebagian), AC-019-3 (sebagian) — `docs/ba_03_acceptance_criteria.md`
