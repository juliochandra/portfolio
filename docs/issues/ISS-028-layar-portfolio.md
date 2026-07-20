# ISS-028 — [FE] Layar Portfolio: daftar & detail project

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-013, ISS-025, ISS-027 |
| **Serves** | SCR-03, SCR-04 |
| **Covers** | AC-003-1, AC-003-2, AC-004-1 |

## Deskripsi

Halaman Portfolio — daftar (`/portfolio`, SCR-03) & detail (`/portfolio/
[slug]`, SCR-04). Mengonsumsi `SA-24` (`getProjects`, tanpa `limit` — ambil
SEMUA project Terbit sekaligus) & `SA-25` (`getProjectBySlug`).

**Rombakan dari referensi visual client** (`docs/layout/portfolio/`, D-021
uiux) — **beda dari ISS-026/027**: referensi kali ini punya elemen yang
genuinely mengubah scope/data (badge kategori per kartu, badge "★
Featured", search box + filter kategori + dropdown sort + pagination
bernomor). Sebelum redesign dieksekusi, UI/UX **berhenti & tanya user
langsung** (AskUserQuestion, dua pertanyaan) — user memilih **skip
semuanya** di kedua pertanyaan. Jadi: **TIDAK ADA** field `category`/
`isFeatured` baru, **TIDAK ADA** toolbar search/filter/sort, **TIDAK ADA**
pagination — `ProjectCard` & `SA-24` tetap seperti spesifikasi lama untuk
bagian itu. Yang berubah cuma bagian non-blocking (data sudah ada/bisa
diturunkan tanpa scope baru): Portfolio Hero, header "Semua Project", dan
struktur Detail Project.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** (kebiasaan wajib
sejak D-024/D-028) menemukan `SA-25` belum mengekspos `publishedAt` —
dibutuhkan badge "Published • {tanggal}" di Detail Project. **Sudah
diperbaiki Tech Lead lebih dulu** (D-029, `techlead_03` v2.16) sebelum
issue ini dikompilasi.

**Catatan build-order penting:** `StatCard` (C-18) — dipakai di Portfolio
Hero untuk 3 angka statistik — **dibangun PERTAMA KALI di issue ini**,
meski komponen ini aslinya discope untuk admin Dashboard (SCR-09, F-06,
issue FE-nya `ISS-032` belum dikompilasi). Karena bakal dipakai ≥2 fitur
(Portfolio sekarang, Dashboard nanti), ditempatkan `shared/components/` —
`ISS-032` nanti tinggal memakainya apa adanya, pola sama `ProjectCard`/
`PostItem` di ISS-026. `SectionHeader` (C-23) dipakai dengan **varian
rata-kiri** yang kodenya baru diperluas `ISS-027` (About) — karena itu
`ISS-027` ditambahkan eksplisit ke `blocked_by` (bukan cuma transitif
lewat `ISS-025`).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-03/SCR-04 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Navbar & Footer** — sudah dibangun `app/(public)/layout.tsx` (ISS-025),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-03 — Portfolio (daftar)

**Portfolio Hero** (custom, bukan reuse `SectionHeader` — pola sama Hero
Home/About)
- Pil dekoratif "Portfolio" (statis) + judul besar "Portfolio" + subjudul +
  garis aksen
- Baris 3 `StatCard` (C-18): "{N}+ Project" (LIVE — `data.length` dari
  `getProjects()` yang sama dipakai grid di bawah, TANPA panggilan
  tambahan) · "{M}+ Teknologi" (LIVE — jumlah nama `skills` UNIK di seluruh
  `data[].skills` yang sama, dihitung client-side) · "100% Dikerjakan
  Sepenuh Hati" (statis, bukan metrik)
- Paragraf penutup singkat (statis) + grafis dekoratif (ilustrasi CSS)

**Daftar Project**
- `SectionHeader` (C-23, varian rata-kiri — reuse dari `ISS-027`): badge
  "Projects" · judul "Semua Project" · subjudul
- Grid `ProjectCard` (C-04) — data `getProjects()` (`SA-24`, tanpa
  `limit`); layar lebar: 2–3 kolom

**State: kosong** (AC-003-2) — teks "Belum ada project untuk ditampilkan."
di tengah area daftar; Navbar, Portfolio Hero (StatCard "0+ Project" tetap
tampil apa adanya), & Footer tetap tampil.

### SCR-04 — Detail Project

**Header Project**
- `BackLink` (C-09) "< Kembali ke Portfolio" — gaya breadcrumb di referensi
  visual direalisasikan lewat elemen yang sama, bukan komponen baru
- Badge "Published" (statis — hanya project Terbit yang pernah sampai ke
  halaman ini) + tanggal (`publishedAt`, `SA-25`)

**Isi Project**
- Nama project + gambaran singkat (`description`)
- {gambar project — `thumbnailImage`, bila ada}
- Section **Tags** — chip `SkillTag` (C-06, polos) dari `tags` (`SA-25`,
  data yang SUDAH ADA tapi baru sekarang ditampilkan)
- Section **Skills & Technologies** — chip `SkillTag` (C-06, varian ikon)
  dari `skills` (`SA-25`), ikon tampil kondisional sesuai `Skill.icon`
- Section **Overview** — `content` (`SA-25`) dirender sebagai rich
  text/Markdown apa adanya; admin bebas menulis heading "Key Features"/
  "Tech Stack" dst sendiri di dalamnya (dapat memuat "peran saya", G-013
  BA) — **tanpa field terstruktur baru**
- `[Lihat Demo]` `[Lihat Kode]` (Button C-01, sekunder) — masing-masing
  tampil hanya bila `demoUrl`/`repositoryUrl` ada; membuka tab baru

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-03, SCR-04) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/02/03/04/06/09/18/22/23).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Catatan eksplisit — TIDAK diadopsi dari referensi visual** (dikonfirmasi
user, G-015/G-016 uiux): badge kategori ("WEB APPLICATION" dst.), badge
"★ Featured", search box, filter kategori, dropdown sort, pagination
bernomor, meta-box "Slug / Created At / Updated At / Status" di Detail
Project.

**Alur:** FLOW-04 (melihat daftar project), FLOW-05 (melihat detail
project) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tidak ada — issue ini murni baca & tampil (Server Component), tanpa form
atau input data milik sendiri.

## Aturan Bisnis/Perilaku

- **2 panggilan baca independen**: `page.tsx` daftar memanggil
  `getProjects()` (`SA-24`, tanpa `limit`); `page.tsx` detail (`[slug]`)
  memanggil `getProjectBySlug(slug)` (`SA-25`) — slug tidak ditemukan/bukan
  Terbit → `notFound()` (pola Next.js standar).
- **Statistik Portfolio Hero WAJIB live-computed, BUKAN hardcode** — "{N}+
  Project" & "{M}+ Teknologi" dihitung dari respons `getProjects()` yang
  sama dengan yang dipakai grid; jangan tempel angka statis, karena akan
  basi begitu pemilik menambah/menghapus project (premis produk
  self-service).
- **TANPA kategori/featured** — `ProjectCard` render apa adanya (nama +
  gambaran + skills/tags + tautan), tanpa badge tambahan apa pun.
- **TANPA search/filter/sort/pagination** — grid menampilkan seluruh
  `data` dari satu panggilan `getProjects()`, tidak ada state
  pencarian/filter/halaman.
- **Section Tags & Skills & Technologies WAJIB terpisah** di Detail
  Project (dua blok berbeda, bukan digabung jadi satu daftar chip) —
  `tags` render `SkillTag` tanpa ikon, `skills` render `SkillTag` dengan
  ikon (ikon dari field `Skill.icon`, kondisional sesuai nullable).
- **`content` dirender sebagai rich text/Markdown apa adanya** — FE tidak
  mem-parsing/memvalidasi struktur heading tertentu ("Key
  Features"/"Tech Stack" adalah pilihan penulisan admin, bukan kontrak
  data).
- **Badge "Published" adalah teks statis**, BUKAN dari field `status` —
  `SA-25` sudah memfilter hanya `status: Terbit`, jadi halaman ini yang
  berhasil merender SUDAH PASTI status Terbit.
- **`StatCard` (C-18) & `SectionHeader` (C-23, varian rata-kiri) dipakai
  apa adanya** dari `shared/` — `SectionHeader` sudah diperluas `ISS-027`;
  `StatCard` dibangun di issue ini (lihat §Aset & Design System), `ISS-032`
  (Dashboard) nanti memakainya apa adanya, tidak membuat versi duplikat.
- **`SkillTag` (C-06) diperluas +varian ikon opsional** di file yang sudah
  ada (`shared/components/SkillTag.tsx`, dipakai `ProjectCard`/`PostItem`
  sejak ISS-026) — bukan komponen baru.

## Auth & Permission

Publik, tanpa sesi — sama seperti seluruh SCR-01 s.d. SCR-07.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak dibangun
ulang): Navbar (C-02), ThemeToggle (C-03), Footer (C-22), BackLink (C-09)
— seluruhnya ISS-025; ProjectCard (C-04) — ISS-026; SectionHeader (C-23,
termasuk varian rata-kiri) — ISS-025 (dasar) + ISS-027 (varian).

**Diperluas di issue ini** (file sudah ada, ditambah kemampuan — bukan
komponen baru):

| Komponen | Lokasi | Perubahan |
|----------|--------|-----------|
| SkillTag (C-06) | `shared/components/SkillTag.tsx` (sejak ISS-026) | + varian ikon opsional (Skills & Technologies Detail Project) |

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| StatCard (C-18) | `shared/components/` | Dipakai ≥2 fitur — Portfolio (sekarang) + Dashboard (nanti, `ISS-032`), meski aslinya discope Dashboard |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — grafis dekoratif Portfolio Hero adalah
ilustrasi CSS/SVG, bukan unggahan; gambar project (`thumbnailImage`) &
ikon Skill sudah dikelola lewat admin sejak fitur masing-masing.

## Struktur File (referensi awal)

```
src/app/(public)/portfolio/
├── page.tsx                       ← SCR-03 Portfolio — Server Component,
│                                     getProjects() tanpa limit
└── [slug]/
    └── page.tsx                    ← SCR-04 Detail Project — Server
                                        Component, getProjectBySlug(slug),
                                        notFound() bila tidak ada/bukan Terbit
src/shared/components/
├── ProjectCard.tsx                 ← C-04 (SUDAH ADA sejak ISS-026)
├── SkillTag.tsx                    ← C-06 (SUDAH ADA sejak ISS-026,
│                                       diperluas varian ikon di sini)
├── SectionHeader.tsx               ← C-23 (SUDAH ADA, varian rata-kiri
│                                       dari ISS-027)
└── StatCard.tsx                    ← C-18 (BARU, dibangun di sini)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getProjects`/`getProjectBySlug` SUDAH ADA (dibangun ISS-013 —
`features/projects/projects.action.ts`); issue ini cuma memanggilnya,
tidak membuat ulang.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/(public)/portfolio/page.tsx` — Portfolio Hero + Daftar Project
      sesuai Spesifikasi Layar.
- [ ] `app/(public)/portfolio/[slug]/page.tsx` — Header Project + Isi
      Project sesuai Spesifikasi Layar.
- [ ] `StatCard` (C-18) dibangun & ditempatkan sesuai §Aset & Design
      System; angka Project/Teknologi live-computed dari `getProjects()`.
- [ ] `SkillTag` (C-06) diperluas varian ikon opsional.
- [ ] State kosong Daftar Project (AC-003-2).
- [ ] Live Demo/Lihat Kode Detail Project tampil kondisional (AC-004-1).
- [ ] `slug` tidak ditemukan/bukan Terbit → `notFound()`.

**Out of Scope**
- Navbar, Footer, ThemeToggle, kerangka route — sudah ISS-025.
- Badge kategori, badge Featured, field `category`/`isFeatured` — DITOLAK
  eksplisit user (G-015 uiux); tetap Open Question untuk siklus PM/BA
  berikutnya bila diminta lagi.
- Search box, filter kategori, dropdown sort, pagination — DITOLAK
  eksplisit user (G-016 uiux); `SA-24` tetap tanpa parameter tambahan.
- Meta-box Slug/Created At/Updated At/Status di Detail Project — sengaja
  tidak diadopsi (info developer-facing, tidak relevan publik).
- Konten halaman lain (Home, About, Blog, Contact, admin) — issue fitur
  masing-masing (ISS-026, ISS-027, ISS-029 s.d. ISS-040).
- Endpoint `getProjects`/`getProjectBySlug` — sudah selesai (ISS-013).
- `StatCard` di Dashboard (SCR-09) — `ISS-032`, memakai komponen yang
  dibangun di sini apa adanya.

## Acceptance Criteria

- [ ] Sudah ada project berstatus Terbit → pengunjung membuka halaman
      Portfolio → daftar project tampil; tiap project menunjukkan nama dan
      gambaran singkat; project Draf/Arsip tidak ikut tampil (AC-003-1).
- [ ] Belum ada project berstatus Terbit → halaman tetap tampil wajar
      dengan keterangan bahwa belum ada project (AC-003-2).
- [ ] Pengunjung memilih satu project dari daftar → detail project tampil:
      deskripsi (dapat memuat peran pemilik) dan tautan bila ada
      (AC-004-1).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: state normal & kosong Daftar Project, angka
      StatCard Portfolio Hero berubah sesuai jumlah project sungguhan,
      Live Demo/Lihat Kode kondisional, section Tags & Skills terpisah
      dengan benar, badge Published + tanggal tampil, slug tidak
      ditemukan → halaman 404.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-03, SCR-04 — `docs/uiux_02_wireframe.md`;
  FLOW-04, FLOW-05 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/02/03/04/06/09/18/22/23 —
  `docs/uiux_03_design_system.md`; referensi visual client —
  `docs/layout/portfolio/` (D-021 uiux)
- **Kontrak API:** `SA-24`, `SA-25` — `docs/techlead_03_api_contract.md`
  (SA-25 diperluas D-029, v2.16)
- **Perilaku yang ditopang:** AC-003-1, AC-003-2, AC-004-1 —
  `docs/ba_03_acceptance_criteria.md`
