# ARCHITECTURE: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-17 |
| **Versi** | 2.10 |
| **Sumber** | Set BA v6.0 + Set UI/UX v1.8 |
| **Konteks** | docs/pm_01_project.md v1.6 (+ techlead-agent/TEAM_STACK.md sebagai sumber stack & struktur) |
| **Disusun oleh** | Tech Lead Agent |
| **Set dokumen** | techlead_01_architecture.md · techlead_02_database.md · techlead_03_api_contract.md · techlead_04_folder_structure.md |

## Ringkasan

Kelas proyek: **CMS ringan** (monolith server-rendered) — bukan situs statis,
karena Objective menuntut pemilik memiliki kendali penuh memperbarui seluruh
isinya sendiri (pemilik = Admin = Target User). **Delapan entitas**, **nol
Route Handler** + **38 Server Action** (SA-01..SA-38 — seluruh baca publik,
baca admin, mutasi admin, dan autentikasi; EP-01..EP-17 pensiun total, v2.9
D-022), tanpa integrasi pihak ketiga transaksional. Stack diambil apa adanya
dari `TEAM_STACK.md` untuk **seluruh layer kecuali API Layer** — sejak v2.4,
TEAM_STACK.md mencakup Cloudflare R2 sebagai object storage baku, mencabut
penyimpangan filesystem-lokal yang berlaku di v2.0-v2.3 (D-002, D-017); API
Layer sejak v2.9 **menyimpang** dari baris "Route Handlers + Server Actions"
TEAM_STACK.md — proyek ini murni Server Action (D-022), deviasi khusus
proyek ini, bukan default baru tim. Sejak v2.10, **struktur folder tiap
fitur** juga menyimpang dari TEAM_STACK.md: pola flat 4-file
(`.action.ts`/`.services.ts`/`.repository.ts`/`.schema.ts`) menggantikan
sub-folder `domain/`/`application/`/`infrastructure/`/`presentation/`
(D-023), deviasi khusus proyek ini juga.

Revisi total dari v1.0 (7 entitas, 21 Route Handler, tanpa Server Action) —
lihat techlead_02_database.md Ringkasan untuk daftar perubahan skema, dan
Keputusan & Trade-off (D-008 s.d. D-015) di bawah untuk keputusan arsitektur
baru dari perancangan skema lanjutan (pm_01 D008) dan referensi desain admin
client (pm_01 D009).

## Tech Stack

| Layer | Pilihan | Sumber | Alasan | Constraint |
|-------|---------|--------|--------|------------|
| Framework | Next.js 15 (App Router) | TEAM_STACK.md | Stack baku tim, mencakup seluruh kapabilitas inventory | — |
| UI Library | React 19 | TEAM_STACK.md | Stack baku tim | — |
| Bahasa | TypeScript 7 (strict mode) | TEAM_STACK.md | Stack baku tim | — |
| Styling | Tailwind CSS 4 | TEAM_STACK.md | Stack baku tim | — |
| Icon | react-icons/si | TEAM_STACK.md | Stack baku tim | — |
| Runtime | Node.js 22 (LTS) | TEAM_STACK.md | Stack baku tim | — |
| API Layer | **Server Actions saja** — tanpa Route Handler | **Menyimpang dari TEAM_STACK.md** (baris API Layer-nya "Route Handlers + Server Actions") | v2.0: Route Handler untuk baca (publik & admin), Server Action untuk seluruh mutasi admin (D-012). v2.8 (D-021): login/keluar pindah ke Server Action (SA-22/SA-23). **v2.9 (D-022):** permintaan eksplisit user "server action untuk semuanya" — 15 Route Handler baca tersisa (EP-01..06, EP-09..17) turut dicabut, digantikan SA-24..38; proyek ini kini murni Server Action. Deviasi khusus proyek ini — `TEAM_STACK.md` tidak diminta diperbarui kali ini | Baca publik & admin lewat Server Action dipanggil dari Server Component, bukan `fetch` ke Route Handler |
| Database | PostgreSQL 18 (Neon) | TEAM_STACK.md | Stack baku tim | — |
| ORM | Prisma 7 | TEAM_STACK.md | Stack baku tim; skema deklaratif = kontrak techlead_02 (07 §3.1) | — |
| Auth | JWT (Access + Refresh Token) + Bcrypt | TEAM_STACK.md | Stack baku tim; cukup untuk 1 akun admin (F-06.1) | — |
| Validasi | Zod 4 | TEAM_STACK.md | Stack baku tim; schema diturunkan 1:1 dari shape techlead_03 | — |
| Form | React Hook Form 7 | TEAM_STACK.md | Stack baku tim | — |
| Test | Vitest 4 (unit) + Playwright 1 (E2E) | TEAM_STACK.md | Stack baku tim | — |
| CI/CD | GitHub Actions | TEAM_STACK.md | Stack baku tim | — |
| Linter/Formatter | Biome 2 | TEAM_STACK.md | Stack baku tim | — |
| Container | Docker Engine 29 + Docker Compose 2 | TEAM_STACK.md | Stack baku tim | — |
| Hosting | Ubuntu LTS 22/24 + Caddy 2 + Cloudflare | TEAM_STACK.md | Stack baku tim; Caddy = HTTPS otomatis, menopang kebutuhan kualitas "mudah ditemukan Google" (AC-001-4, D-007) | — |
| Penyimpanan Berkas | Cloudflare R2 (S3-compatible object storage) | TEAM_STACK.md | Object storage terkelola, S3-compatible — cocok untuk gambar unggahan (thumbnail Project/Post, galeri Media); tanpa biaya egress (ciri khas R2), selaras dengan Cloudflare yang sudah dipakai sebagai CDN & Security di depan Caddy. Menggantikan filesystem-lokal v2.0-v2.3 (D-002, dicabut D-017) — TEAM_STACK.md kini mencakup layer ini, bukan lagi penyimpangan proyek | Kebutuhan Aset uiux_03_design_system.md: foto profil, gambar project, berkas CV |

## Arsitektur Sistem

```
( pengunjung — HP/desktop )                 ( admin — 1 akun )
        │ HTTPS                                    │ HTTPS (masuk via JWT)
        ▼                                          ▼
┌─────────────────────────────────────────────────────────┐
│           Aplikasi Next.js (satu unit, App Router)       │
│  sisi publik: Home · About · Portfolio · Blog · Contact  │
│  sisi admin: terlindung middleware (verifikasi JWT)      │
└───────┬─────────────────────────────┬─────────────────────┘
        │ Prisma                      │ unggah via Server Action
        ▼                             ▼ (binding R2 native, di *.repository.ts fitur)
┌────────────────┐            ┌────────────────────┐
│ PostgreSQL       │            │ Cloudflare R2         │
│ 8 tabel          │            │ (object storage)      │
└────────────────┘            └────────────────────┘
        ▲
        │ di depan aplikasi
┌─────────────────────────┐
│ Caddy (reverse proxy)    │  ← HTTPS otomatis
│ Cloudflare (CDN/security)│  ← di depan Caddy
└─────────────────────────┘
```

Komponen: **Aplikasi Next.js** menyajikan seluruh halaman publik dan admin
dalam satu unit (tidak ada layanan terpisah). **PostgreSQL** menyimpan
kedelapan entitas via Prisma. **Cloudflare R2** menyimpan gambar unggahan
admin (thumbnail project & tulisan, galeri Media) — diakses lewat Server
Action yang sama dengan mutasi admin lain (createProject/createPost/
uploadMedia, D-012 tidak berubah), bukan endpoint terpisah; tanpa volume
Docker manual sejak v2.4 (D-017, mencabut D-002). Berkas CV **tidak** lewat
R2 — ditempel developer langsung ke aset statis/`public/` saat deploy
(pm_01 D007), tidak melalui unggahan admin. **Caddy** menerbitkan sertifikat
HTTPS otomatis dan meneruskan lalu lintas ke aplikasi; **Cloudflare** berada
di depan Caddy untuk CDN & proteksi dasar — vendor yang sama dengan R2,
dua produk berbeda (CDN/proxy vs object storage).

## Modul Aplikasi

| Modul | Tugas | Melayani |
|-------|-------|----------|
| Sisi publik | Menyajikan Home, About, Portfolio, Blog, Contact; menerima pesan | F-01, F-02, F-03, F-04, F-05, F-07 |
| Sisi admin (terlindung) | Masuk/keluar + kelola project, tulisan, keahlian, tag, media, info kontak, pesan masuk + ubah kata sandi sendiri | F-06 |
| Penyimpanan berkas | Menyimpan & menyajikan gambar unggahan admin (thumbnail project & tulisan) — Cloudflare R2, v2.4 | Kebutuhan Aset (F-03, F-04, F-06) |

*(Penataan kode per fitur & layer: techlead_04_folder_structure.md.)*

## Environment & Deployment

- **Lokal:** Node.js 22 + PostgreSQL via Docker Compose (sesuai TEAM_STACK.md);
  `prisma migrate` + seed untuk data awal; unggahan gambar langsung ke bucket
  R2 sandbox/dev (v2.4) — tidak ada lagi folder/volume unggahan lokal.
- **Produksi:** Docker Compose menjalankan aplikasi Next.js + PostgreSQL (atau
  PostgreSQL terkelola/Neon) di VPS Ubuntu LTS; Cloudflare R2 (bucket
  produksi) untuk seluruh berkas unggahan admin — tanpa volume Docker
  terpisah (v2.4, D-017); Caddy sebagai reverse proxy di depan aplikasi;
  Cloudflare di depan Caddy. Deploy = build image via GitHub Actions →
  `docker compose up` di server.
- **Konfigurasi:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, dan
  `R2_PUBLIC_URL` (domain publik bucket/custom domain). Aplikasi Worker
  mengakses bucket melalui binding R2 `PORTFOLIO_MEDIA`, tanpa kredensial S3.

## Keputusan & Trade-off

| ID | Keputusan | Alasan (termasuk alternatif yang ditolak) |
|----|-----------|-------------------------------------------|
| D-001 | Kelas proyek: CMS ringan, bukan situs statis | Objective v1.2 menuntut "kendali penuh memperbarui seluruh isinya sendiri" — pemilik ADALAH Admin/Target User; berbeda dari baseline contoh statis di mana pemilik bukan Target User |
| D-002 | ~~TEAM_STACK.md dipakai apa adanya, kecuali penyimpanan berkas~~ — **DICABUT v2.4 (D-017)**: TEAM_STACK.md kini mencakup penyimpanan berkas (Cloudflare R2) | Berlaku v2.0-v2.3: validasi cakupan waktu itu — stack baku tim menutup seluruh kapabilitas inventory kecuali penyimpanan objek; celah itu ditutup user langsung di TEAM_STACK.md, bukan lagi penyimpangan proyek |
| D-003 | Struktur folder = jalur 1 (Struktur Folder Baku TEAM_STACK.md) — pemetaan F-XX ke folder fitur ini tetap berlaku; sub-struktur layer *di dalam* tiap folder fitur diperbarui v2.10, lihat D-023 | Kerangka sudah baku; pekerjaan Tech Lead murni memetakan fitur ke folder (lihat techlead_04) |
| D-004 | ~~Profil & Info Kontak = entitas singleton, tanpa endpoint buat/hapus~~ — **DICABUT total v2.0 (D-013)** | Profil dihapus sepenuhnya (bukan lagi singleton — bukan tabel sama sekali); Info Kontak jadi multi-baris dengan CRUD penuh, bukan singleton |
| D-005 | Pesan tanpa endpoint ubah **isi** atau hapus — v2.0 menambah endpoint ubah **status** (baca/arsip, D-012) | US-018 hanya menuntut "membaca"; endpoint ubah isi/hapus = endpoint hantu (Scope Validation); status baca/arsip = kemampuan baru dari pm_01 D008, bukan "ubah isi" |
| D-006 | Sorotan Home memakai fungsi baca yang sama dengan daftar penuh (`SA-24`/`SA-26`, v2.9 — dulu `EP-01`/`EP-03`), dibedakan parameter `limit` | Data & aturan identik; fungsi terpisah untuk kebutuhan sama = duplikasi tanpa alasan |
| D-007 | AC-001-4 (muncul di Google) ditopang lewat SSR + metadata + sitemap.xml, bukan endpoint | Kebutuhan kualitas → keputusan arsitektur (rendering), bukan permukaan API |
| D-008 | ID seluruh entitas: `String @default(cuid())`, bukan `BigInt autoincrement()` (v1.0) | Id tidak bisa ditebak/dienumerasi lewat manipulasi URL; berpasangan wajar dengan slug yang sudah dipakai di seluruh entitas berkonten; keputusan user saat perancangan skema |
| D-009 | `ContactInfo` & `User` tanpa kolom `createdAt`/`updatedAt`, beda dari entitas lain | Skala 1 baris/1 akun; tidak ada kebutuhan produk/UI yang menampilkan riwayat perubahan keduanya — menambah kolom tanpa manfaat terukur |
| D-010 | Slug (`projects`, `posts`, `tags`, `skills`) dibuat otomatis dari nama/judul (slugify), bukan isian manual admin | Admin tunggal non-teknis; auto-generate menghindari slug kosong/bentrok tanpa validasi form tambahan; tidak ada requirement stabilitas URL manual |
| D-011 | `Media` = katalog metadata file, bukan foreign key relasional dari `projects`/`posts` (field gambar tetap string path langsung) | Skala kecil (1 admin, unggahan jarang) tidak sepadan dengan kompleksitas menjaga relasi FK tetap sinkron; katalog cukup untuk kebutuhan "admin lihat file yang pernah diunggah" |
| D-012 | Seluruh mutasi admin (create/update/delete, termasuk transisi status) jadi **Server Action**; Route Handler dipertahankan untuk baca (publik & admin) dan autentikasi | Permintaan eksplisit user saat perancangan skema ("nanti menggunakan server action"); mutasi dipanggil langsung dari form admin, tidak butuh permukaan REST terpisah untuk dikonsumsi pihak luar |
| D-013 | Entitas Profil dihapus total (bukan lagi tabel); Info Kontak jadi tabel flat multi-baris dengan CRUD penuh (mencabut D-004) | pm_01 D007 (Profil statis) + pm_01 D008 lanjutan (perancangan skema) — data identitas jarang berubah, tidak sepadan jadi form admin; Info Kontak sebaliknya perlu fleksibel tambah/kurang saluran tanpa migrasi skema |
| D-014 | Skema Prisma **tanpa** `@map`/`@@map` — konvensi default Prisma apa adanya (model PascalCase singular = nama tabel, field camelCase = nama kolom, tanpa dipetakan ulang ke snake_case) | Proyek tidak pernah mengakses PostgreSQL secara langsung di luar Prisma Client (tanpa raw SQL, tool eksternal, atau BI yang membaca skema) — lapisan pemetaan nama snake_case tidak punya manfaat terukur untuk skala ini; keputusan user, mencabut konvensi snake_case v2.0 |
| D-015 | `Tag` & `Media` (sudah ada sejak v2.0) dapat permukaan CRUD/kelola admin penuh (EP-14/SA-16..18 Tag; EP-15/SA-19..20 Media) menggantikan pola inline-only/write-only; `changePassword` (SA-21) baru tanpa field tambahan; `GET /api/admin/dashboard` (EP-16) baru untuk statistik & aktivitas terbaru — murni pemanis, tanpa AC | Referensi desain admin eksplisit dari client (`docs/ui/cms/`, pm_01 D009) — bukan tebakan tim; tidak menambah tabel karena `Tag`/`Media`/`User.passwordHash` sudah cukup di skema v2.0/v2.1 |
| D-016 | `GET /api/skills` (EP-17, publik) ditambahkan v2.3 | Celah kontrak ditemukan Issue Planner saat memecah backlog: SCR-01 Home menampilkan bagian Keahlian ke pengunjung publik (AC-019-1), tapi satu-satunya endpoint baca Skill yang ada sebelumnya (EP-11) khusus admin — pengunjung publik tidak pernah punya jalur baca; gap blocking dikembalikan & langsung diperbaiki di sini sebelum Issue Planner lanjut memecah issue Home |
| D-017 | Penyimpanan berkas pindah dari filesystem lokal (volume Docker) ke Cloudflare R2 (S3-compatible object storage); mencabut D-002 — TEAM_STACK.md kini mencakup layer ini sebagai stack baku, bukan lagi penyimpangan per-proyek. Alur unggah TETAP lewat Server Action (D-012 tidak berubah): file dikirim `FormData` ke Server Action yang sama (`createProject`/`createPost`/`uploadMedia`), Server Action-nya mengunggah ke R2 melalui binding native `PORTFOLIO_MEDIA` di `*.repository.ts` fitur (v2.10 — dulu lapisan `infrastructure`) — tanpa endpoint/kontrak API baru, tanpa presigned URL client-langsung (opsi itu dipertimbangkan & ditolak user demi kesederhanaan skala kecil, satu admin) | Perubahan kapabilitas tim (bukan requirement proyek) — user memperbarui TEAM_STACK.md; R2 menghapus kebutuhan volume Docker terpisah untuk berkas (lebih sederhana dikelola, tanpa biaya egress, terintegrasi dengan Cloudflare yang sudah dipakai sebagai CDN) |
| D-018 | Kelima layar publik (SCR-01..07) dibungkus route group `app/(public)/` (techlead_04) — satu `layout.tsx` bersama (Navbar/MenuUtama C-02 + Footer) tanpa mengubah URL; `admin/` TETAP folder biasa (bukan route group) karena memang perlu tampil di path `/admin/*` yang sebenarnya, dan SCR-08 Masuk sengaja tidak ikut berbagi layout admin | Permintaan user: navbar & footer kemungkinan sama di seluruh halaman publik — route group Next.js adalah mekanisme baku untuk itu tanpa duplikasi kode per halaman; murni keputusan struktur folder (implementasi), tidak mengubah wireframe/kontrak API mana pun |
| D-019 | SCR-08 Masuk Admin (`login/`) dipindah keluar dari `admin/` jadi `app/login/` tersendiri (techlead_04 v2.6) — `admin/layout.tsx` (MenuAdmin) kini berlaku utuh ke seluruh `admin/*` tanpa pengecualian; `middleware.ts` yang menjaga `/admin/*` otomatis tidak lagi menyentuh rute login | Permintaan user: SCR-08 punya UI form sendiri, berbeda dari SCR-09..19 yang seluruhnya berbagi UI Dashboard/MenuAdmin — dicek ke wireframe uiux_02, SCR-08 memang satu-satunya layar kelola tanpa bagian "Header Admin"; murni keputusan struktur folder, tidak mengubah wireframe/kontrak API |
| D-020 | Folder lintas fitur `core/` diganti nama jadi `shared/` (techlead_04 v2.7) — isi & aturan penempatan sama sekali tidak berubah (komponen UI dasar, config, klien Prisma, util JWT, util penyimpanan R2), murni rename. Perubahan permanen di `techlead-agent/TEAM_STACK.md` (Struktur Folder Baku) — berlaku untuk proyek ini dan seluruh proyek berikutnya | Permintaan user: nama `core/` kurang jelas menjelaskan isinya sendiri; `shared/` langsung menyatakan maksud ("dipakai bersama lintas fitur") tanpa perlu buka dokumen — konvensi umum di arsitektur feature-based/DDD |
| D-021 | `EP-07` (`POST /api/admin/login`) & `EP-08` (`POST /api/admin/logout`) dicabut sebagai Route Handler, digantikan Server Action `SA-22` (`login`) & `SA-23` (`logout`) — techlead_03 v2.8. Route Handler kini murni baca (publik & admin), tanpa pengecualian; `SA-22` jadi satu-satunya Server Action yang **tidak** memverifikasi sesi yang sudah ada (justru membuat sesi baru) — pengecualian eksplisit dari pola "setiap Server Action verifikasi sesi ulang" (D-012). `EP-07`/`EP-08` tidak dipakai ulang untuk ID lain (slot pensiun); `EP-09` dst. tidak berubah nomor | Permintaan eksplisit user: login & keluar dipanggil langsung dari form (React Hook Form + action), konsisten dengan seluruh form admin lain yang sudah memakai pola Server Action, bukan `fetch` ke endpoint REST terpisah. Next.js Server Action tidak mengharuskan pemanggilnya sudah admin ber-sesi — itu cuma pola mayoritas D-012 sejauh ini, bukan batasan teknis; halaman `/login` (D-019, di luar `admin/`) tetap publik, formnya sah memanggil Server Action |
| D-022 | **Seluruh 15 Route Handler baca tersisa** (`EP-01`, `EP-02`, `EP-03`, `EP-04`, `EP-05`, `EP-06`, `EP-09`, `EP-10`, `EP-11`, `EP-12`, `EP-13`, `EP-14`, `EP-15`, `EP-16`, `EP-17`) dicabut, digantikan Server Action `SA-24`..`SA-38` — techlead_03 v2.9. Proyek ini **TANPA Route Handler sama sekali**; `app/api/` dihapus dari struktur folder (techlead_04 v2.9). `EP-01`..`EP-17` tidak dipakai ulang untuk ID lain (seluruh slot pensiun, meneruskan pola D-021). **Menyimpang dari `TEAM_STACK.md`** ("Route Handlers + Server Actions") — `TEAM_STACK.md` **tidak** diminta diperbarui kali ini (beda dari D-020 core→shared yang eksplisit diminta jadi perubahan permanen tim); deviasi ini khusus proyek Portfolio Developer | Permintaan eksplisit user, dua tahap dalam sesi yang sama: pertama login/keluar (D-021), lalu ditegaskan "kita akan menggunakan server action untuk semuanya" — dikonfirmasi mencakup seluruh Route Handler tersisa (baca publik & baca admin), bukan cuma operasi admin. Next.js tidak mengharuskan Server Action khusus mutasi — Server Component/Client Component sah memanggilnya untuk query baca juga; keputusan gaya arsitektur milik user, bukan batasan teknis framework |
| D-023 | **Seluruh 9 folder fitur** (`features/<fitur>/`) pindah dari layout bersarang `domain/`·`application/`·`infrastructure/`·`presentation/` ke **pola flat 4-file bersuffix**: `<fitur>.action.ts` (Server Action, entry tipis, `"use server"`), `<fitur>.services.ts` (use case/aturan bisnis — melebur bekas `domain`+`application`), `<fitur>.repository.ts` (akses data/Prisma — bekas `infrastructure`), `<fitur>.schema.ts` (validasi Zod) — techlead_04 v2.10. Folder `presentation/` dihapus total: komponen UI khas satu fitur pindah co-located ke `app/` (route pemanggilnya), komponen dipakai ≥2 fitur tetap naik ke `shared/` (tidak berubah). `features/dashboard/` (tanpa entitas sendiri) terkecuali: hanya `dashboard.action.ts` + `dashboard.services.ts` + `dashboard.repository.ts`, tanpa `.schema.ts` (SA-37 tanpa input). **Menyimpang dari `TEAM_STACK.md`** (Struktur Folder Baku, masih domain/application/infrastructure/presentation) — `TEAM_STACK.md` **tidak** diminta diperbarui kali ini (deviasi khusus proyek ini, pola sama dengan D-022). `docs/issues/ISS-012` & `ISS-013` (dua-duanya sudah compiled, referensi Struktur File lama) di-compile ULANG | Permintaan eksplisit user: pola flat bersuffix, dicontohkan lewat `features/auth/` (`auth.action.ts`, `auth.services.ts`, `auth.repository.ts`, `auth.schema.ts`) — dikonfirmasi berlaku ke seluruh 9 folder fitur (bukan cuma auth), dan `presentation/` dihapus total (bukan dipertahankan di samping 4 file). Skala proyek ini (1 admin, 8 entitas, tanpa business rule kompleks) tidak sepadan dengan ongkos navigasi 4 sub-folder Clean Architecture penuh per fitur; flat-file lebih cepat ditelusuri untuk tim/skala sekecil ini — keputusan gaya folder milik user, `TEAM_STACK.md` sendiri hanya menyediakan baseline "jalur 1", bukan satu-satunya jalur yang sah dipakai |

## Assumptions

- Berkas CV adalah aset statis (bukan data DB) — ditempel developer ke
  `public/` sebelum situs tayang publik; tautan unduh langsung, tanpa
  endpoint (G-001, DIREVISI 2026-07-16 — pm_01 D007 mencabut kewajiban skema
  `NOT NULL` v1.0).
- Daftar Project & Tulisan publik tampil terbaru dulu (`publishedAt desc`),
  hanya `status: PUBLISHED` (G-002, DIREVISI 2026-07-16 — pm_01 D008).
- Batas unggahan: gambar (jpg/png/webp) ≤ 2MB (G-003, DIREVISI 2026-07-16 —
  ketentuan CV ≤5MB dicabut bersama D-007, CV tidak lagi diunggah lewat admin).
- Sesi admin: token akses 15 menit, token pembaruan 7 hari, disimpan sebagai
  httpOnly cookie (G-004) — berlaku juga untuk verifikasi sesi di dalam
  Server Action (D-012).

## Open Questions

- Titipan Open Questions UI/UX: "project unggulan" saat ini = project terbaru
  (bukan kurasi manual). Bila pemilik ingin memilih sendiri project yang
  disorot, itu kemampuan baru (kolom penanda unggulan) — diteruskan untuk
  siklus PM/BA berikutnya, bukan dijawab sendiri di sini.
- Pendaftaran domain, sertifikat/konfigurasi Cloudflare, dan penyimpanan
  kredensial (`JWT_*_SECRET`, `DATABASE_URL`) produksi → titipan untuk DevOps.

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
