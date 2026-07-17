# USER FLOWS: Portfolio Developer

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

19 layar (7 publik + 12 kelola) dan 23 flow untuk dua aktor: HRD/recruiter (sisi
publik) dan Admin/pemilik (halaman admin). Website multi-halaman sesuai 5 halaman
yang dinamai client; halaman admin memakai satu kerangka (header + menu
berkelompok, label Inggris — pm_01 D009) untuk 11 layar kelola. Kapabilitas
mode terang/gelap diwujudkan sebagai SaklarTema (C-03) di kedua sisi.

## Peta Layar & Navigasi

| ID | Layar | Sisi | Melayani | State |
|----|-------|------|----------|-------|
| SCR-01 | Home | Publik | US-001, US-019, US-017 | normal, kosong |
| SCR-02 | About | Publik | US-002, US-020 | normal |
| SCR-03 | Portfolio (daftar) | Publik | US-003 | normal, kosong |
| SCR-04 | Detail Project | Publik | US-004 | normal |
| SCR-05 | Blog (daftar) | Publik | US-005 | normal, kosong |
| SCR-06 | Detail Tulisan | Publik | US-006 | normal |
| SCR-07 | Contact | Publik | US-007, US-008 | normal, error-validasi, memuat, terkirim |
| SCR-08 | Masuk Admin | Pengelola | US-009 | normal, gagal-masuk |
| SCR-09 | Dashboard | Pengelola | US-009, US-016 | normal, terlarang |
| SCR-10 | Kelola Project | Pengelola | US-010, US-011 | normal, kosong, konfirmasi-hapus, terlarang |
| SCR-11 | Form Project | Pengelola | US-010, US-011 | normal, error-validasi, terlarang |
| SCR-12 | Kelola Tulisan | Pengelola | US-012, US-013 | normal, kosong, konfirmasi-hapus, terlarang |
| SCR-13 | Form Tulisan | Pengelola | US-012, US-013 | normal, error-validasi, terlarang |
| SCR-14 | Kelola Keahlian | Pengelola | US-014 | normal, kosong, konfirmasi-hapus, terlarang |
| SCR-15 | Contact Info | Pengelola | US-015 | normal, kosong, konfirmasi-hapus, terlarang |
| SCR-16 | Messages | Pengelola | US-018 | normal, kosong, terlarang |
| SCR-17 | Tags | Pengelola | US-021 | normal, kosong, konfirmasi-hapus, terlarang |
| SCR-18 | Media | Pengelola | US-022 | normal, kosong, mengunggah, konfirmasi-hapus, terlarang |
| SCR-19 | Password | Pengelola | US-023 | normal, error-validasi, tersimpan, terlarang |

Struktur navigasi:

```
Publik   : Home · About · Portfolio · Blog · Contact          (MenuUtama, C-02)
           Home ──sorotan──► About / Detail Project / Detail Tulisan / Contact
           Portfolio ──kartu──► Detail Project ──kembali──► Portfolio
           Blog ──kartu──► Detail Tulisan ──kembali──► Blog

Pengelola: Masuk Admin → Dashboard
           Menu (MenuAdmin, C-10), berkelompok & label Inggris (pm_01 D009):
             Overview:       Dashboard
             Content:        Posts · Projects · Tags · Skills · Media
             Communication:  Messages · Contact Info
             System:         Password
           Keluar (selalu terlihat) → kembali ke Masuk Admin
           Tanpa sesi, semua layar kelola → dialihkan ke Masuk Admin (terlarang)
```

## Flows

### FLOW-01 — Recruiter mengenali pemilik saat pertama membuka (US-001)

- **Aktor:** HRD / recruiter perusahaan
- **Layar:** SCR-01
- **Menutup:** AC-001-1, AC-001-2, AC-001-3, AC-001-4

1. Membuka website — hero menampilkan nama & profesi pemilik; menu ke About,
   Portfolio, Blog, Contact tersedia [AC-001-1].
2. Dari ponsel: seluruh isi terbaca tanpa geser ke samping atau memperbesar
   [AC-001-2]; seluruh teks berbahasa Indonesia [AC-001-3].
3. CATATAN [AC-001-4]: "muncul di pencarian Google saat nama dicari" tidak punya
   wujud layar — **diteruskan ke Tech Lead sebagai kebutuhan sisi sistem** (D-004).

### FLOW-02 — Recruiter melihat sorotan konten di Home (US-019)

- **Aktor:** HRD / recruiter perusahaan
- **Layar:** SCR-01 → (SCR-03 / SCR-04 / SCR-05 / SCR-06 / SCR-07)
- **Menutup:** AC-019-1, AC-019-2, AC-019-3

1. Menggulir Home: ringkasan keahlian → cuplikan project unggulan → tulisan
   terbaru [AC-019-1]. Keahlian tampil utuh langsung di sini, tanpa halaman
   lengkap terpisah (v1.8, D-015 — perbaikan bug: sebelumnya keliru menyebut
   jalan ke About, padahal About tidak lagi menampilkan keahlian sejak D-009).
2. Project Unggulan & Tulisan Terbaru masing-masing punya "Lihat semua →"
   menuju halaman lengkapnya (Portfolio SCR-03 / Blog SCR-05); tiap kartu/item
   juga bisa langsung ditekan menuju detailnya (SCR-04 / SCR-06).
3. Bagian akhir: ajakan menghubungi (menuju Contact) dan tombol [Unduh CV]
   [AC-019-2].
   - CABANG [AC-019-3]: belum ada project/tulisan yang tayang → bagian sorotan
     itu disembunyikan; halaman tetap tampil wajar (state kosong SCR-01).

### FLOW-03 — Melihat perkenalan diri (US-002)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-02 · **Menutup:** AC-002-1

1. Menu About → foto, profesi, dan perkenalan singkat pemilik tampil (About Hero)
   [AC-002-1].

### FLOW-04 — Melihat daftar project (US-003)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-03 · **Menutup:** AC-003-1, AC-003-2

1. Menu Portfolio → daftar project: nama + gambaran singkat per kartu [AC-003-1].
   - CABANG [AC-003-2]: belum ada project → keterangan "belum ada project"
     (state kosong), tanpa halaman rusak.

### FLOW-05 — Membuka detail project (US-004)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-03 → SCR-04 · **Menutup:** AC-004-1

1. Menekan satu kartu project → Detail Project: deskripsi, peran pemilik, tautan
   bila ada [AC-004-1].
2. "< Kembali ke Portfolio" memulangkan ke daftar.

### FLOW-06 — Melihat daftar tulisan (US-005)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-05 · **Menutup:** AC-005-1, AC-005-2

1. Menu Blog → daftar tulisan urut dari yang terbaru [AC-005-1].
   - CABANG [AC-005-2]: belum ada tulisan → keterangan (state kosong).

### FLOW-07 — Membaca satu tulisan (US-006)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-05 → SCR-06 · **Menutup:** AC-006-1, AC-006-2

1. Menekan satu item tulisan → isi tulisan tampil utuh [AC-006-1].
2. Tidak ada fitur komentar di bagian mana pun [AC-006-2] — anotasi negatif SCR-06.
3. "< Kembali ke Blog" memulangkan ke daftar.

### FLOW-08 — Melihat info kontak (US-007)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-07 · **Menutup:** AC-007-1

1. Menu Contact → info kontak (sesuai isian admin di SCR-15) tampil [AC-007-1].

### FLOW-09 — Mengirim pesan lewat formulir (US-008)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-07 · **Menutup:** AC-008-1, AC-008-2

1. Mengisi formulir: nama, email, isi pesan (isian dari Assumption BA A-007).
2. Menekan [Kirim Pesan] → penanda proses (state memuat).
   - CABANG [AC-008-2]: isian wajib kosong → state error-validasi; bagian yang
     salah ditandai per isian → kembali ke langkah 1.
3. [AC-008-1] State terkirim: tanda pesan terkirim tampil; pesan masuk ke Kotak
   Pesan admin (SCR-16 — lihat FLOW-18).

### FLOW-10 — Admin masuk ke halaman admin (US-009)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-08 → SCR-09 · **Menutup:** AC-009-1, AC-009-2, AC-009-3

1. Membuka alamat halaman admin tanpa sesi → dialihkan ke Masuk Admin [AC-009-3]
   (berlaku untuk semua layar kelola — state terlarang).
2. Mengisi data masuk, menekan [Masuk].
   - CABANG [AC-009-2]: data salah → state gagal-masuk dengan pemberitahuan yang
     jelas (tanpa merinci bagian mana yang salah) → kembali ke langkah 2.
3. [AC-009-1] Berhasil → Dashboard (SCR-09); menu kelola tersedia.

### FLOW-11 — Admin menambah project (US-010)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-09 → SCR-10 → SCR-11 → SCR-03 · **Menutup:** AC-010-1, AC-010-2

1. Menu Project (SCR-10) → menekan [+ Tambah Project] → Form Project (SCR-11).
2. Mengisi isian, memilih status (default Draf), menekan [Simpan].
   - CABANG [AC-010-2]: bagian wajib kosong → state error-validasi per isian →
     kembali ke langkah 2.
3. [AC-010-1] Tersimpan → kembali ke Kelola Project dengan pesan berhasil;
   bila status Terbit, project tampil di Portfolio publik (SCR-03); bila Draf,
   belum tampil publik.

### FLOW-12 — Admin mengubah/menghapus/mengatur status project (US-011)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-10 → SCR-11 · **Menutup:** AC-011-1, AC-011-2, AC-011-3, AC-011-4

1. Di Kelola Project, memilih "Ubah" pada satu baris → Form Project terisi data lama.
2. [AC-011-1] Menyimpan → Portfolio publik menampilkan versi terbaru (bila status Terbit).
3. CABANG [AC-011-3]: mengubah status dari Draf → Terbit lalu menyimpan →
   project mulai tampil di Portfolio publik.
4. CABANG [AC-011-4]: mengubah status dari Terbit → Arsip lalu menyimpan →
   project hilang dari Portfolio publik, tetap ada di Kelola Project.
5. Memilih "Hapus" → dialog konfirmasi (state konfirmasi-hapus).
   - CABANG [AC-011-2]: [Batal] → dialog tertutup tanpa perubahan; [Hapus] →
     project hilang permanen dari halaman publik + Kelola Project + pesan berhasil.

### FLOW-13 — Admin menulis tulisan, draf atau terbit (US-012)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-12 → SCR-13 → SCR-05 · **Menutup:** AC-012-1, AC-012-2

1. Menu Tulisan (SCR-12) → [+ Tulis Tulisan] → Form Tulisan (SCR-13).
2. Mengisi judul, isi, gambar sampul & tag (opsional), memilih status (default
   Draf), menekan [Simpan].
   - CABANG [AC-012-2]: judul kosong → state error-validasi → kembali ke langkah 2.
3. [AC-012-1] Tersimpan → bila status Terbit, tulisan langsung tampil teratas
   di Blog publik; bila Draf, tersimpan tanpa tampil publik (menggantikan
   asumsi lama "tanpa draf" — Assumption BA A-006 direvisi).

### FLOW-14 — Admin mengubah/menghapus/mengatur status tulisan (US-013)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-12 → SCR-13 · **Menutup:** AC-013-1, AC-013-2, AC-013-3, AC-013-4

1. "Ubah" pada satu tulisan → form terisi data lama → simpan → Blog publik
   menampilkan versi terbaru bila status Terbit [AC-013-1].
2. CABANG [AC-013-3]: mengubah status dari Draf → Terbit lalu menyimpan →
   tulisan mulai tampil di Blog publik.
3. CABANG [AC-013-4]: mengubah status dari Terbit → Arsip lalu menyimpan →
   tulisan hilang dari Blog publik, tetap ada di Kelola Tulisan.
4. "Hapus" → dialog konfirmasi → [Hapus] → tulisan hilang permanen dari
   halaman publik + Kelola Tulisan [AC-013-2]; [Batal] → kembali tanpa perubahan.

### FLOW-15 — Admin mengelola keahlian (US-014)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-14 → SCR-01 · **Menutup:** AC-014-1, AC-014-2

1. Menu Keahlian → mengisi nama + ikon di Form Tambah Keahlian → [+ Tambah].
2. [AC-014-1] Tersimpan → keahlian baru masuk daftar; ringkasan Home publik
   menampilkan versi terbaru.
3. Memilih "Ubah" pada satu baris → form terisi data lama → simpan → Home
   menampilkan versi terbaru.
4. Memilih "Hapus" → dialog konfirmasi (state konfirmasi-hapus).
   - CABANG [AC-014-2]: [Batal] → dialog tertutup tanpa perubahan; [Hapus] →
     keahlian hilang dari ringkasan Home + pesan berhasil.

**Catatan:** data identitas pemilik (foto, perkenalan, Engineering Principles,
Development Workflow, Current Focus, Beyond Code, berkas CV) bersifat statis —
tidak ada flow admin untuk mengubahnya (pm_01 D007).

### FLOW-16 — Admin mengelola info kontak (US-015)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-15 → SCR-07 · **Menutup:** AC-015-1

1. Menu Contact Info → mengisi label + nilai + ikon di Form Tambah Saluran → [+ Tambah].
2. [AC-015-1] Tersimpan → saluran baru masuk daftar; Contact publik
   menampilkan versi terbaru.
3. Memilih "Ubah" pada satu baris → form terisi data lama → simpan → Contact
   publik menampilkan versi terbaru.
4. Memilih "Hapus" → dialog konfirmasi (state konfirmasi-hapus).
   - CABANG: [Batal] → dialog tertutup tanpa perubahan; [Hapus] → saluran
     hilang dari Contact publik + pesan berhasil.

**Catatan:** dirombak dari pola form singleton lama (satu tombol simpan
replace-all) jadi CRUD per baris, pola sama FLOW-15 — mengikuti skema
ContactInfo flat multi-baris (techlead_02 D-013).

### FLOW-17 — Admin keluar (US-016)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-09 → SCR-08 · **Menutup:** AC-016-1

1. Menekan "Keluar" di header admin (selalu terlihat di semua layar kelola — D-005).
2. [AC-016-1] Sesi berakhir → kembali ke Masuk Admin; membuka alamat admin lagi
   → dialihkan ke Masuk Admin.

### FLOW-18 — Admin membaca & mengarsipkan pesan masuk (US-018)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-16 · **Menutup:** AC-018-1, AC-018-2, AC-018-3, AC-018-4

1. Menu Pesan → tab Aktif terbuka default → daftar pesan urut terbaru; tiap
   kartu: penanda belum-dibaca, nama, email pengirim, waktu, isi pesan utuh
   [AC-018-1].
   - CABANG [AC-018-2]: belum ada pesan di tab yang aktif → keterangan
     "belum ada pesan" (state kosong).
2. [AC-018-3] Membuka/melihat satu kartu pesan → status otomatis berubah jadi
   sudah dibaca, tanpa aksi manual.
3. [AC-018-4] Menekan [Arsipkan] pada satu pesan → pesan pindah ke tab Arsip,
   tidak terhapus; dari tab Arsip, [Kembalikan] mengembalikannya ke tab Aktif.

### FLOW-19 — Recruiter mengunduh CV (US-017)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-01 · **Menutup:** AC-017-1

1. Menekan [Unduh CV] — tersedia di hero dan bagian Ajakan (D-006) — berkas CV
   terunduh dan dapat dibuka [AC-017-1].

### FLOW-20 — Melihat cara berpikir dan cara bekerja pemilik (US-020)

- **Aktor:** HRD / recruiter perusahaan · **Layar:** SCR-02 · **Menutup:** AC-020-1, AC-020-2, AC-020-3, AC-020-4

1. Menggulir halaman About → Engineering Principles, Development Workflow,
   Current Focus, dan Beyond Code tampil berurutan [AC-020-1, AC-020-2,
   AC-020-3, AC-020-4].

### FLOW-21 — Admin mengelola tag (US-021)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-17 · **Menutup:** AC-021-1, AC-021-2

1. Menu Tags → mengisi nama di Form Tambah Tag → [+ Tambah].
2. [AC-021-1] Tersimpan → tag baru masuk daftar, tersedia dipilih di Form
   Project/Tulisan.
3. Memilih "Ubah" pada satu baris → form terisi data lama → simpan.
4. Memilih "Hapus" → dialog konfirmasi (state konfirmasi-hapus).
   - CABANG [AC-021-2]: [Batal] → dialog tertutup tanpa perubahan; [Hapus] →
     tag hilang dari daftar (Project/Tulisan yang memakainya tidak ikut
     terhapus, cuma kehilangan tag itu).

### FLOW-22 — Admin mengelola media (US-022)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-18 · **Menutup:** AC-022-1, AC-022-2, AC-022-3

1. Menu Media → menekan [+ Unggah Gambar] → memilih file.
2. [AC-022-1] Terunggah → gambar masuk galeri.
3. [AC-022-2] Membuka halaman Media → seluruh gambar tampil, urut terbaru.
   - CABANG: belum ada gambar → keterangan "belum ada gambar" (state kosong).
4. Menekan "Hapus" pada satu gambar → dialog konfirmasi.
   - CABANG [AC-022-3]: [Batal] → tanpa perubahan; [Hapus] → gambar hilang
     dari galeri (tautannya di Project/Tulisan yang memakai, bila ada, tidak
     otomatis kosong).

### FLOW-23 — Admin mengubah kata sandi (US-023)

- **Aktor:** Admin (pemilik website) · **Layar:** SCR-19 · **Menutup:** AC-023-1, AC-023-2

1. Menu Password → mengisi kata sandi lama, kata sandi baru, dan konfirmasi
   → [Simpan].
   - CABANG [AC-023-2]: kata sandi lama salah, atau kata sandi baru & konfirmasi
     tidak cocok → state error-validasi, bagian yang salah ditandai → kembali ke 1.
2. [AC-023-1] Kata sandi berhasil diganti → pesan berhasil.

## Handoff

- Dokumen ini bagian dari **set rancangan UI/UX** proyek Portfolio Developer:
  uiux_01_user_flow.md + uiux_02_wireframe.md + uiux_03_design_system.md (versi sama, dibaca bersama).
- **Sumber:** set requirement BA v6.0 (FEATURE + USER_STORY + ACCEPTANCE_CRITERIA),
  konteks docs/pm_01_project.md v1.6.
- **v1.8:** perbaikan bug FLOW-02 (bukan requirement baru) — lihat
  uiux_02_wireframe.md v1.8 & Decision Log D-015.
- **Penerima:** Tech Lead Agent (dan FE Agent saat implementasi).
- **Pertanyaan hilir** tentang tampilan/alur yang tak terjawab set ini = kekurangan
  dokumen UI/UX → dikembalikan ke UI/UX; pertanyaan tentang requirement → ke BA.
- **Perubahan kebutuhan** ditangani dari hulu: siklus PM → BA → set ini terbit
  versi baru. Tidak diedit langsung.
