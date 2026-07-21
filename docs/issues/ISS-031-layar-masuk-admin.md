# ISS-031 — [FE] Layar Masuk Admin

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | S |
| **Blocked by** | ISS-012, ISS-025 |
| **Serves** | SCR-08 |
| **Covers** | AC-009-1, AC-009-2 |

## Deskripsi

Halaman Masuk Admin (`/login`, SCR-08) — satu form, satu tujuan: masuk
sebagai admin. Mengonsumsi `SA-22` (`login`) saja; `SA-23` (`logout`)
& `SA-21` (`changePassword`) bukan bagian issue ini — masing-masing
milik AdminNav (Header Admin, tombol Keluar, dipakai SCR-09 dst.) &
SCR-19 (`ISS-040`).

**RECOMPILE 2026-07-20 (D-025 uiux, ditemukan saat pre-check ISS-033):**
saat pertama dikompilasi, issue ini menulis "TIDAK ada referensi visual
client untuk layar ini" — ternyata keliru, bukan karena salah baca, tapi
karena `docs/layout/cms/login.png` **belum ada** di folder itu saat itu
(cuma `cms-portfolio.png`/`-darkmode.png`, yang ternyata referensi
Dashboard bukan Login). File baru bertambah ke folder yang sama
belakangan, baru ketahuan saat pre-check `ISS-033`. Bagian di bawah ini
sudah diperbarui mengikuti referensi itu — lihat catatan D-025 di
§Spesifikasi Layar untuk detail lengkap apa yang berubah.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** (wajib sejak
D-024/D-028, plus cek staleness `docs/issues/` sejak D-023 issue.yaml) —
`SA-22` di `techlead_03_api_contract.md` **SUDAH SINKRON** dengan salinan
di `ISS-012` (sudah compiled), tanpa selisih — **tidak berubah** oleh
recompile ini, murni tampilan/copy, kontrak `SA-22` sama sekali tidak
tersentuh.

**Catatan arsitektur penting**: SCR-08 **bukan** bagian route group
`app/(public)/` (Navbar/Footer, D-018 techlead) maupun `app/admin/`
(AdminNav, D-019 techlead) — `app/login/` berdiri sendiri setingkat
keduanya (D-019 `techlead_01_architecture.md`). Konsekuensinya: SCR-08
**satu-satunya layar tanpa ThemeToggle** (C-03 `used_in` tidak menyebut
SCR-08) — halaman bare, cuma Form Masuk di tengah, tanpa elemen chrome
apa pun (tanpa navbar, footer, header admin, atau toggle tema).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-08 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

### SCR-08 — Masuk Admin

**Brand** (D-025 — statis, di luar kartu, rata tengah)
- "{Nama pemilik}." (mis. "Julio.") + subjudul kecil "Personal Dashboard"

**Form Masuk** (D-025 — dibungkus kartu berbingkai/rounded, mengikuti
`docs/layout/cms/login.png`)
- Ikon lingkaran (person) di atas, rata tengah
- Judul: "Login"
- Subjudul: "Masuk untuk mengelola website."
- Username * : ___________________ (ikon person di isian)
- Password * : ___________________ (ikon gembok di isian + tombol mata
  lihat/sembunyikan)
- Aksi: [Login]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Isian data masuk | `FormField` (C-08, +ikon isian +tombol lihat/sembunyikan password, D-025) | Wajib keduanya |
| 2 | [Login] | `Button` (C-01, primer) | Berhasil → SCR-09 (AC-009-1); salah → state gagal-masuk |

**Bilah Bawah** (D-025 — statis, di luar kartu; BUKAN reuse `Footer` C-22)
- "© {tahun berjalan} {nama pemilik}. All rights reserved."

**State: gagal-masuk** — `StatusMessage` (C-13) gagal di atas form: "Data
masuk keliru. Periksa kembali." — **tanpa** merinci bagian mana yang
salah (AC-009-2, pesan generik disengaja — tidak membocorkan apakah
username atau password yang keliru); isian **tidak** dikosongkan.

**State: memuat** — `[Login]` menunjukkan penanda sibuk, tidak bisa
ditekan ulang selama proses.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-08) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/13). **Bila berbeda
> dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Catatan (D-025):** label isian "Nama pengguna/email"/"Kata sandi"
(kompilasi pertama) diganti **"Username"/"Password"** (Inggris, konsisten
label modul admin G-008/D-009) — sekalian membetulkan ambiguitas lama:
"email" tidak pernah didukung skema `User`/ENT-08 (cuma `username`).
Tombol "Masuk" jadi "Login". Tidak ada elemen yang ditolak — seluruh
referensi diadopsi, murni tampilan/copy atas kapabilitas yang sudah ada
(`AC-009-1`/`AC-009-2` tidak berubah makna, `SA-22` tidak tersentuh).

**Alur:** FLOW-10 (admin masuk ke halaman admin) — `docs/
uiux_01_user_flow.md`; langkah 1 (dialihkan kemari tanpa sesi, AC-009-3)
& langkah 3 (Dashboard sesudahnya) adalah tanggung jawab `middleware.ts`
& `ISS-012`/`ISS-032`, bukan issue ini.

## Aturan Validasi

Mirror dari `SA-22` (`docs/techlead_03_api_contract.md` / `ISS-012`):

- `username` — wajib; tanpa aturan format/panjang khusus di sisi FE
  (dicocokkan server ke `User.username` tersimpan, ENT-08).
- `password` — wajib; tanpa aturan format/panjang khusus di sisi FE.
- Server tetap sumber kebenaran — FE tidak menambah aturan yang tidak
  ada di kontrak (mis. tidak memvalidasi format email meski label
  bertuliskan "Nama pengguna/email"; `User` tidak punya field email
  sama sekali, `techlead_02_database.md` ENT-08).

## Aturan Bisnis/Perilaku

- **`LoginForm` (Client Component, `"use client"`) memanggil `SA-22`
  langsung dari `action` form** (pola sama D-012/`ISS-030`
  `ContactForm`) — bukan lewat Route Handler/`fetch`.
- **3 state**: normal → memuat (saat submit berjalan) → **berhasil**
  (arahkan ke Dashboard `/admin`, AC-009-1) ATAU **gagal-masuk**
  (`StatusMessage` generik, isian **tidak** dikosongkan, AC-009-2).
- **Pesan gagal SENGAJA generik** — "Data masuk keliru. Periksa
  kembali." tanpa merinci username vs password yang salah (beda dari
  `ContactForm`/`SA-29` yang merinci per bagian) — `SA-22` memang
  mengembalikan `{ error: { message } }` tunggal, bukan `error.fields`
  per bagian (`techlead_03_api_contract.md`), justru untuk tidak
  membocorkan bagian mana yang keliru ke penyerang.
- **Halaman TETAP bare, tanpa layout bersama** — TIDAK memakai
  `app/(public)/layout.tsx` (Navbar/Footer) maupun `app/admin/layout.tsx`
  (AdminNav) — `app/login/page.tsx` berdiri sendiri (D-019 techlead).
  TANPA ThemeToggle (C-03 tidak `used_in` SCR-08). **Brand** & **Bilah
  Bawah** (D-025) TIDAK mengubah ini — keduanya teks statis biasa di
  `page.tsx`, BUKAN komponen `C-XX`, BUKAN reuse `Footer` (C-22, jauh
  lebih kaya — 4 kolom + data `ContactInfo`).
- **`FormField` (C-08) diperluas** (D-025) — ikon opsional di dalam
  isian + tombol lihat/sembunyikan (ikon mata) khusus isian password;
  murni toggle client-side (ubah tipe isian teks↔password), TIDAK
  memengaruhi validasi/pengiriman `SA-22`. `Button` (C-01) & `StatusMessage`
  (C-13) dipakai apa adanya dari `shared/` (`ISS-025`) — tidak diperluas.
- **Redirect terlindung (AC-009-3) bukan tanggung jawab halaman ini** —
  `middleware.ts` (`ISS-012`) yang mengalihkan `/admin/*` tanpa sesi ke
  `/login`; `LoginForm` cuma menangani submit & hasilnya.

## Auth & Permission

- `SA-22`: **publik** — satu-satunya Server Action tanpa sesi di
  seluruh backlog (Matriks Akses, `techlead_03_api_contract.md`); halaman
  `/login` sendiri juga publik (tidak dijaga `middleware.ts`, D-019
  techlead).

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak
diperluas): Button (C-01), StatusMessage (C-13) — sejak `ISS-025`.

**Diperluas di issue ini:**

| Komponen | Lokasi | Perubahan |
|----------|--------|-----------|
| FormField (C-08) | `shared/components/FormField.tsx` (SUDAH ADA sejak ISS-025) | + ikon opsional di isian + tombol lihat/sembunyikan password (D-025) |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tidak ada (Brand/Bilah Bawah murni teks, ikon dari pustaka
ikon proyek).

## Struktur File (referensi awal)

```
src/app/login/
├── page.tsx                        ← SCR-08 Masuk Admin — bare page,
│                                       TANPA layout bersama; render
│                                       <LoginForm />
└── _components/
    └── LoginForm.tsx                ← BARU, Client Component ("use client"),
                                         login (SA-22) via action form;
                                         state memuat/gagal-masuk
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `login` SUDAH ADA (dibangun `ISS-012` —
`features/auth/auth.action.ts`); issue ini cuma memanggilnya, tidak
membuat ulang. `middleware.ts` (juga `ISS-012`) sudah menjaga
`/admin/*` — issue ini tidak menyentuhnya.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/login/page.tsx` — Brand + kartu Form Masuk + Bilah Bawah,
      render `<LoginForm />` sesuai Spesifikasi Layar.
- [ ] `LoginForm` (Client Component) — Username/Password + submit ke
      `login` (`SA-22`), state memuat/gagal-masuk.
- [ ] `FormField` (C-08) diperluas — ikon isian + tombol lihat/
      sembunyikan password, sesuai §Aset & Design System.
- [ ] State gagal-masuk — pesan generik, isian tidak dikosongkan
      (AC-009-2).
- [ ] Berhasil masuk → diarahkan ke Dashboard (AC-009-1).

**Out of Scope**
- `middleware.ts`, `SA-22` sendiri, `SA-23`, `SA-21` — sudah `ISS-012`.
- Header Admin/AdminNav, tombol Keluar — dipakai SCR-09 dst.,
  `ISS-032` (Dashboard) & seterusnya.
- Halaman Password (SCR-19) — `ISS-040`.
- Konten halaman lain (publik maupun admin) — issue fitur masing-masing.

## Acceptance Criteria

- [ ] Admin memasukkan data masuk yang benar → admin berada di halaman
      admin dan dapat mulai mengelola konten (AC-009-1).
- [ ] Admin memasukkan data masuk yang salah → admin tidak masuk,
      melihat pemberitahuan generik bahwa data masuknya keliru
      (AC-009-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: jalur sukses (masuk → Dashboard) & gagal
      (pesan generik, isian tidak hilang) `[Login]`, tombol nonaktif +
      penanda sibuk selama submit berjalan, tombol lihat/sembunyikan
      password berfungsi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-08 — `docs/uiux_02_wireframe.md`; FLOW-10 —
  `docs/uiux_01_user_flow.md`
- **Design system:** C-01/08/13 — `docs/uiux_03_design_system.md`;
  referensi visual client — `docs/layout/cms/login.png` (D-025 uiux)
- **Kontrak API:** `SA-22` — `docs/techlead_03_api_contract.md` (TIDAK
  berubah sejak awal — pre-check ISS-031 mengonfirmasi sinkron dengan
  `ISS-012`, tanpa perluasan; recompile D-025 murni tampilan/copy)
- **Perilaku yang ditopang:** AC-009-1, AC-009-2 —
  `docs/ba_03_acceptance_criteria.md` (AC-009-3 ditopang `ISS-012`)
