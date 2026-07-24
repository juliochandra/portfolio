# ISS-040 — [FE] Layar Password (ubah kata sandi sendiri)

| | |
|---|---|
| **Label** | `frontend` · `F-06` |
| **Ukuran** | S |
| **Blocked by** | ISS-012, ISS-025 |
| **Serves** | SCR-19 |
| **Covers** | AC-023-1, AC-023-2 |

## Deskripsi

Ubah kata sandi sendiri untuk admin (`/admin/password`, SCR-19).
Mengonsumsi `SA-21` (`changePassword`). **Arsitektur paling sederhana
di seluruh backlog**: SATU form 3-isian (kata sandi lama, baru,
konfirmasi), **tanpa** daftar/list/kartu apa pun — satu-satunya issue
Kelola yang tidak memakai `ManageRow`, `MediaCard`, atau komponen kartu
manapun. Tidak seperti `SA-19` (Media, wajib `FormData` karena berkas),
`changePassword` menerima objek biasa — pola calling convention sama
seluruh Server Action non-unggahan lain di proyek ini.

**Pre-check kontrak sebelum Spesifikasi Layar ditulis** — `SA-21` di
`techlead_03_api_contract.md` **SUDAH SINKRON** dengan salinan di
`ISS-012` (sudah compiled), tanpa selisih. `ISS-012` dikonfirmasi tetap
satu-satunya issue Backend yang `serves` `SA-21` (`serves: [Auth,
SA-21, SA-22, SA-23]`, `Out of Scope` `ISS-012` sendiri eksplisit
menyebut "Halaman ... Password (SCR-19) — ISS-040"). Techlead **tidak
disentuh**. `gap_list` (`uiux.yaml` & `issue.yaml`) dicek: **NOL gap
terbuka**. `docs/layout/` dicek lengkap: **tanpa referensi visual
khusus Password** — SCR-19 sudah tersepesifikasi lengkap sejak awal
proyek.

**Build-order `FormField`** — `blocked_by` **TETAP** `[ISS-012,
ISS-025]`, tanpa `+ISS-031`: `FormField` (C-08) **origin**-nya tetap
`ISS-025` (varian dasar) meski varian +ikon-di-dalam-isian & +tombol
lihat/sembunyikan password ditambal in-place belakangan di `ISS-031`
(`D-025` uiux, referensi `docs/layout/cms/login.png`). Konsisten dengan
pola `ManageRow` (blocked_by selalu menunjuk `ISS-033`/origin, tidak
pernah issue yang menambal satu variannya, `ISS-035`/`036`/`038`) —
nomor `ISS-NNN` berurutan = urutan pengerjaan, jadi varian yang
ditambal issue bernomor lebih kecil (`ISS-031` < `ISS-040`) otomatis
sudah tersedia begitu issue bernomor lebih besar ini dikerjakan, tanpa
perlu edge `blocked_by` eksplisit ke issue penambal.

## Spesifikasi Layar

Disalin ringkas dari `docs/uiux_02_wireframe.md` SCR-19 (definisi
lengkap di sana mengikat; issue ini cuma ringkasan actionable).

**Sidebar Admin** — sudah dibangun `app/admin/layout.tsx` (`ISS-025`),
issue ini **tidak** membangun ulang, otomatis terwarisi lewat layout.

### SCR-19 — Password (ubah kata sandi sendiri)

**Bagian (urutan tampil, atas → bawah):** Header Admin (judul
"Password") → Form Ubah Kata Sandi.

**Form Ubah Kata Sandi**
- Kata sandi lama * : ___________________
- Kata sandi baru * : ___________________
- Konfirmasi kata sandi baru * : ___________________
- Aksi: `[Simpan]`

| # | Elemen | Komponen | Perilaku |
|---|--------|----------|----------|
| 1 | Isian | FormField (C-08) | `*` = wajib; error per bagian (AC-023-2); ketiganya otomatis dapat tombol lihat/sembunyikan (D-025, berlaku umum utk isian bertipe password) |
| 2 | `[Simpan]` | Button (C-01, primer) | Kata sandi lama benar & konfirmasi cocok → state tersimpan (AC-023-1) |

**State: error-validasi** — kata sandi lama salah, atau kata sandi baru
& konfirmasi tidak cocok → dibingkai danger + pesan di bawah isian;
tidak tersimpan (AC-023-2); **sesi admin TIDAK diakhiri paksa** — tetap
di halaman ini dengan sesi berjalan (`ISS-012` eksplisit).

**State: tersimpan** — StatusMessage (C-13): "Kata sandi berhasil
diganti." (AC-023-1); ketiga isian dikosongkan kembali (kata sandi
lama tidak boleh tertinggal di layar setelah berhasil diganti).

**State: terlarang** — lihat SCR-09.

> Salinan ringkas dari `docs/uiux_02_wireframe.md` (SCR-19) &
> `docs/uiux_03_design_system.md` (§Komponen C-01/08/13). **Bila
> berbeda dengan dokumen itu, dokumen kontrak yang berlaku** — laporkan
> selisihnya, jangan memilih sendiri.

**Alur:** FLOW-23 (admin mengubah kata sandi sendiri) —
`docs/uiux_01_user_flow.md`.

## Aturan Validasi

Mirror dari `SA-21` (`docs/techlead_03_api_contract.md` / `ISS-012`) —
server tetap sumber kebenaran, FE re-validasi murni UX:

- `oldPassword`, `newPassword`, `confirmPassword` — ketiganya wajib.
- `newPassword` harus sama dengan `confirmPassword` — dicek ulang FE
  untuk UX cepat, tapi server tetap yang memutuskan (`error.fields`
  bisa muncul di `confirmPassword` bila tidak cocok, atau di
  `oldPassword` bila tidak cocok dengan `passwordHash` tersimpan).
- Tanpa aturan panjang/kompleksitas kata sandi baru yang spesifik di
  kontrak (`ISS-012`) — tidak ditambahkan sendiri oleh FE.

## Aturan Bisnis/Perilaku

- **Satu Client Component (`PasswordForm`, `"use client"`, BARU)**
  menangani ketiga isian — form paling sederhana di antara seluruh
  issue Kelola, **tanpa** state `editingX`/mode/daftar apa pun (beda
  dari SEMUA issue Kelola lain, yang minimal punya satu daftar).
  Memanggil `changePassword(data)` (`SA-21`) langsung dengan objek
  biasa (bukan `FormData` — beda dari `uploadMedia`, `ISS-039`).
- **Sukses**: tampilkan `StatusMessage` "Kata sandi berhasil diganti.",
  kosongkan ketiga isian. **Tidak** ada redirect/logout — sesi admin
  tetap berjalan (`ISS-012`, AC-023-1).
- **Gagal**: tampilkan `error.fields` per isian yang salah (bisa
  `oldPassword` dan/atau `confirmPassword`); isian **tidak**
  dikosongkan otomatis (biarkan admin memperbaiki), sesi tetap
  berjalan, tidak dipaksa keluar (AC-023-2).
- **Ketiga isian otomatis mewarisi varian password `FormField`**
  (ikon gembok + tombol lihat/sembunyikan, `D-025`) — kapabilitas
  umum FormField untuk SEMUA isian bertipe password di proyek ini,
  bukan eksklusif milik SCR-08 Login; dipakai apa adanya, **tanpa**
  perluasan baru.
- **Tanpa `ConfirmDialog`** — mengganti kata sandi bukan aksi
  destruktif yang perlu dikonfirmasi (beda dari seluruh `delete*` di
  proyek ini).

## Auth & Permission

- `SA-21`: **admin ber-sesi** (Matriks Akses, `techlead_03`) — dijaga
  ganda oleh `middleware.ts` (`ISS-012`, AC-009-3) di level route
  `/admin/*`. Tanpa sesi valid → `{ error: { message: "UNAUTHORIZED" } }`.

## Aset & Design System

**Dipakai apa adanya dari issue sebelumnya**: AdminNav (C-10, sidebar),
Button (C-01), FormField (C-08, termasuk varian password `D-025`),
StatusMessage (C-13) — seluruhnya `ISS-025` (+ varian password
ditambal `ISS-031`, lihat catatan build-order di Deskripsi).

**TIDAK ada komponen yang diperluas atau dibangun baru di issue ini** —
satu-satunya issue Kelola yang murni reuse penuh tanpa membangun satu
pun elemen UI baru (bukan cuma komponen `shared/`, `PasswordForm`
sendiri pun cuma pembungkus tipis 3 `FormField` + 1 `Button`).

Anatomi & perilaku detail tiap komponen: `docs/uiux_03_design_system.md`
§Komponen — **disalin apa adanya saat implementasi, bukan ditafsir
ulang**.

## Struktur File (referensi awal)

```
src/app/admin/password/
├── page.tsx                        ← SCR-19 — Server Component,
│                                       render <PasswordForm />
└── _components/
    └── PasswordForm.tsx              ← BARU, "use client" — 3 FormField
                                          + Button, panggil
                                          changePassword (SA-21)
```

*Referensi awal, tidak mengikat — ikuti struktur proyek bila sudah
terbentuk. `changePassword` SUDAH ADA (dibangun `ISS-012` —
`features/auth/auth.action.ts`); issue ini cuma memanggilnya.*

## In Scope / Out of Scope

**In Scope**
- [ ] `app/admin/password/page.tsx` — Password sesuai Spesifikasi
      Layar.
- [ ] `PasswordForm` (Client Component, BARU) — 3 isian + submit ke
      `changePassword`.
- [ ] State error-validasi (kata sandi lama salah / konfirmasi tidak
      cocok).
- [ ] State tersimpan (StatusMessage + isian dikosongkan).

**Out of Scope**
- Sidebar Admin/AdminNav, kerangka route `/admin/*` — sudah `ISS-025`.
- `FormField` (C-08) itu sendiri & varian password-nya — sudah selesai
  (`ISS-025` origin, `ISS-031` varian).
- Endpoint `changePassword` — sudah selesai (`ISS-012`).
- Halaman Masuk (`login`/`logout`, `SA-22`/`SA-23`) — sudah selesai
  (`ISS-031`), issue lain.
- Registrasi/lupa kata sandi — tidak ada di kontrak manapun (satu akun,
  Assumption BA A-005).
- Konten halaman lain (publik, Masuk Admin, Dashboard, Kelola
  Project/Tulisan/Keahlian/Contact Info, Messages, Tags, Media) — issue
  fitur masing-masing.

## Acceptance Criteria

- [ ] Admin mengisi kata sandi lama (benar) + kata sandi baru &
      konfirmasi (cocok) lalu menyimpan → kata sandi berhasil diganti,
      admin melihat pesan berhasil (AC-023-1).
- [ ] Admin mengisi kata sandi lama yang salah, ATAU kata sandi baru &
      konfirmasi tidak cocok, lalu menyimpan → perubahan ditolak, admin
      melihat pemberitahuan bagian yang salah, sesi tidak diakhiri
      paksa (AC-023-2).
- [ ] Lolos pemeriksaan kode yang berlaku di proyek (lint/format/type
      check).
- [ ] Test otomatis untuk jalur sukses & gagal di atas lulus.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Manual test di peramban (admin masuk lebih dulu): ganti kata
      sandi sukses (lalu verifikasi kata sandi baru benar-benar berlaku
      di percobaan masuk berikutnya), kata sandi lama salah, konfirmasi
      tidak cocok, sesi tetap berjalan setelah gagal.
- [ ] Semua test otomatis proyek lulus.
- [ ] Bila implementasi menemukan kontrak/wireframe perlu berubah →
      laporkan, jangan ubah sendiri.

## Referensi

- **Wireframe & alur:** SCR-19 — `docs/uiux_02_wireframe.md` (v1.20);
  FLOW-23 — `docs/uiux_01_user_flow.md` (v1.20)
- **Design system:** C-01/08/13 — `docs/uiux_03_design_system.md`
  (v1.20 — tidak berubah, C-08 dipakai apa adanya termasuk varian
  password `D-025`)
- **Kontrak API:** `SA-21` — `docs/techlead_03_api_contract.md` (tidak
  berubah — pre-check ISS-040 mengonfirmasi sinkron dengan `ISS-012`,
  tanpa perluasan)
- **Perilaku yang ditopang:** AC-023-1, AC-023-2 —
  `docs/ba_03_acceptance_criteria.md`
