# ISS-039 — [FE] Layar Media (galeri + unggah)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-023, ISS-025 |
| **Serves** | SCR-18 |
| **Covers** | AC-022-1, AC-022-2, AC-022-3 |

## Deskripsi

Kelola Media admin (`/admin/media`, SCR-18) — galeri grid + unggah.
Mengonsumsi `SA-36` (`getMediaGallery`, Server Component) & `SA-19`/
`SA-20` (`uploadMedia`/`deleteMedia`). **Arsitektur unik lagi** (beda
dari `ISS-033`..`038`): `Media` **tanpa** operasi ubah sama sekali —
cuma tambah (unggah) & hapus, jadi **TANPA state `editingX`/mode ubah**
seperti `Skill`/`ContactInfo`/`Tag`. `uploadMedia` (`SA-19`) adalah
**satu-satunya** Server Action di seluruh proyek yang benar-benar
menyentuh Cloudflare R2 & **satu-satunya** yang tetap memakai
`FormData` asli berisi berkas (`ISS-023`) — issue ini FE pertama dengan
unggah berkas sungguhan (beda dari `thumbnailImage` Project/Tulisan
yang cuma memilih URL dari galeri ini).

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-36`/
`SA-19`/`SA-20` di `techlead_03_api_contract.md` **SUDAH SINKRON**
dengan salinan di `ISS-023` (sudah compiled), tanpa selisih. Techlead
**tidak disentuh**. `gap_list` (`uiux.yaml` & `issue.yaml`) dicek:
**NOL gap terbuka**. `docs/layout/` dicek lengkap: **tanpa referensi
visual khusus Media** — SCR-18 sudah tersepesifikasi lengkap sejak awal
proyek.

**Build-order `MediaCard`** — `blocked_by` **TETAP** `[ISS-023,
ISS-025]`, **TIDAK diperluas**: `MediaCard` (C-20) `used_in: [SCR-18]`
**saja** (dicek langsung), dibangun **fresh, co-located** di issue ini
sendiri — pola sama `MessageCard`/`TabSwitch` (`ISS-037`), `ShareLinks`/
`PostNav` (`ISS-029`): komponen 1-konsumen selalu co-located, tidak
pernah dipinjam dari `shared/components/`.

**Celah kecil ditemukan di kontrak, ditambal via pilihan arsitektur
(bukan ubah kontrak)** — `uploadMedia` sukses cuma mengembalikan
`{ id, url }` (`ISS-023`), **tidak cukup** untuk merender `MediaCard`
baru secara optimistic (butuh `fileName`/`size`/`createdAt` juga).
Diputuskan: setelah `uploadMedia`/`deleteMedia` sukses, panggil
`router.refresh()` (`next/navigation`) untuk memicu `page.tsx`
mengambil `getMediaGallery()` segar — **bukan** optimistic-append
manual dari data yang tidak lengkap, **bukan** juga bergantung pada
`revalidatePath` internal `ISS-023` yang tidak diverifikasi (di luar
cakupan FE).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-18 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-18 — Media (galeri + unggah)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul "Media")
→ Galeri Media.

**Galeri Media**
- Atas: judul "Media" · `[+ Unggah Gambar]`
- Grid thumbnail (2 kolom layar sempit, 4–6 kolom layar lebar): tiap
  kartu = gambar + nama file + ukuran + `[Hapus]`, urut `createdAt`
  terbaru di atas.

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | `[+ Unggah Gambar]` | Button (C-01, primer) | Buka pemilih file → unggah → masuk galeri (AC-022-1) |
| 2 | Kartu media | MediaCard (C-20, BARU) | Urut terbaru; `[Hapus]` → ConfirmDialog |
| 3 | Dialog hapus | ConfirmDialog (C-12) | Konfirmasi dulu; Hapus = danger (AC-022-3) |
| 4 | Pesan hasil | StatusMessage (C-13) | "Terunggah" / "Terhapus" setelah aksi |

**State: kosong** — "Belum ada gambar. Unggah yang pertama." +
`[+ Unggah Gambar]` di tengah area galeri (AC-022-2).

**State: mengunggah** — kartu placeholder dengan penanda sibuk di
posisi pertama grid, selama proses unggah berlangsung.

**State: konfirmasi-hapus** — dialog: "Hapus gambar '{nama file}'? Bila
masih dipakai di Project/Tulisan, tautannya di sana tidak otomatis
kosong." `[Batal]` `[Hapus]`.

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-18) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/12/13/20). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-22 (admin mengelola media) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-19` (`docs/techlead_03_api_contract.md` / `ISS-023`) —
server tetap sumber kebenaran, FE re-validasi murni UX:

- `file` — wajib; jenis jpg/png/webp; ukuran ≤2MB (G-003 techlead).
  Input file FE diberi `accept="image/jpeg,image/png,image/webp"`
  sebagai bantuan UX (bukan validasi definitif — server tetap
  memvalidasi ulang, gagal → `error.fields`).
- Tanpa isian teks apa pun — `fileName`/`size`/`mimeType` seluruhnya
  dihitung server-side dari berkas, tidak diminta dari admin
  (`ISS-023`).

## Aturan Bisnis/Perilaku

- **Satu Client Component (`MediaManager`, `"use client"`, BARU)
  membungkus seluruh section Galeri Media** (tombol/form unggah + grid)
  — beda dari `SkillsManager`/`ContactInfoManager`/`TagsManager`:
  **tanpa** state `editingX`/mode ubah (Media tak punya operasi ubah
  sama sekali), state lokalnya cuma `isUploading` (boolean, untuk kartu
  placeholder sibuk).
- **`page.tsx` (Server Component) memanggil `getMediaGallery()`
  (`SA-36`) langsung**, dioper sebagai prop `media` ke `MediaManager`
  — **dipakai langsung, TIDAK disalin ke local state** (beda dari
  `initialSkills`/`initialContacts`/`initialTags` di issue lain) —
  supaya `router.refresh()` (lihat di bawah) otomatis membawa data
  segar tanpa risiko state basi/prop-vs-state desync.
- **Submit unggah**: `MediaManager` membangun `FormData` dari input
  file terpilih → set `isUploading=true` → panggil `uploadMedia(formData)`
  (`SA-19`) langsung (pola sama seluruh Server Action lain di proyek
  ini — dipanggil langsung dari Client Component, bukan native form
  action) → sukses: `router.refresh()` (`next/navigation`) supaya
  `page.tsx` mengambil ulang `getMediaGallery()` yang sudah menyertakan
  berkas baru dengan data lengkap; gagal: tampilkan `error.fields`.
  `isUploading` kembali `false` di kedua jalur.
- **`MediaCard` (C-20, BARU, co-located, `"use client"`)** — menerima
  satu item media sebagai props; memegang state `ConfirmDialog`
  miliknya sendiri (pola sama `ManageRow`); menekan `[Hapus]` → dialog
  → konfirmasi → panggil `deleteMedia(id)` (`SA-20`) → sukses:
  `router.refresh()`; SELALU sesudah konfirmasi, tidak ada jalur hapus
  langsung.
- **Tag yang/gambar yang masih dipakai Project/Tulisan tetap bisa
  dihapus** — tautannya di sana **tidak** otomatis kosong (`ISS-023`,
  tanpa FK); teks dialog konfirmasi eksplisit memperingatkan ini.
- **Tanpa `StatusSelect`/status tayang** — `Media` murni katalog
  berkas, tanpa konsep Draf/Terbit/Arsip sama sekali.

## Auth & Permission

- `SA-36`, `SA-19`, `SA-20`: seluruhnya **admin ber-sesi** (Matriks
  Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts` (`ISS-012`,
  AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01), ConfirmDialog (C-12), StatusMessage (C-13) — seluruhnya
`ISS-025`.

**Dibangun PERTAMA KALI di issue ini (co-located, bukan `shared/`):**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| MediaCard (C-20) | `app/admin/media/_components/` | Entity-bearing, `used_in` cuma SCR-18 — 1 konsumen, pola sama MessageCard/TabSwitch (`ISS-037`) |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir
ulang**.

## Struktur File (referensi awal)

```
src/app/admin/media/
├── page.tsx                        ← SCR-18 — Server Component,
│                                       getMediaGallery() (SA-36),
│                                       render <MediaManager
│                                       media={...} />
└── _components/
    ├── MediaManager.tsx              ← BARU, "use client" — form
    │                                    unggah + state isUploading +
    │                                    grid, panggil uploadMedia
    │                                    (SA-19) + router.refresh()
    └── MediaCard.tsx                 ← C-20 (BARU) — "use client",
                                          state ConfirmDialog sendiri,
                                          panggil deleteMedia (SA-20)
                                          + router.refresh()
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getMediaGallery`/`uploadMedia`/`deleteMedia` SUDAH ADA
(dibangun `ISS-023` — `features/media/media.action.ts`); issue ini cuma
memanggilnya.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/media/page.tsx` — Media (galeri + unggah) sesuai
      Spesifikasi Layar.
- [ ] `MediaManager` (Client Component, BARU) — form unggah + state
      `isUploading` + grid.
- [ ] `MediaCard` (C-20, BARU) — kartu media + state ConfirmDialog +
      aksi Hapus.
- [ ] State kosong Galeri Media.
- [ ] State mengunggah (kartu placeholder sibuk).
- [ ] State konfirmasi-hapus.
- [ ] State error-validasi unggah (jenis/ukuran file salah).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- Endpoint `getMediaGallery`/`uploadMedia`/`deleteMedia` — sudah
  selesai (`ISS-023`), termasuk unggah fisik ke R2 & S3 delete.
- Bucket Cloudflare R2 itu sendiri — sudah selesai (`ISS-003`).
- Pemilih galeri Media di Form Project/Tulisan (memilih
  `thumbnailImage` dari sini) — `ISS-033`/`ISS-034` masing-masing,
  bukan issue ini.
- Membersihkan `thumbnailImage` yang jadi tautan rusak setelah `Media`
  sumbernya dihapus — tidak ada di kontrak manapun (`ISS-023`,
  G-017 BA).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan/Keahlian/Contact Info, Messages, Tags) — issue fitur
  masing-masing.

## Acceptance Criteria

- [ ] Admin berada di halaman Media, mengunggah gambar baru (jpg/png/
      webp ≤2MB) → gambar tersimpan dan muncul di galeri (AC-022-1).
- [ ] Admin mengunggah berkas dengan jenis/ukuran tidak sesuai → berkas
      tidak tersimpan, admin melihat pemberitahuan bagian yang salah
      (AC-022-1).
- [ ] Ada gambar yang pernah diunggah, admin membuka halaman Media →
      seluruh gambar tampil dalam galeri, urut terbaru; kondisi belum
      ada gambar ditangani wajar (AC-022-2).
- [ ] Ada gambar di galeri, admin menghapusnya → muncul konfirmasi
      dulu; setelah dikonfirmasi, gambar hilang dari galeri (AC-022-3).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type
      check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): unggah gambar
      valid (kartu placeholder sibuk muncul, lalu tergantikan gambar
      asli), unggah jenis/ukuran salah, hapus gambar, state kosong.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe/pendekatan
      `router.refresh()` perlu berubah → laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-18 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-22 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/12/13/20 — `docs/uiux_03_design_system.md`
  (v1.20 — tidak berubah, C-20 dipakai apa adanya sejak semula)
- **Kontrak API:** `SA-36`, `SA-19`, `SA-20` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-039
  mengonfirmasi sinkron dengan `ISS-023`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-022-1, AC-022-2, AC-022-3 —
  `docs/ba_03_acceptance_criteria.md`
