# ISS-037 — [FE] Layar Messages (kelola pesan)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-021, ISS-025 |
| **Serves** | SCR-16 |
| **Covers** | AC-018-1, AC-018-2, AC-018-3, AC-018-4 |

## Deskripsi

Kelola Pesan Masuk admin (`/admin/messages`, SCR-16) — daftar pesan
dengan tab Active/Archived. Mengonsumsi `SA-34` (`getMessages`, Server
Component) & `SA-13`/`SA-14`/`SA-15` (`markMessageRead`/
`archiveMessage`/`unarchiveMessage`). **Arsitektur paling berbeda dari
seluruh issue Kelola sebelumnya** (`ISS-033`/`034`/`035`/`036`):
`Message` **tanpa** operasi tambah/ubah/hapus sama sekali (`ISS-021`,
Scope Validation) — pesan hanya dibuat pengunjung publik (`SA-29`,
`ISS-015`). Layar ini murni **baca + transisi status**
(`UNREAD`→`READ`→`ARCHIVED`↔`READ`), jadi **TANPA form, TANPA
`ConfirmDialog`, TANPA `StatusSelect`** — satu-satunya issue Kelola yang
begitu.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-34`/
`SA-13`/`SA-14`/`SA-15` di `techlead_03_api_contract.md` **SUDAH
SINKRON** dengan salinan di `ISS-021` (sudah compiled), tanpa selisih.
Techlead **tidak disentuh**. `gap_list` (`uiux.yaml` & `issue.yaml`)
dicek: **NOL gap terbuka**. `docs/layout/` dicek lengkap: **tanpa
referensi visual khusus Messages** — SCR-16 sudah tersepesifikasi
lengkap sejak awal proyek.

**Build-order `MessageCard`/`TabSwitch`** — `blocked_by` **TETAP**
`[ISS-021, ISS-025]`, **TIDAK diperluas**: `MessageCard` (C-14) &
`TabSwitch` (C-17) sama-sama `used_in: [SCR-16]` **saja** (dicek
langsung — `ISS-025` tidak menyebut keduanya sama sekali), beda dari
`ManageRow`/`StatusSelect` yang dipakai ≥2 fitur admin dan karenanya
dibangun di `shared/components/` sejak `ISS-033`. `MessageCard` &
`TabSwitch` dibangun **fresh, co-located** di issue ini sendiri (pola
sama `ShareLinks`/`PostNav`, C-28/C-29, `ISS-029` — komponen 1-konsumen
selalu co-located di fitur pemakainya, bukan `shared/`).

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-16 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-16 — Messages (kelola pesan masuk)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul
"Messages") → Tab Pesan → Daftar Pesan.

**Tab Pesan** — ( Active ) ( Archived ), default tab Active terbuka.

**Daftar Pesan**
- Kartu per pesan, urut `createdAt` terbaru di atas: penanda
  belum-dibaca (titik/tebal, hanya bila `UNREAD`) + nama pengirim +
  email + waktu + isi pesan utuh + aksi `[Arsipkan]` (tab Active) /
  `[Kembalikan]` (tab Archived).

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Tab | TabSwitch (C-17, BARU) | Active ↔ Archived, ganti daftar yang ditampilkan |
| 2 | Kartu pesan | MessageCard (C-14, BARU) | Urut terbaru (AC-018-1); tampil = tandai dibaca otomatis (AC-018-3); email bisa ditekan → aplikasi surel |
| 3 | `[Arsipkan]`/`[Kembalikan]` | Button (C-01, sekunder) | Pindah antar tab tanpa menghapus (AC-018-4) |

**State: kosong** — "Belum ada pesan masuk." (tab Active) / "Belum ada
pesan diarsipkan." (tab Archived) (AC-018-2).

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-16) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/14/17). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-18 (admin mengelola pesan masuk) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Tanpa form/input teks sama sekali di layar ini (`ISS-021`: `SA-13`/
`14`/`15` cuma menerima `id`, tanpa `error.fields`) — tidak ada Aturan
Validasi FE untuk divalidasi ulang.

## Aturan Bisnis/Perilaku

- **Tab via `searchParams`** (`?tab=aktif` default / `?tab=arsip`) —
  `TabSwitch` dirender sebagai dua `Link` biasa yang mengganti query
  string, **bukan** client state. `page.tsx` (Server Component)
  membaca `searchParams.tab`, teruskan apa adanya ke `getMessages`
  (`SA-34`).
- **`markMessageRead` dipanggil server-side, sebelum render** — untuk
  setiap baris `UNREAD` dalam hasil `getMessages` tab Active, `page.tsx`
  memanggil `markMessageRead(id)` (`SA-13`) **sebelum** mengirim HTML ke
  admin, memenuhi "otomatis tanpa aksi klik terpisah" (`ISS-021`,
  AC-018-3) tanpa butuh JS client sama sekali. Aman dari efek-samping
  prefetch tak sengaja karena `/admin/*` **selalu dynamic** (butuh
  sesi/cookie admin) — Next.js tidak mem-prefetch route dynamic.
  *(Keputusan arsitektur Issue Planner — kontrak `ISS-021` cuma
  menyatakan "otomatis, tanpa klik", tidak mewajibkan mekanisme
  spesifik; bila implementasi menemukan pendekatan ini bermasalah,
  laporkan, jangan diam-diam diubah tanpa catatan.)*
- **`[Arsipkan]`/`[Kembalikan]` via native form action** — tiap tombol
  dalam `<form>` kecil yang `action`-nya terikat langsung ke
  `archiveMessage`/`unarchiveMessage` (`SA-14`/`SA-15`) dengan `id`
  ter-bind, pola Server Action native Next.js — **tanpa** `onClick`/
  state client.
- **Hasil dari seluruh keputusan di atas: `ISS-037` adalah issue FE
  PERTAMA tanpa Client Component (`"use client"`) sama sekali** — beda
  dari `ISS-033`/`034`/`035`/`036` yang masing-masing minimal butuh 1
  Client Component form. `MessageCard`/`TabSwitch` keduanya Server
  Component murni.
- **Tanpa hapus/arsip permanen** — `archiveMessage`/`unarchiveMessage`
  murni transisi `status`, **tanpa** `ConfirmDialog` (tidak ada aksi
  destruktif yang perlu dikonfirmasi, `ISS-021` eksplisit).
- **Tanpa story ubah isi pesan** — `name`/`email`/`message` tidak
  pernah ditampilkan sebagai form/isian yang bisa diedit di layar ini.

## Auth & Permission

- `SA-34`, `SA-13`, `SA-14`, `SA-15`: seluruhnya **admin ber-sesi**
  (Matriks Akses, `techlead_03`) — dijaga ganda oleh `middleware.ts`
  (`ISS-012`, AC-009-3) di level route `/admin/*`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01) — seluruhnya `ISS-025`.

**Dibangun PERTAMA KALI di issue ini (co-located, bukan `shared/`):**

| Komponen | Lokasi | Alasan |
|----------|--------|--------|
| MessageCard (C-14) | `app/admin/messages/_components/` | Entity-bearing, `used_in` cuma SCR-16 — 1 konsumen, pola sama ShareLinks/PostNav (`ISS-029`) |
| TabSwitch (C-17) | `app/admin/messages/_components/` | `used_in` cuma SCR-16 — 1 konsumen |

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir
ulang**.

## Struktur File (referensi awal)

```
src/app/admin/messages/
├── page.tsx                        ← SCR-16 — Server Component,
│                                       baca searchParams.tab,
│                                       getMessages(SA-34), loop
│                                       markMessageRead(SA-13) utk
│                                       baris UNREAD tab Active
│                                       SEBELUM render
└── _components/
    ├── TabSwitch.tsx                ← C-17 (BARU) — dua Link,
    │                                    ?tab=aktif / ?tab=arsip
    └── MessageCard.tsx               ← C-14 (BARU) — Server Component,
                                          form kecil per Arsipkan/
                                          Kembalikan terikat SA-14/15
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `getMessages`/`markMessageRead`/`archiveMessage`/
`unarchiveMessage` SUDAH ADA (dibangun `ISS-021` —
`features/messages/messages.action.ts`); issue ini cuma memanggilnya.
Tanpa Client Component sama sekali (lihat Aturan Bisnis/Perilaku) —
beda dari seluruh issue Kelola FE sebelumnya yang masing-masing punya
minimal satu `_components/*Manager.tsx`/`*Form.tsx` `"use client"`.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/messages/page.tsx` — Messages (tab + daftar) sesuai
      Spesifikasi Layar.
- [ ] `TabSwitch` (C-17, BARU) — Active/Archived via `searchParams`.
- [ ] `MessageCard` (C-14, BARU) — kartu pesan + tandai-baca otomatis
      server-side + aksi Arsipkan/Kembalikan.
- [ ] State kosong tab Active & tab Archived (pesan berbeda).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- Endpoint `getMessages`/`markMessageRead`/`archiveMessage`/
  `unarchiveMessage` — sudah selesai (`ISS-021`).
- Formulir kirim pesan publik (`SA-29`) — sudah selesai (`ISS-015`,
  `ISS-030`).
- Story ubah isi pesan & hapus pesan — tidak ada di kontrak manapun
  (`ISS-021`, Scope Validation).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan/Keahlian/Contact Info) — issue fitur masing-masing.

## Acceptance Criteria

- [ ] Ada pesan yang pernah dikirim lewat formulir Contact, admin
      membuka Messages → daftar pesan tampil urut dari yang terbaru;
      tiap pesan menunjukkan nama, email pengirim, dan isinya
      (AC-018-1).
- [ ] Belum ada pesan yang masuk → kotak pesan tampil wajar dengan
      keterangan belum ada pesan (AC-018-2).
- [ ] Ada pesan berstatus belum dibaca, admin membuka/melihat pesan itu
      → status pesan otomatis berubah jadi sudah dibaca, tanpa aksi
      manual terpisah (AC-018-3).
- [ ] Admin mengarsipkan pesan yang sudah ditindaklanjuti → pesan
      pindah dari daftar utama ke daftar arsip, tidak terhapus, dapat
      dikembalikan kapan saja (AC-018-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type
      check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): tab Active
      default, buka pesan UNREAD → otomatis READ, Arsipkan → pindah ke
      Archived, Kembalikan → pindah balik ke Active, state kosong kedua
      tab.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe/pendekatan
      arsitektur (tandai-baca server-side) perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-16 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-18 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/14/17 — `docs/uiux_03_design_system.md`
  (v1.20 — tidak berubah, C-14/C-17 dipakai apa adanya sejak semula)
- **Kontrak API:** `SA-34`, `SA-13`, `SA-14`, `SA-15` —
  `docs/techlead_03_api_contract.md` (tidak berubah — pre-check ISS-037
  mengonfirmasi sinkron dengan `ISS-021`, tanpa perluasan)
- **Perilaku yang ditopang:** AC-018-1, AC-018-2, AC-018-3, AC-018-4 —
  `docs/ba_03_acceptance_criteria.md`
