# ISS-027 — [FE] Layar About

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | S |
| **Blocked by** | ISS-025 |
| **Serves** | SCR-02 |
| **Covers** | AC-002-1, AC-020-1, AC-020-2, AC-020-3, AC-020-4 |

## Deskripsi

Halaman About (`/about`) — issue FE ketiga, tapi **satu-satunya halaman
publik yang seluruh isinya teks statis di kode**, tanpa satu pun panggilan
Server Action (pm_01 D007: About Hero, Engineering Principles, Development
Workflow, Current Focus, Beyond Code — semuanya ditulis langsung di kode,
bukan dikelola admin). Berbeda dari ISS-026 (Home) yang jadi issue FE
pertama yang merender data backend, issue ini murni presentasi/komposisi
tanpa lapisan data sama sekali.

**Rombakan menyeluruh dari referensi visual client** (`docs/layout/about/`,
D-020 uiux — pola sama D-019 Home). Tiga komponen baru dibangun di sini:
`InfoCard` (C-25), `Callout` (C-26), `ProcessStep` (C-27) — ketiganya baru
dipakai 1 fitur (About) → co-located di `app/(public)/about/_components/`,
bukan `shared/`, per Aturan Penempatan techlead_04.

**Menyentuh komponen shared yang sudah ada**: `SectionHeader` (C-23,
dibangun ISS-025) dipakai About dengan **varian baru** (rata-kiri + garis
aksen di bawah subjudul) berdampingan dengan varian lama Home (rata-tengah
tanpa garis) — bukan komponen terpisah, tapi `shared/components/
SectionHeader.tsx` (ISS-025) perlu **diperluas** dengan prop varian
(mis. `align: "center" | "left"`), bukan diduplikasi. `TextSection` (C-15,
pemakai lamanya cuma SCR-02) resmi **DEPRECATED** — tidak dipakai di
implementasi issue ini.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-02 (definisi lengkap
di sana mengikat; issue ini cuma ringkasan actionable).

**Navbar & Footer** — sudah dibangun `app/(public)/layout.tsx` (ISS-025),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

**About Hero** (custom, bukan reuse `SectionHeader` — struktur lebih kaya)
- Badge kecil beraksen "About" (statis, dekoratif)
- Baris "{Nama} — {Profesi}" kecil di atas judul (AC-002-1 — nama & profesi
  tampil sebagai elemen tersendiri, bukan cuma tersirat dalam paragraf)
- Judul besar bergaya editorial (statis)
- Subjudul 1-2 kalimat + garis aksen pendek di bawahnya
- 2-3 paragraf perkenalan singkat — teks statis, ditulis langsung di kode
  (pm_01 D007)
- {foto profil pemilik} — opsional (AC-002-1), dibingkai kotak dekoratif
- Baris 3 `InfoCard` (C-25, varian polos): ikon+judul+deskripsi (mis.
  "Developer First"/"Performance Focused"/"User Centered")

**Engineering Principles**
- `SectionHeader` (C-23, varian rata-kiri+garis): badge "Engineering
  Principles" · judul · subjudul
- Grid 6 `InfoCard` (C-25, varian berbingkai) — prinsip kerja teknis
  pemilik, statis

**Development Workflow**
- `SectionHeader` (C-23, varian rata-kiri+garis): badge "Development
  Workflow" · judul · subjudul
- Baris 5 tahap `ProcessStep` (C-27): Understand → Plan → Build →
  Test & Refine → Deploy, terhubung garis putus-putus
- `Callout` (C-26, varian ikon) penutup section

**Current Focus**
- `SectionHeader` (C-23, varian rata-kiri+garis): badge "Current Focus" ·
  judul · subjudul
- Grid 4 `InfoCard` (C-25, varian berbingkai) — fokus pemilik saat ini
- `Callout` (C-26, varian ikon) penutup section

**Beyond Code**
- `SectionHeader` (C-23, varian rata-kiri+garis): badge "Beyond Code" ·
  judul · subjudul
- Grid 5 `InfoCard` (C-25, varian berbingkai) — sisi personal pemilik di
  luar coding
- `Callout` (C-26, varian kutipan) penutup section

**Catatan:** keahlian **tidak** ditampilkan di sini — cukup di Home
(pm_01 D006, D-009 uiux), menghindari redundansi.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-02) &
> `docs/uiux_03_design_system.md` (§Komponen C-02/03/22/23/25/26/27).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Alur:** FLOW-03 (melihat perkenalan diri), FLOW-20 (melihat cara berpikir
& cara bekerja pemilik) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tidak ada — issue ini murni tampilan statis (Server Component tanpa data
dinamis), tanpa form atau input data milik sendiri.

## Aturan Bisnis/Perilaku

- **Tanpa Server Action** — seluruh isi (About Hero, Engineering
  Principles, Development Workflow, Current Focus, Beyond Code) adalah
  teks/ikon statis yang ditulis langsung di kode komponen (pm_01 D007);
  **tidak ada** `getXxx()` yang dipanggil dari `page.tsx` issue ini.
- **`SectionHeader` (C-23) diperluas, bukan diduplikasi** — tambah prop
  varian (rata-tengah tanpa garis/Home vs rata-kiri+garis/About) di
  `shared/components/SectionHeader.tsx` (file sudah ada sejak ISS-025);
  anatomi inti (badge+judul+subjudul) & pemakaian di Home (ISS-026) TIDAK
  boleh berubah — cuma nambah opsi tampilan baru, pola sama `SkillTag`
  dobel-tujuan (D-019 uiux).
- **Baris "{Nama} — {Profesi}" wajib ada** di About Hero meski referensi
  visual client tidak menunjukkannya secara eksplisit (referensi cuma
  menonjolkan judul editorial) — memastikan AC-002-1 tetap eksplisit
  terpenuhi (D-020 uiux).
- **Foto profil opsional** (AC-002-1) — bila developer belum menempel
  berkas foto, slot foto disembunyikan/diganti placeholder netral, halaman
  tidak tampil rusak.
- **`InfoCard`/`Callout`/`ProcessStep` (C-25/26/27) co-located di
  `app/(public)/about/_components/`** — baru dipakai 1 fitur (About),
  BUKAN `shared/components/` (beda dari `ProjectCard`/`PostItem` di
  ISS-026 yang dipakai ≥2 fitur).
- **`TextSection` (C-15) TIDAK dipakai** — deprecated sejak D-020 uiux,
  seluruh 4 section non-Hero pakai `SectionHeader`+`InfoCard`/`Callout`/
  `ProcessStep`.
- Urutan 5 section (Hero → Engineering Principles → Development Workflow →
  Current Focus → Beyond Code) tetap, tidak berubah dari spesifikasi lama.

## Auth & Permission

Publik, tanpa sesi — sama seperti seluruh SCR-01 s.d. SCR-07.

## Aset & Design System

**Dipakai apa adanya dari ISS-025** (`shared/`, tidak dibangun ulang):
Navbar (C-02), ThemeToggle (C-03), Footer (C-22).

**Diperluas di issue ini** (file sudah ada, ditambah prop varian — bukan
komponen baru):

| Komponen | Lokasi | Perubahan |
|----------|--------|-----------|
| SectionHeader (C-23) | `shared/components/SectionHeader.tsx` (ISS-025) | + prop varian rata-kiri/garis aksen (About), varian lama (Home, ISS-026) tetap apa adanya |

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| InfoCard (C-25) | `app/(public)/about/_components/` (co-located) | Baru dipakai 1 fitur (About) |
| Callout (C-26) | `app/(public)/about/_components/` (co-located) | Baru dipakai 1 fitur (About) |
| ProcessStep (C-27) | `app/(public)/about/_components/` (co-located) | Baru dipakai 1 fitur (About) |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** foto profil (opsional, statis, pm_01 D007) sudah ditempel
developer sejak ISS-025/026 bila ada; ikon-ikon `InfoCard`/`ProcessStep`
dari pustaka ikon proyek (bukan aset unggahan admin, beda dari ikon Skill
di SCR-14).

## Struktur File (referensi awal)

```
src/app/(public)/about/
├── page.tsx                       ← SCR-02 About — Server Component,
│                                     TANPA panggilan Server Action apa pun
└── _components/
    ├── InfoCard.tsx                ← C-25 (khas About, varian berbingkai/polos)
    ├── Callout.tsx                 ← C-26 (khas About, varian ikon/kutipan)
    └── ProcessStep.tsx             ← C-27 (khas About)
src/shared/components/
└── SectionHeader.tsx               ← C-23 (SUDAH ADA sejak ISS-025,
                                        diperluas prop varian di sini)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/(public)/about/page.tsx` — 5 section About (Hero, Engineering
      Principles, Development Workflow, Current Focus, Beyond Code) sesuai
      Spesifikasi Layar.
- [ ] `InfoCard` (C-25), `Callout` (C-26), `ProcessStep` (C-27) dibangun &
      ditempatkan sesuai §Aset & Design System.
- [ ] `SectionHeader` (C-23) diperluas dengan varian rata-kiri+garis aksen,
      tanpa mengubah pemakaian varian lama di Home (ISS-026).
- [ ] Foto profil About Hero tampil kondisional (opsional, AC-002-1).

**Out of Scope**
- Navbar, Footer, ThemeToggle, kerangka route — sudah ISS-025.
- Keahlian/SkillCard — eksklusif Home (pm_01 D006), tidak tampil di About.
- Server Action apa pun — halaman ini murni statis, tidak ada endpoint
  yang dipanggil atau dibangun.
- Konten halaman lain (Home, Portfolio, Blog, Contact, admin) — issue
  fitur masing-masing (ISS-026, ISS-028 s.d. ISS-040).
- SEO (`generateMetadata`, `sitemap.ts`) — sudah ISS-025 (AC-001-4, cakupan
  seluruh 5 halaman publik).

## Acceptance Criteria

- [ ] Pengunjung membuka halaman About → foto (bila ada), profesi, dan
      perkenalan singkat pemilik tampil (AC-002-1).
- [ ] Halaman About dimuat → Engineering Principles (prinsip kerja teknis
      pemilik) tampil (AC-020-1).
- [ ] Halaman About dimuat → Development Workflow (alur kerja pemilik)
      tampil (AC-020-2).
- [ ] Halaman About dimuat → Current Focus (fokus pemilik saat ini) tampil
      (AC-020-3).
- [ ] Halaman About dimuat → Beyond Code (sisi personal pemilik di luar
      coding) tampil (AC-020-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: seluruh 5 section tampil sesuai urutan,
      foto profil tampil kondisional (ada/tidak ada), varian baru
      `SectionHeader` tidak merusak tampilan varian lama di Home.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-02 — `docs/uiux_02_wireframe.md`; FLOW-03,
  FLOW-20 — `docs/uiux_01_user_flow.md`
- **Design system:** C-02/03/15/22/23/25/26/27 —
  `docs/uiux_03_design_system.md`; referensi visual client —
  `docs/layout/about/about-01..05.png` (D-020 uiux)
- **Kontrak API:** tidak ada — halaman statis, tanpa Server Action
- **Perilaku yang ditopang:** AC-002-1, AC-020-1/2/3/4 —
  `docs/ba_03_acceptance_criteria.md`
