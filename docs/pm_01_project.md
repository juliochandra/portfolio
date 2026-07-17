# PROJECT: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-16 |
| **Status** | Disetujui client |
| **Versi** | 1.6 |
| **Disusun oleh** | PM Agent |
| **Diteruskan ke** | Business Analyst |

## Project Summary

Website portfolio online untuk seorang developer, ditujukan terutama kepada
HRD/recruiter perusahaan. Tujuannya memperbesar peluang dipanggil interview,
menonjol dibanding kandidat lain, dan memberi pemilik identitas profesional
online yang mudah ditemukan di Google. Website terdiri dari halaman Home, About,
Portfolio, Blog, dan Contact (info kontak + formulir kirim pesan), dilengkapi
tombol unduh CV. Halaman Home menonjolkan perkenalan singkat, ringkasan
keahlian, cuplikan project unggulan, tulisan terbaru, dan ajakan
menghubungi/unduh CV. Halaman About menampilkan perkenalan singkat pemilik
serta cara berpikir dan cara bekerjanya — Engineering Principles, Development
Workflow, Current Focus, dan Beyond Code. Seluruh konten — project, blog, keahlian, dan kontak — dapat
dikelola sendiri oleh pemilik melalui halaman admin (data identitas seperti
nama/bio/foto/CV bersifat statis, D007); pesan dari formulir Contact
juga masuk ke kotak pesan di halaman admin. Komentar blog, versi dua bahasa,
dan newsletter tidak termasuk tahap ini.

## Objective

Menyediakan portfolio online yang menampilkan karya, keahlian, dan tulisan
pemilik sebagai developer, sehingga HRD/recruiter dapat menilai kemampuannya
dengan cepat — sekaligus memberi pemilik kendali penuh untuk memperbarui seluruh
isinya sendiri tanpa bantuan teknis.

## Business Goals

- Memperbesar peluang dipanggil interview kerja.
- Menonjol dibanding kandidat lain yang tidak memiliki portfolio.
- Memiliki identitas profesional online yang rapi.
- Mudah ditemukan di pencarian Google saat nama pemilik dicari.

## Target Users

| Pengguna | Peran / Kebutuhan |
|----------|-------------------|
| HRD / recruiter perusahaan | Menilai kemampuan & pengalaman kandidat dengan cepat, mengunduh CV, menghubungi pemilik |
| Admin (pemilik website) | Mengelola seluruh konten — project, blog, keahlian, dan kontak — serta membaca pesan masuk, tanpa bantuan teknis |

## Core Features

| Prioritas | Fitur | Deskripsi |
|-----------|-------|-----------|
| Must | Halaman Home | Halaman pembuka yang menyambut pengunjung dan mengarahkan ke bagian lain; menonjolkan perkenalan singkat, ringkasan keahlian, cuplikan project unggulan, tulisan terbaru, dan ajakan menghubungi/unduh CV |
| Must | Halaman About | About Hero (foto, profesi, perkenalan singkat) serta cara berpikir dan cara bekerja pemilik: Engineering Principles, Development Workflow, Current Focus, dan Beyond Code — keahlian ditampilkan di Home, tidak diulang di sini |
| Must | Halaman Portfolio | Daftar project/karya pemilik beserta detailnya |
| Must | Halaman Blog | Kumpulan tulisan pemilik |
| Must | Halaman Contact | Menampilkan info kontak dan menyediakan formulir kirim pesan dari pengunjung; pesan masuk ke kotak pesan di halaman admin |
| Must | Pengelolaan konten oleh admin | Pemilik masuk ke halaman admin untuk menambah/mengubah project, blog, keahlian, tag, dan info kontak — termasuk mengatur status tayang project/tulisan (draf/terbit/arsip) — mengelola berkas gambar terunggah (galeri media), membaca & mengarsipkan pesan masuk dari formulir Contact, serta mengubah kata sandi akunnya sendiri — data identitas (nama, headline, bio, foto, CV) bersifat statis, tidak dikelola dari sini |
| Should | Unduh CV | Tombol untuk mengunduh CV terbaru pemilik |

## Out of Scope

- Komentar pengunjung di blog — client mengecualikan eksplisit (D001).
- Versi dua bahasa — client memilih satu bahasa saja, Indonesia (D001).
- Newsletter/berlangganan — client mengecualikan eksplisit (D001).

## Constraints

- Seluruh konten berbahasa Indonesia — berlaku untuk sisi publik (Home,
  About, Portfolio, Blog, Contact) dan seluruh teks isi/tombol/pesan di
  halaman admin. Label navigasi & nama modul teknis halaman admin
  dikecualikan (D009): boleh Inggris mengikuti referensi desain admin dari
  client.
- Website harus nyaman dibuka dari ponsel (recruiter sering membuka lewat HP).

## Preferensi Visual

- Terinspirasi warna di github.com (disebut client sebagai referensi).
- Tersedia mode terang dan gelap (light & dark mode).
- Gaya profesional dan simple.
- Referensi struktur & label halaman admin: `docs/ui/cms/cms-portfolio.png`
  dan `cms-portfolio-darkmode.png` — sidebar berkelompok (Overview/Content/
  Communication/System), label modul berbahasa Inggris (Dashboard, Posts,
  Projects, Tags, Skills, Media, Messages, Contact Info) (D009).

*(Catatan mentah dari client — keputusan desain final tetap di tangan tim UI/UX.)*

## Assumptions

- Pilihan "Tidak ada" pada pertanyaan ruang lingkup dimaknai "tidak ada
  pengecualian lain di luar tiga yang dipilih" (dikonfirmasi client saat
  menyetujui ringkasan).

## Success Criteria

- Pemilik dipanggil interview dengan portfolio ini sebagai referensi.
- Pemilik dapat menambah/mengubah project, blog, keahlian, dan kontak sendiri tanpa bantuan teknis.
- Website muncul di pencarian Google saat nama pemilik dicari.

## Decision Log

| ID | Keputusan | Alasan |
|----|-----------|--------|
| D001 | Komentar blog, versi dua bahasa, dan newsletter tidak termasuk scope tahap ini | Client mengecualikannya secara eksplisit saat ditanya ruang lingkup |
| D002 | Hanya tiga pengecualian di atas — tidak ada yang lain | Client menyetujui ringkasan yang menyebut eksplisit "tidak ada pengecualian lain" |
| D003 | Halaman Contact berisi info kontak sekaligus formulir kirim pesan | Klarifikasi sebelum dokumen disusun |
| D004 | Pesan formulir Contact masuk ke kotak pesan di halaman admin (v1.1) | Gap Report BA (G-001); client memilih kotak masuk admin |
| D005 | Isi halaman Home dirinci: perkenalan, ringkasan keahlian, cuplikan project unggulan, tulisan terbaru, ajakan kontak/unduh CV (v1.2) | Client menilai rincian Home terlalu tipis; discovery ulang terbatas — client menyebut sorotan yang diinginkan (semuanya komposisi fitur yang sudah ada, bukan fitur baru) |
| D006 | Isi halaman About dirinci: About Hero, Engineering Principles, Development Workflow, Current Focus, Beyond Code (v1.3); keahlian dipindah eksklusif ke Home | Client menilai rincian About terlalu tipis (sebelumnya hanya "profil & keahlian"); discovery ulang terbatas — keahlian dihapus dari About untuk menghindari redundansi dengan sorotan Home; empat section baru bersifat teks statis dikelola admin sebagai bagian Profil, bukan daftar item CRUD terpisah seperti Project/Tulisan |
| D007 | Seluruh data identitas pemilik (nama, headline, bio, foto, CV — termasuk About Hero & Home Hero) bersifat statis di kode, BUKAN dikelola dari halaman admin (mencabut sebagian D006); keahlian & info kontak tetap dinamis lewat tabel tersendiri (v1.4) | Keputusan saat perancangan skema database — data identitas jarang berubah, dinilai tidak sepadan dibangun jadi form admin; mencabut sebagian Success Criteria "profil dapat diubah admin" — pemilik memperbarui via developer/deploy, bukan halaman admin |
| D008 | Project & Tulisan mendapat status tayang Draf/Terbit/Arsip — admin dapat menyimpan konten yang belum selesai tanpa tampil ke publik, dan menyembunyikan konten lama tanpa menghapusnya permanen; Pesan masuk mendapat status baca (otomatis saat dibuka) dan dapat diarsipkan admin agar kotak pesan tetap rapi (v1.5) | Keputusan lanjutan saat perancangan skema database — konten belum tentu selesai saat dibuat, jangan sampai mengotori halaman publik; arsip memberi opsi selain hapus permanen untuk project/tulisan lama; kotak pesan butuh penanda mana yang belum ditindaklanjuti |
| D009 | Client memberi referensi desain halaman admin (`docs/ui/cms/`) — label navigasi & nama modul admin ikut Inggris (Dashboard, Posts, Projects, Tags, Skills, Media, Messages, Contact Info), mengecualikan sebagian Constraint "seluruh konten berbahasa Indonesia" untuk zona ini; Tag & Media dapat halaman kelola tersendiri (sebelumnya tanpa CRUD/inline saja); admin dapat mengubah kata sandi akunnya sendiri (v1.6) | Referensi eksplisit client — bukan tebakan tim; kesalahan lama menyamakan bahasa seluruh UI (termasuk admin) dengan bahasa konten publik sudah diperbaiki di framework UI/UX; kata sandi awal dari developer perlu bisa diganti mandiri oleh pemilik |

## Handoff

- **Dokumen ini adalah Single Source of Truth** untuk proyek Portfolio Developer.
- **Penerima:** Business Analyst.
- **BA bekerja hanya dari dokumen ini** — tidak membaca percakapan discovery.
- **Pertanyaan BA** tentang kebutuhan yang belum terjawab dicatat sebagai
  kekurangan dokumen ini dan dikembalikan ke PM.
- **Perubahan kebutuhan** setelah dokumen ini disetujui ditangani melalui
  siklus PM baru (discovery ulang), bukan dengan mengedit dokumen langsung.
