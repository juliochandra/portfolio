# ISS-034 — [FE] Layar kelola tulisan: daftar & form

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-018, ISS-025, ISS-033 |
| **Serves** | SCR-12, SCR-13 |
| **Covers** | AC-012-1, AC-012-2, AC-013-1, AC-013-2, AC-013-3, AC-013-4 |

## Deskripsi

Kelola Tulisan admin — daftar (`/admin/posts`, SCR-12) & form tambah/ubah
(`/admin/posts/new`, `/admin/posts/[id]`, SCR-13). Mengonsumsi `SA-31`
(`getPostsAdmin`, Server Component) & `SA-04`/`SA-05`/`SA-06`
(`createPost`/`updatePost`/`deletePost`, form/aksi). Issue FE **kedua**
berpola CRUD admin penuh (daftar+tambah+ubah+hapus), pola identik
`ISS-033` (Kelola Project) — beda pentingnya: `ManageRow` (C-11) &
`StatusSelect` (C-16) di sini **dipakai apa adanya** (konsumen pertama
setelah dibangun `ISS-033`, D-030), **tidak** dibangun ulang.

**Pre-kondisi diselesaikan lebih dulu (D-031 issue.yaml, sebelum
Spesifikasi Layar ditulis):** `G-011` (celah field Cuplikan di SCR-13,
sengaja dibiarkan terbuka sejak `ISS-018` backend dikompilasi) DITAMBAL
— SCR-13 kini punya isian **Cuplikan** (`description` Post, opsional,
maks. 300 karakter) & klausa usang "gambar sampul tidak tampil di isi
tulisan" dihapus (leftover `D-022` yang luput saat SCR-06 direvisi).
Rincian: `D-026` `docs/memory/uiux.yaml` (v1.19).

**TANPA referensi visual client baru** untuk layar ini — dicek
`docs/layout/cms/` (3 file: `cms-portfolio.png`/`-darkmode.png` sudah
diproses `ISS-032`, `login.png` sudah diproses recompile `ISS-031`),
tidak ada file baru khusus Kelola Tulisan.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** (wajib sejak
D-024/D-028, plus cek staleness `docs/issues/` sejak D-023 issue.yaml) —
`SA-31`/`SA-04`/`SA-05`/`SA-06` di `techlead_03_api_contract.md`
**SUDAH SINKRON** dengan salinan di `ISS-018` (sudah compiled), tanpa
selisih. Techlead **tidak disentuh** siklus ini.

**Catatan build-order**: `ManageRow` (C-11) & `StatusSelect` (C-16)
dibangun pertama kali di `ISS-033` (`shared/components/`), ditandai di
sana akan direuse "Kelola Tulisan/Keahlian/dst tanpa dibangun ulang"
(D-030) — persis situasi issue ini. `blocked_by` karenanya mencakup
`ISS-033` selain `ISS-018`/`ISS-025` (D-031 issue.yaml, ditelusuri
langsung ke `docs/issues/ISS-033`, bukan diasumsikan dari `used_in`
`uiux.yaml`).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-12/SCR-13 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`,
sidebar sejak koreksi D-024), issue ini **tidak** membangun ulang,
otomatis terwarisi lewat layout.

### SCR-12 — Kelola Tulisan (daftar)

**Daftar Kelola Tulisan**
- Atas: judul "Posts" · `[+ Tulis Tulisan]`
- Daftar baris: judul tulisan + **tanggal terbit** (meta, dari
  `createdAt` — SELALU terisi termasuk Draf yang belum pernah terbit,
  beda dari `publishedAt` publik, `SA-31`) + badge status (Draft/
  Published/Archived) + aksi Ubah · Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | `[+ Tulis Tulisan]` | Button (C-01, primer) | → SCR-13 kosong (FLOW-13) |
| 2 | Baris tulisan | `ManageRow` (C-11, REUSE apa adanya) | Ubah → SCR-13 terisi; Hapus → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger (AC-013-2) |
| 4 | Pesan hasil | StatusMessage (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada tulisan. Tulis yang pertama." +
`[+ Tulis Tulisan]`.

**State: konfirmasi-hapus** — dialog: "Hapus tulisan '{judul}'? Tindakan
ini tidak bisa dibatalkan." `[Batal]` `[Hapus]`.

### SCR-13 — Form Tulisan (tambah/ubah)

**Form Tulisan**
- Atas: `< Kembali ke Tulisan` · judul "Tulis Tulisan" / "Ubah Tulisan"
- Judul * : ___________________
- Cuplikan : ___________________ (opsional, maks. 300 karakter — tampil
  di `PostItem` C-05 saat daftar tulisan; DITAMBAHKAN v1.19 uiux, G-011)
- Isi * : ___________________ (area tulis panjang)
- Gambar Sampul : {pilih dari galeri Media — opsional, TANPA unggah baru
  inline, D-016 uiux/D-025 techlead; tampil sbg thumbnail list,
  pratinjau share, & di isi tulisan publik, D-022 uiux}
- Tag : {pilih dari daftar Tag, multi — opsional, G-014 BA}
- Status : ( ) Draft ( ) Published ( ) Archived — default **Draft**
- Aksi: `[Simpan]`

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | `< Kembali` | BackLink (C-09) | Kembali ke SCR-12 tanpa menyimpan |
| 2 | Isian | FormField (C-08) | * = wajib (Judul, Isi); error per bagian (AC-012-2) |
| 3 | Status | `StatusSelect` (C-16, REUSE apa adanya) | Draft/Published/Archived; hanya Published tampil publik (AC-012-1, AC-013-3, AC-013-4) |
| 4 | `[Simpan]` | Button (C-01, primer) | Tersimpan → SCR-12 + pesan berhasil; status Published tampil publik (AC-012-1) |

**State: error-validasi** — Judul kosong dibingkai danger + pesan di
bawah isian; tidak tersimpan (AC-012-2).

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-12, SCR-13) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/09/11/12/13/16).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Alur:** FLOW-13 (admin menulis tulisan, draf atau terbit), FLOW-14
(admin mengubah/menghapus/mengatur status tulisan) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-04`/`SA-05` (`docs/techlead_03_api_contract.md` /
`ISS-018`) — server tetap sumber kebenaran, FE re-validasi murni UX:

- `title` — wajib; maks 200 karakter (AC-012-2).
- `description` (Cuplikan) — **opsional**; maks 300 karakter — beda dari
  `description` Project yang "wajib secara produk" (`ISS-033`); Post
  membolehkannya kosong.
- `content` — wajib; teks panjang, isi tulisan.
- `thumbnailImage` — opsional; dipilih dari galeri Media (URL), **bukan**
  input unggah berkas di form ini.
- `tagIds` — opsional; dipilih dari daftar yang sudah ada, bukan
  ketik-bebas (G-014 BA). **Tanpa `skillIds`** — beda dari Project, Post
  tidak punya relasi ke `Skill` (ENT-02).
- `status` — salah satu `DRAFT`/`PUBLISHED`/`ARCHIVED`; default `DRAFT`
  (G-011 BA).
- `readingTime` — **bukan isian form sama sekali**; dihitung server-side
  dari panjang `content` setiap kali disimpan (`SA-04`/`SA-05`) — jangan
  ditambahkan ke form meski tampil di `PostItem`/Detail Tulisan publik.

## Aturan Bisnis/Perilaku

- **`page.tsx` daftar (Server Component) memanggil `getPostsAdmin()`
  (`SA-31`) langsung**; `PostForm` (Client Component, `"use client"`)
  memanggil `createPost`/`updatePost` (`SA-04`/`SA-05`) via `action`
  form (pola sama `ProjectForm`/`LoginForm`/`ContactForm`); tombol Hapus
  di `ManageRow` memanggil `deletePost` (`SA-06`) — SELALU sesudah
  `ConfirmDialog` dikonfirmasi, tidak ada jalur hapus langsung.
- **`ManageRow` (C-11) & `StatusSelect` (C-16) dipakai APA ADANYA** dari
  `shared/components/` (`ISS-033`) — issue ini tidak memperluas anatomi
  keduanya. Slot "meta singkat" `ManageRow` (anatomi generik, sudah
  mendukung ini sejak dirancang) diisi **tanggal terbit** (`createdAt`)
  di sini — beda dari `ISS-033` yang mengisinya dengan gambaran singkat
  project; bukan perluasan komponen, cuma data berbeda yang dioper lewat
  props.
- **Gambar dipilih dari galeri Media, TANPA unggah inline** — form ini
  cuma menyimpan `thumbnailImage` sebagai URL string; unggah berkas
  sungguhan cuma lewat halaman Media (`SA-19`, `ISS-023`/`ISS-039`,
  belum dikompilasi) — konsisten `D-025` techlead.
- **`tagIds` dipilih dari daftar yang sudah ada** — bukan input teks
  bebas; sumber daftarnya `SA-35` (Tag admin), dari fitur Kelola Tag
  (`ISS-038`, belum dikompilasi) — form ini cukup memanggil daftar itu
  untuk opsi pilihan, tidak membangun ulang Kelola Tag.
- **`slug` dibuat otomatis server-side dari `title`** — FE tidak
  mengisi/menampilkan field `slug` di form sama sekali (D-010 techlead);
  tidak dibuat ulang saat `updatePost` kecuali `title` berubah.
- **Perubahan `status` langsung berefek ke Blog publik** — tanpa
  delay/cache, tanpa aksi terpisah (AC-012-1, AC-013-1, AC-013-3,
  AC-013-4).
- **`FormField` (C-08), `Button` (C-01), `BackLink` (C-09),
  `ConfirmDialog` (C-12), `StatusMessage` (C-13) dipakai apa adanya**
  dari `shared/` (`ISS-025`) — issue ini tidak memperluas anatomi satu
  pun dari kelimanya (FormField varian ikon/toggle dari `D-025`, khusus
  isian password, **tidak relevan** di form ini — Judul/Cuplikan/Isi
  semuanya teks biasa).

## Auth & Permission

- `SA-31`, `SA-04`, `SA-05`, `SA-06`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak
diperluas/dibangun ulang):
- `ISS-025`: AdminNav (C-10, sidebar), Button (C-01), FormField (C-08),
  BackLink (C-09), ConfirmDialog (C-12), StatusMessage (C-13).
- `ISS-033`: **ManageRow (C-11)**, **StatusSelect (C-16)** — konsumen
  pertama setelah keduanya dibangun (D-030); tidak ada baris "Dibangun
  di issue ini" untuk komponen apa pun — issue ini murni pemakaian.

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — gambar tulisan dikelola lewat halaman
Media terpisah (`ISS-039`, belum dikompilasi), bukan bagian issue ini.

## Struktur File (referensi awal)

```
src/app/admin/posts/
├── page.tsx                        ← SCR-12 Kelola Tulisan — Server
│                                       Component, getPostsAdmin() (SA-31)
├── new/
│   └── page.tsx                    ← SCR-13 Tulis Tulisan — <PostForm />
└── [id]/
    └── page.tsx                    ← SCR-13 Ubah Tulisan — <PostForm
                                        post={...} />
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getPostsAdmin`/`createPost`/`updatePost`/`deletePost` SUDAH
ADA (dibangun `ISS-018` — `features/posts/posts.action.ts`); issue ini
cuma memanggilnya, tidak membuat ulang. `ManageRow`/`StatusSelect` SUDAH
ADA di `src/shared/components/` (dibangun `ISS-033`); issue ini cuma
mengimpornya. `PostForm` (Client Component BARU, dipakai DUA route
`new/` & `[id]/`) — co-located di bawah
`app/admin/posts/_components/` jika tidak dipakai fitur lain, pola sama
`ProjectForm` (`ISS-033`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/posts/page.tsx` — Daftar Kelola Tulisan sesuai
      Spesifikasi Layar.
- [ ] `app/admin/posts/new/` & `[id]/` — Form Tulisan (tambah/ubah)
      sesuai Spesifikasi Layar, termasuk isian Cuplikan (G-011).
- [ ] `PostForm` (Client Component) dibangun; `ManageRow`/`StatusSelect`
      diimpor apa adanya dari `shared/components/`, TIDAK dibangun ulang.
- [ ] State kosong Daftar Kelola Tulisan.
- [ ] State konfirmasi-hapus (`ConfirmDialog`, AC-013-2).
- [ ] State error-validasi Form Tulisan (AC-012-2).
- [ ] Transisi status (Draft↔Published↔Archived) tersimpan & langsung
      berefek ke Blog publik (AC-012-1, AC-013-1, AC-013-3, AC-013-4).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- `ManageRow` (C-11) & `StatusSelect` (C-16) itu sendiri — sudah dibangun
  `ISS-033`, issue ini cuma memakainya.
- Endpoint `getPostsAdmin`/`createPost`/`updatePost`/`deletePost` — sudah
  selesai (`ISS-018`).
- Galeri Media (pemilihan `thumbnailImage`) — `ISS-039` (belum
  dikompilasi); form ini cuma memanggil daftar Media yang sudah ada.
- Daftar Tag untuk opsi pilihan `tagIds` — fitur Kelola Tag (`ISS-038`,
  belum dikompilasi); form ini cuma memanggil daftarnya.
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola Project) —
  issue fitur masing-masing.

## Acceptance Criteria

- [ ] Admin menulis tulisan baru (judul & isi), memilih status Terbit,
      lalu menyimpan → tulisan langsung tampil di Blog publik sebagai
      yang terbaru; bila status Draf, tersimpan namun belum tampil
      publik (AC-012-1).
- [ ] Admin menyimpan tanpa mengisi judul → tulisan tidak tersimpan,
      admin melihat pemberitahuan bagian yang harus diisi (AC-012-2).
- [ ] Admin mengubah tulisan yang sudah terbit lalu menyimpan → Blog
      publik menampilkan versi terbaru tulisan itu (AC-013-1).
- [ ] Admin menghapus tulisan → muncul konfirmasi dulu; setelah
      dikonfirmasi, tulisan hilang dari halaman publik (AC-013-2).
- [ ] Admin mengubah status tulisan Draf jadi Terbit lalu menyimpan →
      tulisan mulai tampil di Blog publik (AC-013-3).
- [ ] Admin mengubah status tulisan Terbit jadi Arsip lalu menyimpan →
      tulisan hilang dari Blog publik namun tetap ada di Kelola
      Tulisan, status dapat dikembalikan ke Terbit kapan saja
      (AC-013-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tulis/ubah/
      hapus tulisan (termasuk isian Cuplikan), transisi status
      Draft↔Published↔Archived beserta efeknya di Blog publik, state
      kosong, state konfirmasi-hapus, state error-validasi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-12, SCR-13 — `docs/uiux_02_wireframe.md`
  (v1.19, D-026); FLOW-13, FLOW-14 — `docs/uiux_01_user_flow.md` (v1.19)
- **Design system:** C-01/08/09/11/12/13/16 —
  `docs/uiux_03_design_system.md`
- **Kontrak API:** `SA-31`, `SA-04`, `SA-05`, `SA-06` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-034
  mengonfirmasi sinkron dengan `ISS-018`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-012-1, AC-012-2, AC-013-1, AC-013-2,
  AC-013-3, AC-013-4 — `docs/ba_03_acceptance_criteria.md`
