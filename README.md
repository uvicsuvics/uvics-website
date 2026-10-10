# UVICS website

Next.js App Router, Supabase PostgreSQL/Auth, Cloudinary. Hanya admin mempunyai akun; recruitment bukan signup Auth.

## Mulai lokal

Gunakan Node 22.14+ major 22, npm, dan package-lock.json. Jalankan `npm ci`, salin `.env.example` ke `.env.local`, isi melalui jalur lokal yang aman, lalu `npm run dev`. Login di `/admin/login`; tidak ada akun/password bawaan.

- [PRD](documents/PRD.md)
- [Tech stack](documents/TECH_STACK.md)
- [Kontrak backend](documents/BACKEND_CONVENTIONS.md)
- [Setup dan runbook operator](documents/BACKEND_OPERATIONS.md)

## Verifikasi

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npm run build`.

Database test membutuhkan binary PostgreSQL 17 atau TEST_DATABASE_URL loopback ke database **kosong** bernama uvics_test. Tidak mereset database bersama. Tes provider/browser memakai fixture terkontrol sesuai runbook; tidak memberi secret hosted ke CI PR.
