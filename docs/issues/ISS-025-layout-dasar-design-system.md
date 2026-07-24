# ISS-025 — [FE] Layout dasar, design system & kerangka admin

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-001 |
| **Serves** | SCR-01, SCR-02, SCR-03, SCR-04, SCR-05, SCR-06, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14, SCR-15, SCR-16, SCR-17, SCR-18, SCR-19 |
| **Covers** | AC-001-4, AC-009-3, AC-016-1 |

## Deskripsi

Fondasi tampilan untuk SELURUH 19 layar proyek ini: token desain (warna,
tipografi, spacing — mode terang & gelap), 8 komponen dasar yang dipakai
lintas fitur, dua kerangka route (`app/(public)/layout.tsx` untuk 5 layar
publik, `app/admin/layout.tsx` untuk 11 layar kelola), dan SEO dasar
(metadata + sitemap.xml, D-007 `docs/techlead_01_architecture.md`). Tanpa
issue ini, layar manapun tidak punya tempat berjalan — seluruh 15 issue FE
lain (ISS-026 s.d. ISS-040) `blocked_by` issue ini. **Catatan cakupan
komponen** (interpretasi Issue Planner dari Aturan Penempatan techlead_04
"komponen dipakai ≥2 fitur → shared/"): issue ini membangun komponen yang
**tidak membawa bentuk data satu entitas tertentu** — murni pola interaksi
generik (tombol, menu, form generik, dialog, pesan status). Komponen yang
membawa bentuk data entitas (mis. `ProjectCard` C-04, `PostItem` C-05,
`ManageRow` C-11) dibangun di issue fitur pemiliknya sendiri (ISS-026,
ISS-028/029, dst.) meski tampil di ≥2 layar — bentuknya baru bermakna saat
dipasangkan dengan Server Action fitur itu, bukan berdiri sendiri di sini.

## Spesifikasi Layar

Issue ini **tidak membangun konten** satu layar pun secara utuh — isi
tiap SCR (Hero, daftar project, form, dst.) adalah tanggung jawab issue
fiturnya sendiri (ISS-026 s.d. ISS-040). Yang dibangun di sini adalah
**elemen yang identik berulang di seluruh layar**, disalin ringkas dari
`docs/uiux_02_wireframe.md`:

**Navbar** (SCR-01 s.d. SCR-07, identik di ketujuhnya)
- Kiri: nama pemilik. Kanan: ThemeToggle (☀/☾) + menu (Home · About ·
  Portfolio · Blog · Contact) — terlipat ke ≡ di layar sempit; halaman
  aktif ditandai (AC-001-1, ditopang penuh di issue layar masing-masing).

**Footer** (SCR-01 s.d. SCR-07, identik)
- Tengah: nama pemilik · © tahun — statis, tanpa tautan/anotasi.

**Header Admin / AdminNav** (SCR-09 s.d. SCR-19, identik — TIDAK
termasuk SCR-08 Masuk, lihat Aturan Bisnis)
- Kiri: nama pemilik + "CMS Dashboard". Kanan: ThemeToggle + [Keluar]
  (selalu terlihat, AC-016-1). Menu berkelompok label Inggris:
  **Overview** (Dashboard) · **Content** (Posts, Projects, Tags, Skills,
  Media) · **Communication** (Messages, Contact Info) · **System**
  (Password) — terlipat ke ≡ di layar sempit, [Keluar] tetap terlihat
  tanpa membuka menu.

**State: terlarang** (berlaku SCR-09 s.d. SCR-19, seragam) — membuka
alamat layar kelola tanpa sesi admin dialihkan ke SCR-08 (AC-009-3);
tidak ada bagian pengelolaan yang sempat tampil.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-01 §Navbar/Footer,
> SCR-09 §Header Admin/State terlarang). **Bila berbeda dengan dokumen
> itu, dokumen kontrak yang berlaku** — laporkan selisihnya, jangan
> memilih sendiri.

**Alur:** FLOW-01 (pengunjung pertama membuka, menu & Navbar harus siap),
FLOW-10 (admin masuk → Dashboard, kerangka admin harus siap menerimanya),
FLOW-17 (admin keluar → kembali ke SCR-08, header admin adalah sumber
tombol [Keluar]) — ketiganya di `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tidak ada — issue ini murni kerangka tampilan & navigasi, tanpa form
atau input data milik sendiri (ThemeToggle bukan input yang divalidasi,
cuma dipilih & diingat).

## Aturan Bisnis/Perilaku

- **ThemeToggle (C-03):** ganti mode terang↔gelap seketika, pilihan
  diingat di kunjungan berikutnya (Preferensi Visual pm_01, D-003 uiux);
  satu implementasi dipakai kedua sisi (publik via Navbar, admin via
  AdminNav) — root `app/layout.tsx` menampung `ThemeProvider`-nya
  (techlead_04).
- **`app/(public)/`** (route group, D-018 techlead_01): satu
  `layout.tsx` bersama (Navbar+Footer) untuk kelima layar publik
  (SCR-01..07), tanpa mengubah URL (`/`, `/about`, dst. tetap sama).
- **`app/admin/`** (D-019 techlead_01): satu `layout.tsx` (AdminNav)
  berlaku ke **seluruh** SCR-09..19 tanpa pengecualian — sejak SCR-08
  dipindah keluar ke `app/login/` tersendiri, tidak ada lagi rute admin
  yang perlu dikecualikan dari layout ini.
- **SCR-08 (Masuk)** sengaja **tidak** berbagi `layout.tsx` admin
  maupun publik — wireframe-nya tanpa bagian Header Admin/Navbar
  (`docs/uiux_02_wireframe.md` SCR-08); halaman berdiri sendiri di
  `app/login/`. Konten form-nya sendiri = ISS-031, di luar cakupan
  issue ini.
- **Perlindungan `/admin/*`** sudah ditegakkan `middleware.ts` (dibangun
  ISS-012, verifikasi JWT independen) — issue ini **tidak** membangun
  ulang logikanya, hanya memastikan struktur route `app/admin/**` benar-
  benar ada di bawah path yang dijaga middleware itu, supaya
  perlindungannya punya halaman sungguhan untuk dijaga (AC-009-3).
- **SEO (AC-001-4, D-007 techlead_01):** ditopang lewat Server-Side
  Rendering bawaan App Router (bukan endpoint) + `generateMetadata`
  per halaman publik (judul, deskripsi) + satu route `app/sitemap.ts`
  mendaftarkan kelima halaman statis publik + URL dinamis Project/Post
  yang sudah `PUBLISHED` (dibaca lewat `SA-24`/`SA-26`, sudah ada sejak
  ISS-013/014) — kecepatan pengindeksan Google sendiri di luar kendali
  penuh website (catatan jujur pm_01, ba_03).
- Komponen `C-01/02/03/08/09/10/12/13` yang dibangun di sini dipakai
  **apa adanya** oleh seluruh issue fitur berikutnya — issue lain tidak
  membuat versi duplikatnya sendiri (konsisten `shared/`, techlead_04
  §Aturan Penempatan).

## Auth & Permission

- SCR-01..08: **publik**, tanpa sesi.
- SCR-09..19: **admin ber-sesi** — dijaga `middleware.ts` (ISS-012);
  tanpa sesi valid, permintaan ke `/admin/*` dialihkan ke `/login`
  sebelum halaman dirender (AC-009-3). Issue ini menyediakan struktur
  route yang dijaga, bukan mekanisme penjagaannya sendiri.

## Aset & Design System

**Token** (`docs/uiux_03_design_system.md` §Design Tokens): warna 8
peran (canvas/surface/text/text-mute/border/accent/primary/danger, tiap
peran punya nilai mode terang & gelap — sumber Primer/github.com,
D-002 uiux); tipografi (heading maks. 3 tingkat, body ≤±70 karakter/baris);
spacing basis 8 (8/16/24/32).

**Komponen yang dibangun issue ini** (generik, tanpa bentuk data satu
entitas — lihat Deskripsi §Catatan cakupan):

| Komponen | Dipakai di |
|----------|------------|
| C-01 Button | SCR-01, 04, 07, 08, 09, 10, 11, 12, 13, 14, 15, 17, 18, 19 |
| C-02 Navbar | SCR-01 s.d. SCR-07 |
| C-03 ThemeToggle | SCR-01 s.d. SCR-19 (kedua sisi) |
| C-08 FormField | SCR-07, 08, 11, 13, 14, 15, 17, 19 |
| C-09 BackLink | SCR-04, 06, 11, 13 |
| C-10 AdminNav | SCR-09 s.d. SCR-19 |
| C-12 ConfirmDialog | SCR-10, 12, 14, 15, 17, 18 |
| C-13 StatusMessage | SCR-07, 08, 10, 12, 14, 15, 17, 18, 19 |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen (C-01/02/03/08/09/10/12/13) — **disalin apa adanya saat
implementasi, bukan ditafsir ulang**. Komponen lain (C-04..C-07, C-11,
C-14..C-21) dibangun di issue fitur pemiliknya masing-masing.

**Aset:** tanpa aset visual baru di issue ini — foto profil/CV (statis,
pm_01 D007) ditempel developer langsung, di luar cakupan komponen
kerangka.

## Struktur File (referensi awal)

```
src/app/
├── layout.tsx                   ← root: ThemeProvider (ThemeToggle C-03)
├── sitemap.ts                   ← SEO: daftar URL statis + dinamis (D-007)
├── (public)/
│   └── layout.tsx                ← Navbar (Navbar C-02) + Footer, 5 layar publik
├── login/                        ← berdiri sendiri, TANPA layout.tsx bersama (ISS-031 isi formnya)
└── admin/
    └── layout.tsx                 ← Header Admin (AdminNav C-10), SCR-09..19
src/shared/
└── components/
    ├── Button.tsx           ← C-01
    ├── Navbar.tsx             ← C-02
    ├── ThemeToggle.tsx            ← C-03
    ├── FormField.tsx             ← C-08
    ├── BackLink.tsx            ← C-09
    ├── AdminNav.tsx             ← C-10
    ├── ConfirmDialog.tsx      ← C-12
    └── StatusMessage.tsx           ← C-13
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Konfigurasi token warna/tipografi/spacing (Tailwind) juga
tinggal di `shared/` (techlead_04), bukan folder baru di luar peta itu.
`middleware.ts` (penjaga `/admin/*`) **tidak** dibangun di sini — sudah
ada sejak ISS-012.*

## In Scope / Out of Scope

**In Scope**
- [ ] Token desain (warna/tipografi/spacing, mode terang & gelap)
      dikonfigurasi (Tailwind).
- [ ] 8 komponen generik: Button, Navbar, ThemeToggle, FormField,
      BackLink, AdminNav, ConfirmDialog, StatusMessage (C-01/02/03/
      08/09/10/12/13).
- [ ] `app/(public)/layout.tsx` (Navbar+Footer, 5 layar publik).
- [ ] `app/admin/layout.tsx` (Header Admin/AdminNav, 11 layar kelola).
- [ ] `app/login/` berdiri sendiri tanpa layout bersama (kerangka folder
      saja — isi form ISS-031).
- [ ] SEO dasar: `generateMetadata` per halaman publik + `app/sitemap.ts`.
- [ ] Mode terang/gelap berfungsi & diingat lintas kunjungan.

**Out of Scope**
- Konten tiap layar (Hero, daftar, form, dsb.) — issue fitur
  masing-masing (ISS-026 s.d. ISS-040).
- Komponen bermuatan data entitas (ProjectCard C-04, PostItem C-05,
  ManageRow C-11, dst.) — dibangun di issue fitur pemiliknya.
- Isi form Masuk (SCR-08) — ISS-031.
- `middleware.ts` & logika verifikasi sesi — sudah selesai (ISS-012).

## Acceptance Criteria

- [ ] Website tayang → nama pemilik dapat ditemukan lewat pencarian
      Google (SSR + metadata + sitemap aktif; kecepatan pengindeksan di
      luar kendali penuh website) (AC-001-4).
- [ ] Seseorang belum masuk sebagai admin mencoba membuka alamat halaman
      admin mana pun → dialihkan, halaman pengelolaan tidak sempat
      diakses (AC-009-3).
- [ ] Admin menekan [Keluar] di header admin → sesi berakhir; membuka
      alamat admin lagi dialihkan ke Masuk (AC-016-1).
- [ ] Navbar (publik) & Header Admin (kelola) tampil identik di seluruh
      layar yang memakainya, termasuk penanda halaman aktif & lipatan
      menu di layar sempit.
- [ ] Mode terang/gelap dapat diganti dari kedua sisi & tetap tersimpan
      setelah menutup/membuka kembali situs.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: navigasi publik & admin, saklar tema,
      halaman admin tanpa sesi dialihkan, tombol Keluar berfungsi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-01, SCR-08, SCR-09 (Navbar/Footer/Header
  Admin/State terlarang) — `docs/uiux_02_wireframe.md`; FLOW-01,
  FLOW-10, FLOW-17 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/02/03/08/09/10/12/13, Design Tokens —
  `docs/uiux_03_design_system.md`
- **Arsitektur & struktur folder:** D-007, D-018, D-019 —
  `docs/techlead_01_architecture.md`; `app/`, `shared/` —
  `docs/techlead_04_folder_structure.md`
- **Perilaku yang ditopang:** AC-001-4, AC-009-3, AC-016-1 —
  `docs/ba_03_acceptance_criteria.md`
