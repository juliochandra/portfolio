# ISS-032 — [FE] Layar Dashboard

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-024, ISS-025, ISS-028 |
| **Serves** | SCR-09 |
| **Covers** | — |

## Deskripsi

Halaman Dashboard (`/admin`, SCR-09) — beranda admin sesudah masuk.
Mengonsumsi `SA-37` (`getDashboardSummary`) saja: 4 hitungan agregat +
5 item terbaru tiap Post & Project. Murni pemanis tampilan, **tanpa**
`F-06.X` sendiri — `Covers` kosong, tidak ada AC BA yang menguji issue
ini secara khusus (pm_01 D009, G-009 uiux; pola sama `ISS-024`).

**Rombakan dari referensi visual client** (`docs/layout/cms/
cms-portfolio.png`, `-darkmode.png`, D-024 uiux) — **PERTAMA KALI**
referensi visual di seluruh backlog ini menyasar **sisi admin**, bukan
publik (ISS-026 s.d. 031 semuanya publik/login). NOL pertanyaan blocking
via AskUserQuestion, tapi referensi ini memicu **dua perbaikan upstream**
sebelum Spesifikasi Layar bisa ditulis:

1. **`AdminNav` (C-10) dikoreksi** dari "header atas" jadi **sidebar
   kiri** (G-020 uiux) — item & pengelompokan menu (Overview/Content/
   Communication/System) TIDAK berubah, murni orientasi. Karena
   `AdminNav` dibangun `ISS-025` (foundational), `ISS-025` **di-compile
   ulang** untuk koreksi ini sebelum issue ini ditulis.
2. **`SA-37` diperluas** +`tags` (`recentPosts`) +`skills`
   (`recentProjects`) — D-031 techlead, `techlead_03` v2.18. Celah
   ditemukan saat pre-check: `uiux_03_design_system.md` C-19
   (`SummaryRow`) sudah lama menyebut "tag/skill singkat" di anatominya,
   tapi `SA-37` belum pernah mengeksposnya. Pola identik D-028 (field
   yang relasinya sudah ada, tinggal diekspos) — **tanpa perubahan
   skema**. `docs/issues/ISS-024` (sudah compiled) **di-compile ulang**.

Grup menu SYSTEM pada referensi menampilkan "Users" — **TIDAK diadopsi**,
tetap "Password" (G-021 uiux, dikunci Assumption BA A-005: satu akun
admin, tanpa registrasi/manajemen banyak pengguna).

**Catatan build-order**: `StatCard` (C-18) dipakai lagi di sini (4 kartu
Ringkasan Statistik) — kodenya **sudah dibangun `ISS-028`** (Portfolio),
meski aslinya discope untuk Dashboard; karena itu `ISS-028` ditambahkan
eksplisit ke `blocked_by` (bukan cuma transitif lewat `ISS-025`), pola
sama `ISS-028`→`ISS-027` & `ISS-029`→`ISS-027`/`028` sebelumnya.
`SummaryRow` (C-19) & `QuickAction` (C-21) — **keduanya dibangun PERTAMA
KALI di issue ini** (belum pernah dipakai issue FE mana pun sebelumnya)
— ditempatkan `shared/components/` (generik, tanpa data satu entitas
tertentu — pola sama `AdminNav`/`ISS-025`), bukan co-located, meski
`used_in` saat ini cuma SCR-09.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-09 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`,
dikoreksi jadi sidebar D-024), issue ini **tidak** membangun ulang,
otomatis terwarisi lewat layout.

### SCR-09 — Dashboard

**Ringkasan Statistik**
- 4 kartu: Total Posts (+ jumlah Published) · Total Projects (+ jumlah
  Published) · Total Tags · Total Skills

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Kartu statistik | `StatCard` (C-18, reuse dari `ISS-028`) | Statis, angka hasil hitung otomatis; murni pemanis, non-blocking |

**Aktivitas Terbaru**
- Dua kolom (layar lebar) / bertumpuk (layar sempit): "Recent Posts" &
  "Recent Projects", masing-masing 5 item terbaru (semua status) + chip
  tag/skill ringkas; `[View all]` di pojok kanan judul tiap kolom

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 2 | Baris ringkasan | `SummaryRow` (C-19, BARU) | Bisa ditekan → form ubah item itu; `[View all]` → SCR-10/SCR-12 |

**Pintasan Cepat**
- Baris tombol: `[New Post]` · `[New Project]` · `[New Skill]` ·
  `[Upload Media]` · `[View Messages]` · `[Contact Info]` — masing-masing
  + keterangan kecil (mis. "Create a new blog post")

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 3 | Tombol pintasan | `QuickAction` (C-21, BARU) | Menuju form tambah/halaman kelola terkait |

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-09) &
> `docs/uiux_03_design_system.md` (§Komponen C-10/18/19/21). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Catatan eksplisit — TIDAK diadopsi dari referensi visual**: grup menu
SYSTEM "Users" (tetap "Password", G-021 — lihat Deskripsi).

**Alur:** FLOW-10 (admin masuk → Dashboard), FLOW-17 (admin keluar dari
Dashboard) — `docs/uiux_01_user_flow.md`; keduanya generik, tidak
menyebut detail konten Dashboard.

## Aturan Validasi

Tidak ada — `SA-37` tanpa parameter, issue ini murni baca & tampil
(Server Component), tanpa form atau input data milik sendiri.

## Aturan Bisnis/Perilaku

- **Satu panggilan baca**: `app/admin/page.tsx` (Server Component)
  memanggil `getDashboardSummary()` (`SA-37`) langsung — bukan lewat
  Route Handler/`fetch`.
- **4 StatCard live-computed dari respons `SA-37` yang sama** — bukan
  hardcode, konsisten pola StatCard publik (`ISS-028`/`029`), meski di
  sini datanya sudah datang teragregasi dari server (bukan dihitung
  client-side dari list mentah seperti sisi publik).
- **`recentPosts`/`recentProjects` seluruh status** (Draf/Terbit/Arsip
  ikut tampil) — beda dari sorotan Home publik yang cuma `PUBLISHED`;
  ini tampilan admin. Badge status per baris (Draft/Published/Archived,
  label Inggris, D-014).
- **Tanpa state kosong khusus** — belum ada Post/Project/Tag/Skill sama
  sekali → hitungan tampil 0, daftar terbaru tampil kosong tanpa error
  (bukan skenario AC formal, tapi tetap harus tidak rusak/crash).
- **`SummaryRow` (C-19, BARU) & `QuickAction` (C-21, BARU) dibangun di
  `shared/components/`** — generik, tanpa bentuk data satu entitas
  tertentu (SummaryRow menerima props generik judul/thumbnail/status/
  tanggal/tags-atau-skills; QuickAction menerima ikon/label/keterangan/
  tujuan) — konsisten Aturan Penempatan `techlead_04`.
- **`AdminNav` (C-10, sidebar), `ThemeToggle` (C-03), `StatCard` (C-18)
  dipakai apa adanya** dari `shared/` — issue ini tidak memperluas
  anatomi satu pun dari ketiganya.
- **`[View all]`/Pintasan Cepat murni navigasi FE** — tautan ke halaman
  kelola masing-masing (`/admin/posts`, `/admin/projects`, dst.), TANPA
  data dari `SA-37` (sudah ditegaskan `ISS-024` Out of Scope).

## Auth & Permission

- `SA-37`: **admin ber-sesi** (Matriks Akses, `techlead_03`) — dijaga
  ganda oleh `middleware.ts` (`ISS-012`, AC-009-3) di level route
  `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak
diperluas/dibangun ulang): AdminNav (C-10, sidebar sejak koreksi D-024)
— `ISS-025`; ThemeToggle (C-03) — `ISS-025`; StatCard (C-18) —
`ISS-028`.

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| SummaryRow (C-19) | `shared/components/` | Generik, tanpa data satu entitas — pola sama AdminNav/ISS-025, meski `used_in` baru SCR-09 |
| QuickAction (C-21) | `shared/components/` | Generik, tanpa data satu entitas — pola sama di atas |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — ikon StatCard/SummaryRow/QuickAction
dari pustaka ikon proyek (bukan unggahan).

## Struktur File (referensi awal)

```
src/app/admin/
└── page.tsx                        ← SCR-09 Dashboard — Server Component,
                                        getDashboardSummary() (SA-37)
src/shared/components/
├── SummaryRow.tsx                   ← C-19 (BARU, dibangun di sini)
└── QuickAction.tsx                  ← C-21 (BARU, dibangun di sini)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getDashboardSummary` SUDAH ADA (dibangun `ISS-024` —
`features/dashboard/dashboard.action.ts`, direcompile kontraknya sebelum
issue ini, pola sama `ISS-013`/`014`); issue ini cuma memanggilnya,
tidak membuat ulang. `app/admin/layout.tsx` (AdminNav sidebar) sudah ada
sejak `ISS-025`, dikoreksi D-024 — issue ini tidak menyentuhnya.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/page.tsx` — Ringkasan Statistik + Aktivitas Terbaru +
      Pintasan Cepat sesuai Spesifikasi Layar.
- [ ] `SummaryRow` (C-19) & `QuickAction` (C-21) dibangun & ditempatkan
      sesuai §Aset & Design System.
- [ ] 4 StatCard menampilkan hitungan sesuai respons `SA-37`.
- [ ] Recent Posts/Recent Projects — hingga 5 item terbaru masing-masing,
      seluruh status, dengan chip tag/skill.
- [ ] `[View all]` → SCR-10 (Kelola Project)/SCR-12 (Kelola Tulisan).
- [ ] 6 Pintasan Cepat → form tambah/halaman kelola terkait.

**Out of Scope**
- Sidebar Admin/AdminNav, ThemeToggle, kerangka route `/admin/*` —
  sudah `ISS-025`.
- Grup menu SYSTEM "Users"/manajemen banyak pengguna — DITOLAK, dikunci
  Assumption BA A-005 (G-021).
- Endpoint `getDashboardSummary` — sudah selesai (`ISS-024`, kontrak
  terkini setelah recompile D-031 techlead).
- Halaman kelola tujuan `[View all]`/Pintasan Cepat (Kelola Project,
  Tulisan, Keahlian, Media, Pesan, Info Kontak) — masing-masing issue
  fitur sendiri (`ISS-033` dst., belum dikompilasi).
- Konten halaman lain (publik, Masuk Admin) — issue fitur masing-masing.

## Acceptance Criteria

Tidak ada AC BA yang menguji issue ini secara khusus (`Covers` kosong,
murni pemanis non-blocking — pm_01 D009, pola sama `ISS-024`). Checklist
berikut disusun langsung dari kontrak `SA-37`/wireframe SCR-09 sebagai
pengganti AC formal:

- [ ] Admin membuka Dashboard → 4 kartu statistik menampilkan hitungan
      yang benar (Total & Published Posts/Projects, Total Tags, Total
      Skills).
- [ ] Admin membuka Dashboard → "Recent Posts"/"Recent Projects"
      masing-masing menampilkan hingga 5 item terbaru dengan chip
      tag/skill, urut terbaru, mencakup semua status.
- [ ] Belum ada Post/Project/Tag/Skill tersimpan sama sekali → hitungan
      tampil 0, daftar terbaru tampil kosong tanpa error/rusak.
- [ ] `[View all]` & 6 Pintasan Cepat mengarah ke halaman yang benar.
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Dashboard di peramban, admin masuk
      lebih dulu) — hitungan & daftar terbaru sesuai data sungguhan,
      mode terang & gelap (referensi 2 varian), sidebar responsif layar
      sempit.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-09 — `docs/uiux_02_wireframe.md`; FLOW-10,
  FLOW-17 — `docs/uiux_01_user_flow.md`
- **Design system:** C-10/18/19/21 — `docs/uiux_03_design_system.md`;
  referensi visual client — `docs/layout/cms/` (D-024 uiux)
- **Kontrak API:** `SA-37` — `docs/techlead_03_api_contract.md` (v2.18,
  D-031: +`tags`/+`skills`)
- **Perilaku yang ditopang:** tidak ada AC spesifik (pemanis
  non-blocking, pm_01 D009) — `docs/pm_01_project.md`
