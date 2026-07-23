# ISS-033 — [FE] Layar kelola project: daftar & form

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-017, ISS-025 |
| **Serves** | SCR-10, SCR-11 |
| **Covers** | AC-010-1, AC-010-2, AC-011-1, AC-011-2, AC-011-3, AC-011-4 |

## Deskripsi

Kelola Project admin — daftar (`/admin/projects`, SCR-10) & form tambah/
ubah (`/admin/projects/new`, `/admin/projects/[id]`, SCR-11). Mengonsumsi
`SA-30` (`getProjectsAdmin`, Server Component) & `SA-01`/`SA-02`/`SA-03`
(`createProject`/`updateProject`/`deleteProject`, form/aksi). Issue FE
**pertama** yang berbentuk pola CRUD admin penuh (daftar+tambah+ubah+
hapus) — beda dari ISS-026 s.d. 032 yang seluruhnya baca-saja atau form
tunggal (Contact/Login).

**TANPA referensi visual client baru** untuk layar ini — dicek
`docs/layout/cms/` (3 file: `cms-portfolio.png`/`-darkmode.png` sudah
diproses `ISS-032` Dashboard, `login.png` sudah diproses recompile
`ISS-031`), tidak ada file baru khusus Kelola Project. SCR-10/SCR-11
sudah lengkap tersepesifikasi sejak awal proyek (`status: done`, tanpa
D-0XX redesign tertunda) — issue ini **compile langsung** dari wireframe
yang sudah ada, tanpa cascade pertanyaan/redesign.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** (wajib sejak
D-024/D-028, plus cek staleness `docs/issues/` sejak D-023 issue.yaml) —
`SA-30`/`SA-01`/`SA-02`/`SA-03` di `techlead_03_api_contract.md`
**SUDAH SINKRON** dengan salinan di `ISS-017` (sudah compiled), tanpa
selisih. Techlead **tidak disentuh** siklus ini.

**Catatan build-order**: `ManageRow` (C-11) & `StatusSelect` (C-16) —
**KEDUANYA dibangun PERTAMA KALI di issue ini**. `ManageRow` entity-
bearing (baris nama+meta+badge status+aksi) — per `ISS-025`
("Komponen bermuatan data entitas ... dibangun di issue fitur
pemiliknya"), sengaja TIDAK dibangun di sana. `StatusSelect` generik
(3 opsi enum `PublishStatus`) tapi bukan bagian 10 komponen dasar
`ISS-025`, dan Kelola Project adalah konsumen pertamanya (SCR-11 sebelum
SCR-13 Kelola Tulisan, `ISS-034`, belum dikompilasi). Keduanya
ditempatkan `shared/components/` (dipakai ≥2 fitur admin ke depan —
`ManageRow`: SCR-10/12/14/15/17; `StatusSelect`: SCR-11/13) — `ISS-034`
dst. nanti tinggal memakainya apa adanya, pola sama `ProjectCard`/
`PostItem` di `ISS-026` & `StatCard` di `ISS-028`.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-10/SCR-11 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`,
sidebar sejak koreksi D-024), issue ini **tidak** membangun ulang,
otomatis terwarisi lewat layout.

### SCR-10 — Kelola Project (daftar)

**Daftar Kelola Project**
- Atas: judul "Projects" · `[+ Tambah Project]`
- Daftar baris: nama project + gambaran singkat + badge status (Draft/
  Published/Archived) + aksi Ubah · Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | `[+ Tambah Project]` | Button (C-01, primer) | → SCR-11 kosong (FLOW-11) |
| 2 | Baris project | `ManageRow` (C-11, BARU) | Ubah → SCR-11 terisi; Hapus → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger (AC-011-2, A-004 BA) |
| 4 | Pesan hasil | StatusMessage (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada project. Tambahkan yang pertama." +
`[+ Tambah Project]`.

**State: konfirmasi-hapus** — dialog: "Hapus project '{nama}'? Tindakan
ini tidak bisa dibatalkan." `[Batal]` `[Hapus]`.

### SCR-11 — Form Project (tambah/ubah)

**Form Project**
- Atas: `< Kembali ke Project` · judul "Tambah Project" / "Ubah Project"
- Nama project * : ___________________
- Gambaran singkat * : ___________________
- Deskripsi lengkap : ___________________ (beberapa baris — dapat memuat
  peran pemilik, G-013 BA)
- Tautan demo : ___________________ · Tautan kode : ___________________
- Gambar : {pilih dari galeri Media — opsional, TANPA unggah baru
  inline, D-016 uiux/D-025 techlead}
- Keahlian/Tech Stack : {pilih dari daftar Keahlian, multi — opsional}
- Tag : {pilih dari daftar Tag, multi — opsional, G-014 BA}
- Status : ( ) Draft ( ) Published ( ) Archived — default **Draft**
- Aksi: `[Simpan]`

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | `< Kembali` | BackLink (C-09) | Kembali ke SCR-10 tanpa menyimpan |
| 2 | Isian | FormField (C-08) | * = wajib; error per bagian (AC-010-2) |
| 3 | Status | `StatusSelect` (C-16, BARU) | Draft/Published/Archived; hanya Published tampil publik (AC-010-1, AC-011-3, AC-011-4) |
| 4 | `[Simpan]` | Button (C-01, primer) | Tersimpan → SCR-10 + pesan berhasil; status Published tampil publik (AC-010-1, AC-011-1) |

**State: error-validasi** — bagian wajib kosong dibingkai danger + pesan
di bawah isian; tidak tersimpan (AC-010-2).

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-10, SCR-11) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/09/11/12/13/16).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Alur:** FLOW-11 (admin menambah project), FLOW-12 (admin mengubah/
menghapus/mengatur status project) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-01`/`SA-02` (`docs/techlead_03_api_contract.md` /
`ISS-017`) — server tetap sumber kebenaran, FE re-validasi murni UX:

- `title` — wajib; maks 200 karakter (AC-010-2).
- `description` — wajib **secara produk** meski nullable di skema; maks
  300 karakter.
- `content` — wajib; teks panjang, dapat memuat "peran saya" (G-013 BA).
- `demoUrl`, `repositoryUrl` — opsional; maks 255 karakter.
- `thumbnailImage` — opsional; dipilih dari galeri Media (URL), **bukan**
  input unggah berkas di form ini.
- `skillIds`, `tagIds` — opsional; dipilih dari daftar yang sudah ada,
  bukan ketik-bebas (G-014 BA).
- `status` — salah satu `DRAFT`/`PUBLISHED`/`ARCHIVED`; default `DRAFT`
  (G-011 BA).

## Aturan Bisnis/Perilaku

- **`page.tsx` daftar (Server Component) memanggil `getProjectsAdmin()`
  (`SA-30`) langsung**; `ProjectForm` (Client Component, `"use client"`)
  memanggil `createProject`/`updateProject` (`SA-01`/`SA-02`) via
  `action` form (pola sama `LoginForm`/`ContactForm`); tombol Hapus di
  `ManageRow` memanggil `deleteProject` (`SA-03`) — SELALU sesudah
  `ConfirmDialog` dikonfirmasi, tidak ada jalur hapus langsung.
- **`ManageRow` (C-11, BARU)** — baris generik (judul+meta+badge
  status+aksi Ubah/Hapus), menerima data project sebagai props; badge
  status label Inggris (Draft/Published/Archived, D-014).
- **`StatusSelect` (C-16, BARU)** — 3 opsi radio/dropdown mengikuti enum
  `PublishStatus`; SATU isian dalam form yang sama, BUKAN tombol simpan
  terpisah (beda dari pola "Publish" 1-klik di CMS lain) — status ikut
  tersimpan bersama `[Simpan]`.
- **Gambar dipilih dari galeri Media, TANPA unggah inline** — form ini
  cuma menyimpan `thumbnailImage` sebagai URL string; unggah berkas
  sungguhan cuma lewat halaman Media (`SA-19`, `ISS-023`/`ISS-039`,
  belum dikompilasi) — konsisten D-025 techlead.
- **`skillIds`/`tagIds` dipilih dari daftar yang sudah ada** — bukan
  input teks bebas; sumber daftarnya `SA-32`(Skill admin)/`SA-35`(Tag
  admin), masing-masing dari fitur Kelola Keahlian/Tag (belum
  dikompilasi) — form ini cukup memanggil daftar itu untuk opsi pilihan,
  tidak membangun ulang Kelola Keahlian/Tag.
- **`slug` dibuat otomatis server-side dari `title`** — FE tidak
  mengisi/menampilkan field `slug` di form sama sekali (D-010 techlead).
- **Perubahan `status` langsung berefek ke Portfolio publik** — tanpa
  delay/cache, tanpa aksi terpisah (AC-011-1, AC-011-3, AC-011-4).
- **`FormField` (C-08), `Button` (C-01), `BackLink` (C-09),
  `ConfirmDialog` (C-12), `StatusMessage` (C-13) dipakai apa adanya**
  dari `shared/` (`ISS-025`) — issue ini tidak memperluas anatomi satu
  pun dari kelimanya.

## Auth & Permission

- `SA-30`, `SA-01`, `SA-02`, `SA-03`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak
diperluas/dibangun ulang): AdminNav (C-10, sidebar) — `ISS-025`; Button
(C-01), FormField (C-08), BackLink (C-09), ConfirmDialog (C-12),
StatusMessage (C-13) — seluruhnya `ISS-025`.

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| ManageRow (C-11) | `shared/components/` | Entity-bearing tapi dipakai ≥2 fitur admin (SCR-10/12/14/15/17) — per ISS-025, sengaja bukan cakupan issue itu; dibangun di konsumen pertama |
| StatusSelect (C-16) | `shared/components/` | Generik (enum PublishStatus) tapi dipakai ≥2 fitur (SCR-11/13), bukan bagian 10 komponen dasar ISS-025; dibangun di konsumen pertama |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — gambar project dikelola lewat halaman
Media terpisah (`ISS-039`, belum dikompilasi), bukan bagian issue ini.

## Struktur File (referensi awal)

```
src/app/admin/projects/
├── page.tsx                        ← SCR-10 Kelola Project — Server
│                                       Component, getProjectsAdmin() (SA-30)
├── new/
│   └── page.tsx                    ← SCR-11 Tambah Project — <ProjectForm />
└── [id]/
    └── page.tsx                    ← SCR-11 Ubah Project — <ProjectForm
                                        project={...} />
src/shared/components/
├── ManageRow.tsx                    ← C-11 (BARU, dibangun di sini)
├── StatusSelect.tsx                 ← C-16 (BARU, dibangun di sini)
└── ProjectForm.tsx (atau co-located _components/)
                                     ← Client Component, createProject/
                                        updateProject (SA-01/SA-02) via
                                        action form
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getProjectsAdmin`/`createProject`/`updateProject`/
`deleteProject` SUDAH ADA (dibangun `ISS-017` —
`features/projects/projects.action.ts`, file yang sama diperluas sejak
`ISS-013`); issue ini cuma memanggilnya, tidak membuat ulang. `ProjectForm`
dipakai DUA route (`new/` & `[id]/`) — co-located di bawah
`app/admin/projects/_components/` jika tidak dipakai fitur lain.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/projects/page.tsx` — Daftar Kelola Project sesuai
      Spesifikasi Layar.
- [ ] `app/admin/projects/new/` & `[id]/` — Form Project (tambah/ubah)
      sesuai Spesifikasi Layar.
- [ ] `ManageRow` (C-11) & `StatusSelect` (C-16) dibangun & ditempatkan
      sesuai §Aset & Design System.
- [ ] State kosong Daftar Kelola Project.
- [ ] State konfirmasi-hapus (`ConfirmDialog`, AC-011-2).
- [ ] State error-validasi Form Project (AC-010-2).
- [ ] Transisi status (Draft↔Published↔Archived) tersimpan & langsung
      berefek ke Portfolio publik (AC-011-1, AC-011-3, AC-011-4).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- Endpoint `getProjectsAdmin`/`createProject`/`updateProject`/
  `deleteProject` — sudah selesai (`ISS-017`).
- Galeri Media (pemilihan `thumbnailImage`) — `ISS-039` (belum
  dikompilasi); form ini cuma memanggil daftar Media yang sudah ada.
- Daftar Keahlian/Tag untuk opsi pilihan `skillIds`/`tagIds` — masing2
  fitur Kelola Keahlian/Tag (`ISS-036`/`ISS-038`, belum dikompilasi);
  form ini cuma memanggil daftarnya.
- Konten halaman lain (publik, Masuk Admin, Dashboard) — issue fitur
  masing-masing.

## Acceptance Criteria

- [ ] Admin menambah project baru dengan lengkap, memilih status Terbit,
      lalu menyimpan → project tampil di Portfolio publik; bila status
      Draf, tersimpan namun belum tampil publik (AC-010-1).
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
      Project, dapat dikembalikan ke Terbit kapan saja (AC-011-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tambah/ubah/
      hapus project, transisi status Draft↔Published↔Archived beserta
      efeknya di Portfolio publik, state kosong, state konfirmasi-hapus,
      state error-validasi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-10, SCR-11 — `docs/uiux_02_wireframe.md`;
  FLOW-11, FLOW-12 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/08/09/11/12/13/16 —
  `docs/uiux_03_design_system.md`
- **Kontrak API:** `SA-30`, `SA-01`, `SA-02`, `SA-03` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-033
  mengonfirmasi sinkron dengan `ISS-017`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-010-1, AC-010-2, AC-011-1, AC-011-2,
  AC-011-3, AC-011-4 — `docs/ba_03_acceptance_criteria.md`
