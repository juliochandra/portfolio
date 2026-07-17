# ISS-021 — [BE] Kelola pesan masuk: daftar, baca-otomatis & arsip

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-010, ISS-012 |
| **Serves** | SA-34, SA-13, SA-14, SA-15 |
| **Covers** | AC-018-1, AC-018-2, AC-018-3, AC-018-4 |

## Deskripsi

Kelola Pesan Masuk untuk admin: daftar dengan filter tab (`SA-34`
`getMessages`), tandai-baca otomatis (`SA-13` `markMessageRead`), dan
arsipkan/kembalikan (`SA-14` `archiveMessage` · `SA-15`
`unarchiveMessage`) — F-06.7. Sama seperti ISS-017..020/022, keempat
Server Action di sini **admin ber-sesi**, memverifikasi token JWT
secara independen di dalam fungsinya masing-masing (D-012,
`docs/techlead_01_architecture.md`) — `blocked_by` mencakup `ISS-012`
(fondasi Auth) selain `ISS-010` (tabel `Message` sendiri). Berbeda dari
seluruh issue Kelola sebelumnya, `Message` **tanpa** operasi
tambah/ubah/hapus sama sekali — pesan hanya dibuat pengunjung publik
(`SA-29`, ISS-015, di luar cakupan issue ini) dan dibaca/diarsipkan
admin lewat transisi `status` (`UNREAD`→`READ`→`ARCHIVED`↔`READ`),
**tanpa** story hapus pesan (Scope Validation). Dipanggil langsung dari
halaman/form admin (bukan `fetch` ke Route Handler) — proyek ini murni
Server Action, tanpa Route Handler sama sekali (v2.9, D-022).

## Spesifikasi Endpoint

### SA-34 — `getMessages`

*v2.9 (D-022): menggantikan `EP-13` (Route Handler, dicabut).*

| | |
|---|---|
| **Melayani** | SCR-16 · FLOW-18 |
| **Menopang** | AC-018-1, AC-018-2 |
| **Entitas** | ENT-06 |

```ts
async function getMessages(params?: {
  tab?: "aktif" | "arsip"  // default "aktif" (UNREAD+READ); "arsip" = ARCHIVED
}): Promise<{
  data: { id: string; name: string; email: string; message: string; status: "UNREAD" | "READ" | "ARCHIVED"; createdAt: string }[]
}>
```

**Hasil:** urut `createdAt desc`; daftar kosong sah, bukan error
(AC-018-2).

### SA-13 — `markMessageRead`

```ts
async function markMessageRead(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-018-3 — dipanggil otomatis oleh FE saat kartu pesan
UNREAD dibuka/ditampilkan, tanpa aksi klik terpisah dari admin.

### SA-14 — `archiveMessage` · SA-15 — `unarchiveMessage`

```ts
async function archiveMessage(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
async function unarchiveMessage(id: string): Promise<{ data: { id: string } } | { error: { message: string } }>
```

**Menopang:** AC-018-4 — `archiveMessage` (dari tab Aktif) memindahkan
`status` ke `ARCHIVED`; `unarchiveMessage` (dari tab Arsip)
mengembalikan ke `READ`. Keduanya tanpa hapus data (Scope Validation —
tanpa story hapus pesan).

> Salinan dari SA-34, SA-13, SA-14, SA-15 untuk kenyamanan. **Bila
> berbeda dengan `docs/techlead_03_api_contract.md`, dokumen kontrak
> yang berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `tab` (`SA-34`) — opsional; salah satu `"aktif"`/`"arsip"`; default
  `"aktif"` bila tidak dikirim.
- `id` (`SA-13`/`SA-14`/`SA-15`) — wajib; merujuk baris `Message` yang
  sudah ada — Server Action mengembalikan `{ error: { message } }`
  bila `id` tidak ditemukan (bentuk error pesan tunggal, bukan
  `error.fields` — ketiganya tanpa form/input teks, cuma aksi atas
  baris yang sudah ada).
- Tanpa Server Action tambah/ubah isi pesan di issue ini —
  `name`/`email`/`message` (ENT-06) hanya divalidasi di `SA-29`
  (`sendMessage`, ISS-015) saat pesan pertama kali dibuat.

## Aturan Bisnis

- `SA-34` menyaring baris berdasar `tab`: `"aktif"` (default) =
  gabungan `UNREAD`+`READ`; `"arsip"` = `ARCHIVED` saja — beda dari
  `SA-30`/`SA-31`/`SA-32`/`SA-35` (Project/Post/Skill/Tag) yang selalu
  mengembalikan seluruh baris tanpa filter (ENT-06, ISS-010).
- Transisi status: `UNREAD → READ` **otomatis** dipanggil FE saat
  admin membuka/melihat pesan (AC-018-3, `SA-13`) — bukan aksi klik
  terpisah, beda dari pola tombol pada seluruh Server Action Kelola
  lain di proyek ini.
- `UNREAD|READ → ARCHIVED` saat admin menekan Arsipkan dari tab Aktif
  (`SA-14`, AC-018-4); `ARCHIVED → READ` saat admin menekan Kembalikan
  dari tab Arsip (`SA-15`) — **tidak pernah** kembali ke `UNREAD`
  setelah pertama kali dibaca.
- **Tanpa** Server Action hapus pesan sama sekali (Scope Validation,
  ISS-010) — arsip adalah satu-satunya cara "menyingkirkan" pesan dari
  daftar utama, selalu dapat dikembalikan kapan saja (AC-018-4). Beda
  dari `deleteProject`/`deletePost`/`deleteSkill`/`deleteContactInfo`/
  `deleteTag` (ISS-017/018/019/020/022) yang hard delete permanen — di
  sini **tidak ada** hard delete maupun `DialogKonfirmasi` (C-12) sama
  sekali, karena tidak ada aksi destruktif yang perlu dikonfirmasi.
- **Setiap Server Action di issue ini memverifikasi sesi admin ulang
  secara independen** di dalam fungsinya — tidak semata mengandalkan
  `middleware.ts` (D-012, ISS-012). Tanpa token valid → `{ error: {
  message: "UNAUTHORIZED" } }`.
- Dipanggil langsung dari halaman admin (`SA-34` Server Component;
  `SA-13`/`14`/`15` aksi tombol) — bukan Route Handler, tidak melalui
  `fetch`/path HTTP (v2.9, D-022).

## Auth & Permission

- `SA-34`, `SA-13`, `SA-14`, `SA-15`: seluruhnya **admin ber-sesi** —
  tanpa sesi valid, keempatnya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan status HTTP;
  pola dari ISS-012). Dijaga ganda oleh `middleware.ts` di layar
  pemanggilnya (SCR-16 — di bawah prefix `/admin/*`, AC-009-3).

## Perubahan Database

Tidak ada — tabel `Message` (ENT-06) & `enum MessageStatus` sudah
dibuat di ISS-010. Issue ini murni membaca baris yang ada dan mengubah
kolom `status`-nya, tanpa migrasi tambahan.

## Catatan Performa

- `getMessages` memakai index majemuk `status, createdAt` (dibuat
  ISS-010) secara langsung — filter tab (`status`) + urut terbaru
  (`createdAt desc`) dalam satu index, beda dari `getSkillsAdmin`/
  `getTagsAdmin`/`getContactInfoAdmin` yang indexnya "tidak relevan"
  karena tanpa filter status.
- `markMessageRead`/`archiveMessage`/`unarchiveMessage` — operasi
  update tunggal per baris (ubah `status` saja).

## Struktur File (referensi awal)

```
src/features/messages/
├── messages.action.ts                 ← + getMessages, markMessageRead,
│                                          archiveMessage, unarchiveMessage
│                                          ("use server")
├── messages.services.ts               ← + use case transisi status & filter tab
├── messages.repository.ts             ← akses Prisma (baca + update status)
└── messages.schema.ts                 ← tidak berubah — SA-13/14/15 cuma
                                           menerima id, SA-34 cuma tab; tanpa
                                           input teks baru yang perlu Zod
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Menyambung `features/messages/` yang sudah dibuka ISS-015
(`SA-29` `sendMessage`, keempat file sudah ada termasuk
`messages.schema.ts` untuk `name`/`email`/`message`) — issue ini
menambah fungsi ke `messages.action.ts`/`.services.ts`/`.repository.ts`
yang sudah ada, **tanpa** menyentuh `messages.schema.ts`. Tanpa Route
Handler apa pun — seluruhnya Server Action (v2.9, D-022; v2.10 D-023:
folder ini sendiri pola flat 4-file, bukan
`domain/application/infrastructure/presentation`).*

## In Scope / Out of Scope

**In Scope**
- [ ] `SA-34` `getMessages` — daftar tab Aktif (default) & tab Arsip,
      termasuk daftar kosong.
- [ ] `SA-13` `markMessageRead` — transisi `UNREAD`→`READ`.
- [ ] `SA-14` `archiveMessage` — transisi `UNREAD`/`READ`→`ARCHIVED`.
- [ ] `SA-15` `unarchiveMessage` — transisi `ARCHIVED`→`READ`.

**Out of Scope**
- Server Action kirim pesan publik (`SA-29`) — sudah selesai
  (ISS-015).
- Layar Messages (FE) — issue frontend (ISS-037).
- Migrasi model `Message` — sudah selesai (ISS-010).
- Fondasi Auth/sesi admin — sudah selesai (ISS-012), dipakai ulang di
  sini.
- Story ubah isi pesan & hapus pesan — tidak ada di kontrak (Scope
  Validation, ISS-010).

## Acceptance Criteria

- [ ] Ada pesan yang pernah dikirim lewat formulir Contact, admin
      membuka kotak pesan → daftar pesan tampil urut dari yang
      terbaru; tiap pesan menunjukkan nama, alamat email pengirim, dan
      isinya (AC-018-1).
- [ ] Belum ada pesan yang masuk, admin membuka kotak pesan → kotak
      pesan tampil wajar dengan keterangan belum ada pesan (AC-018-2).
- [ ] Ada pesan berstatus belum dibaca, admin membuka/melihat pesan
      itu → status pesan otomatis berubah jadi sudah dibaca, tanpa
      aksi manual terpisah (AC-018-3).
- [ ] Ada pesan yang sudah ditindaklanjuti admin, admin
      mengarsipkannya → pesan pindah dari daftar utama ke daftar
      arsip, tidak terhapus, dan dapat dikembalikan ke daftar utama
      kapan saja (AC-018-4).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (lewat halaman Messages di peramban, admin masuk
      lebih dulu) jalur tab Aktif/Arsip, tandai-baca otomatis,
      arsipkan & kembalikan.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-34, SA-13, SA-14, SA-15 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-06 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-018-1, AC-018-2, AC-018-3, AC-018-4 —
  `docs/ba_03_acceptance_criteria.md`
