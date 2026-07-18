# ISS-024 — [BE] Ringkasan Dashboard

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-005, ISS-006, ISS-007, ISS-008, ISS-012 |
| **Serves** | SA-37 |
| **Covers** | — |

## Deskripsi

Ringkasan lintas entitas untuk halaman Dashboard (SCR-09, layar
beranda admin): satu Server Action (`SA-37` `getDashboardSummary`)
mengembalikan hitungan agregat (Total Posts/Projects/Tags/Skills,
termasuk jumlah Published) plus 5 item terbaru masing-masing Post &
Project (semua status). Berbeda dari seluruh issue Kelola sebelumnya
(ISS-017..023), issue ini **tanpa `F-06.X` sendiri** — bukan sub-fitur
formal, murni ringkasan lintas 4 entitas yang sudah ada
(Project/Post/Tag/Skill), **murni pemanis tampilan, non-blocking**
(pm_01 D009) — karenanya `Covers` kosong, tidak ada AC BA yang menuntut
kontennya secara spesifik. `blocked_by` mencakup keempat migrasi yang
diagregasi (`ISS-005` Project, `ISS-006` Post, `ISS-007` Tag, `ISS-008`
Skill) plus `ISS-012` (fondasi Auth, sama seperti seluruh Server Action
admin lain) — **tidak** mencakup `ISS-009`/`ISS-010`/`ISS-011`
(Media/Pesan/Info Kontak) karena Dashboard tidak mengagregasi
ketiganya. Dipanggil langsung dari Server Component (bukan `fetch` ke
Route Handler) — proyek ini murni Server Action, tanpa Route Handler
sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-37 — `getDashboardSummary`

*v2.9 (D-022): menggantikan `EP-16` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-09 |
| **Entitas** | ENT-01, ENT-02, ENT-03, ENT-04 |

```ts
async function getDashboardSummary(): Promise<{
  data: {
    totalPosts: number; publishedPosts: number
    totalProjects: number; publishedProjects: number
    totalTags: number; totalSkills: number
    recentPosts: { id: string; title: string; thumbnailImage: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[]
    recentProjects: { id: string; title: string; thumbnailImage: string | null; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; createdAt: string }[]
  }
}>
```

**Hasil:** hitungan agregat + 5 item terbaru tiap Project & Post (semua
status) — murni pemanis tampilan, non-blocking (pm_01 D009, G-009
uiux). Tanpa `F-06.X` sendiri — bukan sub-fitur formal, murni ringkasan
lintas entitas.

> Salinan dari SA-37 untuk kenyamanan. **Bila berbeda dengan
> `docs/techlead_03_api_contract.md`, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

Tidak ada — `SA-37` tanpa parameter, tanpa `dashboard.schema.ts`
(techlead_04: "SA-37 tanpa input").

## Aturan Bisnis

- 4 hitungan agregat: `totalPosts`/`publishedPosts`,
  `totalProjects`/`publishedProjects` (`COUNT` seluruh baris + `COUNT`
  berstatus `PUBLISHED`), `totalTags`, `totalSkills` (`COUNT` seluruh
  baris, tanpa status) — ditampilkan sbg `KartuStatistik` (C-18,
  SCR-09).
- `recentPosts`/`recentProjects` masing-masing **5 item terbaru**,
  urut `createdAt desc`, **seluruh status** (Draf/Terbit/Arsip ikut
  tampil) — beda dari sorotan Home publik (`SA-24`/`SA-26`) yang hanya
  `PUBLISHED`; ini tampilan admin, bukan publik. Ditampilkan sbg
  `BarisRingkasan` (C-19), bisa ditekan menuju form ubah item itu.
- Tanpa agregat Media/Pesan/Info Kontak — Dashboard hanya meringkas
  Project/Post/Tag/Skill (`ENT-01..04`); "Pintasan Cepat" (SCR-09,
  termasuk [Unggah Media]/[Lihat Pesan]/[Info Kontak]) murni tautan
  navigasi FE ke halaman kelola masing-masing, **tanpa** data ringkasan
  dari `SA-37` — di luar cakupan Server Action ini.
- Murni **query baca agregat** — tanpa efek samping, tanpa write ke
  database mana pun.
- **Memverifikasi sesi admin ulang secara independen** di dalam
  fungsinya — tidak semata mengandalkan `middleware.ts` (D-012,
  ISS-012). Tanpa token valid → `{ error: { message: "UNAUTHORIZED"
  } }` (pola sama seluruh Server Action admin lain, meski `SA-37`
  sendiri tanpa AC yang menguji jalur gagal ini secara eksplisit).
- Dipanggil langsung dari Server Component (SCR-09) — bukan Route
  Handler, tidak melalui `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-37`: **admin ber-sesi** (Matriks Akses,
  `docs/techlead_03_api_contract.md` — masuk kelompok "SA-30 s.d.
  SA-37") — tanpa sesi valid mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` (SCR-09 — di
  bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — seluruh 4 tabel yang diagregasi (`Project` ENT-01, `Post`
ENT-02, `Tag` ENT-03, `Skill` ENT-04) sudah dibuat di
ISS-005/006/007/008. Issue ini murni membaca (COUNT + top-5), tanpa
menulis apa pun.

## Catatan Performa

- 6 query agregat (4 `COUNT` + 2 `findMany` top-5) dalam satu
  pemanggilan `SA-37` — skala kecil (1 admin, jumlah baris kecil di
  seluruh 4 tabel), tanpa kebutuhan index tambahan di luar yang sudah
  ada (`slug` unik tiap entitas, dari migrasi masing-masing).
- Tanpa cache — dipanggil ulang tiap kali SCR-09 dibuka; volume
  traffic (1 admin) tidak menuntut optimasi lebih lanjut saat ini.

## Struktur File (referensi awal)

```
src/features/dashboard/
├── dashboard.action.ts                ← getDashboardSummary ("use server")
├── dashboard.services.ts              ← use case (agregat 4 entitas + top-5)
└── dashboard.repository.ts            ← akses Prisma (COUNT + findMany lintas
                                           Project/Post/Tag/Skill)
                                        (TANPA dashboard.schema.ts — SA-37
                                         tanpa input yang perlu divalidasi)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `features/dashboard/` **satu-satunya** folder fitur di
proyek ini yang sejak awal dirancang tanpa `.schema.ts` (techlead_04
v2.10, D-023 — "tanpa entitas sendiri", `SA-37` tanpa input untuk
divalidasi) — beda dari `features/tags/`/`features/media/` (ISS-022/
023, 4 file lengkap sejak awal karena entitasnya sendiri punya form
tambah/ubah). Tanpa Route Handler apa pun — seluruhnya Server Action di
`features/dashboard/dashboard.action.ts` (v2.9, D-022).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-37` `getDashboardSummary` — 4 hitungan agregat + 2×5 item
      terbaru.

**Out of Scope**
- Layar Dashboard (FE, `KartuStatistik`/`BarisRingkasan`/
  `PintasanAksi`) — issue frontend (ISS-032).
- Migrasi model `Project`/`Post`/`Tag`/`Skill` — sudah selesai
  (ISS-005/006/007/008).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.
- Agregat Media/Pesan/Info Kontak — tidak diminta kontrak, `SA-37`
  hanya meringkas 4 entitas (Project/Post/Tag/Skill).
- Navigasi "Pintasan Cepat" (SCR-09) — murni tautan FE ke halaman
  kelola masing-masing, tanpa data dari Server Action ini.

## Acceptance Criteria

Tidak ada AC BA yang menguji issue ini secara khusus (`Covers`
kosong, murni pemanis non-blocking — pm_01 D009). Checklist berikut
disusun langsung dari kontrak `SA-37` sebagai pengganti AC formal:

- [ ] Admin membuka Dashboard → 4 kartu statistik menampilkan
      hitungan yang benar (Total & Published Posts/Projects, Total
      Tags, Total Skills).
- [ ] Admin membuka Dashboard → "Recent Posts"/"Recent Projects"
      masing-masing menampilkan hingga 5 item terbaru, urut
      `createdAt desc`, mencakup semua status (Draf/Terbit/Arsip).
- [ ] Belum ada Post/Project/Tag/Skill tersimpan sama sekali →
      hitungan tampil 0, daftar terbaru tampil kosong tanpa error.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Dashboard di peramban, admin masuk
      lebih dulu) — hitungan & daftar terbaru sesuai data sungguhan.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-37 — `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-01, ENT-02, ENT-03, ENT-04 —
  `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** Tidak ada AC spesifik (pemanis
  non-blocking, pm_01 D009) — `docs/pm_01_project.md`
