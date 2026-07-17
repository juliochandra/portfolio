# ISS-003 — [SETUP] Bucket Cloudflare R2 (sandbox)

| | |
|---|---|
| **Label** | `setup` |
| **Ukuran** | S |
| **Blocked by** | ISS-001 |
| **Serves** | Penyimpanan Berkas |
| **Covers** | — |

## Tujuan

Setelah issue ini selesai, aplikasi punya bucket Cloudflare R2 (sandbox)
siap dipakai fitur unggah berkas (thumbnail Project/Post, galeri Media) —
tanpa itu, fitur unggah tidak bisa diuji sama sekali karena proyek ini
tidak punya fallback penyimpanan lokal (D-017).

## Deskripsi

Penyimpanan berkas objek proyek Portfolio Developer sesuai Tech Stack
baku tim: bucket Cloudflare R2 (S3-compatible) untuk gambar unggahan
admin. Issue ini menyiapkan bucket & kredensial **sandbox/dev** saja —
berbeda dari Docker/Caddy/Cloudflare CDN/GitHub Actions (kerangka deploy
& CI), R2 tetap disiapkan lebih awal karena merupakan layanan cloud
terkelola yang langsung dipakai fitur unggah saat dikembangkan lokal
(sama seperti Neon di ISS-002), bukan alat orkestrasi deployment.

## Definition of Ready

- [ ] ISS-001 selesai.
- [ ] Akun Cloudflare tersedia untuk membuat bucket R2.

## Langkah

### 1. Cloudflare R2

- [ ] Buat bucket R2 untuk lingkungan sandbox/dev.
- [ ] Buat API token R2 (Access Key ID/Secret) khusus sandbox/dev.
- [ ] Set variabel `R2_*` (lihat Konfigurasi) di environment lokal.

*Referensi: `docs/techlead_01_architecture.md` §Tech Stack (Penyimpanan Berkas), §Environment & Deployment (v2.4, D-017)*

### 2. Verifikasi Akses

- [ ] Buktikan bucket bisa diakses: unggah satu berkas percobaan lewat
      S3 SDK/CLI, baca kembali URL publiknya, lalu hapus.

## Catatan — Jangan Lakukan

Issue ini hanya menyiapkan bucket & kredensial sandbox. Jangan
membuat/mengerjakan:

- Logika unggah berkas nyata dari form admin (upload dari
  `createProject`/`createPost`/`uploadMedia`) — bagian fitur masing-masing
  (ISS-017, ISS-018, ISS-023).
- Koneksi database — ISS-002 (Prisma/Neon).
- Docker, Docker Compose, Caddy, Cloudflare CDN/reverse proxy, GitHub
  Actions (CI maupun deploy) — **ditunda ke akhir backlog** per permintaan
  user (proyek masih dikembangkan lokal); Titipan, belum ada nomor issue.
- Bucket/kredensial produksi — titipan DevOps (G-007).

## Konfigurasi

- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`,
  `R2_BUCKET_NAME`, `R2_PUBLIC_URL` — nilai bucket sandbox/dev, tidak ikut
  ke repositori (`.env`, masuk `.gitignore`).
- Nilai produksi = titipan DevOps (`docs/techlead_01_architecture.md`
  §Open Questions, G-007 `docs/memory/issue.yaml`).

## Hasil yang Diharapkan

```
.env.example (tambahan R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
              R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)
```

## Verifikasi

- Bucket R2 sandbox terbukti bisa diakses (baca/tulis percobaan) dengan
  kredensial yang di-set.
- `R2_PUBLIC_URL` membuka berkas percobaan yang diunggah lewat peramban.

## Checklist Review (untuk reviewer)

1. Salin `.env.example` → `.env`, isi `R2_*` sendiri.
2. Jalankan skrip/perintah unggah percobaan (S3 SDK atau CLI seperti
   `aws s3 --endpoint-url ...` / `rclone`).
3. Buka `R2_PUBLIC_URL` hasil unggahan di peramban — pastikan berkas
   tampil.
4. Hapus berkas percobaan dari bucket.

## In Scope / Out of Scope

**In Scope**
- [ ] Bucket R2 sandbox/dev.
- [ ] Kredensial API token R2 sandbox/dev.
- [ ] `.env.example` terdokumentasi.

**Out of Scope**
- Docker, Docker Compose, Caddy, Cloudflare CDN/reverse proxy, GitHub
  Actions (CI & deploy) — Titipan, ditunda ke akhir backlog.
- Logika unggah berkas per fitur — ISS-017, ISS-018, ISS-023.
- Koneksi database — ISS-002.
- Bucket/kredensial/domain produksi — titipan DevOps (G-007).

## Acceptance Criteria

- [ ] Bucket R2 sandbox terbukti bisa dibaca/ditulis dengan kredensial
      yang di-set.
- [ ] `R2_PUBLIC_URL` membuka berkas percobaan lewat peramban.
- [ ] `.env.example` terdokumentasi dengan seluruh variabel `R2_*`.
- [ ] Langkah terdokumentasi & bisa diulang orang lain (README
      repositori).

## Deliverables

- Bucket R2 sandbox + kredensial dev.
- `.env.example` diperbarui.

## Definition of Done

- [ ] Code review selesai & disetujui.
- [ ] Verifikasi manual dilakukan.
- [ ] Tidak ada kredensial/rahasia yang ikut ke repositori.

## Completion Checklist

- [ ] `.env` (nilai sandbox asli) tidak ikut ke repositori.
- [ ] Berkas percobaan sudah dihapus dari bucket sebelum issue ditutup.
- [ ] Tidak ada kredensial produksi tertulis di mana pun dalam
      kode/config.

## Referensi

- **Stack & konvensi penyimpanan:** `docs/techlead_01_architecture.md` §Tech Stack (Penyimpanan Berkas), §Environment & Deployment
- **Batas dengan DevOps:** `docs/techlead_01_architecture.md` §Open Questions (G-007 `docs/memory/issue.yaml`)
