# UVICS website

Next.js App Router, Supabase PostgreSQL/Auth, Cloudinary. Hanya admin mempunyai akun; recruitment bukan signup Auth.

## Mulai lokal

Gunakan Node 22.14+ major 22, npm, dan package-lock.json. Jalankan `npm ci`, salin `.env.example` ke `.env.local`, isi melalui jalur lokal yang aman, lalu `npm run dev`. Login di `/admin/login`; tidak ada akun/password bawaan.

## Dokumentasi

| Dokumen | Kapan dibaca |
| --- | --- |
| [PRD](documents/PRD.md) | Kebutuhan produk dan modul |
| [Spesifikasi halaman publik](documents/UVICS_Public_Website_Page_Specification.md) | Membangun halaman website publik |
| [Catatan keputusan](documents/DECISIONS.md) | Jawaban open questions dan keputusan yang mengoreksi PRD |
| [Arsitektur](documents/ARCHITECTURE.md) | Peta sistem, struktur kode, domain data, alur utama |
| [Tech stack](documents/TECH_STACK.md) | Pilihan teknologi dan batasnya |
| [Kontrak backend](documents/BACKEND_CONVENTIONS.md) | Aturan data, validasi, error, auth, audit, media |
| [Runbook operator](documents/BACKEND_OPERATIONS.md) | Setup environment, migration, pengujian hosted |
| [Workflow pengembangan](documents/DEVELOPMENT_WORKFLOW.md) | Branch, commit, PR, merge, rilis |
| [Aturan kode](AGENTS.md) | Konvensi penulisan kode dan struktur proyek |
| [Design system](design.md) | Warna, tipografi, komponen, animasi |

## Verifikasi

`npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npm run build`, `npm run check:migrations`.

`npm run lint` gagal bila ada warning. `npm run test:db` melaporkan setiap suite SQL yang gagal, lalu gagal juga bila `types/database.ts` berbeda dari schema hasil migration. `npm run check:migrations` menolak perubahan pada migration yang sudah ada di `origin/development`.

Database test membutuhkan binary PostgreSQL 17 atau TEST_DATABASE_URL loopback ke database **kosong** bernama uvics_test. Tidak mereset database bersama. Tes provider/browser memakai fixture terkontrol sesuai runbook; tidak memberi secret hosted ke CI PR.
