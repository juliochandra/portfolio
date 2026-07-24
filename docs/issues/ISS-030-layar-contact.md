# ISS-030 — [FE] Layar Contact: info kontak & formulir pesan

| | |
|---|---|
| **Label** | `frontend` |
| **Ukuran** | M |
| **Blocked by** | ISS-015, ISS-025 |
| **Serves** | SCR-07 |
| **Covers** | AC-007-1, AC-008-1, AC-008-2 |

## Deskripsi

Halaman Contact (`/contact`, SCR-07) — satu-satunya layar publik dengan
**dua** kebutuhan sekaligus: baca info kontak (`SA-28` `getContactInfo`)
& kirim pesan (`SA-29` `sendMessage`). Beda dari ISS-026/027/028/029
(seluruhnya murni baca), issue ini yang **pertama** punya form bermutasi
di sisi publik — butuh satu batas Client Component (`ContactForm`) untuk
mengelola state `memuat`/`error-validasi`/`terkirim`, bukan 100% Server
Component seperti keempat issue FE publik sebelumnya.

**Rombakan dari referensi visual client** (`docs/layout/contact/
contact.png`, D-023 uiux) — pola sama ISS-026 s.d. 029, tapi cascade
**paling sederhana**: **NOL** pertanyaan blocking (Contact secara inheren
tanpa konsep kategori/featured/search/pagination sama sekali). Contact
Hero **diringkas**: sebelumnya judul+tagline bebas (D-011), kini **REUSE
`SectionHeader` (C-23, varian rata-tengah) apa adanya** — anatomi Hero
pada referensi (badge+judul+subjudul polos, tanpa StatCard/garis
aksen/paragraf) kebetulan cocok persis dengan anatomi inti
`SectionHeader`, beda dari Hero SCR-01/03/05 yang semua custom karena
lebih kaya.

**Info Kontak TETAP dipertahankan** sebagai section wajib terpisah
(F-05.1 Must, AC-007-1, D-011 tidak dicabut) — referensi visual cuma
membingkai Hero+Formulir Pesan, TIDAK menonjolkan Info Kontak, TAPI itu
bukan penolakan elemen (beda dari kasus kategori/featured/newsletter di
Portfolio/Blog yang eksplisit ditambahkan referensi lalu ditolak/
diterima user) — cukup elemen yang tidak difokuskan satu screenshot,
sementara sudah dikunci wajib sejak D-011. Disusun ulang jadi baris
horizontal chip `ContactLink` (lihat G-019 uiux.yaml).

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** (kebiasaan wajib
sejak D-024/D-028, dan wajib cek staleness `docs/issues/` sejak D-023
issue.yaml) — kali ini **`SA-28`/`SA-29` SUDAH SINKRON**, `ISS-015` yang
sudah compiled TIDAK basi, tanpa selisih kontrak. Techlead **tidak
disentuh sama sekali** siklus ini — kontras dengan ISS-028/029 yang
masing-masing menemukan celah (D-029, D-030) dan staleness ISS-013/014.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-07 (definisi lengkap
di sana mengikat; issue ini cuma ringkasan actionable).

**Navbar & Footer** — sudah dibangun `app/(public)/layout.tsx` (ISS-025),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-07 — Contact

**Contact Hero** (D-023 — REUSE `SectionHeader`, BUKAN custom Hero baru)
- `SectionHeader` (C-23, varian rata-tengah — reuse dari `ISS-025`):
  badge "Contact" · judul "Mari Bekerja Sama" (echo istilah Ajakan Home,
  D-019) · subjudul

**Info Kontak**
- Baris horizontal chip `ContactLink` (C-07) — data `getContactInfo()`
  (`SA-28`, tanpa parameter); boleh melipat ke beberapa baris di layar
  sempit

**Formulir Pesan** (D-023 — kartu berbingkai, judul in-card lama "Kirim
Pesan" dicabut — redundan dengan judul Hero)
- Nama * / Email * / Pesan * — `FormField` (C-08)
- Aksi: `[Kirim Pesan]` (`Button` C-01, primer, + ikon opsional D-023)
- Catatan kepercayaan statis di bawah tombol — murni teks dekoratif
  (ikon gembok + jaminan singkat), TANPA data/komponen baru

**State: error-validasi** — isian wajib yang kosong dibingkai danger +
pesan di bawah isian itu; pesan tidak terkirim (AC-008-2).

**State: memuat** — `[Kirim Pesan]` menunjukkan penanda sibuk, tidak bisa
ditekan ulang selama proses.

**State: terkirim** — `StatusMessage` (C-13) berhasil: "Pesan terkirim.
Terima kasih!"; formulir dikosongkan (AC-008-1).

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-07) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/02/03/07/08/13/22/23).
> **Bila berbeda dengan dokumen itu, dokumen kontrak yang berlaku** —
> laporkan selisihnya, jangan memilih sendiri.

**Catatan eksplisit — TIDAK diadopsi dari referensi visual**: tidak ada
(cascade ini nol elemen yang ditolak — beda dari ISS-026 s.d. 029 yang
masing-masing punya daftar TIDAK-diadopsi). Satu-satunya penyesuaian
adalah Info Kontak yang **dipertahankan** meski tidak difokuskan
referensi (lihat Deskripsi & G-019 uiux.yaml).

**Alur:** FLOW-08 (melihat info kontak), FLOW-09 (mengirim pesan lewat
formulir) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-29` (`docs/techlead_03_api_contract.md` / `ISS-015`) —
server tetap sumber kebenaran, FE re-validasi murni untuk UX (pesan error
instan sebelum round-trip):

- `name` — wajib; maks 100 karakter (AC-008-2).
- `email` — wajib; format email; maks 255 karakter (AC-008-2).
- `message` — wajib; teks panjang, tanpa batas atas eksplisit.
- FE **tidak boleh** melonggarkan aturan ini lebih dari kontrak server —
  bila `sendMessage` mengembalikan `error.fields`, itu yang dianggap
  benar & ditampilkan apa adanya per bagian (`FormField`, C-08).
- `SA-28` (`getContactInfo`) tanpa parameter — tidak ada yang divalidasi.

## Aturan Bisnis/Perilaku

- **2 panggilan baca/tulis independen**: `page.tsx` (Server Component)
  memanggil `getContactInfo()` (`SA-28`) untuk Info Kontak; `ContactForm`
  (Client Component, `"use client"`) memanggil `sendMessage` (`SA-29`)
  langsung dari `action` form (pola sama form admin, D-012
  `techlead_01_architecture.md`) — Server Action dipanggil langsung,
  bukan lewat Route Handler/`fetch`.
- **`SA-29` publik meski menulis data** — tanpa sesi apa pun, sama seperti
  `SA-28` (Matriks Akses `techlead_03`); FE tidak perlu menangani kasus
  "belum masuk".
- **Info Kontak tampil apa adanya, termasuk daftar kosong** — `SA-28`
  tidak pernah gagal secara bisnis; belum ada baris `ContactInfo`
  tersimpan bukan skenario yang diuji AC manapun (beda dari Project/Post
  yang punya AC-003-2/AC-005-2 khusus status kosong) — FE cukup render
  daftar (mungkin kosong) apa adanya, tanpa state kosong khusus.
- **`ContactForm` mengelola 4 state**: normal → memuat (saat submit
  berjalan, tombol nonaktif+penanda sibuk) → **terkirim** (`StatusMessage`
  sukses, seluruh isian dikosongkan, AC-008-1) ATAU **error-validasi**
  (`error.fields` dari `SA-29` dipetakan ke `FormField` masing-masing,
  isian TIDAK dikosongkan, AC-008-2).
- **Catatan kepercayaan di bawah tombol** — teks statis di kode, TANPA
  data/props/state; tidak disebut di elements table manapun.
- **`SectionHeader` (C-23, varian rata-tengah), `ContactLink` (C-07),
  `FormField` (C-08), `StatusMessage` (C-13) dipakai apa adanya** dari
  `shared/` — issue ini tidak memperluas anatominya, cuma `ContactLink`
  disusun ulang jadi baris horizontal (styling, bukan varian baru).
- **`Button` (C-01) diperluas** +ikon opsional (dekoratif) — dipakai
  `[Kirim Pesan]`; varian primer/sekunder/bahaya & perilaku lain tidak
  berubah.

## Auth & Permission

Publik, tanpa sesi — sama seperti seluruh SCR-01 s.d. SCR-07. `SA-29`
tetap publik walau menulis data (lihat Aturan Bisnis).

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya** (`shared/`, tidak dibangun
ulang): Navbar (C-02), ThemeToggle (C-03), Footer (C-22), SectionHeader
(C-23, varian rata-tengah), ContactLink (C-07), FormField (C-08),
StatusMessage (C-13) — seluruhnya sejak `ISS-025`.

**Diperluas di issue ini:**

| Komponen | Lokasi | Perubahan |
|----------|--------|-----------|
| Button (C-01) | `shared/components/Button.tsx` (SUDAH ADA sejak ISS-025) | + ikon opsional (dekoratif) |

**Dibangun di issue ini:**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| ContactForm | `app/(public)/contact/_components/` (co-located) | Baru dipakai 1 fitur (Contact); Client Component (batas interaktivitas, bukan komponen desain-sistem C-XX) |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** tanpa aset visual baru — ikon kirim & ikon gembok adalah ikon
dari pustaka ikon proyek (bukan unggahan); Info Kontak sudah dikelola
lewat admin sejak fitur Kelola Info Kontak.

## Struktur File (referensi awal)

```
src/app/(public)/contact/
├── page.tsx                        ← SCR-07 Contact — Server Component,
│                                       getContactInfo() (SA-28); merender
│                                       Contact Hero (SectionHeader reuse)
│                                       + Info Kontak (ContactLink) +
│                                       <ContactForm />
└── _components/
    └── ContactForm.tsx              ← BARU, Client Component ("use client"),
                                         sendMessage (SA-29) via action form;
                                         state memuat/error-validasi/terkirim
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getContactInfo`/`sendMessage` SUDAH ADA (dibangun ISS-015 —
`features/contact/contact.action.ts` & `features/messages/
messages.action.ts`); issue ini cuma memanggilnya, tidak membuat ulang.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/(public)/contact/page.tsx` — Contact Hero + Info Kontak +
      `<ContactForm />` sesuai Spesifikasi Layar.
- [ ] `ContactForm` (Client Component) — Nama/Email/Pesan + submit ke
      `sendMessage` (`SA-29`), state memuat/error-validasi/terkirim.
- [ ] `Button` (C-01) diperluas +ikon opsional sesuai §Aset & Design
      System.
- [ ] Info Kontak render apa adanya dari `getContactInfo()` (termasuk
      daftar kosong, tanpa state kosong khusus).
- [ ] State error-validasi per bagian (`error.fields` → `FormField`,
      AC-008-2).
- [ ] State terkirim — formulir dikosongkan, `StatusMessage` sukses
      (AC-008-1).

**Out of Scope**
- Navbar, Footer, ThemeToggle, kerangka route — sudah ISS-025.
- Peta lokasi, jam operasional, live chat, FAQ — tidak ada di F-05 BA
  maupun referensi visual manapun (A-019 uiux.yaml).
- Konten halaman lain (Home, About, Portfolio, Blog, admin) — issue
  fitur masing-masing.
- Endpoint `getContactInfo`/`sendMessage` — sudah selesai (ISS-015).
- Kelola Info Kontak admin (`SA-10/11/12`, SCR-15) & baca daftar pesan
  admin (`SA-34`, SCR-16) — `ISS-020`/`ISS-021`.

## Acceptance Criteria

- [ ] Pengunjung membuka halaman Contact → info kontak yang dikelola
      admin tampil (AC-007-1).
- [ ] Pengunjung mengisi formulir dengan lengkap lalu mengirimnya →
      pengunjung melihat tanda pesan terkirim, dan pesan itu muncul di
      kotak pesan halaman admin (AC-008-1).
- [ ] Pengunjung mengirim formulir dengan isian wajib kosong → pesan
      tidak terkirim, pengunjung melihat pemberitahuan bagian yang harus
      diisi (AC-008-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban: Info Kontak tampil sesuai data admin,
      jalur sukses & gagal `[Kirim Pesan]` (termasuk validasi per
      bagian), state memuat tidak bisa ditekan ulang, pesan yang
      terkirim benar-benar muncul di kotak pesan admin.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-07 — `docs/uiux_02_wireframe.md`; FLOW-08,
  FLOW-09 — `docs/uiux_01_user_flow.md`
- **Design system:** C-01/02/03/07/08/13/22/23 —
  `docs/uiux_03_design_system.md`; referensi visual client —
  `docs/layout/contact/` (D-023 uiux)
- **Kontrak API:** `SA-28`, `SA-29` — `docs/techlead_03_api_contract.md`
  (keduanya TIDAK berubah sejak awal — pre-check ISS-030 mengonfirmasi
  sinkron dengan `ISS-015`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-007-1, AC-008-1, AC-008-2 —
  `docs/ba_03_acceptance_criteria.md`
