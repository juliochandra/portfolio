# ISS-038 — [FE] Layar Tags (kelola)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-022, ISS-025, ISS-033 |
| **Serves** | SCR-17 |
| **Covers** | AC-021-1, AC-021-2 |

## Deskripsi

Kelola Tag admin — **satu layar tunggal** (`/admin/tags`, SCR-17) yang
menggabungkan form tambah/ubah DAN daftar dalam satu halaman, pola
identik `ISS-035`/`ISS-036` (Skills/Contact Info) — BUKAN pola
`ISS-033`/`ISS-034` (Project/Tulisan) yang punya route form terpisah.
Mengonsumsi `SA-35` (`getTagsAdmin`, Server Component) & `SA-16`/
`SA-17`/`SA-18` (`createTag`/`updateTag`/`deleteTag`, form/aksi). `Tag`
**tidak** punya status Draf/Terbit/Arsip — jadi **tanpa `StatusSelect`**,
pola sama `ISS-035`/`036`. **Entitas paling sederhana sejauh ini**: cuma
satu field, `name` (wajib, unik, maks 50 karakter) — **tanpa** `icon`
atau field lain apa pun, satu-satunya form 1-isian di antara seluruh
issue Kelola.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-35`/
`SA-16`/`SA-17`/`SA-18` di `techlead_03_api_contract.md` **SUDAH
SINKRON** dengan salinan di `ISS-022` (sudah compiled), tanpa selisih.
Techlead **tidak disentuh**. `gap_list` (`uiux.yaml` & `issue.yaml`)
dicek: **NOL gap terbuka**. `docs/layout/` dicek lengkap: **tanpa
referensi visual khusus Tags** — SCR-17 sudah tersepesifikasi lengkap
sejak awal proyek.

**Build-order `ManageRow`** — `blocked_by` diperluas
`[ISS-022, ISS-025]` → `[ISS-022, ISS-025, ISS-033]`: baris Tag pakai
`ManageRow` (C-11) **baseline TANPA ikon** (dikonfirmasi eksplisit
`D-027` uiux: "TIDAK dipakai SCR-17 — baris cuma nama tanpa ikon,
anatomi lama sudah cukup"), dipinjam apa adanya dari `shared/
components/` (`ISS-033`, konsumen pertama) — pola sama `ISS-034`
(Tulisan). **Beda dari `ISS-035`/`036`** yang memakai varian
`ManageRow` +ikon.

**Relasi lintas-fitur** — `Tag` dipakai **bersama** `Project`/`Post`
(relasi m-n implisit, `tagIds`) — `deleteTag` cuma melepas
keterkaitannya (Prisma `disconnect` otomatis), **tidak** ikut menghapus
Project/Tulisan pemakainya (AC-021-2, `ISS-022`).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-17 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-17 — Tags (kelola tag)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul "Tags")
→ Form Tambah Tag → Daftar Tag — SATU halaman, tanpa route terpisah.

**Form Tambah Tag**
- Nama * : ___________________
- Aksi: `[+ Tambah]` (mode tambah) / `[Simpan]` (mode ubah)

**Daftar Tag**
- Baris per tag: nama + aksi Ubah · Hapus (TANPA ikon — `ManageRow`
  baseline)

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Form tambah/ubah | FormField (C-08) | Simpan → tag baru/terbarui masuk daftar & tersedia dipilih di Form Project/Tulisan (AC-021-1) |
| 2 | Baris tag | `ManageRow` (C-11, dipakai apa adanya, TANPA ikon) | Ubah → form di atas terisi data lama, tombol jadi `[Simpan]`; Hapus → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger (AC-021-2) |
| 4 | Pesan hasil | StatusMessage (C-13) | "Tersimpan" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada tag. Tambahkan yang pertama." di tengah
area daftar; form tambah tetap tampil di atas.

**State: konfirmasi-hapus** — dialog: "Hapus tag '{nama}'? Project/
Tulisan yang memakainya tidak ikut terhapus, cuma kehilangan tag ini."
`[Batal]` `[Hapus]`.

**State: error-validasi** — Nama kosong/duplikat dibingkai danger +
pesan di bawah isian; tidak tersimpan.

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-17) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/11/12/13). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-21 (admin mengelola tag) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-16`/`SA-17` (`docs/techlead_03_api_contract.md` /
`ISS-022`) — server tetap sumber kebenaran, FE re-validasi murni UX:

- `name` — wajib; maks 50 karakter; **unik** (AC-021-1, `ENT-03`) — pola
  sama `name` Skill (bukan `label` ContactInfo yang tanpa constraint
  unik).
- `slug` — **tidak** jadi isian form sama sekali; dibuat otomatis
  server-side dari `name` (D-010 techlead), disiapkan di skema tapi
  belum dipakai route apa pun (disiapkan utk kebutuhan filter publik
  di masa depan, G-014 BA — di luar cakupan issue ini).

## Aturan Bisnis/Perilaku

- **Satu Client Component (`TagsManager`, `"use client"`) menangani
  form DAN daftar** — pola identik `ISS-035`/`036`, beda dari
  `ISS-033`/`034` (Server Component daftar + Client Component form
  terpisah dua route). State lokal `editingTag` (`null` = mode tambah,
  terisi = mode ubah) menentukan: nilai awal form, label tombol
  (`[+ Tambah]`/`[Simpan]`), & Server Action yang dipanggil saat submit
  (`createTag` vs `updateTag`).
- **`page.tsx` (Server Component) memanggil `getTagsAdmin()` (`SA-35`)
  langsung**, dioper sebagai `initialTags` ke `TagsManager`.
- Menekan **"Ubah"** pada satu `ManageRow` → `editingTag` diisi data
  baris itu → form di atas terisi ulang (FLOW-21 langkah 3) — TANPA
  navigasi, TANPA route baru.
- Menekan **"Hapus"** → `ConfirmDialog` dulu → setelah dikonfirmasi,
  panggil `deleteTag` (`SA-18`) — SELALU sesudah konfirmasi; bila baris
  yang dihapus sedang dalam mode ubah, form direset kembali ke mode
  tambah. Tag yang sedang dipakai Project/Tulisan **tetap bisa
  dihapus** — hanya keterkaitannya yang lepas, Project/Tulisan
  pemakainya tidak ikut terhapus (AC-021-2).
- **`ManageRow` (C-11) dipakai apa adanya, TANPA ikon** — beda dari
  `ISS-035`/`036` yang memakai varian +ikon (`D-027`); baris Tag cuma
  nama+aksi, sesuai anatomi dasar `ManageRow` sejak dibangun `ISS-033`.
  Komponen lain (`FormField`/`Button`/`ConfirmDialog`/`StatusMessage`)
  dipakai apa adanya tanpa perluasan.
- **Tanpa `StatusSelect`** — `Tag` tidak punya status tayang; begitu
  `createTag`/`updateTag` sukses, langsung tersedia dipilih di Form
  Project/Tulisan pada request berikutnya — tanpa cache/delay.
- **`slug` dibuat otomatis server-side dari `name`** — FE tidak
  mengisi/menampilkan field `slug` di form sama sekali (D-010 techlead).

## Auth & Permission

- `SA-35`, `SA-16`, `SA-17`, `SA-18`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01), FormField (C-08), `ManageRow` (C-11, baseline TANPA
ikon), ConfirmDialog (C-12), StatusMessage (C-13) — seluruhnya
`ISS-025`/`ISS-033`.

**TIDAK ada komponen yang diperluas di issue ini** — beda dari `ISS-035`
(yang memperluas `ManageRow` +ikon): baris Tag memakai anatomi dasar
`ManageRow` apa adanya sejak `ISS-033`, tanpa butuh slot ikon sama
sekali.

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir
ulang**.

## Struktur File (referensi awal)

```
src/app/admin/tags/
└── page.tsx                        ← SCR-17 — Server Component,
                                        getTagsAdmin() (SA-35), render
                                        <TagsManager initialTags={...} />
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getTagsAdmin`/`createTag`/`updateTag`/`deleteTag` SUDAH ADA
(dibangun `ISS-022` — `features/tags/tags.action.ts`); issue ini cuma
memanggilnya. `TagsManager` (Client Component BARU, satu-satunya untuk
fitur ini, TANPA route `new/`/`[id]`) — co-located
`app/admin/tags/_components/` bila tidak dipakai fitur lain.
`shared/components/ManageRow.tsx` **tidak disentuh** — dipakai import
apa adanya, tanpa perubahan file.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/tags/page.tsx` — Tags (form + daftar) sesuai
      Spesifikasi Layar.
- [ ] `TagsManager` (Client Component) — mode tambah/ubah dalam satu
      form, state `editingTag`.
- [ ] Baris daftar pakai `ManageRow` (C-11) apa adanya, tanpa ikon.
- [ ] State kosong Daftar Tag.
- [ ] State konfirmasi-hapus (`ConfirmDialog`) — termasuk teks
      penjelas "Project/Tulisan yang memakainya tidak ikut terhapus".
- [ ] State error-validasi Form Tambah Tag (kosong & duplikat).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- `ManageRow` (C-11) itu sendiri — sudah dibangun `ISS-033`, issue ini
  cuma memakainya apa adanya (tanpa perluasan).
- Endpoint `getTagsAdmin`/`createTag`/`updateTag`/`deleteTag` — sudah
  selesai (`ISS-022`).
- Isian `tagIds` di Form Project/Tulisan (memilih tag yang sudah ada)
  — bagian `ISS-033`/`ISS-034` masing-masing, bukan issue ini.
- Filter/halaman-per-tag publik — tidak ada di kontrak (G-014 BA).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan/Keahlian/Contact Info, Messages) — issue fitur
  masing-masing.

## Acceptance Criteria

- [ ] Admin menambah tag baru (nama) lalu menyimpan → tag tersimpan
      dan tersedia dipilih di form Project/Tulisan (AC-021-1).
- [ ] Admin menyimpan tanpa mengisi nama → tag tidak tersimpan, admin
      melihat pemberitahuan bagian yang harus diisi (AC-021-1).
- [ ] Admin mengubah tag yang sudah tersimpan lalu menyimpan → daftar
      tag menampilkan versi terbaru (AC-021-2).
- [ ] Admin menghapus tag → muncul konfirmasi dulu; setelah
      dikonfirmasi, tag hilang dari daftar (AC-021-2).
- [ ] Admin menghapus tag yang sedang dipakai satu atau lebih
      Project/Tulisan → keterkaitannya terlepas, Project/Tulisan itu
      sendiri tetap ada, tidak ikut terhapus (AC-021-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type
      check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tambah tag,
      ubah tag (form terisi ulang dari baris), hapus tag (termasuk tag
      yang sedang dipakai project/tulisan), state kosong, state
      konfirmasi-hapus, state error-validasi (kosong & duplikat).
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-17 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-21 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/08/11/12/13 — `docs/uiux_03_design_system.md`
  (v1.20 — `ManageRow` C-11 dipakai baseline, TANPA perluasan ikon)
- **Kontrak API:** `SA-35`, `SA-16`, `SA-17`, `SA-18` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-038
  mengonfirmasi sinkron dengan `ISS-022`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-021-1, AC-021-2 —
  `docs/ba_03_acceptance_criteria.md`
