# ISS-036 — [FE] Layar Contact Info (kelola)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-020, ISS-025, ISS-033 |
| **Serves** | SCR-15 |
| **Covers** | AC-015-1 |

## Deskripsi

Kelola Info Kontak admin — **satu layar tunggal** (`/admin/contact-info`,
SCR-15) yang menggabungkan form tambah/ubah DAN daftar dalam satu
halaman, pola identik `ISS-035` (Skills) — BUKAN pola `ISS-033`/`ISS-034`
(Project/Tulisan) yang punya route form terpisah (`new/`, `[id]/`).
Mengonsumsi `SA-33` (`getContactInfoAdmin`, Server Component) &
`SA-10`/`SA-11`/`SA-12` (`createContactInfo`/`updateContactInfo`/
`deleteContactInfo`, form/aksi). `ContactInfo` **tidak** punya status
Draf/Terbit/Arsip — begitu tersimpan, langsung tampil di halaman Contact
publik (`SA-28`, `ISS-015`) — jadi **tanpa `StatusSelect`**, sama seperti
`ISS-035`, beda dari `ISS-033`/`ISS-034`.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-33`/
`SA-10`/`SA-11`/`SA-12` di `techlead_03_api_contract.md` **SUDAH
SINKRON** dengan salinan di `ISS-020` (sudah compiled), tanpa selisih.
Techlead **tidak disentuh** siklus ini. `gap_list` (`uiux.yaml` &
`issue.yaml`) dicek: **NOL gap terbuka**. `docs/layout/` dicek lengkap
(seluruh sub-folder): `contact/contact.png` **SUDAH** dipakai duluan
untuk SCR-07 Contact publik (`ISS-030`, D-023 uiux) — bukan referensi
baru untuk layar admin ini; `docs/layout/cms/` (referensi sisi admin)
tidak bertambah isi sejak `D-025` (`ISS-031`/`ISS-033`).

**Siklus BERSIH — nihil temuan baru** (beda dari `ISS-034`/`ISS-035`
yang masing-masing menemukan satu celah upstream): `ManageRow` (C-11)
**sudah cukup apa adanya** — perluasan +ikon opsional (`D-027` uiux,
dilakukan di `ISS-035`) sudah eksplisit mencatat SCR-15 sebagai
konsumen berikutnya sejak awal, jadi tidak ada yang perlu ditambal lagi
di sini. Ikon (judul di depan) + Label (jadi slot "nama/judul") + Nilai
(jadi slot "meta singkat") + aksi Ubah/Hapus — seluruhnya pas ke anatomi
`ManageRow` yang sudah ada, murni **reuse**, bukan perluasan baru.
`blocked_by` mencakup `ISS-033` (asal `ManageRow` dibangun) selain
`ISS-020`/`ISS-025`, konsisten pola `ISS-034`/`ISS-035`.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-15 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`,
sidebar sejak koreksi D-024), issue ini **tidak** membangun ulang,
otomatis terwarisi lewat layout.

### SCR-15 — Contact Info (kelola info kontak)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul "Contact
Info") → Form Tambah Saluran → Daftar Saluran — SATU halaman, tanpa
route terpisah.

**Form Tambah Saluran**
- Label * : ___________________ (mis. "Email", "LinkedIn")
- Nilai * : ___________________ (alamat/tautan saluran)
- Ikon : {pilih dari daftar ikon} — **opsional**, beda dari Ikon Skill
  (`ISS-035`) yang wajib & daftar tech-stack khusus
- Aksi: `[+ Tambah]` (mode tambah) / `[Simpan]` (mode ubah)

**Daftar Saluran**
- Baris per saluran: ikon (opsional, `ManageRow` — sudah cukup, `D-027`)
  + label + nilai + aksi Ubah · Hapus

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah/ubah | FormField (C-08) | Simpan → saluran baru/terbarui masuk daftar & tampil di Contact publik (AC-015-1) |
| 2 | Baris saluran | `ManageRow` (C-11, dipakai apa adanya) | Ubah → form di atas terisi data lama, tombol jadi `[Simpan]`; Hapus → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger |
| 4 | Pesan hasil | StatusMessage (C-13) | "Tersimpan" / "Terhapus" setelah aksi (AC-015-1) |

**State: kosong** — "Belum ada saluran kontak. Tambahkan yang pertama."
di tengah area daftar; form tambah tetap tampil di atas.

**State: konfirmasi-hapus** — dialog: "Hapus saluran '{label}'? Tindakan
ini tidak bisa dibatalkan." `[Batal]` `[Hapus]`.

**State: error-validasi** — Label/Nilai kosong dibingkai danger + pesan
di bawah isian; tidak tersimpan.

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-15) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/11/12/13). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-16 (admin mengelola info kontak) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-10`/`SA-11` (`docs/techlead_03_api_contract.md` /
`ISS-020`) — server tetap sumber kebenaran, FE re-validasi murni UX:

- `label` — wajib; maks 100 karakter — nama saluran (mis. "Email",
  "LinkedIn", `ENT-07`). **Tanpa** constraint unik — dua baris berlabel
  sama diizinkan, beda dari `name` Skill (`ISS-035`) yang unik.
- `value` — wajib; maks 255 karakter — alamat/tautan saluran (`ENT-07`).
- `icon` — **opsional** murni, tanpa AC yang mensyaratkannya; maks 100
  karakter; string nama ikon dari daftar ikon generik (bukan input
  bebas, bukan unggah berkas) — beda dari `icon` Skill yang wajib
  secara produk & daftar tech-stack khusus.

## Aturan Bisnis/Perilaku

- **Satu Client Component (`ContactInfoManager`, `"use client"`)
  menangani form DAN daftar** — pola identik `ISS-035`, beda dari
  `ISS-033`/`ISS-034` (Server Component daftar + Client Component form
  terpisah dua route). State lokal `editingContact` (`null` = mode
  tambah, terisi = mode ubah) menentukan: nilai awal form, label tombol
  (`[+ Tambah]`/`[Simpan]`), & Server Action yang dipanggil saat submit
  (`createContactInfo` vs `updateContactInfo`).
- **`page.tsx` (Server Component) memanggil `getContactInfoAdmin()`
  (`SA-33`) langsung**, dioper sebagai `initialContacts` ke
  `ContactInfoManager`.
- Menekan **"Ubah"** pada satu `ManageRow` → `editingContact` diisi data
  baris itu → form di atas terisi ulang (FLOW-16 langkah 3) — TANPA
  navigasi, TANPA route baru.
- Menekan **"Hapus"** → `ConfirmDialog` dulu → setelah dikonfirmasi,
  panggil `deleteContactInfo` (`SA-12`) — **hard delete** permanen,
  tanpa undo (`ENT-07`); SELALU sesudah konfirmasi, tidak ada jalur
  hapus langsung; bila baris yang dihapus sedang dalam mode ubah, form
  direset kembali ke mode tambah.
- **`ManageRow` (C-11) dipakai apa adanya** — sudah diperluas +ikon
  opsional lebih dulu di `ISS-035` (`D-027` uiux), yang eksplisit sudah
  mengantisipasi SCR-15 sebagai konsumen berikutnya. **TIDAK ada
  perluasan komponen apa pun di issue ini** — `FormField`/`Button`/
  `ConfirmDialog`/`StatusMessage`/`ManageRow` seluruhnya reuse murni.
- **Tanpa `StatusSelect`** — `ContactInfo` tidak punya status tayang;
  begitu `createContactInfo`/`updateContactInfo`/`deleteContactInfo`
  sukses, langsung berefek ke halaman Contact publik pada request
  berikutnya (`SA-28`, `ISS-015`) — tanpa cache/delay, tanpa aksi
  terpisah (sama pola `Skill`/`ISS-035`).
- **`icon` dipilih dari daftar ikon generik tetap** (bukan galeri Media,
  bukan unggah berkas, bukan daftar tech-stack seperti Skill) — sumber
  daftarnya aset statis di kode FE, bukan data dari Server Action apa
  pun; **opsional** — form tetap valid & tersimpan tanpa ikon dipilih.

## Auth & Permission

- `SA-33`, `SA-10`, `SA-11`, `SA-12`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01), FormField (C-08), `ManageRow` (C-11, sudah termasuk
perluasan +ikon `D-027`), ConfirmDialog (C-12), StatusMessage (C-13) —
seluruhnya `ISS-025`/`ISS-033`/`ISS-035`.

**TIDAK ada komponen yang diperluas di issue ini** — beda dari `ISS-035`
(yang memperluas `ManageRow` +ikon): perluasan itu sudah proaktif
mengantisipasi SCR-15 sejak dilakukan, jadi siklus ini murni pemakaian
apa adanya, tanpa temuan celah baru.

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir
ulang**.

**Aset:** daftar ikon generik (nama-nama ikon yang bisa dipilih) — aset
statis FE, bukan bagian kontrak backend; `icon` cuma menyimpan
nama/key-nya sebagai string (sama mekanisme `Skill.icon`, `ISS-035`,
tapi daftar sumbernya beda/lebih umum, bukan khusus tech-stack).

## Struktur File (referensi awal)

```
src/app/admin/contact-info/
└── page.tsx                        ← SCR-15 — Server Component,
                                        getContactInfoAdmin() (SA-33),
                                        render <ContactInfoManager
                                        initialContacts={...} />
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getContactInfoAdmin`/`createContactInfo`/
`updateContactInfo`/`deleteContactInfo` SUDAH ADA (dibangun `ISS-020` —
`features/contact/contact.action.ts`); issue ini cuma memanggilnya.
`ContactInfoManager` (Client Component BARU, satu-satunya untuk fitur
ini, TANPA route `new/`/`[id]`) — co-located
`app/admin/contact-info/_components/` bila tidak dipakai fitur lain.
`shared/components/ManageRow.tsx` **tidak disentuh** — dipakai import
apa adanya, tanpa perubahan file.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/contact-info/page.tsx` — Contact Info (form + daftar)
      sesuai Spesifikasi Layar.
- [ ] `ContactInfoManager` (Client Component) — mode tambah/ubah dalam
      satu form, state `editingContact`.
- [ ] Baris daftar pakai `ManageRow` (C-11) apa adanya, termasuk slot
      ikon opsional.
- [ ] State kosong Daftar Saluran.
- [ ] State konfirmasi-hapus (`ConfirmDialog`).
- [ ] State error-validasi Form Tambah Saluran.

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- `ManageRow` (C-11) itu sendiri & perluasan +ikon — sudah selesai
  (`ISS-033` asal komponen, `ISS-035` perluasan ikon).
- Endpoint `getContactInfoAdmin`/`createContactInfo`/
  `updateContactInfo`/`deleteContactInfo` — sudah selesai (`ISS-020`).
- Halaman Contact publik (baca `ContactInfo` via `SA-28`) — sudah
  selesai (`ISS-030`).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan/Keahlian) — issue fitur masing-masing.

## Acceptance Criteria

- [ ] Admin menambah saluran kontak baru (label + alamat/tautan,
      ikon opsional) lalu menyimpan → saluran baru tampil di halaman
      Contact publik (AC-015-1).
- [ ] Admin menyimpan tanpa mengisi label atau alamat/tautan → saluran
      tidak tersimpan, admin melihat pemberitahuan bagian yang harus
      diisi (AC-015-1).
- [ ] Admin mengubah saluran kontak yang sudah tersimpan lalu
      menyimpan → halaman Contact publik menampilkan versi terbaru
      (AC-015-1).
- [ ] Admin menghapus saluran kontak → muncul konfirmasi dulu; setelah
      dikonfirmasi, saluran itu hilang dari halaman Contact publik
      (AC-015-1).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type
      check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tambah saluran,
      ubah saluran (form terisi ulang dari baris), hapus saluran,
      state kosong, state konfirmasi-hapus, state error-validasi.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-15 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-16 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/08/11/12/13 — `docs/uiux_03_design_system.md`
  (v1.20 — `ManageRow` C-11 dipakai apa adanya, sudah termasuk perluasan
  `D-027`)
- **Kontrak API:** `SA-33`, `SA-10`, `SA-11`, `SA-12` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-036
  mengonfirmasi sinkron dengan `ISS-020`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-015-1 —
  `docs/ba_03_acceptance_criteria.md`
