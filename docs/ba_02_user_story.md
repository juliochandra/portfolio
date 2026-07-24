# USER STORIES: Portfolio Developer

## Metadata

| | |
|---|---|
| **Tanggal** | 2026-07-16 |
| **Versi** | 6.0 |
| **Sumber** | docs/pm_01_project.md v1.6 |
| **Disusun oleh** | BA Agent |
| **Set dokumen** | ba_01_feature.md · ba_02_user_story.md · ba_03_acceptance_criteria.md |

## Ringkasan

23 user story mencakup kedua Target User — HRD/recruiter perusahaan (11 story sisi
publik) dan Admin/pemilik website (12 story sisi pengelolaan) — atas 7 fitur.
US-014 dirombak dari "mengubah profil" jadi "mengelola keahlian" (pm_01 v1.4, D007).
US-011/US-013 (v1.5, D008) kini mencakup pengaturan status tayang
(Draf/Terbit/Arsip); US-018 mencakup status baca otomatis & arsip pesan.
US-021/US-022/US-023 (v1.6, D009) baru: mengelola tag, mengelola media, dan
mengubah kata sandi — referensi desain admin client.

## Stories

### F-01 — Halaman Home

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-001 | Must | Sebagai HRD/recruiter perusahaan, saya ingin langsung melihat siapa pemilik website dan menuju bagian yang saya butuhkan saat pertama membuka, sehingga saya cepat memahami kandidat tanpa membuang waktu. | AC-001-1, AC-001-2, AC-001-3, AC-001-4 |
| US-019 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat sorotan keahlian, project unggulan, dan tulisan terbaru langsung di halaman depan, sehingga saya menangkap gambaran kandidat dengan cepat tanpa menjelajah semua halaman. | AC-019-1, AC-019-2, AC-019-3 |

### F-02 — Halaman About

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-002 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat perkenalan singkat pemilik website, sehingga saya mengenal sosok di balik portfolio ini. | AC-002-1 |
| US-020 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat cara berpikir dan cara bekerja pemilik (prinsip teknis, alur kerja, fokus saat ini, dan sisi personal), sehingga saya dapat menilai kecocokan karakter dan budaya kerja kandidat, bukan cuma kemampuan teknisnya. | AC-020-1, AC-020-2, AC-020-3, AC-020-4 |

### F-03 — Halaman Portfolio

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-003 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat daftar project kandidat dalam satu tempat, sehingga saya dapat menilai kemampuannya dengan cepat. | AC-003-1, AC-003-2 |
| US-004 | Must | Sebagai HRD/recruiter perusahaan, saya ingin membuka detail sebuah project, sehingga saya yakin dengan kualitas dan peran kandidat di dalamnya. | AC-004-1 |

### F-04 — Halaman Blog

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-005 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat daftar tulisan kandidat, sehingga saya melihat sisi lain kandidat yang membuatnya menonjol dibanding pelamar lain. | AC-005-1, AC-005-2 |
| US-006 | Must | Sebagai HRD/recruiter perusahaan, saya ingin membaca satu tulisan secara utuh, sehingga saya dapat menilai cara berpikir dan berkomunikasinya. | AC-006-1, AC-006-2 |

### F-05 — Halaman Contact

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-007 | Must | Sebagai HRD/recruiter perusahaan, saya ingin melihat info kontak pemilik, sehingga saya dapat menghubunginya untuk proses rekrutmen. | AC-007-1 |
| US-008 | Must | Sebagai HRD/recruiter perusahaan, saya ingin mengirim pesan langsung dari website, sehingga saya dapat menghubungi kandidat tanpa berpindah aplikasi. | AC-008-1, AC-008-2 |

### F-06 — Pengelolaan Konten oleh Admin

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-009 | Must | Sebagai Admin (pemilik website), saya ingin masuk ke halaman admin dengan akun saya, sehingga hanya saya yang dapat mengubah isi website. | AC-009-1, AC-009-2, AC-009-3 |
| US-010 | Must | Sebagai Admin (pemilik website), saya ingin menambah project baru, sehingga portfolio saya selalu mencerminkan karya terbaru tanpa bantuan teknis. | AC-010-1, AC-010-2 |
| US-011 | Must | Sebagai Admin (pemilik website), saya ingin mengubah, menghapus, atau mengatur status tayang (Draf/Terbit/Arsip) project yang sudah ada, sehingga saya dapat memperbaiki, mencabut, atau menyembunyikan sementara karya yang belum siap/tidak lagi relevan. | AC-011-1, AC-011-2, AC-011-3, AC-011-4 |
| US-012 | Must | Sebagai Admin (pemilik website), saya ingin menulis tulisan baru dan memilih menyimpannya sebagai draf atau langsung menerbitkannya, sehingga saya dapat berbagi tulisan yang memperkuat citra profesional saya tanpa terburu-buru menayangkan yang belum selesai. | AC-012-1, AC-012-2 |
| US-013 | Must | Sebagai Admin (pemilik website), saya ingin mengubah, menghapus, atau mengatur status tayang tulisan yang sudah terbit, sehingga isi blog saya tetap akurat, layak dibaca, dan bisa disembunyikan sementara tanpa dihapus. | AC-013-1, AC-013-2, AC-013-3, AC-013-4 |
| US-014 | Must | Sebagai Admin (pemilik website), saya ingin menambah, mengubah, atau menghapus keahlian saya, sehingga ringkasan keahlian di Home selalu menggambarkan kemampuan saya terkini. | AC-014-1, AC-014-2 |
| US-015 | Must | Sebagai Admin (pemilik website), saya ingin mengubah info kontak yang tampil, sehingga recruiter selalu menghubungi saya lewat saluran yang benar. | AC-015-1 |
| US-016 | Must | Sebagai Admin (pemilik website), saya ingin keluar dari halaman admin setelah selesai, sehingga orang lain yang memakai perangkat saya tidak dapat mengubah isi website. | AC-016-1 |
| US-018 | Must | Sebagai Admin (pemilik website), saya ingin membaca pesan yang dikirim pengunjung lewat formulir Contact dan merapikan kotak pesan dengan mengarsipkan yang sudah ditindaklanjuti, sehingga saya tidak melewatkan peluang yang datang lewat website dan kotak pesan tetap mudah dipantau. | AC-018-1, AC-018-2, AC-018-3, AC-018-4 |
| US-021 | Must | Sebagai Admin (pemilik website), saya ingin menambah, mengubah, atau menghapus tag, sehingga label yang dipakai di Project dan Tulisan tetap rapi dan konsisten. | AC-021-1, AC-021-2 |
| US-022 | Must | Sebagai Admin (pemilik website), saya ingin mengunggah gambar dan melihat semua gambar yang pernah saya unggah dalam satu galeri, sehingga saya bisa memakai ulang gambar tanpa mengunggah dobel. | AC-022-1, AC-022-2, AC-022-3 |
| US-023 | Must | Sebagai Admin (pemilik website), saya ingin mengubah kata sandi akun saya sendiri, sehingga saya bisa mengganti kata sandi awal dari developer sesuai kebutuhan saya. | AC-023-1, AC-023-2 |

### F-07 — Unduh CV

| ID | Prioritas | Story | AC |
|----|-----------|-------|----|
| US-017 | Should | Sebagai HRD/recruiter perusahaan, saya ingin mengunduh CV terbaru kandidat, sehingga saya dapat membawanya ke proses rekrutmen internal. | AC-017-1 |

## Handoff

- Dokumen ini bagian dari **set requirement BA** proyek Portfolio Developer:
  ba_01_feature.md + ba_02_user_story.md + ba_03_acceptance_criteria.md (versi sama, dibaca bersama).
- **Sumber:** docs/pm_01_project.md v1.6 — Single Source of Truth kebutuhan bisnis.
- **Penerima:** UI/UX Agent dan Tech Lead Agent.
- **Pertanyaan hilir** yang tak terjawab set ini = kekurangan dokumen BA →
  dikembalikan ke BA (bukan langsung ke PM/client).
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → pm_01_project.md baru →
  BA menyesuaikan → set ini terbit versi baru. Tidak diedit langsung.
