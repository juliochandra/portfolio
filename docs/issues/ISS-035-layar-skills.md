# ISS-035 — [FE] Layar Skills (kelola keahlian)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-019, ISS-025, ISS-033 |
| **Serves** | SCR-14 |
| **Covers** | AC-014-1, AC-014-2 |

## Deskripsi

Kelola Keahlian admin — **satu layar tunggal** (`/admin/skills`, SCR-14)
yang menggabungkan form tambah/ubah DAN daftar dalam satu halaman, TIDAK
seperti `ISS-033`/`ISS-034` (Project/Tulisan) yang punya route form
terpisah (`new/`, `[id]/`). Mengonsumsi `SA-32` (`getSkillsAdmin`,
Server Component) & `SA-07`/`SA-08`/`SA-09` (`createSkill`/`updateSkill`/
`deleteSkill`, form/aksi). `Skill` **tidak** punya status Draf/Terbit/
Arsip — begitu tersimpan, langsung tampil di ringkasan Keahlian Home
(`SA-38`, `ISS-016`) — jadi **tanpa `StatusSelect`**, beda dari
`ISS-033`/`ISS-034`.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-32`/
`SA-07`/`SA-08`/`SA-09` di `techlead_03_api_contract.md` **SUDAH
SINKRON** dengan salinan di `ISS-019` (sudah compiled), tanpa selisih.
Techlead **tidak disentuh** siklus ini. `gap_list` (`uiux.yaml` &
`issue.yaml`) dicek: **NOL gap terbuka tersisa** (`G-011` sudah bersih
sejak `ISS-034`). `docs/layout/` dicek lengkap (seluruh sub-folder,
bukan cuma `cms/`): **tanpa referensi visual khusus Skills** — SCR-14
sudah tersepesifikasi lengkap sejak awal proyek.

**Temuan pre-check (D-027 uiux/D-033 issue.yaml)**: `ManageRow` (C-11)
punya celah laten — SCR-14 sudah lama menulis "Baris per keahlian: ikon
+ nama + aksi Ubah/Hapus", & `used_in` `C-11` sendiri sudah lama
mencantumkan `SCR-14`, tapi anatomi `C-11` tak pernah mencantumkan slot
ikon. Ditambal **di issue ini** (in-place, pola sama `D-025`
FormField/`ISS-031`) — `ManageRow` kini resmi punya ikon opsional di
depan judul; **TIDAK** memicu recompile `ISS-033` (baris Project di
sana memang tanpa ikon, spesifikasinya tetap akurat apa adanya).
`blocked_by` mencakup `ISS-033` (asal `ManageRow` dibangun) selain
`ISS-019`/`ISS-025`.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-14 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`,
sidebar sejak koreksi D-024), issue ini **tidak** membangun ulang,
otomatis terwarisi lewat layout.

### SCR-14 — Skills (kelola keahlian)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul "Skills")
→ Form Tambah Keahlian → Daftar Keahlian — SATU halaman, tanpa route
terpisah.

**Form Tambah Keahlian**
- Nama * : ___________________
- Ikon * : {pilih dari daftar ikon tech-stack}
- Aksi: `[+ Tambah]` (mode tambah) / `[Simpan]` (mode ubah)

**Daftar Keahlian**
- Baris per keahlian: **ikon** (C-11 diperluas, D-027) + nama + aksi
  Ubah · Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah/ubah | FormField (C-08) | Simpan → keahlian baru/terbarui masuk daftar & tampil di ringkasan Home (AC-014-1, AC-014-2) |
| 2 | Baris keahlian | `ManageRow` (C-11, DIPERLUAS +ikon) | Ubah → form di atas terisi data lama, tombol jadi `[Simpan]`; Hapus → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger (AC-014-2) |
| 4 | Pesan hasil | StatusMessage (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada keahlian." di tengah area daftar; form
tambah tetap tampil di atas.

**State: konfirmasi-hapus** — dialog: "Hapus keahlian '{nama}'? Tindakan
ini tidak bisa dibatalkan." `[Batal]` `[Hapus]`.

**State: error-validasi** — Nama/Ikon kosong dibingkai danger + pesan
di bawah isian; tidak tersimpan (AC-014-1).

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-14) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/11/12/13). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-15 (admin mengelola keahlian) — `docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-07`/`SA-08` (`docs/techlead_03_api_contract.md` /
`ISS-019`) — server tetap sumber kebenaran, FE re-validasi murni UX:

- `name` — wajib; maks 50 karakter; **unik** (AC-014-1, `ENT-04`) — beda
  dari `title` Project/Post yang tidak unik; server menolak duplikat,
  FE menampilkan error dari `error.fields` apa adanya.
- `icon` — wajib **secara produk** ("nama + ikon", AC-014-1) meski
  nullable di skema; maks 100 karakter; dipilih dari daftar nama
  tech-stack (bukan input bebas, bukan unggah berkas — `icon` cuma
  string nama ikon, `ENT-04`).
- `slug` — **tidak** jadi isian form sama sekali; dibuat otomatis
  server-side dari `name` (D-010 techlead), disiapkan di skema tapi
  belum dipakai route apa pun.

## Aturan Bisnis/Perilaku

- **Satu Client Component (`SkillsManager`, `"use client"`) menangani
  form DAN daftar** — beda dari pola `ISS-033`/`ISS-034` (Server
  Component daftar + Client Component form terpisah dua route). State
  lokal `editingSkill` (`null` = mode tambah, terisi = mode ubah)
  menentukan: nilai awal form, label tombol (`[+ Tambah]`/`[Simpan]`),
  & Server Action yang dipanggil saat submit (`createSkill` vs
  `updateSkill`).
- **`page.tsx` (Server Component) memanggil `getSkillsAdmin()` (`SA-32`)
  langsung**, dioper sebagai `initialSkills` ke `SkillsManager`.
- Menekan **"Ubah"** pada satu `ManageRow` → `editingSkill` diisi data
  baris itu → form di atas terisi ulang (FLOW-15 langkah 3) — TANPA
  navigasi, TANPA route baru.
- Menekan **"Hapus"** → `ConfirmDialog` dulu → setelah dikonfirmasi,
  panggil `deleteSkill` (`SA-09`) — SELALU sesudah konfirmasi, tidak
  ada jalur hapus langsung; bila baris yang dihapus sedang dalam mode
  ubah, form direset kembali ke mode tambah.
- **`ManageRow` (C-11) DIPERLUAS di sini** — ikon opsional di depan
  judul (D-027 uiux/D-033 issue.yaml), dipakai apa adanya dari
  `shared/components/` (`ISS-033`) lalu ditambah prop `icon` baru;
  komponen lain (`FormField`/`Button`/`ConfirmDialog`/`StatusMessage`)
  dipakai apa adanya tanpa perluasan.
- **Tanpa `StatusSelect`** — `Skill` tidak punya status tayang; begitu
  `createSkill`/`updateSkill` sukses, langsung tampil di ringkasan
  Keahlian Home pada request berikutnya (`SA-38`, `ISS-016`) — tanpa
  cache/delay, tanpa aksi terpisah.
- **`slug` dibuat otomatis server-side dari `name`** — FE tidak
  mengisi/menampilkan field `slug` di form sama sekali (D-010 techlead).
- **`icon` dipilih dari daftar ikon tech-stack tetap** (bukan galeri
  Media, bukan unggah berkas) — sumber daftarnya aset statis di kode FE
  (mis. konstanta/ikon-set bawaan), bukan data dari Server Action
  apa pun.

## Auth & Permission

- `SA-32`, `SA-07`, `SA-08`, `SA-09`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01), FormField (C-08), ConfirmDialog (C-12), StatusMessage
(C-13) — seluruhnya `ISS-025`.

**Diperluas di issue ini:**

| Komponen | Perluasan | Alasan |
|----------|-----------|--------|
| ManageRow (C-11) | +ikon opsional di depan judul | Celah laten SCR-14 vs anatomi lama C-11 (D-027 uiux/D-033 issue.yaml); in-place, tidak memicu recompile `ISS-033` |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir ulang**.

**Aset:** daftar ikon tech-stack (nama-nama ikon yang bisa dipilih) —
aset statis FE, bukan bagian kontrak backend; `icon` cuma menyimpan
nama/key-nya sebagai string.

## Struktur File (referensi awal)

```
src/app/admin/skills/
└── page.tsx                        ← SCR-14 — Server Component,
                                        getSkillsAdmin() (SA-32), render
                                        <SkillsManager initialSkills={...} />
src/shared/components/
└── ManageRow.tsx                    ← DIPERLUAS di sini (+prop icon),
                                        file yang sama ISS-033, bukan baru
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getSkillsAdmin`/`createSkill`/`updateSkill`/`deleteSkill`
SUDAH ADA (dibangun `ISS-019` — `features/skills/skills.action.ts`);
issue ini cuma memanggilnya. `SkillsManager` (Client Component BARU,
satu-satunya untuk fitur ini, TANPA route `new/`/`[id]`) — co-located
`app/admin/skills/_components/` bila tidak dipakai fitur lain.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/skills/page.tsx` — Skills (form + daftar) sesuai
      Spesifikasi Layar.
- [ ] `SkillsManager` (Client Component) — mode tambah/ubah dalam satu
      form, state `editingSkill`.
- [ ] `ManageRow` (C-11) diperluas +prop `icon`, dipakai di baris
      daftar.
- [ ] State kosong Daftar Keahlian.
- [ ] State konfirmasi-hapus (`ConfirmDialog`, AC-014-2).
- [ ] State error-validasi Form Tambah Keahlian (AC-014-1).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- `ManageRow` (C-11) itu sendiri (anatomi dasar) — sudah dibangun
  `ISS-033`, issue ini cuma memperluasnya +ikon.
- Endpoint `getSkillsAdmin`/`createSkill`/`updateSkill`/`deleteSkill` —
  sudah selesai (`ISS-019`).
- Ringkasan Keahlian Home (baca publik) — sudah selesai (`ISS-026`,
  `SA-38`/`ISS-016`).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan) — issue fitur masing-masing.

## Acceptance Criteria

- [ ] Admin menambah keahlian baru (nama + ikon) lalu menyimpan →
      keahlian tersimpan dan tampil di ringkasan Keahlian pada halaman
      Home (AC-014-1).
- [ ] Admin menyimpan tanpa mengisi nama atau ikon → keahlian tidak
      tersimpan, admin melihat pemberitahuan bagian yang harus diisi
      (AC-014-1).
- [ ] Admin mengubah keahlian yang sudah tersimpan lalu menyimpan →
      ringkasan Home menampilkan versi terbaru (AC-014-2).
- [ ] Admin menghapus keahlian → muncul konfirmasi dulu; setelah
      dikonfirmasi, keahlian hilang dari ringkasan Home (AC-014-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tambah keahlian,
      ubah keahlian (form terisi ulang dari baris), hapus keahlian,
      state kosong, state konfirmasi-hapus, state error-validasi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-14 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-15 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/08/11/12/13 — `docs/uiux_03_design_system.md`
  (v1.20, D-027 — ManageRow C-11 diperluas +ikon)
- **Kontrak API:** `SA-32`, `SA-07`, `SA-08`, `SA-09` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-035
  mengonfirmasi sinkron dengan `ISS-019`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-014-1, AC-014-2 —
  `docs/ba_03_acceptance_criteria.md`
