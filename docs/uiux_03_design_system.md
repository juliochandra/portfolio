# DESIGN SYSTEM: Portfolio Developer

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

Karakter visual: profesional dan simple, terinspirasi github.com — sesuai
Preferensi Visual client di pm_01_project.md. Nilai warna memakai **angka asli
Primer** (design system GitHub; sumber: primer.style/primitives — D-002), dalam
dua set lengkap untuk mode terang & gelap. Pembacanya recruiter yang menilai
cepat; sisi admin dipakai satu orang non-tim-teknis.

## Prinsip Desain

1. Recruiter melihat bukti kemampuan (keahlian & project) dalam ≤ 1 gulir dari
   atas Home.
2. Satu aksi utama per area — [Unduh CV] dan [Simpan] tidak pernah bersaing
   dengan aksi lain yang sama menonjolnya.
3. Konten adalah desainnya: tanpa dekorasi yang tidak membawa informasi
   (preferensi client: simple, "jangan rame").
4. Kedua mode (terang & gelap) setara — setiap peran warna punya nilai di kedua
   mode; tidak ada elemen yang hanya terbaca di salah satu mode.
5. Aksi destruktif selalu berwarna danger dan selalu melewati konfirmasi.
6. Semua yang bisa ditekan terlihat bisa ditekan; halaman aktif selalu ditandai
   di menu.

## Design Tokens

### Warna

Sumber nilai: Primer — design system github.com (primer.style/primitives), tema
light default & dark default (D-002). Peran yang mengikat; nilai = usulan setia
pada referensi client.

| Peran | Pemakaian | Mode terang | Mode gelap |
|-------|-----------|-------------|------------|
| canvas | Latar halaman | `#ffffff` | `#0d1117` |
| surface | Latar kartu, panel, section selang | `#f6f8fa` | `#161b22` |
| text | Teks utama | `#1f2328` | `#e6edf3` |
| text-mute | Meta: tanggal, peran, keterangan | `#59636e` | `#8b949e` |
| border | Garis kartu, pemisah, bingkai isian | `#d0d7de` | `#30363d` |
| accent | Tautan, elemen interaktif, penanda fokus | `#0969da` | `#58a6ff` |
| primary | Tombol aksi utama (Kirim, Simpan, Unduh CV) | `#1f883d` | `#238636` |
| danger | Error & aksi hapus | `#cf222e` | `#f85149` |

Kontras teks–latar harus tetap nyaman dibaca di kedua mode — pasangan nilai di
atas sudah memenuhi ini pada sumbernya; jangan menukar nilai antar mode.

### Tipografi

| Peran | Spesifikasi |
|-------|-------------|
| heading | Tegas; nama pemilik di hero = terbesar; maksimal 3 tingkat hierarki |
| body | Nyaman dibaca di HP; baris ≤ ±70 karakter; isi tulisan blog = prioritas keterbacaan tertinggi |

### Spacing

Basis 8 (8/16/24/32). Jarak antar section = 2× jarak internal section — batas
section terasa tanpa garis tebal.

## Komponen

### C-01 — TombolUtama
- **Anatomi:** label aksi. Varian: **primer** (latar primary), **sekunder**
  (garis tepi, latar transparan), **bahaya** (danger — hanya di dialog hapus).
- **Perilaku:** satu aksi utama per area; saat proses berjalan menunjukkan
  penanda sibuk dan tidak bisa ditekan ulang.
- **Dipakai di:** SCR-01, SCR-04, SCR-07, SCR-08, SCR-09, SCR-10, SCR-11, SCR-12, SCR-13, SCR-14, SCR-15, SCR-17, SCR-18, SCR-19.

### C-02 — MenuUtama
- **Anatomi:** nama pemilik (kiri) + tautan Home · About · Portfolio · Blog ·
  Contact + SaklarTema (kanan).
- **Perilaku:** layar sempit: tautan terlipat ke ≡; halaman aktif ditandai.
- **Dipakai di:** SCR-01 s.d. SCR-07.

### C-03 — SaklarTema
- **Anatomi:** tombol ikon ☀/☾.
- **Perilaku:** mengganti mode terang ↔ gelap seketika; pilihan diingat pada
  kunjungan berikutnya. Wujud kapabilitas "tersedia mode terang dan gelap" dari
  Preferensi Visual pm_01_project.md (D-003).
- **Dipakai di:** SCR-01 s.d. SCR-07 (via MenuUtama), SCR-09 s.d. SCR-19 (via MenuAdmin).

### C-04 — KartuProject
- **Anatomi:** nama + gambaran singkat 2 baris + tag keahlian (+ gambar bila ada).
- **Perilaku:** seluruh kartu bisa ditekan → Detail Project; layar lebar: 2–3 kolom.
- **Dipakai di:** SCR-01, SCR-03.

### C-05 — ItemTulisan
- **Anatomi:** baris list (bukan kartu/kotak) — judul + tanggal + cuplikan awal
  isi 2 baris + thumbnail kecil di kanan (opsional, bila admin mengisi Gambar
  Sampul); antar-item dipisah garis tipis, tanpa bingkai/shadow; selalu 1
  kolom penuh lebar di semua ukuran layar (gaya medium.com — D-008/D-013).
- **Perilaku:** seluruh baris bisa ditekan → Detail Tulisan; urut terbaru di atas.
- **Dipakai di:** SCR-01, SCR-05.

### C-06 — TagKeahlian
- **Anatomi:** label pendek berlatar surface, bergaris border.
- **Perilaku:** statis, tidak bisa ditekan.
- **Dipakai di:** SCR-01, SCR-04 (v1.8 — dihapus dari SCR-02: About tidak lagi
  menampilkan keahlian sejak D-009, leftover lama diperbaiki bersama D-015).

### C-07 — TautanKontak
- **Anatomi:** ikon + label saluran (sesuai isian admin).
- **Perilaku:** email membuka aplikasi surel; tautan lain membuka tab baru.
- **Dipakai di:** SCR-07.

### C-08 — FormIsian
- **Anatomi:** label + isian + tanda * untuk wajib + baris pesan error di bawah
  isian.
- **Perilaku:** error ditampilkan per bagian yang salah (bingkai danger + pesan),
  bukan hanya ringkasan di atas form.
- **Dipakai di:** SCR-07, SCR-08, SCR-11, SCR-13, SCR-14, SCR-15, SCR-17, SCR-19.

### C-09 — NavKembali
- **Anatomi:** < + label tujuan ("Kembali ke Portfolio").
- **Perilaku:** kembali ke daftar/posisi sebelumnya — bukan sekadar ke atas
  halaman; dari form kelola: keluar tanpa menyimpan.
- **Dipakai di:** SCR-04, SCR-06, SCR-11, SCR-13.

### C-10 — MenuAdmin
- **Anatomi:** header (nama pemilik + "CMS Dashboard" + SaklarTema + [Keluar])
  + menu berkelompok, label Inggris (referensi desain admin client, pm_01
  D009): **Overview** (Dashboard) · **Content** (Posts, Projects, Tags,
  Skills, Media) · **Communication** (Messages, Contact Info) · **System**
  (Password).
- **Perilaku:** layar sempit: menu terlipat ke ≡, tetapi [Keluar] selalu terlihat
  tanpa membuka menu (US-016); bagian aktif ditandai. Label modul/menu boleh
  Inggris; sisa teks kelola (isian, tombol, pesan) tetap Bahasa Indonesia
  (uiux-agent 07 aturan 6 — perbaikan kesalahan lama, D-009).
- **Dipakai di:** SCR-09 s.d. SCR-19.

### C-11 — BarisKelola
- **Anatomi:** nama/judul item + meta singkat + badge status (opsional —
  Draft/Published/Archived, label Inggris karena mengikuti nilai enum status
  — dipakai SCR-10/SCR-12) + aksi "Ubah" & "Hapus".
- **Perilaku:** Hapus selalu membuka DialogKonfirmasi; di layar sempit aksi tetap
  terlihat per baris (tidak disembunyikan di balik ⋮).
- **Dipakai di:** SCR-10, SCR-12, SCR-14, SCR-15, SCR-17.

### C-12 — DialogKonfirmasi
- **Anatomi:** pertanyaan + nama item + [Batal] [Hapus].
- **Perilaku:** Hapus berwarna danger; Batal = pilihan aman & default; menutup
  dialog tanpa memilih = batal.
- **Dipakai di:** SCR-10, SCR-12, SCR-14, SCR-15, SCR-17, SCR-18.

### C-13 — PesanStatus
- **Anatomi:** bilah pesan singkat — varian berhasil / gagal / info.
- **Perilaku:** muncul setelah aksi (tersimpan, terkirim, terhapus, gagal masuk,
  terunggah); hilang sendiri setelah beberapa saat atau bisa ditutup.
- **Dipakai di:** SCR-07, SCR-08, SCR-10, SCR-12, SCR-14, SCR-15, SCR-17, SCR-18, SCR-19.

### C-14 — KartuPesan
- **Anatomi:** penanda belum-dibaca (titik/tebal, hanya bila status UNREAD) +
  nama pengirim + email + waktu + isi pesan utuh + aksi [Arsipkan]/[Kembalikan].
- **Perilaku:** urut terbaru di atas; email pengirim bisa ditekan (membuka
  aplikasi surel untuk membalas); membuka/menampilkan kartu menandai pesan
  sudah dibaca otomatis (AC-018-3); [Arsipkan]/[Kembalikan] memindah pesan
  antar tab Aktif ↔ Arsip tanpa menghapus (AC-018-4).
- **Dipakai di:** SCR-16.

### C-15 — SeksiTeks
- **Anatomi:** judul section (heading) + isi teks bebas (paragraf/daftar poin
  sederhana), statis di kode — bukan dikelola admin (pm_01 D007).
- **Perilaku:** statis, tidak bisa ditekan/interaktif.
- **Dipakai di:** SCR-02.

### C-16 — PilihanStatus
- **Anatomi:** 3 opsi radio/dropdown — **Draft · Published · Archived** (label
  Inggris, mengikuti nilai enum `PublishStatus` — konsisten dengan badge
  status di BarisKelola C-11, bukan diterjemahkan berbeda-beda di dua tempat).
- **Perilaku:** satu isian dalam form yang sama (bukan tombol simpan terpisah);
  status awal konten baru = Draft; hanya Published tampil di halaman publik.
- **Dipakai di:** SCR-11, SCR-13.

### C-18 — KartuStatistik
- **Anatomi:** ikon + label metrik + angka besar + keterangan kecil (mis. "Published: 11").
- **Perilaku:** statis, tidak bisa ditekan; angka hasil hitung otomatis — murni
  pemanis tampilan (pm_01 D009, non-blocking).
- **Dipakai di:** SCR-09.

### C-19 — BarisRingkasan
- **Anatomi:** thumbnail kecil + judul + tag/skill singkat + badge status + tanggal.
- **Perilaku:** seluruh baris bisa ditekan → form ubah item itu; berbeda dari
  BarisKelola (C-11) karena tanpa aksi Ubah/Hapus eksplisit di baris — cukup
  ringkasan baca-cepat.
- **Dipakai di:** SCR-09.

### C-20 — KartuMedia
- **Anatomi:** gambar thumbnail + nama file + ukuran berkas + aksi [Hapus].
- **Perilaku:** grid responsif (2 kolom layar sempit, 4–6 kolom layar lebar);
  urut terbaru; [Hapus] → DialogKonfirmasi (C-12).
- **Dipakai di:** SCR-18.

### C-21 — PintasanAksi
- **Anatomi:** ikon + label aksi singkat + keterangan kecil.
- **Perilaku:** menuju form tambah/halaman kelola terkait; murni navigasi
  cepat, tidak menyimpan apa pun sendiri.
- **Dipakai di:** SCR-09.

### C-17 — TabSwitch
- **Anatomi:** dua pilihan sejajar — Aktif · Arsip.
- **Perilaku:** menyaring daftar yang ditampilkan; tab Aktif = default terbuka.
- **Dipakai di:** SCR-16.

## Kebutuhan Aset

| Aset | Dari | Untuk |
|------|------|-------|
| Berkas CV terbaru (PDF) | Pemilik (statis, developer tempel ke kode — D007) | SCR-01 |
| Foto profil (opsional) | Pemilik (statis, developer tempel ke kode — D007) | SCR-01, SCR-02 |
| Teks perkenalan (About Hero, bahasa Indonesia) | Pemilik (statis, developer tempel ke kode — D007) | SCR-01, SCR-02 |
| Teks Engineering Principles, Development Workflow, Current Focus, Beyond Code (bahasa Indonesia) | Pemilik (statis, developer tempel ke kode — D007) | SCR-02 |
| Daftar keahlian (nama + ikon) | Pemilik (dikelola via SCR-14) | SCR-01, SCR-14 |
| Data project awal (nama, gambaran, deskripsi — dapat memuat peran, tautan, gambar, keahlian, tag) | Pemilik (via halaman admin) | SCR-03, SCR-04 |
| Gambar sampul tulisan (opsional, untuk thumbnail list & pratinjau share) | Pemilik (via halaman admin) | SCR-01, SCR-05 |
| Info kontak yang ditampilkan (email, tautan lain) | Pemilik (via halaman admin) | SCR-07 |

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
