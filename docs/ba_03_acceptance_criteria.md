# ACCEPTANCE CRITERIA: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-16 |
| **Versi** | 6.0 |
| **Sumber** | docs/pm_01_project.md v1.6 |
| **Disusun oleh** | BA Agent |
| **Set dokumen** | ba_01_feature.md · ba_02_user_story.md · ba_03_acceptance_criteria.md |

## Ringkasan

53 acceptance criteria untuk 23 story — mencakup jalur sukses, jalur gagal
(validasi isian, data masuk salah), kondisi kosong, batas akses halaman admin,
kriteria kualitas dari Constraints (ponsel, bahasa Indonesia), dan kriteria
negatif penjaga Out of Scope (tanpa komentar blog). Versi 5.0 menambah 6 AC
baru (AC-011-3/4, AC-013-3/4, AC-018-3/4) untuk transisi status Draf/Terbit/
Arsip (Project/Tulisan) dan status baca/arsip Pesan (pm_01 v1.5, D008). Versi
6.0 menambah 3 story & 7 AC baru (US-021..023, AC-021-1/2, AC-022-1/2/3,
AC-023-1/2) untuk kelola tag, kelola media, dan ubah kata sandi (pm_01 v1.6,
D009 — referensi desain admin client).

## Criteria

### US-001 — Melihat halaman pembuka (F-01)

**AC-001-1**
- **Given** Pengunjung membuka website
- **When** Halaman Home terbuka
- **Then** Nama dan profesi pemilik tampil, dan tersedia jalan menuju About, Portfolio, Blog, dan Contact

**AC-001-2**
- **Given** Pengunjung membuka website dari ponsel
- **When** Pengunjung menjelajah halaman Home
- **Then** Seluruh isi terbaca tanpa perlu menggeser layar ke samping atau memperbesar tampilan

**AC-001-3**
- **Given** Pengunjung membuka halaman mana pun
- **When** Pengunjung membaca isinya
- **Then** Seluruh teks berbahasa Indonesia

**AC-001-4**
- **Given** Website telah tayang dan dapat diakses publik
- **When** Nama pemilik dicari di Google
- **Then** Website ini muncul di hasil pencarian

### US-019 — Melihat sorotan konten beranda (F-01)

**AC-019-1**
- **Given** Sudah ada project dan tulisan yang tayang
- **When** Pengunjung menjelajah halaman Home
- **Then** Ringkasan keahlian, cuplikan project unggulan, dan tulisan terbaru tampil — masing-masing menyediakan jalan ke halaman lengkapnya

**AC-019-2**
- **Given** Pengunjung berada di halaman Home
- **When** Pengunjung menjelajahinya
- **Then** Tersedia ajakan menghubungi pemilik yang mengarah ke halaman Contact serta aksi unduh CV

**AC-019-3**
- **Given** Belum ada project atau tulisan yang tayang
- **When** Pengunjung membuka halaman Home
- **Then** Halaman tetap tampil wajar — sorotan yang datanya kosong tidak tampil rusak atau membingungkan

### US-002 — Melihat perkenalan diri (F-02)

**AC-002-1**
- **Given** Pengunjung membuka website
- **When** Pengunjung membuka halaman About
- **Then** Foto (bila ada), profesi, dan perkenalan singkat pemilik tampil

### US-020 — Melihat cara berpikir dan cara bekerja pemilik (F-02)

**AC-020-1**
- **Given** Pengunjung berada di halaman About
- **When** Halaman dimuat
- **Then** Engineering Principles (prinsip kerja teknis pemilik) tampil — teks statis (pm_01 D007)

**AC-020-2**
- **Given** Pengunjung berada di halaman About
- **When** Halaman dimuat
- **Then** Development Workflow (alur kerja pemilik) tampil — teks statis (pm_01 D007)

**AC-020-3**
- **Given** Pengunjung berada di halaman About
- **When** Halaman dimuat
- **Then** Current Focus (fokus yang sedang dipelajari/dikerjakan pemilik saat ini) tampil — teks statis (pm_01 D007)

**AC-020-4**
- **Given** Pengunjung berada di halaman About
- **When** Halaman dimuat
- **Then** Beyond Code (sisi personal pemilik di luar coding) tampil — teks statis (pm_01 D007)

### US-003 — Melihat daftar project (F-03)

**AC-003-1**
- **Given** Sudah ada project berstatus Terbit
- **When** Pengunjung membuka halaman Portfolio
- **Then** Daftar project tampil; tiap project menunjukkan nama dan gambaran singkat — project berstatus Draf/Arsip tidak ikut tampil

**AC-003-2**
- **Given** Belum ada project berstatus Terbit (termasuk bila yang ada baru Draf/Arsip)
- **When** Pengunjung membuka halaman Portfolio
- **Then** Halaman tetap tampil wajar dengan keterangan bahwa belum ada project

### US-004 — Melihat detail project (F-03)

**AC-004-1**
- **Given** Pengunjung berada di daftar project
- **When** Pengunjung memilih satu project
- **Then** Detail project tampil: deskripsi (dapat memuat peran pemilik bila ditulis admin di sana, G-013) dan tautan bila ada

### US-005 — Melihat daftar tulisan (F-04)

**AC-005-1**
- **Given** Sudah ada tulisan berstatus Terbit
- **When** Pengunjung membuka halaman Blog
- **Then** Daftar tulisan tampil urut dari yang terbaru — tulisan berstatus Draf/Arsip tidak ikut tampil

**AC-005-2**
- **Given** Belum ada tulisan berstatus Terbit (termasuk bila yang ada baru Draf/Arsip)
- **When** Pengunjung membuka halaman Blog
- **Then** Halaman tetap tampil wajar dengan keterangan bahwa belum ada tulisan

### US-006 — Membaca satu tulisan (F-04)

**AC-006-1**
- **Given** Pengunjung berada di daftar tulisan
- **When** Pengunjung memilih satu tulisan
- **Then** Isi tulisan tampil utuh dan dapat dibaca

**AC-006-2**
- **Given** Pengunjung membaca sebuah tulisan
- **When** Pengunjung mencari cara meninggalkan komentar
- **Then** Tidak ada fitur komentar di mana pun (sesuai Out of Scope)

### US-007 — Melihat info kontak (F-05)

**AC-007-1**
- **Given** Pengunjung ingin menghubungi pemilik
- **When** Pengunjung membuka halaman Contact
- **Then** Info kontak yang dikelola admin tampil

### US-008 — Mengirim pesan lewat formulir (F-05)

**AC-008-1**
- **Given** Pengunjung berada di halaman Contact
- **When** Pengunjung mengisi formulir dengan lengkap lalu mengirimnya
- **Then** Pengunjung melihat tanda pesan terkirim, dan pesan itu muncul di kotak pesan halaman admin

**AC-008-2**
- **Given** Pengunjung berada di halaman Contact
- **When** Pengunjung mengirim formulir dengan isian wajib kosong
- **Then** Pesan tidak terkirim dan pengunjung melihat pemberitahuan bagian yang harus diisi

### US-009 — Masuk ke halaman admin (F-06)

**AC-009-1**
- **Given** Admin memiliki akun
- **When** Admin memasukkan data masuk yang benar
- **Then** Admin berada di halaman admin dan dapat mulai mengelola konten

**AC-009-2**
- **Given** Admin berada di halaman masuk
- **When** Admin memasukkan data masuk yang salah
- **Then** Admin tidak masuk dan melihat pemberitahuan bahwa data masuknya keliru

**AC-009-3**
- **Given** Seseorang belum masuk sebagai admin
- **When** Ia mencoba membuka halaman admin
- **Then** Halaman pengelolaan tidak dapat diakses

### US-010 — Menambah project baru (F-06)

**AC-010-1**
- **Given** Admin berada di halaman admin
- **When** Admin menambah project baru dengan lengkap, memilih status Terbit, lalu menyimpannya
- **Then** Project tampil di halaman Portfolio publik; bila status yang dipilih Draf, project tersimpan namun belum tampil publik (default status konten baru = Draf, G-011)

**AC-010-2**
- **Given** Admin sedang menambah project
- **When** Admin menyimpan tanpa mengisi bagian wajib
- **Then** Project tidak tersimpan dan admin melihat pemberitahuan bagian yang harus diisi

### US-011 — Mengubah/menghapus project (F-06)

**AC-011-1**
- **Given** Ada project yang sudah tersimpan
- **When** Admin mengubahnya lalu menyimpan
- **Then** Halaman Portfolio publik menampilkan versi terbaru

**AC-011-2**
- **Given** Ada project yang sudah tersimpan
- **When** Admin menghapusnya
- **Then** Muncul konfirmasi dulu; setelah dikonfirmasi, project hilang dari halaman publik

**AC-011-3**
- **Given** Ada project berstatus Draf
- **When** Admin mengubah statusnya jadi Terbit lalu menyimpan
- **Then** Project mulai tampil di halaman Portfolio publik

**AC-011-4**
- **Given** Ada project berstatus Terbit
- **When** Admin mengubah statusnya jadi Arsip lalu menyimpan
- **Then** Project hilang dari halaman Portfolio publik namun tetap ada (tidak terhapus) di halaman Kelola Project — status dapat dikembalikan ke Terbit kapan saja

### US-012 — Menulis & menerbitkan tulisan (F-06)

**AC-012-1**
- **Given** Admin berada di halaman admin
- **When** Admin menulis tulisan baru (judul & isi), memilih status Terbit, lalu menyimpannya
- **Then** Tulisan langsung tampil di halaman Blog publik sebagai yang terbaru; bila status yang dipilih Draf, tulisan tersimpan namun belum tampil publik (default status konten baru = Draf, G-011)

**AC-012-2**
- **Given** Admin sedang menulis tulisan
- **When** Admin menyimpan tanpa mengisi judul
- **Then** Tulisan tidak tersimpan dan admin melihat pemberitahuan bagian yang harus diisi

### US-013 — Mengubah/menghapus tulisan (F-06)

**AC-013-1**
- **Given** Ada tulisan yang sudah terbit
- **When** Admin mengubahnya lalu menyimpan
- **Then** Halaman Blog publik menampilkan versi terbaru tulisan itu

**AC-013-2**
- **Given** Ada tulisan yang sudah terbit
- **When** Admin menghapusnya
- **Then** Muncul konfirmasi dulu; setelah dikonfirmasi, tulisan hilang dari halaman publik

**AC-013-3**
- **Given** Ada tulisan berstatus Draf
- **When** Admin mengubah statusnya jadi Terbit lalu menyimpan
- **Then** Tulisan mulai tampil di halaman Blog publik

**AC-013-4**
- **Given** Ada tulisan berstatus Terbit
- **When** Admin mengubah statusnya jadi Arsip lalu menyimpan
- **Then** Tulisan hilang dari halaman Blog publik namun tetap ada (tidak terhapus) di halaman Kelola Tulisan — status dapat dikembalikan ke Terbit kapan saja

### US-014 — Mengelola keahlian (F-06)

**AC-014-1**
- **Given** Admin berada di halaman admin
- **When** Admin menambah keahlian baru (nama + ikon) lalu menyimpan
- **Then** Keahlian tampil di ringkasan Home

**AC-014-2**
- **Given** Ada keahlian yang sudah tersimpan
- **When** Admin mengubah atau menghapusnya
- **Then** Ringkasan Home menampilkan versi terbaru; hapus selalu lewat konfirmasi dulu

### US-015 — Mengubah info kontak (F-06)

**AC-015-1**
- **Given** Admin berada di halaman admin
- **When** Admin mengubah info kontak lalu menyimpan
- **Then** Halaman Contact menampilkan info kontak terbaru

### US-016 — Keluar dari halaman admin (F-06)

**AC-016-1**
- **Given** Admin sedang masuk di halaman admin
- **When** Admin keluar
- **Then** Halaman admin tidak lagi dapat diakses tanpa masuk kembali

### US-018 — Membaca pesan masuk (F-06)

**AC-018-1**
- **Given** Ada pesan yang pernah dikirim lewat formulir Contact
- **When** Admin membuka kotak pesan di halaman admin
- **Then** Daftar pesan tampil urut dari yang terbaru; tiap pesan menunjukkan nama, alamat email pengirim, dan isinya

**AC-018-2**
- **Given** Belum ada pesan yang masuk
- **When** Admin membuka kotak pesan
- **Then** Kotak pesan tampil wajar dengan keterangan belum ada pesan

**AC-018-3**
- **Given** Ada pesan berstatus belum dibaca
- **When** Admin membuka/melihat pesan tersebut di kotak pesan
- **Then** Status pesan otomatis berubah jadi sudah dibaca, tanpa aksi manual terpisah

**AC-018-4**
- **Given** Ada pesan yang sudah ditindaklanjuti admin
- **When** Admin mengarsipkannya
- **Then** Pesan pindah dari daftar utama ke daftar arsip, tidak terhapus, dan dapat dikembalikan ke daftar utama kapan saja

### US-021 — Mengelola tag (F-06)

**AC-021-1**
- **Given** Admin berada di halaman admin
- **When** Admin menambah tag baru (nama) lalu menyimpan
- **Then** Tag tersimpan dan tersedia dipilih di form Project/Tulisan

**AC-021-2**
- **Given** Ada tag yang sudah tersimpan
- **When** Admin mengubah atau menghapusnya
- **Then** Daftar tag menampilkan versi terbaru; hapus selalu lewat konfirmasi dulu; menghapus tag yang sedang dipakai hanya melepas keterkaitannya dari Project/Tulisan terkait, tidak menghapus Project/Tulisan itu sendiri

### US-022 — Mengelola media (F-06)

**AC-022-1**
- **Given** Admin berada di halaman Media
- **When** Admin mengunggah gambar baru
- **Then** Gambar tersimpan dan muncul di galeri

**AC-022-2**
- **Given** Ada gambar yang pernah diunggah
- **When** Admin membuka halaman Media
- **Then** Seluruh gambar tampil dalam galeri, urut terbaru; kondisi belum ada gambar ditangani wajar

**AC-022-3**
- **Given** Ada gambar di galeri
- **When** Admin menghapusnya
- **Then** Muncul konfirmasi dulu; setelah dikonfirmasi, gambar hilang dari galeri

### US-023 — Mengubah kata sandi (F-06)

**AC-023-1**
- **Given** Admin berada di halaman admin
- **When** Admin mengisi kata sandi lama yang benar, kata sandi baru, dan konfirmasinya (cocok), lalu menyimpan
- **Then** Kata sandi berhasil diganti dan admin melihat pesan berhasil

**AC-023-2**
- **Given** Admin sedang mengubah kata sandi
- **When** Kata sandi lama yang dimasukkan salah, atau kata sandi baru & konfirmasi tidak cocok
- **Then** Perubahan ditolak dan admin melihat pemberitahuan bagian yang salah

### US-017 — Mengunduh CV (F-07)

**AC-017-1**
- **Given** Pengunjung membuka website
- **When** Pengunjung memakai aksi unduh CV
- **Then** Berkas CV terunduh dan dapat dibuka

## Cakupan Success Criteria

| Success Criteria (pm_01_project.md) | Ditutup oleh |
|-------------------------------------|--------------|
| "Pemilik dipanggil interview dengan portfolio ini sebagai referensi" | AC-001-1, AC-002-1, AC-003-1, AC-004-1, AC-017-1, AC-019-1, AC-020-1, AC-020-2, AC-020-3, AC-020-4 — perilaku yang memampukan recruiter menilai & menindaklanjuti (hasil bisnisnya sendiri di luar kendali website) |
| "Pemilik dapat menambah/mengubah project, blog, keahlian, dan kontak sendiri tanpa bantuan teknis" | AC-010-1, AC-011-1, AC-011-3, AC-011-4, AC-012-1, AC-013-1, AC-013-3, AC-013-4, AC-014-1, AC-014-2, AC-015-1, AC-018-3, AC-018-4, AC-021-1, AC-021-2, AC-022-1, AC-022-2, AC-022-3, AC-023-1, AC-023-2 — seluruh alur (termasuk status Draf/Terbit/Arsip, status baca/arsip Pesan, kelola tag/media, dan ubah kata sandi) dilakukan admin sendiri dari halaman admin, tanpa langkah teknis (data identitas pemilik statis, di luar cakupan kriteria ini — pm_01 D007) |
| "Website muncul di pencarian Google saat nama pemilik dicari" | AC-001-4 — dapat diperiksa langsung; catatan jujur: kecepatan pengindeksan Google di luar kendali penuh website |

## Handoff

- Dokumen ini bagian dari **set requirement BA** proyek Portfolio Developer:
  ba_01_feature.md + ba_02_user_story.md + ba_03_acceptance_criteria.md (versi sama, dibaca bersama).
- **Sumber:** docs/pm_01_project.md v1.6 — Single Source of Truth kebutuhan bisnis.
- **Penerima:** UI/UX Agent dan Tech Lead Agent.
- **Pertanyaan hilir** yang tak terjawab set ini = kekurangan dokumen BA →
  dikembalikan ke BA (bukan langsung ke PM/client).
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → pm_01_project.md baru →
  BA menyesuaikan → set ini terbit versi baru. Tidak diedit langsung.
