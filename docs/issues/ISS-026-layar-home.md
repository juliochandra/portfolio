# ISS-026 — [FE] Layar Home

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-013, ISS-014, ISS-015, ISS-016, ISS-025 |
| **Serves** | SCR-01 |
| **Covers** | AC-001-1, AC-001-2, AC-001-3, AC-017-1, AC-019-1, AC-019-2, AC-019-3 |

## Deskripsi

Halaman Home (`/`) — issue FE kedua (setelah ISS-025 fondasi), tapi issue
FE **pertama** yang benar-benar merender data dari backend. Mengonsumsi
`SA-24` (`getProjects`), `SA-26` (`getPosts`), `SA-38` (`getSkills`)
sekaligus `SA-28` (`getContactInfo`, untuk tombol email di Ajakan).

**Pertama juga yang membangun komponen bermuatan data entitas** yang
sengaja tidak dibangun ISS-025: `ProjectCard` (C-04), `PostItem` (C-05),
`SkillCard` (C-24). `ProjectCard`/`PostItem` dipakai ≥2 fitur (Home +
Portfolio; Home + Blog) — per Aturan Penempatan techlead_04, keduanya
ditempatkan di `shared/components/` meski dibangun di sini; ISS-028/029
nanti **memakainya apa adanya**, tidak membuat versi duplikat. `SkillCard`
baru dipakai 1 fitur (Home — Keahlian eksklusif tampil di sini, pm_01
D006/D-009 uiux, tidak ada halaman Skills publik terpisah) → co-located
di `app/(public)/`, bukan `shared/`.

**Rombakan menyeluruh dari referensi visual client** (`docs/layout/home/`,
D-019 uiux): komponen baru `SectionHeader` (C-23, dibangun ISS-025, tinggal
dipakai di sini) menyeragamkan pembuka tiap section; Unduh CV dicabut dari
Hero & Ajakan (kini eksklusif via Footer, ISS-025); `ProjectCard` dapat
tautan Live Demo/GitHub, `PostItem` dapat waktu baca & tag — **celah
kontrak `SA-24`/`SA-26` yang timbul dari perubahan ini sudah diperbaiki
Tech Lead lebih dulu** (D-028, techlead_03 v2.15) sebelum issue ini
dikompilasi, supaya Struktur Data di bawah tidak mengarang bentuk yang
belum dikonfirmasi kontrak.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-01 (definisi lengkap
di sana mengikat; issue ini cuma ringkasan actionable).

**Navbar & Footer** — sudah dibangun `app/(public)/layout.tsx` (ISS-025),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

**Hero**
- Pil dekoratif `</> Hello, I'm` (statis) + {foto profil — opsional}
- "Halo, saya {nama}" · "{profesi}" · satu kalimat ringkasan
- `[Lihat Portfolio]` (primer → SCR-03) `[Hubungi Saya]` (sekunder → SCR-07)

**Keahlian**
- SectionHeader (C-23): badge "Keahlian" · judul "Teknologi yang Saya
  Kuasai" · subjudul "Beberapa teknologi dan tools yang saya gunakan untuk
  membangun aplikasi web yang modern, andal, dan skalabel."
- Grid `SkillCard` (C-24) — data `getSkills()` (`SA-38`), seluruh baris
  tanpa batas jumlah
- **Kosong** (AC-019-3): section disembunyikan seluruhnya (judul ikut hilang)

**Project Unggulan**
- SectionHeader (C-23): badge "Portfolio" · judul "Project Unggulan" ·
  subjudul "Beberapa project yang pernah saya kerjakan — masing-masing
  dibangun dengan fokus pada performa, skalabilitas, dan pengalaman
  pengguna yang baik."
- 3 `ProjectCard` (C-04) — data `getProjects({ limit: 3 })` (`SA-24`);
  layar lebar: 3 kolom
- `[Lihat Semua Project →]` (Button C-01 sekunder) → SCR-03
- **Kosong** (AC-019-3): section disembunyikan

**Tulisan Terbaru**
- SectionHeader (C-23): badge "Blog" · judul "Tulisan Terbaru" · subjudul
  "Pemikiran, tutorial, dan wawasan seputar pengembangan web dan
  membangun produk."
- 3 `PostItem` (C-05) — data `getPosts({ limit: 3 })` (`SA-26`); list 1
  kolom penuh lebar (gaya medium.com, D-008/D-013)
- `[Lihat Semua Tulisan →]` (Button C-01 sekunder) → SCR-05
- **Kosong** (AC-019-3): section disembunyikan

**Ajakan** — dibungkus kartu berbingkai (surface + border, beda dari
section lain yang latar polos)
- SectionHeader (C-23): badge "Mari Bekerja Sama" · judul "Punya Project
  dalam Pikiran? Mari Bangun Sesuatu yang Hebat Bersama." · subjudul "Saya
  saat ini terbuka untuk project freelance maupun kesempatan penuh waktu.
  Mari diskusikan bagaimana mewujudkan ide Anda."
- `[Hubungi Saya]` (primer → SCR-07) `[Kirim Email]` (sekunder, mailto —
  data `getContactInfo()`, `SA-28`, entri berlabel saluran email)

**State: kosong** (AC-019-3) — berlaku independen per sorotan (Keahlian/
Project Unggulan/Tulisan Terbaru masing-masing bisa kosong sendiri-sendiri,
bukan seluruh Home hilang); Hero, Navbar, Ajakan, Footer selalu tampil.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-01) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/02/03/04/05/07/22/23/24).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Alur:** FLOW-01 (pengunjung pertama membuka), FLOW-02 (melihat sorotan
konten), FLOW-19 (mengunduh CV via Footer) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tidak ada — issue ini murni baca & tampil (Server Component), tanpa form
atau input data milik sendiri.

## Aturan Bisnis/Perilaku

- **3 panggilan baca independen** dari `page.tsx` (Server Component):
  `getProjects({ limit: 3 })`, `getPosts({ limit: 3 })`, `getSkills()` —
  masing-masing menopang sorotan yang berbeda; kosongnya satu sorotan
  tidak memengaruhi sorotan lain (AC-019-1, AC-019-3).
- **Unduh CV TIDAK dibangun di issue ini** — dicabut dari Hero & Ajakan
  (D-019 uiux, merevisi D-006). Aksi F-07/AC-017-1 terpenuhi lewat Footer
  (Resume, C-22) yang sudah tersedia via layout (ISS-025); halaman Home
  ikut menyediakannya krn Footer tampil di halaman yang sama.
- **SectionHeader (C-23) dipakai apa adanya** dari `shared/` (dibangun
  ISS-025) — issue ini cuma mengisi konten teks (badge/judul/subjudul)
  per section, tidak membuat komponen baru untuk pola ini.
- **Estimasi waktu baca `PostItem`** = field `readingTime` dari `SA-26`
  langsung (sudah dihitung BE saat admin menyimpan tulisan, `techlead_02`
  `Post.readingTime`) — **tanpa logika hitung tambahan di FE** (G-014
  uiux, dikoreksi dari asumsi awal "dihitung saat render").
- **Live Demo/GitHub `ProjectCard`** tampil kondisional — hanya render
  bila `demoUrl`/`repositoryUrl` masing-masing tidak `null` (AC-004-1,
  pola sama Detail Project); menekan tautan ini adalah event terpisah
  dari "tekan kartu" (tidak ikut memicu navigasi ke SCR-04).
- **Tag `PostItem`** dari field `tags` (`SA-26`) — render pakai `SkillTag`
  (C-06), sumber data `Tag` bukan `Skill` (D-019 uiux).
- **`[Kirim Email]` Ajakan**: ambil entri `getContactInfo()` yang salurannya
  email (pola sama `ContactLink` C-07 di SCR-07/Footer — deteksi saluran
  email mengikuti mekanisme yang sudah berlaku di sana, bukan logika baru).
- Komponen `ProjectCard`/`PostItem` yang dibangun di sini (`shared/`)
  dipakai **apa adanya** oleh ISS-028 (Portfolio)/ISS-029 (Blog) — issue
  itu tidak membuat versi duplikatnya sendiri.

## Auth & Permission

Publik, tanpa sesi — sama seperti seluruh SCR-01 s.d. SCR-07.

## Aset & Design System

**Dipakai apa adanya dari ISS-025** (`shared/`, tidak dibangun ulang):
Navbar (C-02), ThemeToggle (C-03), Button (C-01), Footer (C-22),
SectionHeader (C-23).

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| ProjectCard (C-04) | `shared/components/` | Dipakai ≥2 fitur (Home + Portfolio, ISS-028) |
| PostItem (C-05) | `shared/components/` | Dipakai ≥2 fitur (Home + Blog, ISS-029) |
| SkillCard (C-24) | `app/(public)/_components/` (co-located) | Baru dipakai 1 fitur (Home) |

Anatomi & perilaku detail: `docs/uiux_03_design_system.md` §Komponen —
**disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — foto profil/CV (statis, pm_01 D007)
sudah ditempel developer sejak ISS-025; ikon Skill/teknologi berasal dari
isian admin (`icon` per baris `Skill`, SCR-14).

## Struktur File (referensi awal)

```
src/app/(public)/
├── page.tsx                       ← Home (/) — Server Component,
│                                     Promise.all(getProjects, getPosts,
│                                     getSkills); getContactInfo terpisah
│                                     utk [Kirim Email]
└── _components/
    └── SkillCard.tsx               ← C-24, khas Home (belum dipakai fitur lain)
src/shared/components/
├── ProjectCard.tsx                 ← C-04 (dipakai jg ISS-028 Portfolio)
└── PostItem.tsx                    ← C-05 (dipakai jg ISS-029 Blog)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getProjects`/`getPosts`/`getSkills`/`getContactInfo` SUDAH ADA
(dibangun ISS-013/014/016/015 — `features/projects/projects.action.ts`,
`features/posts/posts.action.ts`, `features/skills/skills.action.ts`,
`features/contact/contact.action.ts`); issue ini cuma memanggilnya,
tidak membuat ulang.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/(public)/page.tsx` — 5 section Home (Hero, Keahlian, Project
      Unggulan, Tulisan Terbaru, Ajakan) sesuai Spesifikasi Layar.
- [ ] `ProjectCard` (C-04), `PostItem` (C-05), `SkillCard` (C-24) dibangun
      & ditempatkan sesuai §Aset & Design System.
- [ ] 3 sorotan (Keahlian/Project Unggulan/Tulisan Terbaru) masing-masing
      punya state kosong independen (AC-019-3).
- [ ] Live Demo/GitHub `ProjectCard` tampil kondisional (AC-004-1).
- [ ] `[Kirim Email]` Ajakan berfungsi (mailto ke alamat ContactInfo).

**Out of Scope**
- Navbar, Footer, ThemeToggle, kerangka route — sudah ISS-025.
- Unduh CV — dihapus dari Hero/Ajakan (D-019 uiux); tombolnya sendiri
  bagian Footer (ISS-025), bukan issue ini.
- Konten halaman lain (About, Portfolio, Blog, Contact, admin) — issue
  fitur masing-masing (ISS-027 s.d. ISS-040).
- Endpoint `getProjects`/`getPosts`/`getSkills`/`getContactInfo` — sudah
  selesai (ISS-013/014/016/015).
- SEO (`generateMetadata`, `sitemap.ts`) — sudah ISS-025 (AC-001-4).

## Acceptance Criteria

- [ ] Pengunjung membuka `/` → nama & profesi pemilik tampil; jalan menuju
      About, Portfolio, Blog, Contact tersedia (AC-001-1).
- [ ] Dibuka dari ponsel → seluruh isi terbaca tanpa geser samping/zoom
      (AC-001-2); seluruh teks berbahasa Indonesia (AC-001-3).
- [ ] Sudah ada project & tulisan tayang → ringkasan keahlian, cuplikan
      project unggulan, tulisan terbaru tampil, masing-masing menyediakan
      jalan ke halaman lengkapnya (AC-019-1).
- [ ] Menjelajahi Home → tersedia ajakan menghubungi (→ Contact) serta
      aksi unduh CV (via Footer) (AC-019-2).
- [ ] Belum ada project/tulisan tayang → halaman tetap tampil wajar,
      sorotan yang kosong tidak tampil rusak/membingungkan (AC-019-3).
- [ ] Aksi unduh CV (dari Footer, tampil di Home) → berkas CV terunduh
      dan dapat dibuka (AC-017-1).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: state normal & kosong (masing-masing
      sorotan), Live Demo/GitHub kondisional, [Kirim Email] membuka
      aplikasi surel, seluruh tautan menuju halaman yang benar.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-01 — `docs/uiux_02_wireframe.md`; FLOW-01,
  FLOW-02, FLOW-19 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/02/03/04/05/07/22/23/24 —
  `docs/uiux_03_design_system.md`; referensi visual client —
  `docs/layout/home/home-01..05.png` (D-019 uiux)
- **Kontrak API:** `SA-24`, `SA-26`, `SA-28`, `SA-38` —
  `docs/techlead_03_api_contract.md` (SA-24/26 diperluas D-028, v2.15)
- **Perilaku yang ditopang:** AC-001-1/2/3, AC-004-1, AC-017-1,
  AC-019-1/2/3 — `docs/ba_03_acceptance_criteria.md`
