# ISS-012 — [BE] Auth admin: masuk, keluar, pelindung sesi & ubah kata sandi sendiri

| | |
|---|---|
| **Label** | `backend` · `F-06` |
| **Ukuran** | M |
| **Blocked by** | ISS-004 |
| **Serves** | Auth, SA-21, SA-22, SA-23 |
| **Covers** | AC-009-1, AC-009-2, AC-009-3, AC-016-1, AC-023-1, AC-023-2 |

## Deskripsi

Fondasi keamanan seluruh halaman admin: admin masuk dengan username &
kata sandi (F-06.1), keluar mengakhiri sesinya (F-06.6), dan dapat
mengganti kata sandi sendiri (F-06.10). Tanpa issue ini, `/admin/*`
tidak terlindung — seluruh Server Action kelola terlindung lainnya
(ISS-017 s.d. ISS-024, yakni Kelola Project/Tulisan/Keahlian/Info
Kontak/Pesan/Tag/Media & Dashboard) menunggu mekanisme sesi ini
tersedia. Beda dari Server Action baca publik (SA-24 s.d. SA-29, SA-38
— mis. ISS-013) yang tidak butuh sesi sama sekali. Masuk & keluar
**dipanggil langsung dari form** (Server Action), konsisten dengan
seluruh form admin lain — proyek ini tanpa Route Handler sama sekali
(v2.8 D-021, diperluas v2.9 D-022,
`docs/techlead_01_architecture.md`). Auth memakai JWT (Access + Refresh
Token) + Bcrypt (TEAM_STACK.md) — cukup untuk skenario 1 akun admin
(`User`, ISS-004).

## Spesifikasi Endpoint

### SA-22 — `login` (Server Action, F-06.1)

```ts
async function login(data: {
  username: string
  password: string
}): Promise<
  | { data: { username: string } }
  | { error: { message: string } }
>
```

**Sukses:** `username`/`password` cocok dengan `User` tersimpan (Bcrypt
compare) → access & refresh token diset sebagai httpOnly cookie; admin
diarahkan ke Dashboard (AC-009-1).

**Gagal:** data masuk salah → `{ error: { message: string } }`, pesan
generik tanpa merinci bagian mana yang salah (AC-009-2).

### SA-23 — `logout` (Server Action, F-06.6)

```ts
async function logout(): Promise<{ data: { success: true } }>
```

**Sukses:** cookie access & refresh token dihapus; sesi berakhir,
halaman admin tidak lagi dapat diakses tanpa masuk kembali (AC-016-1).

### Pelindung Sesi — `middleware.ts` (AC-009-3)

Middleware menjaga seluruh route `/admin/*`: menolak akses **sebelum
halaman dirender** bila tidak ada access token JWT valid pada cookie —
dialihkan ke `/login`. Tidak menyentuh route `/login` itu sendiri
(D-019, `docs/techlead_01_architecture.md`).

### SA-21 — `changePassword` (Server Action, F-06.10)

```ts
async function changePassword(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<
  | { data: { success: true } }
  | { error: { fields: Record<string, string> } }
>
```

**Sukses:** `oldPassword` cocok dengan `passwordHash` tersimpan (Bcrypt
compare) dan `newPassword === confirmPassword` → `passwordHash`
diperbarui (AC-023-1).

**Gagal:** `oldPassword` tidak cocok, atau `newPassword` ≠
`confirmPassword` → `error.fields` (AC-023-2) — sesi admin **tidak**
diakhiri paksa, tetap login dengan sesi berjalan.

> Salinan dari SA-22, SA-23, SA-21 untuk kenyamanan. **Bila berbeda
> dengan `docs/techlead_03_api_contract.md`, dokumen kontrak yang
> berlaku** — laporkan selisihnya, jangan memilih sendiri.

## Aturan Validasi

- `username`, `password` (SA-22) — keduanya wajib; tanpa aturan panjang
  khusus di sisi request (dicocokkan ke `User.username`/`passwordHash`
  tersimpan).
- `oldPassword`, `newPassword`, `confirmPassword` (SA-21) — ketiganya
  wajib; `newPassword` harus sama dengan `confirmPassword`.

## Aturan Bisnis

- Token akses berumur 15 menit, token pembaruan 7 hari, keduanya
  httpOnly cookie (Assumption BA/Tech Lead G-004,
  `docs/techlead_01_architecture.md`). Refresh token memperbarui access
  token; keduanya dihapus saat keluar (SA-23).
- **Setiap Server Action tetap memverifikasi sesi ulang secara
  independen** di dalam fungsinya — tidak semata mengandalkan
  middleware, karena Server Action dapat dipanggil langsung tanpa lewat
  render halaman (praktik baku Next.js, `docs/techlead_03_api_contract.md`
  §Konvensi) — **kecuali `SA-22` (`login`)**, satu-satunya pengecualian:
  ia dipanggil justru untuk membuat sesi baru, bukan memverifikasi yang
  sudah ada (D-021). Tanpa token valid pada `SA-23`/`SA-21` → `{ error:
  { message: "UNAUTHORIZED" } }`.
- Kata sandi disimpan sebagai hash Bcrypt, tidak pernah dibandingkan
  sebagai teks polos (TEAM_STACK.md).
- `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` — nilai pengembangan/sandbox
  disiapkan sendiri per environment lokal (`.env`, tidak ikut commit);
  nilai produksi = titipan DevOps (`docs/techlead_01_architecture.md`
  §Open Questions).
- Tanpa Server Action/halaman registrasi publik — tepat satu akun,
  disiapkan lewat seed Data Awal (ISS-004, Assumption BA A-005).

## Auth & Permission

- `SA-22` (masuk): **publik** — satu-satunya Server Action tanpa sesi
  di seluruh backlog ini.
- `SA-23` (keluar), `SA-21` (`changePassword`): **admin ber-sesi** —
  tanpa sesi valid, keduanya mengembalikan `{ error: { message:
  "UNAUTHORIZED" } }` (bentuk Result Server Action, bukan HTTP status).
- Seluruh route `/admin/*` (kecuali `/login`): dijaga `middleware.ts`,
  dialihkan ke `/login` bila tanpa sesi (AC-009-3).

## Perubahan Database

Tidak ada — tabel `User` sudah dibuat di ISS-004 (ENT-08,
`docs/techlead_02_database.md`). Issue ini hanya membaca &
memperbarui (`passwordHash`) baris yang sudah ada, tanpa mengubah skema.

## Catatan Performa

Tidak ada — satu baris `User`, tanpa query kompleks/pagination.

## Struktur File (referensi awal)

```
middleware.ts                        ← penjaga /admin/* (AC-009-3)
src/features/auth/
├── auth.action.ts                   ← SA-22 login, SA-23 logout,
│                                        SA-21 changePassword ("use server")
├── auth.services.ts                 ← verifikasi kredensial (Bcrypt compare)
├── auth.repository.ts               ← baca/tulis baris User (Prisma)
└── auth.schema.ts                   ← validasi Zod (login, changePassword)
src/shared/                          ← util sign/verify JWT & hash Bcrypt, dipakai
                                        middleware.ts & seluruh Server Action lain
                                        saat verifikasi sesi ulang
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. Berbeda dari kompilasi sebelumnya: **tidak ada lagi**
`app/api/admin/login/route.ts` atau `logout/route.ts` — keduanya
digantikan Server Action di `features/auth/auth.action.ts` (v2.8, D-021;
v2.10 D-023: `features/auth/` sendiri pindah dari
`application/infrastructure/presentation` ke pola flat 4-file di atas).*

## In Scope / Out of Scope

**In Scope**
- [ ] SA-22 `login` — jalur sukses & gagal.
- [ ] SA-23 `logout`.
- [ ] `middleware.ts` — pelindung sesi seluruh `/admin/*`.
- [ ] SA-21 `changePassword` — jalur sukses & gagal.
- [ ] Util sign/verify JWT & hash/compare Bcrypt (`shared/`), dipakai
      ulang oleh Server Action fitur lain untuk verifikasi sesi mereka
      sendiri.

**Out of Scope**
- Halaman Masuk (SCR-08) & Password (SCR-19) — ISS-031, ISS-040.
- Registrasi akun publik/mandiri — tidak ada di kontrak (Assumption BA
  A-005).
- Server Action kelola terlindung lainnya (Project, Tulisan, dst.) —
  masing-masing issue sendiri, hanya memakai ulang util sesi dari issue
  ini.
- Migrasi/seed `User` — sudah selesai (ISS-004).

## Acceptance Criteria

- [ ] Data masuk benar → admin berada di halaman admin dan dapat mulai
      mengelola konten (AC-009-1).
- [ ] Data masuk salah → admin tidak masuk, melihat pemberitahuan
      generik data masuk keliru (AC-009-2).
- [ ] Belum masuk sebagai admin → halaman pengelolaan tidak dapat
      diakses (AC-009-3).
- [ ] Admin keluar → halaman admin tidak lagi dapat diakses tanpa masuk
      kembali (AC-016-1).
- [ ] Kata sandi lama benar + baru & konfirmasi cocok → kata sandi
      berhasil diganti, admin melihat pesan berhasil (AC-023-1).
- [ ] Kata sandi lama salah, atau baru & konfirmasi tidak cocok →
      perubahan ditolak, admin melihat pemberitahuan bagian yang salah,
      sesi tidak diakhiri paksa (AC-023-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint / format /
      type check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test (form di peramban, lewat halaman `/login` & tombol
      Keluar) jalur sukses & gagal SA-22/SA-23, middleware, dan SA-21.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak perlu berubah → laporkan,
      jangan ubah sendiri.

## Referensi

- **Kontrak endpoint:** SA-21, SA-22, SA-23 —
  `docs/techlead_03_api_contract.md`
- **Skema & aturan data:** ENT-08 — `docs/techlead_02_database.md`
- **Perilaku yang ditopang:** AC-009-1/2/3, AC-016-1, AC-023-1/2 —
  `docs/ba_03_acceptance_criteria.md`
