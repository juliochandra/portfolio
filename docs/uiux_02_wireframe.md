# WIREFRAMES: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-16 |
| **Versi** | 1.8 |
| **Sumber** | Set BA v6.0 (FEATURE + USER_STORY + ACCEPTANCE_CRITERIA) |
| **Konteks** | docs/pm_01_project.md v1.6 |
| **Disusun oleh** | UI/UX Agent |
| **Set dokumen** | uiux_01_user_flow.md · uiux_02_wireframe.md · uiux_03_design_system.md |

## Ringkasan

19 layar (7 publik + 12 kelola), dideskripsikan mobile-first. Sisi publik
seluruhnya berbahasa Indonesia; nama halaman (Home, About, Portfolio, Blog,
Contact) dipertahankan sebagai nama diri dari client (A-001). Sisi
kelola/admin memakai **bahasa campuran**: label navigasi & nama modul teknis
berbahasa Inggris (Dashboard, Posts, Projects, Tags, Skills, Media, Messages,
Contact Info, Password — referensi desain admin client, pm_01 D009), sisa
teks kelola (isian form, tombol, pesan status, dialog) tetap Bahasa Indonesia
(uiux-agent 07 aturan 6). Kedua sisi mendukung mode terang & gelap lewat
SaklarTema (C-03).

**v1.8** (perbaikan bug, bukan requirement baru): SCR-01 bagian Keahlian
tidak lagi menyebut "Selengkapnya di About →" (D-015) — leftover dari sebelum
Keahlian dipindah eksklusif ke Home (pm_01 D006); ditemukan Issue Planner saat
memecah backlog karena tautannya menuju halaman yang sudah tidak menampilkan
data itu.

## Cara Membaca

```
[ ] tombol · ( ) pilihan · [v] centang · ___ isian · { } placeholder aset
<  kembali · ≡ menu lipat · ⋮ aksi lain · ——— pemisah
```
Setiap layar ditulis sebagai daftar bagian (urutan atas → bawah); tiap bagian
dijabarkan sebagai bullet posisi → isi (kiri/tengah/kanan untuk bagian sejajar
horizontal). Deskripsi disusun untuk layar sempit (HP); perilaku layar lebar
ditulis sebagai catatan delta.

## Wireframes

### SCR-01 — Home

*Melayani: US-001, US-019, US-017 · Dirujuk: FLOW-01, FLOW-02, FLOW-19 · State: normal, kosong*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar
2. Hero
3. Keahlian
4. Project Unggulan
5. Tulisan Terbaru
6. Ajakan
7. Footer

**Navbar**
- Kiri: nama pemilik
- Kanan: ☀/☾ · ≡ menu (lipat di layar sempit; layar lebar: Home · About · Portfolio · Blog · Contact berjajar)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | ≡ / baris menu | MenuUtama (C-02) | Menuju halaman lain; halaman aktif ditandai (AC-001-1) |
| 2 | ☀/☾ | SaklarTema (C-03) | Ganti mode terang ↔ gelap seketika (Preferensi Visual, D-003) |

**Hero**
- Atas: {foto profil — opsional, dari pemilik}
- Tengah: "Halo, saya {nama}" · "{profesi — mis. Developer}" · satu kalimat ringkasan
- Bawah: [Unduh CV]  [Lihat Portfolio]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 3 | [Unduh CV] | TombolUtama (C-01, primer) | Mengunduh berkas CV (AC-017-1); muncul juga di Ajakan (D-006) |
| 4 | [Lihat Portfolio] | TombolUtama (C-01, sekunder) | Menuju SCR-03 |

**Keahlian**
- Judul bagian: "Keahlian"
- Daftar seluruh keahlian (dari isian admin, SCR-14) — bukan cuplikan; tanpa
  halaman lengkap terpisah, karena Keahlian eksklusif tampil di Home (pm_01
  D006, D-009 uiux — dihapus dari About)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 5 | Tag | TagKeahlian (C-06) | Statis (AC-019-1); tidak menuju halaman lain — perbaikan bug D-015 uiux: sebelumnya menyebut "Selengkapnya di About", padahal About sudah tidak menampilkan keahlian sejak D-009 |

**Project Unggulan**
- Judul bagian: "Project Unggulan" + tautan "Lihat semua →"
- 3 kartu project terbaru (A-002, A-003)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 6 | Kartu project | KartuProject (C-04) | Seluruh kartu bisa ditekan → SCR-04 (AC-019-1); layar lebar: 3 kolom |
| 7 | "Lihat semua →" | — (tautan accent) | Menuju SCR-03 |

**Tulisan Terbaru**
- Judul bagian: "Tulisan Terbaru" + tautan "Lihat semua →"
- 3 item tulisan terbaru (berstatus Terbit), list 1 kolom penuh lebar — gaya
  medium.com, tanpa bingkai kartu, dipisah garis antar-item, gambar thumbnail
  kecil di kanan tiap baris bila diisi admin (A-002, A-003, D-008/D-013)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 8 | Item tulisan | ItemTulisan (C-05) | Seluruh baris bisa ditekan → SCR-06 (AC-019-1) |
| 9 | "Lihat semua →" | — (tautan accent) | Menuju SCR-05 |

**Ajakan**
- Tengah: "Tertarik bekerja sama?" · [Hubungi Saya]  [Unduh CV]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 10 | [Hubungi Saya] | TombolUtama (C-01, primer) | Menuju SCR-07 (AC-019-2) |
| 11 | [Unduh CV] | TombolUtama (C-01, sekunder) | Mengunduh berkas CV (AC-019-2, AC-017-1) |

**Footer**
- Tengah: nama pemilik · © tahun — statis, tanpa anotasi

**State: kosong** — belum ada project dan/atau tulisan yang tayang: bagian sorotan
yang datanya kosong **disembunyikan seluruhnya** (judul ikut hilang); Hero,
Keahlian, Ajakan, Footer tetap tampil — halaman tetap wajar (AC-019-3).

Catatan layar lebar: section tetap satu kolom terpusat (lebar baca nyaman);
kartu Project Unggulan 3 kolom; Tulisan Terbaru **tetap 1 kolom penuh lebar**
di semua ukuran layar (gaya medium.com, D-008) — tidak ikut jadi grid.

### SCR-02 — About

*Melayani: US-002, US-020 · Dirujuk: FLOW-03, FLOW-20 · State: normal*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. About Hero
3. Engineering Principles
4. Development Workflow
5. Current Focus
6. Beyond Code
7. Footer

**About Hero**
- Atas: {foto profil}
- Tengah: nama & profesi pemilik + perkenalan singkat — teks statis, ditulis
  langsung di kode (pm_01 D007, bukan dikelola admin)

**Engineering Principles**
- Judul bagian: "Engineering Principles"
- Isi: teks bebas, statis di kode — prinsip kerja teknis pemilik

**Development Workflow**
- Judul bagian: "Development Workflow"
- Isi: teks bebas, statis di kode — alur kerja pemilik

**Current Focus**
- Judul bagian: "Current Focus"
- Isi: teks bebas, statis di kode — fokus pemilik saat ini

**Beyond Code**
- Judul bagian: "Beyond Code"
- Isi: teks bebas, statis di kode — sisi personal pemilik di luar coding

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Foto + perkenalan | — (teks) | About Hero statis (AC-002-1) |
| 2 | Engineering Principles | SeksiTeks (C-15) | Statis (AC-020-1) |
| 3 | Development Workflow | SeksiTeks (C-15) | Statis (AC-020-2) |
| 4 | Current Focus | SeksiTeks (C-15) | Statis (AC-020-3) |
| 5 | Beyond Code | SeksiTeks (C-15) | Statis (AC-020-4) |

Catatan: keahlian **tidak** ditampilkan di sini — cukup di Home (D006 pm_01,
D-009 uiux), menghindari redundansi.

### SCR-03 — Portfolio (daftar)

*Melayani: US-003 · Dirujuk: FLOW-04, FLOW-05, FLOW-11 · State: normal, kosong*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. Portfolio Hero
3. Daftar Project
4. Footer

**Portfolio Hero**
- Judul halaman: "Portfolio"
- Tagline: satu kalimat pembuka statis (mis. "Kumpulan project yang pernah
  saya kerjakan.") — sama untuk semua pengunjung, bukan dikelola admin (D-010)

**Daftar Project**
- Daftar kartu project berstatus Terbit (nama + gambaran singkat + tag
  keahlian + {gambar bila ada}), satu kolom di layar sempit

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Kartu project | KartuProject (C-04) | Seluruh kartu bisa ditekan → SCR-04 (AC-003-1); layar lebar: 2–3 kolom |

**State: kosong** — teks "Belum ada project untuk ditampilkan." di tengah area
daftar; navbar, Portfolio Hero, & footer tetap (AC-003-2).

### SCR-04 — Detail Project

*Melayani: US-004 · Dirujuk: FLOW-05, FLOW-02 · State: normal*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. Header Project
3. Isi Project
4. Footer

**Header Project**
- Kiri: < Kembali ke Portfolio

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | < Kembali ke Portfolio | NavKembali (C-09) | Kembali ke posisi daftar di SCR-03 |

**Isi Project**
- Atas: nama project + tag keahlian
- Tengah: {gambar project — bila ada}, deskripsi lengkap, "Peran saya: {peran}"
- Bawah: [Lihat Demo]  [Lihat Kode] — masing-masing hanya tampil bila tautannya ada

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 2 | Deskripsi + peran | — (teks) | Isi wajib AC-004-1: deskripsi, peran pemilik |
| 3 | [Lihat Demo] [Lihat Kode] | TombolUtama (C-01, sekunder) | Hanya tampil bila tautan ada (AC-004-1); membuka tab baru |
| 4 | Tag | TagKeahlian (C-06) | Statis |

### SCR-05 — Blog (daftar)

*Melayani: US-005 · Dirujuk: FLOW-06, FLOW-07, FLOW-13 · State: normal, kosong*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. Blog Hero
3. Daftar Tulisan
4. Footer

**Blog Hero**
- Judul halaman: "Blog"
- Tagline: satu kalimat pembuka statis (mis. "Tulisan seputar hal yang saya
  pelajari dan kerjakan.") — sama untuk semua pengunjung, bukan dikelola
  admin (D-011, pola sama D-010)

**Daftar Tulisan**
- Daftar item tulisan berstatus Terbit (judul + tanggal + cuplikan 2 baris +
  thumbnail kanan bila diisi admin), urut terbaru di atas — list 1 kolom
  penuh lebar di **semua** ukuran layar, gaya medium.com, tanpa grid (D-008/
  D-013; beda dari SCR-03 Portfolio yang 2–3 kolom)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Item tulisan | ItemTulisan (C-05) | Seluruh baris bisa ditekan → SCR-06; urut terbaru (AC-005-1, Assumption BA A-002) |

**State: kosong** — teks "Belum ada tulisan." di tengah area daftar; navbar,
Blog Hero, & footer tetap (AC-005-2).

### SCR-06 — Detail Tulisan

*Melayani: US-006 · Dirujuk: FLOW-07, FLOW-02 · State: normal*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. Header Tulisan
3. Isi Tulisan
4. Footer

**Header Tulisan**
- Kiri: < Kembali ke Blog

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | < Kembali ke Blog | NavKembali (C-09) | Kembali ke daftar di SCR-05 |

**Isi Tulisan**
- Judul tulisan + tanggal terbit
- Isi tulisan utuh, lebar baris nyaman dibaca (AC-006-1)
- **Tidak ada area komentar dalam bentuk apa pun** (AC-006-2, Out of Scope) —
  halaman berakhir di isi tulisan + footer

### SCR-07 — Contact

*Melayani: US-007, US-008 · Dirujuk: FLOW-08, FLOW-09, FLOW-16 · State: normal, error-validasi, memuat, terkirim*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Navbar — sama dengan SCR-01
2. Contact Hero
3. Info Kontak
4. Formulir Pesan
5. Footer

**Contact Hero**
- Judul halaman: "Contact"
- Tagline: satu kalimat pembuka statis (mis. "Ada peluang kerja sama? Hubungi
  saya lewat salah satu saluran di bawah, atau kirim pesan langsung.") — sama
  untuk semua pengunjung, bukan dikelola admin (D-011, pola sama D-010)

**Info Kontak**
- Daftar saluran: ✉ email · tautan lain — sesuai isian admin (SCR-15)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Saluran kontak | TautanKontak (C-07) | Email → aplikasi surel; tautan lain → tab baru (AC-007-1) |

**Formulir Pesan**
- Judul: "Kirim Pesan"
- Nama * : ___________________
- Email * : ___________________
- Pesan * : ___________________ (beberapa baris)
- Aksi: [Kirim Pesan]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 2 | Isian nama/email/pesan | FormIsian (C-08) | Tanda * = wajib (Assumption BA A-007); error per bagian |
| 3 | [Kirim Pesan] | TombolUtama (C-01, primer) | Kirim → state memuat → terkirim (AC-008-1) / error-validasi (AC-008-2) |

**State: error-validasi** — isian wajib yang kosong dibingkai danger + pesan di
bawah isian itu ("Bagian ini wajib diisi"); pesan tidak terkirim (AC-008-2).

**State: memuat** — [Kirim Pesan] menunjukkan penanda sibuk dan tidak bisa
ditekan ulang selama proses.

**State: terkirim** — PesanStatus (C-13) berhasil: "Pesan terkirim. Terima kasih!";
formulir dikosongkan (AC-008-1).

### SCR-08 — Masuk Admin

*Melayani: US-009 · Dirujuk: FLOW-10, FLOW-17 · State: normal, gagal-masuk*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Form Masuk

**Form Masuk**
- Tengah layar: "Halaman Admin — {nama pemilik}"
- Nama pengguna/email * : ___________________
- Kata sandi * : ___________________
- Aksi: [Masuk]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Isian data masuk | FormIsian (C-08) | Wajib keduanya |
| 2 | [Masuk] | TombolUtama (C-01, primer) | Berhasil → SCR-09 (AC-009-1); salah → state gagal-masuk |

**State: gagal-masuk** — PesanStatus (C-13) gagal di atas form: "Data masuk
keliru. Periksa kembali." — tanpa merinci bagian mana yang salah (AC-009-2);
isian tidak dikosongkan.

### SCR-09 — Dashboard

*Melayani: US-009, US-016 · Dirujuk: FLOW-10, FLOW-17 · State: normal, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin
2. Ringkasan Statistik
3. Aktivitas Terbaru
4. Pintasan Cepat

**Header Admin** *(kerangka ini dipakai identik oleh SCR-10 s.d. SCR-19 — D-005;
label menu berkelompok & berbahasa Inggris — pm_01 D009, referensi desain
admin client)*
- Kiri: nama pemilik + "CMS Dashboard"
- Kanan: ☀/☾ · [Keluar]
- Menu (berkelompok): **Overview** (Dashboard) · **Content** (Posts, Projects,
  Tags, Skills, Media) · **Communication** (Messages, Contact Info) ·
  **System** (Password)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Header + menu | MenuAdmin (C-10) | Menu berkelompok, label Inggris; layar sempit: ≡; bagian aktif ditandai |
| 2 | ☀/☾ | SaklarTema (C-03) | Sama dengan sisi publik (D-003) |
| 3 | [Keluar] | bagian MenuAdmin (C-10) | Selalu terlihat tanpa membuka menu; akhiri sesi → SCR-08 (AC-016-1) |

**Ringkasan Statistik**
- 4 kartu: Total Posts (+ jumlah Published) · Total Projects (+ jumlah
  Published) · Total Tags · Total Skills

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 4 | Kartu statistik | KartuStatistik (C-18) | Statis, angka hasil hitung otomatis; murni pemanis tampilan, non-blocking (pm_01 D009) |

**Aktivitas Terbaru**
- Dua kolom (layar lebar) / bertumpuk (layar sempit): "Recent Posts" &
  "Recent Projects", masing-masing 5 item terbaru (semua status)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 5 | Baris ringkasan | BarisRingkasan (C-19) | Bisa ditekan → form ubah item itu; "Lihat semua →" menuju SCR-10/SCR-12 |

**Pintasan Cepat**
- Baris tombol: [+ Tulisan Baru] · [+ Project Baru] · [+ Keahlian Baru] ·
  [Unggah Media] · [Lihat Pesan] · [Info Kontak]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 6 | Tombol pintasan | PintasanAksi (C-21) | Menuju form tambah/halaman kelola terkait |

**State: terlarang** *(berlaku untuk semua layar kelola)* — tanpa sesi admin,
membuka alamat layar ini mengalihkan ke SCR-08; tidak ada bagian pengelolaan
yang tampil (AC-009-3).

### SCR-10 — Kelola Project

*Melayani: US-010, US-011 · Dirujuk: FLOW-11, FLOW-12 · State: normal, kosong, konfirmasi-hapus, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Daftar Kelola Project

**Daftar Kelola Project**
- Atas: judul "Projects" · [+ Tambah Project]
- Daftar baris: nama project + gambaran singkat + **badge status** (Draft/
  Published/Archived) + aksi Ubah · Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | [+ Tambah Project] | TombolUtama (C-01, primer) | → SCR-11 kosong (FLOW-11) |
| 2 | Baris project | BarisKelola (C-11) | Ubah → SCR-11 terisi; Hapus → DialogKonfirmasi |
| 3 | Dialog hapus | DialogKonfirmasi (C-12) | Konfirmasi dulu; Hapus = danger (AC-011-2, A-004) |
| 4 | Pesan hasil | PesanStatus (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada project. Tambahkan yang pertama." + [+ Tambah Project].

**State: konfirmasi-hapus** — dialog: "Hapus project '{nama}'? Tindakan ini
tidak bisa dibatalkan." [Batal] [Hapus].

**State: terlarang** — lihat SCR-09.

### SCR-11 — Form Project

*Melayani: US-010, US-011 · Dirujuk: FLOW-11, FLOW-12 · State: normal, error-validasi, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Project

**Form Project**
- Atas: < Kembali ke Project · judul "Tambah Project" / "Ubah Project"
- Nama project * : ___________________
- Gambaran singkat * : ___________________
- Deskripsi lengkap : ___________________ (beberapa baris — dapat memuat
  peran pemilik di sini, G-013 BA)
- Tautan demo : ___________________  · Tautan kode : ___________________
- Gambar : {pilih dari galeri Media atau unggah baru — opsional}
- Keahlian/Tech Stack : {pilih dari daftar Keahlian, bisa lebih dari satu — opsional}
- Tag : {pilih dari daftar Tag, bisa lebih dari satu — opsional; direvisi dari
  input bebas, G-014 BA}
- Status : ( ) Draft  ( ) Published  ( ) Archived — default **Draft** untuk project baru
- Aksi: [Simpan]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | < Kembali | NavKembali (C-09) | Kembali ke SCR-10 tanpa menyimpan |
| 2 | Isian | FormIsian (C-08) | * = wajib; error per bagian (AC-010-2) |
| 3 | Status | PilihanStatus (C-16) | Draft/Published/Archived; hanya Published tampil di Portfolio publik (AC-010-1, AC-011-3, AC-011-4) |
| 4 | [Simpan] | TombolUtama (C-01, primer) | Tersimpan → SCR-10 + pesan berhasil; status Published tampil di publik (AC-010-1, AC-011-1) |

**State: error-validasi** — bagian wajib kosong dibingkai danger + pesan di bawah
isian; tidak tersimpan (AC-010-2).

**State: terlarang** — lihat SCR-09.

### SCR-12 — Kelola Tulisan

*Melayani: US-012, US-013 · Dirujuk: FLOW-13, FLOW-14 · State: normal, kosong, konfirmasi-hapus, terlarang*

Struktur = SCR-10 dengan penyesuaian:

- Judul "Posts" · [+ Tulis Tulisan] → SCR-13.
- Baris: judul tulisan + tanggal terbit + **badge status** (Draft/Published/
  Archived) + aksi Ubah · Hapus (BarisKelola C-11).
- **State kosong:** "Belum ada tulisan. Tulis yang pertama."
- **State konfirmasi-hapus:** dialog "Hapus tulisan '{judul}'?..." (C-12, AC-013-2).
- **State terlarang** — lihat SCR-09.

### SCR-13 — Form Tulisan

*Melayani: US-012, US-013 · Dirujuk: FLOW-13, FLOW-14 · State: normal, error-validasi, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Tulisan

**Form Tulisan**
- Atas: < Kembali ke Tulisan · judul "Tulis Tulisan" / "Ubah Tulisan"
- Judul * : ___________________
- Isi * : ___________________ (area tulis panjang)
- Gambar Sampul : {pilih dari galeri Media atau unggah baru — opsional, untuk
  thumbnail list & pratinjau saat dibagikan; tidak tampil di isi tulisan}
- Tag : {pilih dari daftar Tag, bisa lebih dari satu — opsional; direvisi dari
  input bebas, G-014 BA}
- Status : ( ) Draft  ( ) Published  ( ) Archived — default **Draft** untuk tulisan baru
- Aksi: [Simpan]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | < Kembali | NavKembali (C-09) | Kembali ke SCR-12 tanpa menyimpan |
| 2 | Judul & Isi | FormIsian (C-08) | Wajib; error per bagian (AC-012-2) |
| 3 | Status | PilihanStatus (C-16) | Draft/Published/Archived; hanya Published tampil di Blog publik (AC-012-1, AC-013-3, AC-013-4) |
| 4 | [Simpan] | TombolUtama (C-01, primer) | Status Published → langsung tayang di Blog publik (AC-012-1; menggantikan asumsi lama "tanpa draf", BA A-006 direvisi) |

**State: error-validasi** — judul kosong ditandai + pesan; tidak tersimpan (AC-012-2).

**State: terlarang** — lihat SCR-09.

### SCR-14 — Kelola Keahlian

*Melayani: US-014 · Dirujuk: FLOW-15 · State: normal, kosong, konfirmasi-hapus, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Tambah Keahlian
3. Daftar Keahlian

**Form Tambah Keahlian**
- Atas: judul "Skills"
- Nama * : ___________________
- Ikon * : {pilih dari daftar ikon tech-stack}
- Aksi: [+ Tambah]

**Daftar Keahlian**
- Baris per keahlian: ikon + nama + aksi Ubah/Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah | FormIsian (C-08) | Simpan → keahlian baru masuk daftar & tampil di ringkasan Home (AC-014-1) |
| 2 | Baris keahlian | BarisKelola (C-11) | Ubah → form terisi data lama; Hapus → DialogKonfirmasi (AC-014-2) |
| 3 | Pesan hasil | PesanStatus (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — teks "Belum ada keahlian." di tengah area daftar.

**Catatan:** data identitas pemilik (foto, perkenalan/About Hero, Engineering
Principles, Development Workflow, Current Focus, Beyond Code, berkas CV) TIDAK
lagi dikelola dari halaman admin — bersifat statis, ditulis langsung di kode
(pm_01 D007). Layar "Ubah Profil" yang lama dihapus.

**State: konfirmasi-hapus** — dialog: "Hapus keahlian '{nama}'? Tindakan ini
tidak bisa dibatalkan." [Batal] [Hapus].

**State: terlarang** — lihat SCR-09.

### SCR-15 — Contact Info

*Melayani: US-015 · Dirujuk: FLOW-16 · State: normal, kosong, konfirmasi-hapus, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Tambah Saluran
3. Daftar Saluran

**Form Tambah Saluran** *(dirombak dari form singleton "Ubah Info Kontak" —
kini CRUD per baris, pola sama SCR-14, mengikuti skema ContactInfo flat
multi-baris — techlead_02 D-013)*
- Atas: judul "Contact Info"
- Label * : ___________________ (mis. "Email", "LinkedIn")
- Nilai * : ___________________ (alamat/tautan saluran)
- Ikon : {pilih dari daftar ikon}
- Aksi: [+ Tambah]

**Daftar Saluran**
- Baris per saluran: ikon + label + nilai + aksi Ubah/Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah | FormIsian (C-08) | Simpan → saluran baru masuk daftar & tampil di Contact publik (AC-015-1) |
| 2 | Baris saluran | BarisKelola (C-11) | Ubah → form terisi data lama; Hapus → DialogKonfirmasi |
| 3 | Dialog hapus | DialogKonfirmasi (C-12) | Konfirmasi dulu; Hapus = danger |
| 4 | Pesan hasil | PesanStatus (C-13) | "Tersimpan" / "Terhapus" setelah aksi (AC-015-1) |

**State: kosong** — teks "Belum ada saluran kontak. Tambahkan yang pertama."
di tengah area daftar.

**State: konfirmasi-hapus** — dialog: "Hapus saluran '{label}'? Tindakan ini
tidak bisa dibatalkan." [Batal] [Hapus].

**State: terlarang** — lihat SCR-09.

### SCR-16 — Messages

*Melayani: US-018 · Dirujuk: FLOW-18 · State: normal, kosong, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Tab Pesan
3. Daftar Pesan

**Tab Pesan**
- ( Active )  ( Archived ) — default tab Active terbuka (label Inggris,
  konsisten status MessageStatus — pm_01 D009)

**Daftar Pesan**
- Judul: "Messages"
- Daftar kartu pesan, urut terbaru di atas; tiap kartu: penanda belum-dibaca
  (titik/tebal bila status UNREAD) · nama pengirim · email · waktu · isi pesan
  utuh · aksi [Arsipkan] (tab Active) / [Kembalikan] (tab Archived) (A-005, AC-018-3, AC-018-4)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Kartu pesan | KartuPesan (C-14) | Urut terbaru (AC-018-1); membuka/menampilkan kartu menandai pesan sudah dibaca otomatis (AC-018-3); email pengirim bisa ditekan → aplikasi surel untuk membalas |
| 2 | [Arsipkan] / [Kembalikan] | TombolUtama (C-01, sekunder) | Pindah antar tab Active ↔ Archived, tanpa menghapus (AC-018-4) |

**State: kosong** — "Belum ada pesan masuk." (tab Active) / "Belum ada pesan diarsipkan." (tab Archived) (AC-018-2).

**State: terlarang** — lihat SCR-09.

### SCR-17 — Tags

*Melayani: US-021 · Dirujuk: FLOW-21 · State: normal, kosong, konfirmasi-hapus, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Tambah Tag
3. Daftar Tag

**Form Tambah Tag** *(pola sama SCR-14 Skills — dipakai bersama Project &
Tulisan, halaman kelola baru menggantikan pola inline lama, G-014 BA)*
- Atas: judul "Tags"
- Nama * : ___________________
- Aksi: [+ Tambah]

**Daftar Tag**
- Baris per tag: nama + aksi Ubah/Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah | FormIsian (C-08) | Simpan → tag baru masuk daftar & tersedia dipilih di Form Project/Tulisan (AC-021-1) |
| 2 | Baris tag | BarisKelola (C-11) | Ubah → form terisi data lama; Hapus → DialogKonfirmasi (AC-021-2) |
| 3 | Pesan hasil | PesanStatus (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — teks "Belum ada tag. Tambahkan yang pertama." di tengah
area daftar.

**State: konfirmasi-hapus** — dialog: "Hapus tag '{nama}'? Project/Tulisan
yang memakainya tidak ikut terhapus, cuma kehilangan tag ini." [Batal] [Hapus].

**State: terlarang** — lihat SCR-09.

### SCR-18 — Media

*Melayani: US-022 · Dirujuk: FLOW-22 · State: normal, kosong, mengunggah, konfirmasi-hapus, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Galeri Media

**Galeri Media**
- Atas: judul "Media" · [+ Unggah Gambar]
- Grid thumbnail (2 kolom layar sempit, 4–6 kolom layar lebar): tiap kartu =
  gambar + nama file + ukuran + [Hapus]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | [+ Unggah Gambar] | TombolUtama (C-01, primer) | Buka pemilih file → unggah → masuk galeri (AC-022-1) |
| 2 | Kartu media | KartuMedia (C-20) | Urut terbaru; [Hapus] → DialogKonfirmasi |
| 3 | Dialog hapus | DialogKonfirmasi (C-12) | Konfirmasi dulu; Hapus = danger (AC-022-3) |
| 4 | Pesan hasil | PesanStatus (C-13) | "Terunggah" / "Terhapus" setelah aksi |

**State: kosong** — teks "Belum ada gambar. Unggah yang pertama." +
[+ Unggah Gambar] di tengah area galeri (AC-022-2).

**State: mengunggah** — kartu placeholder dengan penanda sibuk selama proses unggah.

**State: konfirmasi-hapus** — dialog: "Hapus gambar '{nama file}'? Bila masih
dipakai di Project/Tulisan, tautannya di sana tidak otomatis kosong."
[Batal] [Hapus].

**State: terlarang** — lihat SCR-09.

### SCR-19 — Password

*Melayani: US-023 · Dirujuk: FLOW-23 · State: normal, error-validasi, tersimpan, terlarang*

**State: normal**

**Bagian (urutan tampil, atas → bawah):**
1. Header Admin — sama dengan SCR-09
2. Form Ubah Kata Sandi

**Form Ubah Kata Sandi**
- Atas: judul "Password"
- Kata sandi lama * : ___________________
- Kata sandi baru * : ___________________
- Konfirmasi kata sandi baru * : ___________________
- Aksi: [Simpan]

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Isian | FormIsian (C-08) | * = wajib; error per bagian (AC-023-2) |
| 2 | [Simpan] | TombolUtama (C-01, primer) | Kata sandi lama benar & konfirmasi cocok → state tersimpan (AC-023-1) |

**State: error-validasi** — kata sandi lama salah, atau kata sandi baru &
konfirmasi tidak cocok → dibingkai danger + pesan di bawah isian; tidak
tersimpan (AC-023-2).

**State: tersimpan** — PesanStatus (C-13): "Kata sandi berhasil diganti." (AC-023-1).

**State: terlarang** — lihat SCR-09.

## Assumptions

- Label menu memakai nama halaman dari client (Home · About · Portfolio · Blog ·
  Contact) sebagai nama diri; sisi publik seluruh teks lain berbahasa
  Indonesia (G-001, sisi admin lihat G-008).
- Cuplikan Home = 3 project terbaru + 3 tulisan terbaru; sorotan yang datanya
  kosong disembunyikan (G-002, G-003).
- Konfirmasi hapus berbentuk dialog dengan aksi danger (G-004).
- Pesan dibaca langsung di daftar Kotak Pesan — isi utuh di kartu, tanpa layar
  detail (G-005).
- Status Draft/Published/Archived (Project/Tulisan) dipilih lewat satu isian
  dropdown/radio di form yang sama, bukan tombol simpan terpisah; label opsi
  berbahasa Inggris mengikuti nilai enum (G-006, direvisi 2026-07-16 — lihat G-008).
- Pesan diarsipkan lewat dua tab terpisah (Active/Archived) di Messages, bukan
  filter/dropdown — konsisten pola tab sederhana untuk admin non-teknis
  (G-007, label direvisi 2026-07-16 — lihat G-008).
- Sisi admin memakai bahasa campuran: label navigasi/modul/status berbahasa
  Inggris (referensi desain client), sisa teks kelola tetap Bahasa Indonesia
  (G-008, pm_01 D009 — perbaikan kesalahan framework uiux-agent lama yang
  menyamakan bahasa seluruh UI dengan bahasa konten publik).
- Dashboard (SCR-09) murni pemanis tampilan — kartu statistik & aktivitas
  terbaru tidak dituntut AC manapun, non-blocking (G-009, klarifikasi user
  2026-07-16).
- Isian Tag di Form Project/Tulisan berubah dari input bebas jadi pilih-dari-
  daftar, mengikuti Tag yang kini punya halaman kelola sendiri (G-010,
  konsisten G-014 BA direvisi).
- Unggah gambar bisa lewat halaman Media langsung atau inline dari form
  Project/Tulisan — keduanya masuk galeri yang sama (G-011).
- Ubah kata sandi mewajibkan verifikasi kata sandi lama sebelum kata sandi
  baru disimpan (G-012).

## Open Questions

- "Project unggulan" saat ini = project terbaru (G-002). Bila pemilik ingin
  **memilih sendiri** project yang disorot, itu kemampuan baru (penanda unggulan
  di Form Project) — diusulkan untuk siklus PM/BA berikutnya.
- AC-001-4 ("website muncul di pencarian Google saat nama pemilik dicari")
  ditutup di sisi sistem, bukan tampilan — diteruskan ke Tech Lead (D-004).

## Handoff

- Dokumen ini bagian dari **set rancangan UI/UX** proyek Portfolio Developer:
  uiux_01_user_flow.md + uiux_02_wireframe.md + uiux_03_design_system.md (versi sama, dibaca bersama).
- **Sumber:** set requirement BA v6.0 (FEATURE + USER_STORY + ACCEPTANCE_CRITERIA),
  konteks docs/pm_01_project.md v1.6.
- **Penerima:** Tech Lead Agent (dan FE Agent saat implementasi).
- **Pertanyaan hilir** tentang tampilan/alur yang tak terjawab set ini = kekurangan
  dokumen UI/UX → dikembalikan ke UI/UX; pertanyaan tentang requirement → ke BA.
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → BA → set ini terbit
  versi baru. Tidak diedit langsung.
