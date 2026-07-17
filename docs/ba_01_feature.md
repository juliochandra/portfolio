# FEATURES: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-16 |
| **Versi** | 6.0 |
| **Sumber** | docs/pm_01_project.md v1.6 |
| **Disusun oleh** | BA Agent |
| **Set dokumen** | ba_01_feature.md · ba_02_user_story.md · ba_03_acceptance_criteria.md |

## Ringkasan

Tujuh Core Feature (6 Must, 1 Should) dibedah menjadi 7 fitur dengan 24 sub-fitur,
menghasilkan 23 user story dan 53 acceptance criteria. Satu gap blocking (tujuan
pesan formulir Contact) dikembalikan ke PM dan terjawab lewat pm_01_project.md
v1.1: pesan masuk ke kotak pesan halaman admin. Versi 4.0 set ini mengikuti
pm_01_project.md v1.4 (D007): data identitas pemilik (About Hero, Engineering
Principles, Development Workflow, Current Focus, Beyond Code, CV) jadi **statis**,
BUKAN dikelola admin — mencabut sebagian D006; F-06.4 dirombak dari "Mengubah
profil" jadi **"Mengelola keahlian"** (tambah/ubah/hapus, pola sama Project/Tulisan).
Versi 5.0 mengikuti pm_01_project.md v1.5 (D008): Project & Tulisan mendapat
status tayang **Draf/Terbit/Arsip** — hanya status Terbit tampil publik;
Pesan masuk mendapat status baca (otomatis saat dibuka admin) dan dapat
diarsipkan. Versi 6.0 mengikuti pm_01_project.md v1.6 (D009): client memberi
referensi desain halaman admin — **Tag** dan **Media** dapat halaman kelola
tersendiri (sebelumnya Tag tanpa CRUD/inline saja, G-014 dicabut), admin
dapat **mengubah kata sandi** akunnya sendiri, dan label navigasi admin
boleh berbahasa Inggris (F-06 dst.). Tujuh belas keputusan analisis
non-blocking terdokumentasi di Assumptions.

## Daftar Fitur

| ID | Fitur | Prioritas | Sumber (pm_01_project.md) | Stories |
|----|-------|-----------|---------------------------|---------|
| F-01 | Halaman Home | Must | Core Features > Halaman Home | US-001, US-019 |
| F-02 | Halaman About | Must | Core Features > Halaman About | US-002 |
| F-03 | Halaman Portfolio | Must | Core Features > Halaman Portfolio | US-003, US-004 |
| F-04 | Halaman Blog | Must | Core Features > Halaman Blog | US-005, US-006 |
| F-05 | Halaman Contact | Must | Core Features > Halaman Contact | US-007, US-008 |
| F-06 | Pengelolaan Konten oleh Admin | Must | Core Features > Pengelolaan konten oleh admin | US-009 s.d. US-016, US-018, US-021 s.d. US-023 |
| F-07 | Unduh CV | Should | Core Features > Unduh CV | US-017 |

## Rincian Fitur

### F-01 — Halaman Home

Halaman pembuka website: pengunjung langsung mengetahui siapa pemilik, melihat
sorotan konten terbaik, dan dapat menuju bagian lain (pm_01_project.md v1.2,
D005). Kriteria kualitas lintas halaman (nyaman di ponsel, seluruh teks
berbahasa Indonesia, ditemukan di Google) dijangkarkan pada fitur ini.

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-01.1 | Melihat halaman pembuka | Nama & profesi pemilik tampil; tersedia jalan ke About, Portfolio, Blog, dan Contact |
| F-01.2 | Melihat sorotan konten beranda | Ringkasan keahlian, cuplikan project unggulan, tulisan terbaru, dan ajakan menghubungi/unduh CV tampil; tiap sorotan mengarah ke halaman lengkapnya. Semua sorotan = komposisi fitur yang sudah ada (F-02/F-03/F-04/F-05/F-07); susunan & urutan blok tetap keputusan UI/UX |

### F-02 — Halaman About

Perkenalan singkat pemilik (About Hero) serta cara berpikir dan cara bekerjanya
(pm_01_project.md v1.3, D006). Keahlian tidak ditampilkan di sini — cukup di
Home (F-01.2), menghindari redundansi.

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-02.1 | Melihat perkenalan diri (About Hero) | Foto, profesi, dan perkenalan singkat pemilik tampil |
| F-02.2 | Melihat Engineering Principles | Prinsip kerja teknis yang dipegang pemilik tampil |
| F-02.3 | Melihat Development Workflow | Alur kerja pemilik saat membangun sebuah project tampil |
| F-02.4 | Melihat Current Focus | Hal yang sedang dipelajari/difokuskan pemilik saat ini tampil |
| F-02.5 | Melihat Beyond Code | Sisi personal pemilik di luar coding (minat/kegiatan) tampil |

### F-03 — Halaman Portfolio

Pengunjung melihat kumpulan project pemilik dan membuka detailnya.

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-03.1 | Melihat daftar project | Kumpulan project **berstatus Terbit** tampil dengan nama & gambaran singkat; kondisi belum-ada-project (Terbit) ditangani wajar (A-010) |
| F-03.2 | Melihat detail project | Satu project dibuka: deskripsi (memuat peran pemilik bila ditulis admin), tautan bila ada (A-001, A-012) |

### F-04 — Halaman Blog

Pengunjung melihat daftar tulisan pemilik dan membacanya. Tanpa fitur komentar
(Out of Scope pm_01_project.md).

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-04.1 | Melihat daftar tulisan | Daftar tulisan **berstatus Terbit** tampil urut dari yang terbaru (A-002); kondisi kosong (Terbit) ditangani wajar |
| F-04.2 | Membaca satu tulisan | Isi tulisan tampil utuh |

### F-05 — Halaman Contact

Pengunjung menemukan info kontak dan dapat mengirim pesan lewat formulir; pesan
tersimpan ke kotak pesan halaman admin (pm_01_project.md v1.1, D004).

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-05.1 | Melihat info kontak | Info kontak (sesuai yang dikelola admin) tampil |
| F-05.2 | Mengirim pesan lewat formulir | Pengunjung mengisi nama, alamat email, dan isi pesan (A-007) lalu mengirim; pesan masuk ke kotak pesan halaman admin |

### F-06 — Pengelolaan Konten oleh Admin

Area terlindung tempat pemilik mengelola seluruh konten — project, tulisan blog,
keahlian, tag, media, info kontak — dan membaca pesan masuk, tanpa bantuan
teknis. Data identitas pemilik (nama, headline, bio, foto, CV) bersifat
statis, tidak dikelola dari sini (pm_01_project.md v1.4, D007).

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-06.1 | Masuk ke halaman admin | Hanya admin ber-akun yang dapat masuk; data masuk salah ditangani jelas |
| F-06.2 | Mengelola project | Menambah, mengubah, menghapus project (siklus kelola dari "CMS lengkap", D-001); mengatur status tayang — Draf (belum tampil publik, default konten baru), Terbit (tampil publik), atau Arsip (pernah terbit, disembunyikan tanpa dihapus) — lewat satu isian status di form yang sama (A-010) |
| F-06.3 | Mengelola tulisan blog | Menambah, mengubah, menghapus tulisan; mengatur status tayang Draf/Terbit/Arsip dengan pola sama Project (A-010) |
| F-06.4 | Mengelola keahlian | Menambah, mengubah, menghapus keahlian (nama + ikon) yang tampil di ringkasan Home (F-01.2); data identitas pemilik (About Hero, Engineering Principles, Development Workflow, Current Focus, Beyond Code) TIDAK dikelola dari sini — bersifat statis (pm_01 D007) |
| F-06.5 | Mengubah info kontak | Info kontak halaman Contact diperbarui admin |
| F-06.6 | Keluar dari halaman admin | Admin mengakhiri sesi kerjanya |
| F-06.7 | Membaca pesan masuk | Admin melihat daftar pesan dari formulir Contact dan membaca isinya; pesan otomatis tertandai sudah dibaca saat dibuka admin (tanpa aksi manual terpisah); admin dapat mengarsipkan pesan yang sudah ditindaklanjuti agar kotak pesan tetap rapi, tanpa menghapusnya (A-011) |
| F-06.8 | Mengelola tag | Menambah, mengubah, menghapus tag (nama) yang dipakai bersama Project & Tulisan — halaman kelola tersendiri, mencabut G-014 lama ("tanpa halaman kelola, inline saja"); referensi desain admin client (pm_01 D009) |
| F-06.9 | Mengelola media | Mengunggah gambar lewat halaman Media tersendiri (bukan cuma inline dari form Project/Tulisan), melihat galeri seluruh gambar yang pernah diunggah, dan menghapusnya bila tidak dipakai lagi (pm_01 D009) |
| F-06.10 | Mengubah kata sandi | Admin mengganti kata sandi akunnya sendiri — kata sandi awal disiapkan developer saat serah terima (Assumption BA A-005), pemilik dapat menggantinya mandiri (pm_01 D009) |

### F-07 — Unduh CV

Pengunjung mengunduh CV terbaru pemilik dalam satu aksi. Berkas CV bersifat
statis — diperbarui developer saat deploy, bukan lewat halaman admin (A-004,
pm_01 D007).

| Sub | Nama | Deskripsi |
|-----|------|-----------|
| F-07.1 | Mengunduh CV | Berkas CV terunduh dan dapat dibuka |

## Later Features

- Tidak ada — pm_01_project.md tidak memuat fitur berprioritas Later.

## Glossary

| Istilah | Arti di proyek ini |
|---------|--------------------|
| Project | Karya/pekerjaan pemilik yang dipamerkan di halaman Portfolio (bukan "proyek" pekerjaan client) |
| Tulisan | Konten blog yang dibuat pemilik; sinonim "artikel"/"post" TIDAK dipakai |
| Halaman admin | Area terlindung tempat admin mengelola konten & membaca pesan. Layar beranda area ini bernama **"Dashboard"** (istilah Inggris, referensi desain admin client — pm_01 D009); larangan sinonim "dashboard" di versi sebelumnya DICABUT untuk konteks ini |
| Profil | Isi halaman About: perkenalan singkat (About Hero), Engineering Principles, Development Workflow, Current Focus, dan Beyond Code — keahlian TIDAK termasuk (tampil eksklusif di Home); seluruhnya data statis, TIDAK dikelola dari halaman admin (pm_01 D007) |
| Info kontak | Saluran kontak yang ditampilkan di halaman Contact, isinya dikelola admin |
| Pesan | Kiriman pengunjung lewat formulir Contact: nama, alamat email pengirim, isi pesan |
| Kotak pesan | Bagian halaman admin tempat pesan-pesan masuk terkumpul dan dibaca |
| CV | Berkas riwayat hidup terbaru pemilik yang dapat diunduh pengunjung |
| Draf | Status tayang Project/Tulisan: tersimpan tapi belum tampil di halaman publik |
| Terbit | Status tayang Project/Tulisan: tampil di halaman publik |
| Arsip | Status tayang Project/Tulisan: pernah Terbit, kini disembunyikan dari publik tanpa dihapus permanen |
| Tag | Label pada Project/Tulisan, dipakai bersama keduanya; punya halaman kelola tersendiri di admin (F-06.8, DIREVISI 2026-07-16 — sebelumnya inline-only, G-014); belum ada tampilan/filter aktif di sisi publik yang memakainya |
| Media | Berkas gambar yang pernah diunggah admin (lewat form Project/Tulisan atau langsung dari halaman Media); punya galeri tersendiri di admin (F-06.9) |
| Dashboard | Layar beranda halaman admin — ringkasan angka & pintasan, murni pemanis tampilan (referensi desain client, pm_01 D009) |
| Kata sandi | Kredensial masuk admin; diisi awal oleh developer saat serah terima, dapat diganti mandiri oleh admin (F-06.10) |

## Assumptions

- Detail project berisi deskripsi, peran pemilik, dan tautan bila ada (G-002).
- Daftar tulisan blog tampil urut waktu terbaru, tanpa pengelompokan kategori
  pada tampilan daftar (G-003, direvisi 2026-07-16 — lihat A-002).
- Penghapusan project/tulisan bersifat permanen, selalu dengan konfirmasi
  sebelum menghapus — terpisah dari Arsip, yang menyembunyikan tanpa
  menghapus (G-004, direvisi 2026-07-16).
- Berkas CV bersifat statis, diperbarui developer saat deploy — bukan diganti admin (G-005, direvisi pm_01 D007).
- Terdapat satu akun admin (pemilik); penyiapannya bagian dari penyiapan awal website (G-006).
- Project & Tulisan punya status tayang Draf/Terbit/Arsip; hanya status Terbit
  tampil publik (G-007, DIREVISI 2026-07-16, pm_01 D008 — mencabut asumsi awal
  "tanpa mekanisme draf").
- Formulir pesan berisi nama, alamat email pengirim, dan isi pesan (G-008).
- Seluruh data identitas pemilik (About Hero, Engineering Principles,
  Development Workflow, Current Focus, Beyond Code) adalah teks statis di
  kode — BUKAN dikelola admin dari halaman manapun, beda dari kesimpulan awal
  yang sempat menganggapnya bagian form Profil (klarifikasi user, 2026-07-16,
  G-009, direvisi pm_01 D007).
- Keahlian dikelola admin lewat tambah/ubah/hapus satu-satu (nama + ikon),
  mengikuti pola sederhana yang sama dengan Project/Tulisan — bukan lagi
  bagian form Profil tunggal (default non-blocking, G-010).
- Admin memilih status Draf/Terbit/Arsip lewat satu isian di form Project/
  Tulisan yang sama (bukan tombol simpan terpisah); status awal konten baru =
  Draf (G-011).
- Pesan otomatis tertandai sudah dibaca saat admin membuka/melihatnya, tanpa
  aksi manual "tandai dibaca" terpisah; pesan yang sudah ditindaklanjuti dapat
  diarsipkan admin secara manual agar kotak pesan tetap rapi, tanpa dihapus
  (G-012).
- "Peran saya" pada Project bukan lagi field terstruktur terpisah — digabung
  ke isian deskripsi bebas; AC-004-1 tetap terpenuhi karena admin dapat
  menuliskan perannya di sana (keputusan implementasi Tech Lead, G-013).
- Tag punya halaman kelola tersendiri (tambah/ubah/hapus, pola sama Skill) —
  DIREVISI 2026-07-16 (pm_01 D009, referensi desain admin client): asumsi
  awal "tanpa halaman kelola, inline saja" (G-014) sudah tidak berlaku;
  di Project/Tulisan, isian Tag tetap berupa pilihan dari tag yang ada
  (bukan ketik bebas lagi) supaya konsisten dengan daftar terkelola.
- Menghapus tag yang sedang dipakai Project/Tulisan hanya melepas
  keterkaitannya (Project/Tulisan tetap ada, cuma kehilangan 1 tag itu) —
  bukan ikut menghapus Project/Tulisan (default non-blocking, G-015).
- Mengunggah gambar bisa lewat dua jalur: langsung dari halaman Media, atau
  inline dari form Project/Tulisan (keduanya masuk galeri yang sama) —
  admin memilih gambar dari galeri atau unggah baru saat mengisi form
  Project/Tulisan (G-016).
- Menghapus media yang sedang dipakai sebagai gambar Project/Tulisan TIDAK
  otomatis mengosongkan rujukannya di sana (tanpa relasi wajib ke Media,
  keputusan Tech Lead) — admin bertanggung jawab tidak menghapus file yang
  masih dipakai; risiko diterima mengingat skala kecil, 1 admin (G-017).
- Ubah kata sandi mewajibkan kata sandi lama yang benar sebelum kata sandi
  baru disimpan (pola keamanan standar, bukan sekadar isi ulang bebas)
  (G-018).

## Open Questions

- Pemulihan akses bila pemilik lupa kata sandi tidak disebut sumber — tidak dijadikan
  requirement; disarankan dipertimbangkan pada siklus PM berikutnya.
- Preferensi Visual pm_01_project.md (warna terinspirasi github.com, mode terang &
  gelap, gaya profesional-simple) diteruskan utuh ke UI/UX — bukan ranah BA.

## Handoff

- Dokumen ini bagian dari **set requirement BA** proyek Portfolio Developer:
  ba_01_feature.md + ba_02_user_story.md + ba_03_acceptance_criteria.md (versi sama, dibaca bersama).
- **Sumber:** docs/pm_01_project.md v1.6 — Single Source of Truth kebutuhan bisnis.
- **Penerima:** UI/UX Agent dan Tech Lead Agent.
- **Pertanyaan hilir** yang tak terjawab set ini = kekurangan dokumen BA →
  dikembalikan ke BA (bukan langsung ke PM/client).
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → pm_01_project.md baru →
  BA menyesuaikan → set ini terbit versi baru. Tidak diedit langsung.
