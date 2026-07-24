# ISS-029 — [FE] Layar Blog: daftar & detail tulisan

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-014, ISS-025, ISS-027, ISS-028 |
| **Serves** | SCR-05, SCR-06 |
| **Covers** | AC-005-1, AC-005-2, AC-006-1, AC-006-2 |

## Deskripsi

Halaman Blog — daftar (`/blog`, SCR-05) & detail (`/blog/[slug]`, SCR-06).
Mengonsumsi `SA-26` (`getPosts`, tanpa `limit` — ambil SEMUA tulisan
Terbit sekaligus) & `SA-27` (`getPostBySlug`).

**Rombakan dari referensi visual client** (`docs/layout/blog/`, D-022
uiux) — pola sama ISS-028 (Portfolio): referensi punya elemen yang
genuinely mengubah scope/data. Sebelum redesign dieksekusi, UI/UX
**berhenti & tanya user langsung** (AskUserQuestion, satu pertanyaan) —
kotak newsletter "Stay in the loop" (butuh entity Subscriber + Server
Action baru). User memilih **skip sepenuhnya**. **Tiga elemen lain**
(badge kategori + sidebar "Categories" berhitung, badge "★ Featured",
search box + sidebar "Popular Tags" klik-filter + pagination) **sengaja
tidak ditanya ulang** — identik dengan pertanyaan yang sudah dijawab 2×
sebelumnya untuk halaman lain (G-002 Home, G-015/G-016 Portfolio),
preseden diterapkan langsung. Konsekuensinya: seluruh layout sidebar
2-kolom di referensi **tidak diadopsi** — Blog tetap 1-kolom penuh lebar
seperti spesifikasi lama (medium.com style, D-008).

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** menemukan `SA-27`
belum mengekspos navigasi tulisan sebelum/sesudah — dibutuhkan untuk
`PostNav` di Detail Tulisan. **Sudah diperbaiki Tech Lead lebih dulu**
(D-030, `techlead_03` v2.17, `SA-27` +`prevPost`/+`nextPost`) — berbeda
dari gap-gap sebelumnya (D-024/D-028/D-029 yang murni field-expose), ini
kapabilitas BARU (query tetangga `publishedAt`), tapi tetap non-blocking
karena tidak mengubah scope/akses (pola sama D-016 lama).

**Temuan tambahan saat pre-check**: `ISS-013` (Portfolio) & `ISS-014`
(Blog) — kedua issue Backend yang membangun `SA-24`..`SA-27` — ternyata
**sudah stale**, dikompilasi sebelum D-028/D-029/D-030 dan tidak pernah
disusulkan. **Sudah direcompile** (bagian Spesifikasi Endpoint & Aturan
Bisnis) sebelum issue ini ditulis — lihat D-023 issue.yaml.

**Cover image kini tampil di Detail Tulisan** — `Post.thumbnailImage`
sebelumnya punya catatan eksplisit "TIDAK tampil di isi tulisan"; catatan
itu **dicabut** karena referensi visual baru memintanya secara eksplisit,
murni pilihan tampilan atas field yang sudah ada (non-blocking, pola sama
Tags Detail Project di ISS-028).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-05/SCR-06 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Navbar & Footer** — sudah dibangun `app/(public)/layout.tsx` (ISS-025),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-05 — Blog (daftar)

**Blog Hero** (custom, bukan reuse `SectionHeader` — pola sama Hero
Home/About/Portfolio)
- Pil dekoratif "Blog" (statis) + judul besar "Blog" + subjudul + garis
  aksen
- Baris 3 `StatCard` (C-18, reuse dari `ISS-028`): "{N}+ Tulisan" (LIVE —
  `data.length` dari `getPosts()`) · "{M}+ Menit Bacaan" (LIVE — SUM
  `readingTime` seluruh `data`, field sudah ada sejak D-028) ·
  "{tahun}—Sekarang" (LIVE — tahun `publishedAt` paling awal dari `data`
  yang sama)
- Paragraf penutup singkat (statis) + grafis dekoratif (ilustrasi CSS)

**Daftar Tulisan**
- `SectionHeader` (C-23, varian rata-kiri — reuse dari `ISS-027`): badge
  "Tulisan" · judul "Semua Tulisan" · subjudul
- List `PostItem` (C-05, reuse dari `ISS-026`) — data `getPosts()`
  (`SA-26`, tanpa `limit`); 1 kolom penuh lebar (medium.com style,
  D-008/D-013) — **tidak berubah**

**State: kosong** (AC-005-2) — teks "Belum ada tulisan." di tengah area
daftar; Navbar, Blog Hero (StatCard "0+ Tulisan" tetap tampil apa
adanya), & Footer tetap tampil.

### SCR-06 — Detail Tulisan

**Header Tulisan**
- `BackLink` (C-09) "< Kembali ke Blog" — gaya breadcrumb di referensi
  visual direalisasikan lewat elemen yang sama, bukan komponen baru
- Tanggal terbit + estimasi waktu baca (`publishedAt` + `readingTime`,
  sudah ada sejak D-024/D-028 — tidak berubah)

**Isi Tulisan**
- Judul + cuplikan (`description`, bila ada)
- Chip tag — `SkillTag` (C-06, polos) dari `tags` (`SA-27`, tidak berubah)
- {gambar sampul — `thumbnailImage`, bila ada} — **kini juga tampil di
  isi tulisan** (D-022, larangan lama dicabut)
- Isi tulisan utuh — `content` (`SA-27`) dirender sebagai rich
  text/Markdown apa adanya (AC-006-1)
- `ShareLinks` (C-28, baru) — Twitter/LinkedIn/salin tautan, murni
  client-side tanpa data
- **Tanpa area komentar dalam bentuk apa pun** (AC-006-2, Out of Scope)

**PostNav** (`ShareLinks` di bawahnya, di atas Footer)
- `PostNav` (C-29, baru) — 2 sel "← Tulisan Sebelumnya" / "Tulisan
  Selanjutnya →", masing-masing dari `prevPost`/`nextPost` (`SA-27`,
  D-030); sel `null` (tidak ada tetangga) **tidak dirender**

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-05, SCR-06) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/02/03/05/06/09/18/22/
> 23/28/29). **Bila berbeda dengan dokumen itu, dokumen kontrak yang
> berlaku** — laporkan selisihnya, jangan memilih sendiri.

**Catatan eksplisit — TIDAK diadopsi dari referensi visual** (self-resolved
via preseden G-002/G-015/G-016, dituliskan G-018; newsletter dikonfirmasi
AskUserQuestion, G-017): badge kategori ("Web Development" dst.), sidebar
"Categories" berhitung, badge "★ Featured", search box, sidebar "Popular
Tags" klik-filter, pagination bernomor, kotak newsletter "Stay in the
loop".

**Alur:** FLOW-06 (melihat daftar tulisan), FLOW-07 (membaca satu
tulisan) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tidak ada — issue ini murni baca & tampil (Server Component), tanpa form
atau input data milik sendiri.

## Aturan Bisnis/Perilaku

- **2 panggilan baca independen**: `page.tsx` daftar memanggil
  `getPosts()` (`SA-26`, tanpa `limit`); `page.tsx` detail (`[slug]`)
  memanggil `getPostBySlug(slug)` (`SA-27`) — slug tidak ditemukan/bukan
  Terbit → `notFound()`.
- **Statistik Blog Hero WAJIB live-computed, BUKAN hardcode** — pola
  sama Portfolio Hero (`ISS-028`): dihitung dari respons `getPosts()`
  yang sama dipakai daftar, bukan angka tempel yang bisa basi.
- **TANPA kategori/featured/newsletter/toolbar** — `PostItem` render apa
  adanya, `SA-26` tidak diperluas parameter apa pun (tetap "tanpa
  batas").
- **Cover image (`thumbnailImage`) tampil kondisional** di Isi Tulisan —
  hanya render bila tidak `null`, TANPA fallback placeholder wajib.
- **`content` dirender sebagai rich text/Markdown apa adanya** — FE tidak
  mem-parsing/memvalidasi struktur heading tertentu, sama pola Overview
  Detail Project (`ISS-028`).
- **`PostNav` render kondisional per sel** — `prevPost`/`nextPost` masing-
  masing `null` → sel itu TIDAK dirender (bukan disabled/abu-abu).
  Tulisan pertama TIDAK punya `nextPost`; tulisan terbaru TIDAK punya
  `prevPost`.
- **`ShareLinks` murni client-side** — Twitter/LinkedIn intent URL dari
  `window.location.href` + judul halaman saat ini; salin tautan pakai
  clipboard API, TANPA Server Action.
- **`SectionHeader` (C-23, varian rata-kiri) & `StatCard` (C-18) dipakai
  apa adanya** dari `shared/` — keduanya sudah dibangun (`ISS-027`,
  `ISS-028`), issue ini tidak memperluas lagi.
- **`PostItem` (C-05) & `SkillTag` (C-06) dipakai apa adanya** dari
  `shared/` (sejak `ISS-026`) — tidak ada perubahan lagi di sini.

## Auth & Permission

Publik, tanpa sesi — sama seperti seluruh SCR-01 s.d. SCR-07.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak dibangun
ulang): Navbar (C-02), ThemeToggle (C-03), Footer (C-22) — ISS-025;
PostItem (C-05), SkillTag (C-06) — ISS-026; SectionHeader (C-23, varian
rata-kiri) — ISS-025 (dasar) + ISS-027 (varian); BackLink (C-09) —
ISS-025; StatCard (C-18) — ISS-028.

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| ShareLinks (C-28) | `app/(public)/blog/[slug]/_components/` (co-located) | Baru dipakai 1 fitur (Blog Detail) |
| PostNav (C-29) | `app/(public)/blog/[slug]/_components/` (co-located) | Baru dipakai 1 fitur (Blog Detail) |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — grafis dekoratif Blog Hero adalah
ilustrasi CSS/SVG, bukan unggahan; gambar sampul tulisan (`thumbnailImage`)
sudah dikelola lewat admin sejak fitur Kelola Tulisan.

## Struktur File (referensi awal)

```
src/app/(public)/blog/
├── page.tsx                       ← SCR-05 Blog — Server Component,
│                                     getPosts() tanpa limit
└── [slug]/
    ├── page.tsx                    ← SCR-06 Detail Tulisan — Server
    │                                   Component, getPostBySlug(slug),
    │                                   notFound() bila tidak ada/bukan Terbit
    └── _components/
        ├── ShareLinks.tsx           ← C-28 (khas Blog Detail)
        └── PostNav.tsx              ← C-29 (khas Blog Detail)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getPosts`/`getPostBySlug` SUDAH ADA (dibangun ISS-014 —
`features/posts/posts.action.ts`, direcompile kontraknya sebelum issue
ini, D-023); issue ini cuma memanggilnya, tidak membuat ulang.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/(public)/blog/page.tsx` — Blog Hero + Daftar Tulisan sesuai
      Spesifikasi Layar.
- [ ] `app/(public)/blog/[slug]/page.tsx` — Header Tulisan + Isi Tulisan +
      PostNav sesuai Spesifikasi Layar.
- [ ] `ShareLinks` (C-28) & `PostNav` (C-29) dibangun & ditempatkan
      sesuai §Aset & Design System.
- [ ] Angka StatCard Blog Hero live-computed dari `getPosts()`.
- [ ] State kosong Daftar Tulisan (AC-005-2).
- [ ] Cover image tampil kondisional di Detail Tulisan.
- [ ] `PostNav` render kondisional per sel (prev/next bisa `null`).
- [ ] `slug` tidak ditemukan/bukan Terbit → `notFound()`.

**Out of Scope**
- Navbar, Footer, ThemeToggle, kerangka route — sudah ISS-025.
- Badge kategori, sidebar Categories, badge Featured, search box, sidebar
  Popular Tags, pagination — DITOLAK via preseden G-002/G-015/G-016
  (diterapkan G-018, tidak ditanya ulang).
- Kotak newsletter "Stay in the loop" — DITOLAK eksplisit user (G-017);
  tanpa entity Subscriber atau Server Action terkait.
- Area komentar — Out of Scope permanen (AC-006-2).
- Konten halaman lain (Home, About, Portfolio, Contact, admin) — issue
  fitur masing-masing.
- Endpoint `getPosts`/`getPostBySlug` — sudah selesai (ISS-014, kontrak
  terkini setelah recompile D-023).

## Acceptance Criteria

- [ ] Sudah ada tulisan berstatus Terbit → pengunjung membuka halaman
      Blog → daftar tulisan tampil urut dari yang terbaru; tulisan
      Draf/Arsip tidak ikut tampil (AC-005-1).
- [ ] Belum ada tulisan berstatus Terbit → halaman tetap tampil wajar
      dengan keterangan bahwa belum ada tulisan (AC-005-2).
- [ ] Pengunjung memilih satu tulisan dari daftar → isi tulisan tampil
      utuh dan dapat dibaca (AC-006-1).
- [ ] Pengunjung membaca sebuah tulisan → tidak ada fitur komentar di
      mana pun (AC-006-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: state normal & kosong Daftar Tulisan, angka
      StatCard Blog Hero berubah sesuai jumlah tulisan sungguhan, cover
      image kondisional, ShareLinks membuka intent share yang benar,
      PostNav menuju tulisan tetangga yang benar (termasuk kasus tulisan
      pertama/terakhir — sel hilang, bukan disabled), slug tidak
      ditemukan → halaman 404.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-05, SCR-06 — `docs/uiux_02_wireframe.md`;
  FLOW-06, FLOW-07 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/02/03/05/06/09/18/22/23/28/29 —
  `docs/uiux_03_design_system.md`; referensi visual client —
  `docs/layout/blog/` (D-022 uiux)
- **Kontrak API:** `SA-26`, `SA-27` — `docs/techlead_03_api_contract.md`
  (SA-26 diperluas D-028 v2.15; SA-27 diperluas D-024 v2.11 & D-030 v2.17)
- **Perilaku yang ditopang:** AC-005-1, AC-005-2, AC-006-1, AC-006-2 —
  `docs/ba_03_acceptance_criteria.md`
