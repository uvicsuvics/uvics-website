# Workflow Pengembangan UVICS

**Diperbarui:** 10 Oktober 2026
**Berlaku untuk:** semua kontributor (frontend, backend, PM)
**Rujukan:** [Aturan kode (AGENTS.md)](../AGENTS.md) · [Kontrak backend](BACKEND_CONVENTIONS.md) · [Runbook operator](BACKEND_OPERATIONS.md) · [Catatan keputusan](DECISIONS.md)

Dokumen ini menjelaskan jalur sebuah pekerjaan dari issue sampai rilis. Aturan penulisan kode ada di AGENTS.md; dokumen ini tidak mengulangnya.

## 1. Alur singkat

```text
Issue  →  branch dari development  →  commit  →  PR ke development
       →  CI hijau + review  →  squash merge  →  tutup issue  →  rilis ke main
```

## 2. Branch

| Branch | Fungsi | Aturan |
| --- | --- | --- |
| `main` | Rilis | Tidak ada push langsung. Hanya menerima PR rilis dari `development`. |
| `development` | Integrasi | Base semua PR fitur. Tidak ada push langsung. |
| Branch kerja | Satu issue atau satu perubahan | Dibuat dari `development` terbaru, dihapus setelah merge. |

Format nama branch kerja: `<tipe>/<topik-singkat>`, huruf kecil dengan tanda hubung.

| Tipe | Untuk |
| --- | --- |
| `feature/` | Fitur atau halaman baru |
| `fix/` | Perbaikan bug |
| `docs/` | Dokumentasi |
| `test/` | Penambahan tes saja |
| `refactor/` | Perubahan struktur tanpa mengubah perilaku |
| `chore/` | Konfigurasi, dependency, tooling |

Contoh: `feature/public-registration`, `fix/organization-timestamps`.

```bash
git fetch origin
git switch -c feature/public-registration origin/development
```

## 3. Issue

- **Judul:** `[S{sprint}-{area}-{nomor}] Deskripsi singkat`. Area: `FE` (frontend), `BE` (backend), `PM` (project management). Contoh: `[S2-BE-01] Implement Secure Public Registration Submission`.
- **Label:** satu label area (`frontend`, `backend`, `project-management`) dan satu label sprint (`sprint-1`, `sprint-2`, …).
- **Isi minimum:** PIC, tujuan, acceptance criteria berupa checklist, dependency ke issue lain, dan rujukan ke PRD/spesifikasi.
- **Satu PIC per issue.** Pekerjaan lintas orang dipecah menjadi issue terpisah yang saling merujuk.
- Keputusan yang muncul saat mengerjakan issue dicatat di [DECISIONS.md](DECISIONS.md), bukan hanya di komentar.

## 4. Commit

Format [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipe>(<scope>): <ringkasan> (#<issue>)
```

- **Tipe:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.
- **Scope:** domain atau modul, mis. `organization`, `membership`, `cms`, `homepage`, `admin`, `security`.
- **Ringkasan:** kalimat perintah, maksimal ±72 karakter, Bahasa Indonesia atau Inggris (konsisten dalam satu PR).

Contoh: `fix(membership): enforce normalized stored phone format (D04) (#8)`.

Aturan:

- Satu commit = satu perubahan logis yang lulus tes.
- Jangan commit `.env.local`, secret, folder `scratch/`, hasil tes (`test-results/`), atau script residu.
- Pakai akun Git milik sendiri. Periksa `git config user.name` dan `user.email` sebelum commit pertama.

## 5. Menjaga branch tetap sinkron

Pakai **merge**, bukan rebase, untuk branch yang sudah di-push atau dipakai bersama. Jangan force push ke branch orang lain.

```bash
git fetch origin
git merge origin/development
```

**Perhatian setelah squash merge.** PR di-squash ke `development`, sehingga commit asli PR tidak ada di histori `development`. Jika branch Anda dibangun di atas PR lain yang sudah di-squash:

1. Setelah merge `origin/development`, jalankan `git diff --stat origin/development` dan pastikan hanya file milik PR Anda yang berubah.
2. File yang sudah Anda hapus bisa muncul kembali tanpa konflik. Periksa dan hapus lagi bila perlu.
3. Jika isi `development` sudah sepenuhnya ada di branch Anda (tree sama dengan commit yang pernah Anda merge), `git merge -s ours origin/development` aman dipakai. Verifikasi dulu dengan `git diff --stat`.

## 6. Pull request

### Sebelum membuka PR

Jalankan pemeriksaan lokal yang sama dengan CI:

```bash
npm run lint
npm run typecheck
npm test
npm run test:db
npm run build
npm run check:migrations
```

`npm run test:db` membutuhkan binary PostgreSQL 17 atau 18 lokal (dideteksi otomatis di Windows; override dengan `PG_BIN`). Detail di [README](../README.md#verifikasi).

### Aturan PR

- **Base:** `development`. PR ke `main` hanya untuk rilis (bagian 8).
- **Judul:** format commit, mis. `feat(membership): implement membership data foundation (#8)`.
- **Draft** bila belum siap review atau masih menunggu PR lain. Tulis dependency di deskripsi: `Depends on #16`.
- **CI wajib hijau.** Check `verify` lulus bila semua job lulus:
  - `static`: lint tanpa warning, typecheck, dan guard migration append-only (`npm run check:migrations`).
  - `unit`: Vitest.
  - `database`: `test:db` di PostgreSQL 17 dan 18, termasuk cek `types/database.ts` terhadap schema.
  - `e2e`: build dan Playwright subset.
- **Minimal satu reviewer** yang bukan author dan bukan penulis commit terakhir.
- PR yang mengubah RLS, grants, audit, atau fungsi SQL berprivilege direview owner security (Jordan).
- Satu PR fokus pada satu issue. Perubahan di luar cakupan issue dipisah ke PR lain.

### Template deskripsi PR

```markdown
## Ringkasan
Apa yang diubah dan kenapa (1–3 kalimat).

## Issue
Refs #<issue>

## Perubahan utama
- …

## Verifikasi
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm test
- [ ] npm run test:db
- [ ] npm run build
Bukti tambahan (screenshot, output, langkah manual):

## Database
- [ ] Tidak ada perubahan schema
- [ ] Migration baru (additive), tes di tests/db, types/database.ts diperbarui

## Risiko dan catatan
Dependency, keputusan baru (DECISIONS.md), hal yang belum diuji.
```

## 7. Merge dan setelah merge

1. **Squash merge** ke `development`. Judul commit: judul PR diikuti nomor PR, mis. `feat(membership): implement membership data foundation (#8) (#17)`.
2. **Tutup issue secara manual** dengan komentar `Selesai via #<PR>`. Kata kunci `Closes #N` hanya bekerja untuk merge ke default branch (`main`), jadi issue tidak tertutup otomatis saat merge ke `development`.
3. Hapus branch kerja.
4. Beri tahu pemilik PR yang bergantung (komentar di PR mereka) bahwa dependency sudah masuk.

## 8. Rilis ke `main`

- Dilakukan PM di akhir sprint atau saat ada versi yang siap dipakai.
- Buat PR dari `development` ke `main` dengan daftar issue/PR yang masuk.
- Gunakan **merge commit**, bukan squash, agar histori `main` dan `development` tetap sejalan dan rilis berikutnya tidak berkonflik.
- Migration ke Supabase hosted dijalankan operator terpisah sesuai [runbook](BACKEND_OPERATIONS.md), bukan saat build.

## 9. Database dan migration

- File baru di `supabase/migrations/` dengan nama `YYYYMMDDHHMMSS_<topik>.sql`.
- **Migration yang sudah diterapkan tidak boleh diedit** (runner memeriksa checksum). Perubahan schema selalu berupa migration baru.
- Satu migration membawa tabel, constraint, index, grants, RLS, dan fungsinya sekaligus.
- Tes SQL di `tests/db/<domain>.sql`, didaftarkan di `scripts/test-database.mjs`. Setiap file tes membuka transaksinya sendiri, membuat fixture sendiri, dan diakhiri `rollback`.
- Uji akses untuk tiga peran: admin aktif, authenticated non-admin, dan `anon`.
- Perbarui `types/database.ts` sesuai schema. Jika generator belum bisa dijalankan, tulis manual mengikuti format generator dan tambahkan tes compile-time.
- Seed memakai identitas sintetis (`@example.invalid`, NIM `SEED-…`) dengan ID tetap agar bisa dibersihkan terarah.

## 10. Definition of Done

Sebuah issue selesai jika:

- Acceptance criteria issue terpenuhi dan dicentang di issue.
- Validasi server, error state, dan empty state tersedia (PRD §54–55).
- Responsive di mobile dan desktop untuk perubahan UI.
- Tes otomatis tersedia untuk logika bisnis, RLS, atau constraint yang ditambahkan.
- CI hijau dan PR sudah direview serta di-merge ke `development`.
- Issue ditutup dan keputusan baru tercatat di DECISIONS.md.
- Dokumentasi terkait diperbarui bila kontrak, route, atau schema berubah.

## 11. Pengaturan GitHub yang disarankan

Dilakukan admin repository:

- Branch protection untuk `main` dan `development`: wajib lewat PR, wajib status check `verify` (agregat semua job CI; job lain tidak perlu didaftarkan satu per satu), minimal satu approval, larang force push dan penghapusan branch.
- Default merge method untuk PR fitur: squash.
- Hapus branch otomatis setelah merge.
