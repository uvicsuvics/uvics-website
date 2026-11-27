# CLAUDE.md — UVICS

Instruksi utama proyek ada di `AGENTS.md` dan dimuat otomatis lewat baris impor di bawah. Jangan menyalin isi AGENTS.md ke file ini: ubah AGENTS.md agar Claude Code dan agent lain membaca aturan yang sama. File ini hanya berisi tambahan khusus Claude Code.

@AGENTS.md

---

## Tambahan khusus Claude Code

### Sebelum mengubah kode

- Cocokkan pekerjaan dengan issue GitHub-nya (`gh issue view <nomor>`): acceptance criteria issue adalah batas cakupan. Jangan menambah fitur di luar issue, PRD, dan `documents/DECISIONS.md`.
- Jika PRD dan spesifikasi bertentangan, ikuti keputusan berstatus **Diterima** di DECISIONS.md. Untuk keputusan berstatus **Usulan**, tanyakan ke pengguna sebelum membangun.

### Verifikasi sebelum menyatakan selesai

Jalankan pemeriksaan yang sama dengan CI dan laporkan hasil nyatanya, bukan perkiraan:

```bash
npm run lint
npm run typecheck
npm test
npm run test:db
npm run build
```

Simpan output panjang ke file lalu baca bagian akhirnya, jangan menampilkan seluruhnya.

### Git dan GitHub

- Ikuti `documents/DEVELOPMENT_WORKFLOW.md`: branch kerja dari `development`, PR ke `development`, format Conventional Commits.
- Commit lokal boleh. Push, membuat atau mengubah PR, merge, menutup issue, dan komentar di GitHub hanya setelah pengguna meminta atau mengonfirmasi.
- Pakai merge, bukan rebase, untuk branch yang sudah di-push. Jangan force push ke branch orang lain.
- Setelah merge `origin/development`, periksa `git diff --stat origin/development`. Karena PR di-squash, file yang sudah dihapus bisa muncul kembali tanpa konflik.

### Database dan Supabase

- Hanya ada satu project Supabase dan dipakai bersama sampai production. Jangan menjalankan `npm run db:migrate`, script seed, provisioning, atau tes hosted tanpa izin eksplisit pengguna.
- Migration yang sudah di-merge ke `development` dianggap sudah diterapkan: jangan diedit, buat migration baru.
- `supabase gen types --db-url` gagal terhubung ke PostgreSQL lokal (probe SSL). Jika `npm run db:types` tidak bisa dipakai, perbarui `types/database.ts` secara manual mengikuti format generator dan tambahkan tes compile-time.

### Lingkungan lokal (Windows)

- Shell utama PowerShell; Git Bash juga tersedia. Path proyek mengandung spasi, jadi selalu beri tanda kutip.
- `npm run test:db` mendeteksi PostgreSQL 18 atau 17 di `C:/Program Files/PostgreSQL/<versi>/bin`; override dengan `PG_BIN`.
- Saat menjalankan `pg_ctl start` sendiri, arahkan output ke file dan stdin ke `/dev/null`. Jangan mem-pipe output-nya, karena proses PostgreSQL menahan pipe dan perintah tidak pernah selesai.
