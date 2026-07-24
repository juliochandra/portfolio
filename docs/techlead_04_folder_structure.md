# FOLDER STRUCTURE: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-17 |
| **Versi** | 2.10 |
| **Sumber** | Set BA v6.0 + Set UI/UX v1.8 |
| **Konteks** | docs/pm_01_project.md v1.6 (+ techlead-agent/TEAM_STACK.md sebagai sumber struktur) |
| **Disusun oleh** | Tech Lead Agent |
| **Set dokumen** | techlead_01_architecture.md · techlead_02_database.md · techlead_03_api_contract.md · techlead_04_folder_structure.md |

## Ringkasan

**Feature-based layered (Clean Architecture)** — kerangkanya diinstansiasi
langsung dari Struktur Folder Baku `TEAM_STACK.md` (jalur 1, D-003).
**Revisi v2.0:** folder `profile/` dihapus total (entitas Profil tidak ada
lagi, pm_01 D007); `skills/` baru menggantikannya sebagai folder fitur
(F-06.4).
**Revisi v2.2** (referensi desain admin client, pm_01 D009): `tags/` dan
`media/` naik status dari "inline/infra tanpa folder sendiri" jadi **folder
fitur penuh** (F-06.8, F-06.9) — masing-masing dapat halaman kelola admin
sendiri (SCR-17 Tags, SCR-18 Media). Delapan folder fitur (`projects`,
`posts`, `skills`, `tags`, `media`, `contact`, `messages`, `auth`) memetakan
tujuh Core Feature BA. Logika bersama yang masih dipakai lintas fitur (Tag
dipilih dari daftar di form Project/Tulisan; unggahan gambar dari form
Project/Tulisan) naik ke `core/` (§ Aturan Penempatan) — bukan lagi
diasumsikan "inline" tanpa pemilik jelas.
**Revisi v2.4** (perubahan kapabilitas tim, D-017 techlead_01): tidak ada
folder baru — util penyimpanan berkas di `core/` kini membungkus S3 SDK ke
Cloudflare R2, menggantikan operasi filesystem lokal v2.0-v2.3; pemetaan
fitur→folder sama sekali tidak berubah.
**Revisi v2.5** (permintaan user — navbar/footer kemungkinan sama di seluruh
halaman publik): kelima layar publik (SCR-01..07) dibungkus **route group**
`app/(public)/` (D-018) — mekanisme Next.js App Router untuk memberi
`layout.tsx` bersama (Navbar/MenuUtama C-02 + Footer) tanpa memengaruhi URL
maupun mengubah pemetaan fitur→folder. `admin/` sengaja TIDAK ikut jadi
route group (path `/admin/*` memang nyata, dilindungi `middleware.ts`).
Turut ditemukan & diperbaiki: referensi `EP-01..EP-16` yang basi di Pohon
Folder & Pemetaan Folder (seharusnya `EP-01..EP-17` sejak EP-17 ditambahkan
v2.3 — leftover yang lolos dari cascade v2.3/v2.4 sebelumnya).
**Revisi v2.6** (permintaan user — SCR-08 Masuk Admin punya UI sendiri,
beda dari SCR-09..19 yang berbagi UI Dashboard): `login/` dipindah keluar
dari `admin/` jadi `app/login/` tersendiri (D-019) — `admin/layout.tsx`
(MenuAdmin, C-10) kini berlaku utuh ke seluruh `admin/*` tanpa pengecualian;
`middleware.ts` yang menjaga `/admin/*` otomatis tidak lagi menyentuh rute
login. Pemetaan fitur→folder tidak berubah (SCR-08 tetap dilayani
`features/auth/`).
**Revisi v2.7** (permintaan user — nama folder lintas fitur kurang jelas
maksudnya): `core/` diganti nama jadi **`shared/`** (D-020) — isi & aturan
penempatan sama sekali tidak berubah (tetap komponen UI dasar, config,
klien Prisma, util JWT, util penyimpanan R2), murni penggantian nama agar
langsung menjelaskan diri sendiri ("dipakai bersama lintas fitur") tanpa
perlu buka dokumen untuk tahu maksudnya. Perubahan permanen di
`techlead-agent/TEAM_STACK.md` (Struktur Folder Baku) — berlaku untuk
proyek ini dan seluruh proyek berikutnya yang memakai TEAM_STACK.md.
**Revisi v2.8** (permintaan user — login/keluar dipanggil dari form,
konsisten pola Server Action seluruh admin lain): `EP-07`/`EP-08` (Route
Handler `login`/`logout`) pensiun, digantikan `SA-22`/`SA-23` di
`features/auth/` (D-021 techlead_01) — `app/api/` kehilangan 2 rute
(`admin/login`, `admin/logout`), pemetaan folder lain tidak berubah. Turut
ditemukan & diperbaiki: bullet Aturan Penempatan yang keliru menyebut util
verifikasi JWT hidup di `features/auth/` (seharusnya `shared/`, konsisten
Pohon Folder & Pemetaan Folder yang dari awal sudah benar — leftover yang
baru ketahuan saat meninjau folder ini untuk revisi EP-07/08).
**Revisi v2.9** (permintaan eksplisit user — "server action untuk
semuanya"): **`app/api/` dihapus total** dari struktur folder — sisa 15
Route Handler baca (`EP-01`..`EP-06`, `EP-09`..`EP-17`) turut pensiun,
digantikan `SA-24`..`SA-38` (D-022 techlead_01) tersebar ke tiap
`features/X/` yang relevan (baca publik & baca admin masing-masing
folder, di samping mutasi yang sudah lebih dulu Server Action). `admin/`
kini anak terakhir `app/` (menggantikan posisi `api/`). Pemetaan
fitur→folder lain tidak berubah — perubahan murni menghapus satu baris
folder (`app/api/`) dan mengganti label EP→SA di anotasi tiap folder.
**Revisi v2.10** (permintaan eksplisit user — pola folder Server Action):
seluruh 9 folder fitur pindah dari layout bersarang `domain/`·
`application/`·`infrastructure/`·`presentation/` ke **pola flat 4-file
bersuffix** — `<fitur>.action.ts` (Server Action, `"use server"`),
`<fitur>.services.ts` (use case/aturan bisnis — melebur bekas `domain`+
`application`), `<fitur>.repository.ts` (akses Prisma — bekas
`infrastructure`), `<fitur>.schema.ts` (validasi Zod) — D-023 techlead_01.
Folder `presentation/` dihapus total: komponen UI khas satu fitur pindah
co-located ke `app/` (route pemanggilnya); komponen dipakai ≥2 fitur tetap
naik ke `shared/` (tidak berubah). `features/dashboard/` (tanpa entitas
sendiri) jadi pengecualian: hanya `dashboard.action.ts` +
`dashboard.services.ts` + `dashboard.repository.ts`, tanpa `.schema.ts`
(SA-37 tanpa input). **Menyimpang dari Struktur Folder Baku
`TEAM_STACK.md`** (masih domain/application/infrastructure/presentation)
— `TEAM_STACK.md` tidak diminta diperbarui kali ini, deviasi khusus
proyek ini (pola sama dengan D-022 API Layer).

## Prinsip & Sumber Struktur

- **Sumber:** Struktur Folder Baku `techlead-agent/TEAM_STACK.md` ([04_ARCHITECTURE_ENGINE.md](../techlead-agent/04_ARCHITECTURE_ENGINE.md) §8.1
  jalur 1) — Tech Lead hanya memetakan fitur proyek (F-XX) ke folder fitur,
  tanpa merancang kerangka baru. Sejak v2.10 (D-023), sub-struktur **layer
  di dalam tiap folder fitur** menyimpang dari baku ini (flat 4-file,
  bukan 4 sub-folder bersarang) — pemetaan fitur→folder itu sendiri (F-XX
  ke `features/<fitur>/`) tidak berubah.
- **Aturan dependensi:** `<fitur>.action.ts` (entry tipis, divalidasi
  `<fitur>.schema.ts`) → `<fitur>.services.ts` (use case/aturan bisnis) →
  `<fitur>.repository.ts` (akses data/Prisma) — mengarah ke dalam,
  meneruskan prinsip yang sama dengan layered sebelumnya (v2.10, D-023;
  dulu presentation → application → domain, infrastructure mengimplementasi
  kebutuhan domain/application) meski kini flat-file, bukan sub-folder.
  Tidak ada import antar-fitur langsung — yang lintas fitur naik ke
  `shared/`. `middleware.ts` menjaga route `/admin/*` lewat verifikasi JWT
  sebelum halaman dirender (AC-009-3) — sejak v2.6, `login/` (SCR-08)
  dipindah keluar dari `admin/` ke `app/login/` sehingga TIDAK lagi
  tercakup pola `/admin/*` sama sekali; matcher middleware jadi lebih
  sederhana (tanpa pengecualian manual untuk rute login seperti lazimnya
  dibutuhkan bila login ikut di bawah prefix terlindung).

## Pohon Folder

```
src/
├── app/                        ← route App Router (pintu masuk presentation)
│   ├── layout.tsx               ← root layout (html/body, ThemeProvider utk SaklarTema C-03 — dipakai publik & admin, v2.5)
│   ├── (public)/                 ← route group — TIDAK muncul di URL; layout.tsx bersama (Navbar+Footer) utk 5 halaman publik (v2.5)
│   │   ├── layout.tsx             ← MenuUtama (C-02) + Footer, dipakai seluruh halaman di bawahnya
│   │   ├── page.tsx               ← SCR-01 Home (identitas pemilik statis — pm_01 D007)
│   │   ├── about/                  ← SCR-02 (isi statis di kode)
│   │   ├── portfolio/               ← SCR-03; portfolio/[slug]/ → SCR-04
│   │   ├── blog/                    ← SCR-05; blog/[slug]/ → SCR-06
│   │   └── contact/                  ← SCR-07
│   ├── login/                    ← SCR-08 (v2.6) — dipindah keluar dari admin/; UI form sendiri,
│   │                                tanpa layout Navbar/Footer publik maupun MenuAdmin
│   └── admin/                    (v2.9, D-022: app/api/ dihapus — admin/ kini anak
│       │                          terakhir app/; seluruh baca/mutasi lewat Server Action)
│       ├── layout.tsx            ← MenuAdmin (C-10), kini berlaku utuh ke SELURUH admin/* (v2.6) —
│       │                            sebelumnya harus dikecualikan manual krn login ikut di dalam admin/
│       ├── page.tsx              ← SCR-09 (Dashboard — kartu statistik & aktivitas terbaru)
│       ├── projects/             ← SCR-10; projects/new/, projects/[id]/edit/ → SCR-11
│       ├── posts/                ← SCR-12; posts/new/, posts/[id]/edit/ → SCR-13
│       ├── skills/                ← SCR-14 (Skills)
│       ├── tags/                  ← SCR-17 (Tags)
│       ├── media/                 ← SCR-18 (Media — galeri + unggah)
│       ├── contact/               ← SCR-15 (Contact Info, list CRUD)
│       ├── messages/              ← SCR-16 (Messages, tab Active/Archived)
│       └── password/              ← SCR-19 (Password — ubah kata sandi sendiri)
├── features/                    ← v2.10 (D-023): pola flat 4-file per fitur — bukan
│                                   lagi sub-folder domain/application/infrastructure/presentation
│   ├── projects/                ← F-01.2, F-03, F-06.2 (ENT-01, SA-24/25 baca publik,
│   │                                SA-30 baca admin, SA-01..03 mutasi)
│   ├── posts/                    ← F-01.2, F-04, F-06.3 (ENT-02, SA-26/27 baca publik,
│   │                                SA-31 baca admin, SA-04..06 mutasi)
│   ├── skills/                   ← F-01.2, F-06.4 (ENT-04, SA-38 baca publik,
│   │                                SA-32 baca admin, SA-07..09 mutasi)
│   ├── tags/                     ← F-06.8 (ENT-03, SA-35 baca admin, SA-16..18 mutasi) — folder baru v2.2
│   ├── media/                    ← F-06.9 (ENT-05, SA-36 baca admin, SA-19..20 mutasi) — folder baru v2.2
│   ├── contact/                  ← F-05.1, F-06.5 (ENT-07, SA-28 baca publik,
│   │                                SA-33 baca admin, SA-10..12 mutasi)
│   ├── messages/                 ← F-05.2, F-06.7 (ENT-06, SA-29 kirim publik,
│   │                                SA-34 baca admin, SA-13..15 mutasi)
│   ├── auth/                     ← F-06.1, F-06.6, F-06.10 (ENT-08, SA-21 changePassword,
│   │   │                            SA-22 login, SA-23 logout — v2.8, D-021)
│   │   ├── auth.action.ts            ← Server Action ("use server")
│   │   ├── auth.services.ts          ← use case / aturan bisnis
│   │   ├── auth.repository.ts        ← akses Prisma
│   │   └── auth.schema.ts            ← validasi Zod
│   └── dashboard/                ← ringkasan lintas fitur (SA-37) — SCR-09; query agregat saja, tanpa entitas sendiri
│       ├── dashboard.action.ts · dashboard.services.ts · dashboard.repository.ts
│       └── (TANPA dashboard.schema.ts — SA-37 tanpa input untuk divalidasi)
│       (fitur lain di atas ikut pola sama persis dengan auth/: <fitur>.action.ts ·
│        <fitur>.services.ts · <fitur>.repository.ts · <fitur>.schema.ts — v2.10, D-023)
├── shared/                      ← lintas fitur: komponen UI dasar (C-01..C-21 design system),
│                                   config, klien Prisma, util verifikasi JWT,
│                                   util penyimpanan berkas — S3 SDK ke Cloudflare R2, v2.4 (dipakai projects/posts/media saat unggah)
└── middleware.ts                ← penjaga route /admin/* (JWT)
prisma/                          ← schema.prisma (8 model) & seed (Data Awal)
public/                          ← aset statis termasuk berkas CV (pm_01 D007) — bukan lewat unggahan admin
```

## Pemetaan Folder

| Folder | Layer | Melayani |
|--------|-------|----------|
| `features/projects/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-01.2, F-03, F-06.2 |
| `features/posts/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-01.2, F-04, F-06.3 |
| `features/skills/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-01.2, F-06.4 (+ SA-38 baca publik, v2.3, ex-EP-17) |
| `features/tags/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-06.8 |
| `features/media/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-06.9 |
| `features/contact/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-05.1, F-06.5 |
| `features/messages/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-05.2, F-06.7 |
| `features/auth/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` · `.schema.ts` (v2.10, D-023) | F-06.1, F-06.6, F-06.10 |
| `features/dashboard/` | flat: `.action.ts` · `.services.ts` · `.repository.ts` (v2.10 — tanpa `.schema.ts`, SA-37 tanpa input) | SCR-09 (pemanis, non-blocking) |
| `app/` | presentation (route + komponen UI khas-fitur co-located, v2.10 D-023 — tanpa Route Handler sejak v2.9, D-022) | SCR-01..SCR-19 |
| `app/(public)/` | presentation — route group, layout bersama tanpa mengubah URL | SCR-01..SCR-07 (5 halaman publik) |
| `app/login/` | presentation — halaman berdiri sendiri, UI sendiri (v2.6) | SCR-08 |
| `app/admin/` | presentation — layout bersama MenuAdmin (C-10), berlaku utuh tanpa pengecualian sejak login dipindah (v2.6) | SCR-09..SCR-19 |
| `shared/` | shared lintas fitur (ui dasar, config, klien Prisma, util auth, util penyimpanan berkas — S3 SDK ke R2, v2.4) | lintas fitur |
| `middleware.ts` | penjaga route terlindung | F-06 (semua sub-fitur) |
| `prisma/` | skema data & seed | ENT-01..ENT-08 |
| `public/` | aset statis (termasuk CV) | F-07 |

## Aturan Penempatan

- **Route (`app/`) tipis** — halaman publik/admin memanggil `<fitur>.services.ts`
  fitur terkait untuk baca data; form admin memanggil **Server Action**
  (`<fitur>.action.ts`, ditandai `"use server"`) langsung dari `action`
  form, tanpa lewat Route Handler (D-012). Logika (aturan wajib/opsional,
  penghapusan permanen, transisi status) tinggal di `<fitur>.services.ts`,
  bukan di route atau di `.action.ts` itu sendiri — `.action.ts` hanya
  memvalidasi input (`<fitur>.schema.ts`, Zod) & memanggil `.services.ts`
  (v2.10, D-023 — dulu `application`/`domain`).
- **Pola flat 4-file** (v2.10, D-023, menggantikan `domain/`·`application/`·
  `infrastructure/`·`presentation/`): tiap `features/<fitur>/` berisi
  `<fitur>.action.ts` (Server Action, entry tipis, `"use server"`),
  `<fitur>.services.ts` (use case & aturan bisnis — melebur bekas `domain`+
  `application`), `<fitur>.repository.ts` (akses data/Prisma — bekas
  `infrastructure`), `<fitur>.schema.ts` (skema validasi Zod, dipakai
  `.action.ts`). Arah panggil: `.action.ts` → `.services.ts` →
  `.repository.ts`. `features/dashboard/` terkecuali: tanpa `.schema.ts`
  (SA-37 tanpa input).
- **`app/(public)/`** (v2.5, D-018): route group Next.js — tanda kurung berarti
  segmen ini TIDAK muncul di URL (`/`, `/about`, `/portfolio`, dst. tetap
  seperti semula). Satu-satunya tujuannya: `layout.tsx` bersama (MenuUtama
  C-02 + Footer) untuk kelima halaman publik, tanpa duplikasi Navbar/Footer
  di tiap `page.tsx` dan tanpa memengaruhi path. Berlaku hanya untuk 5 layar
  publik (SCR-01..07) — `admin/` TIDAK ikut jadi route group karena memang
  perlu tampil di path `/admin/*` yang sebenarnya (dilindungi
  `middleware.ts`); SCR-08 (Masuk) sengaja TIDAK berbagi layout admin
  (`Header Admin`) — lihat wireframe SCR-08 yang tidak punya bagian itu.
  `app/layout.tsx` (root, di luar route group) menampung `ThemeProvider`
  untuk SaklarTema (C-03) karena dipakai kedua sisi.
- **`app/login/`** (v2.6, D-019): SCR-08 Masuk Admin dipindah keluar dari
  `admin/` ke folder tersendiri setingkat `(public)/`/`admin/`/`api/` —
  permintaan eksplisit user: SCR-08 punya UI form sendiri (lihat wireframe,
  tanpa bagian "Header Admin"), berbeda dari SCR-09..19 yang seluruhnya
  berbagi UI Dashboard/MenuAdmin (C-10) yang sama. Konsekuensi baik:
  `admin/layout.tsx` kini bisa membungkus **seluruh** isi `admin/` tanpa
  perlu pengecualian untuk rute login, dan `middleware.ts` yang menjaga
  `/admin/*` otomatis tidak menyentuh `/login` sama sekali (dulu, saat login
  ada di `admin/login/`, matcher middleware perlu mengecualikannya secara
  eksplisit — pola umum yang gampang salah konfigurasi).
- **Halaman komposit (Home, `app/page.tsx`)** memanggil use case dari
  `skills`, `projects`, `posts` — tetap tidak membentuk fitur `home`
  tersendiri, karena tidak ada entitas/aturan bisnis miliknya sendiri (murni
  komposisi presentasi, D-006); identitas pemilik (nama/headline/dst.) berupa
  konstanta JSX statis di komponen Hero, bukan dipanggil dari fitur manapun
  (pm_01 D007).
- **Tag** (v2.2): CRUD penuh kini milik `tags.services.ts` &
  `tags.repository.ts` (SA-16..18, v2.10 — dulu `features/tags/domain` &
  `application`) — mencabut aturan lama "upsert-by-name inline" (G-014 BA).
  `features/projects` & `features/posts` hanya **membaca** daftar Tag yang
  ada (via `shared/` atau memanggil query baca `features/tags` lewat
  `tags.services.ts`, bukan import langsung antar-fitur) untuk mengisi
  pemilih `tagIds` di form — pola identik `skillIds`.
- **Media** (v2.2): `media.services.ts` (v2.10 — dulu `features/media/domain`
  & `application`) memiliki kapabilitas kelola galeri (list, `uploadMedia`
  mandiri, `deleteMedia` — SA-19..20). Unggahan **inline** dari form
  Project/Tulisan tetap memanggil util penyimpanan berkas bersama di
  `shared/` (mengunggah ke R2 + mencatat baris `Media`, v2.4) — `shared/`
  menampung mekanisme berbagi, `features/media` menampung kapabilitas
  admin-facing (galeri) di atasnya.
- **Akses berkas** (baca/tulis gambar unggahan) hanya dari `<fitur>.repository.ts`
  fitur `projects`, `posts`, dan `media` (v2.10 — dulu `infrastructure/`),
  lewat util penyimpanan bersama di `shared/` — util ini membungkus S3 SDK
  ke Cloudflare R2 (v2.4, D-017 techlead_01; sebelumnya operasi filesystem
  lokal v2.0-v2.3), dipanggil dari dalam Server Action masing-masing fitur,
  tidak pernah langsung dari komponen UI. CV **tidak** melalui jalur ini —
  berkas statis di `public/`, ditautkan langsung dari komponen Hero
  (pm_01 D007).
- **Dashboard** (`features/dashboard/`) hanya `dashboard.action.ts` +
  `dashboard.services.ts` (query agregat lintas `Project`/`Post`/`Tag`/
  `Skill`) + `dashboard.repository.ts` — tanpa `.schema.ts` (SA-37 tanpa
  input) dan tanpa aturan bisnis tersendiri, murni pemanis tampilan
  non-blocking (pm_01 D009, G-009 uiux; v2.10 D-023 — dulu `application`+
  `presentation` tanpa `domain`).
- **Verifikasi JWT** (sign, verify, decode token) adalah util generik di
  `shared/` (bukan `features/auth/`, diperbaiki v2.8 — sebelumnya keliru
  menyebut `features/auth/domain`/`application`, padahal fitur lain tidak
  boleh mengimpor `features/auth/` langsung, lihat aturan di bawah; sejak
  v2.10 istilah `domain`/`application` itu sendiri sudah tidak berlaku,
  digantikan `auth.services.ts`/`auth.repository.ts`) — `middleware.ts`
  dan **setiap Server Action** (lintas fitur) memanggilnya untuk
  verifikasi sesi independen (D-012), tidak menduplikasi logika.
  `features/auth/` sendiri hanya berisi logika spesifik fitur Auth
  (`login`/`logout`/`changePassword`, SA-21..23) yang turut memakai util
  `shared/` ini.
- Komponen UI dari design system (C-01..C-21) yang dipakai ≥ 2 fitur →
  `shared/`; komponen yang khas satu fitur **co-located di `app/`**
  (route/halaman pemanggilnya) — v2.10 (D-023): folder `presentation/`
  per-fitur dihapus, tidak dipertahankan sebagai lokasi terpisah.
- Tidak ada import antar-fitur langsung (mis. `features/posts` tidak mengimpor
  dari `features/projects`) — kebutuhan lintas fitur naik ke `shared/`.
- **`core/` → `shared/`** (v2.7, D-020): rename murni, tanpa perubahan isi/
  aturan penempatan — nama lama sengaja tidak dipertahankan sebagai alias.

## Handoff

- Dokumen ini bagian dari **set blueprint Tech Lead** proyek Portfolio Developer:
  techlead_01_architecture.md + techlead_02_database.md + techlead_03_api_contract.md +
  techlead_04_folder_structure.md (versi sama, dibaca bersama).
- **Sumber:** set BA v6.0 (FEATURE + USER_STORY + ACCEPTANCE_CRITERIA) +
  set UI/UX v1.8 (USER_FLOW + WIREFRAME + DESIGN_SYSTEM),
  konteks docs/pm_01_project.md v1.6 (+ TEAM_STACK.md sebagai sumber stack).
- **Penerima:** FE & BE Agent (via Issue Planner); QA memakai API_CONTRACT
  sebagai acuan uji.
- **Pertanyaan hilir** tentang stack/data/API yang tak terjawab set ini =
  kekurangan dokumen Tech Lead → dikembalikan ke Tech Lead; pertanyaan tentang
  tampilan/alur → ke UI/UX; tentang requirement → ke BA.
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → BA → UI/UX → set ini
  terbit versi baru. Tidak diedit langsung.
