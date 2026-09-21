# Tech Stack UVICS

**Scope:** Fondasi teknis MVP UVICS Website Platform

**Rujukan produk:** [PRD](PRD.md) dan [spesifikasi website publik](UVICS_Public_Website_Page_Specification.md)

Dokumen ini menetapkan teknologi yang digunakan untuk pengembangan berikutnya. Keputusan stack tidak menyatakan seluruh integrasi sudah diimplementasikan. Manifest dan lockfile tetap menjadi sumber versi dependency aktual; penggantian pilihan stack memerlukan keputusan pengguna.

## Pilihan yang ditetapkan

| Area | Teknologi | Pemakaian |
| --- | --- | --- |
| Aplikasi full-stack | Next.js App Router + React + TypeScript strict | Website publik, dashboard admin, dan backend dalam satu aplikasi |
| Backend | Server Actions + Route Handlers | Form/mutasi internal melalui Server Actions; endpoint integrasi, signature upload, dan callback melalui Route Handlers sesuai kebutuhan |
| Database | Supabase PostgreSQL | Konten CMS, registration, member, histori organisasi, settings, dan audit aplikasi |
| Autentikasi | Supabase Auth + `@supabase/ssr` | Email/password admin dengan sesi Supabase berbasis access/refresh token yang diintegrasikan melalui cookie untuk SSR |
| Akses data | `@supabase/supabase-js` | Query bertipe dan pemanggilan fungsi database melalui RPC; MVP tidak menambahkan ORM terpisah |
| Migrasi | Supabase CLI + SQL migrations | Schema, constraint, index, RLS, dan fungsi database disimpan di Git |
| Otorisasi | Pemeriksaan admin di server + PostgreSQL Row Level Security | Proteksi operasi aplikasi dan tabel yang terekspos melalui Supabase Data API |
| Media | Cloudinary | Upload, penyimpanan, transformasi, dan delivery media dengan pemisahan akses publik/privat |
| Styling | Tailwind CSS 4 + token desain UVICS | Identitas visual bersama untuk website publik dan admin |
| Komponen UI | shadcn/ui + komponen UVICS yang relevan | Komponen baru diadaptasi ke design system; integrasi dilakukan bertahap |
| Animasi | Motion melalui `motion/react` | Animasi interaktif sesuai kebutuhan dengan dukungan reduced motion |
| Ikon | Lucide React; Tabler Icons React sebagai pendukung | Mempertahankan library ikon yang sudah digunakan repo |
| Utility class | `clsx` + `tailwind-merge` melalui `cn()` | Komposisi class kondisional |
| Validasi | Zod | Schema input dan validasi server; dapat dipakai kembali untuk feedback client |
| Form | React Hook Form + `@hookform/resolvers` | Form pendaftaran dan admin yang membutuhkan pengelolaan field; form sederhana tidak wajib memakai seluruh abstraksi |
| Editor CMS | Tiptap | Rich text untuk berita dan halaman; ditambahkan ketika modul terkait dibangun |
| Testing | Vitest + Playwright | Tes logika/validasi dan integrasi terarah; tes browser untuk alur kritis |
| Quality gates | ESLint + TypeScript + Next.js build | Pemeriksaan sesuai dampak perubahan |
| CI | GitHub Actions | Lint, typecheck, tes relevan, dan build |
| Hosting aplikasi | Vercel | Deployment Next.js; konfigurasi environment dan rilis ditentukan saat persiapan deployment |
| Rate limiting | Upstash Redis + `@upstash/ratelimit` | Batas permintaan bersama untuk endpoint publik seperti registration dan upload |
| Dependency management | npm + `package-lock.json` | Instalasi dan versi dependency yang dapat direproduksi |

## Batas arsitektur

### Backend dan data

- Logika aplikasi berada di server Next.js dengan pemisahan akses data dan logika domain yang proporsional. Hindari menyebarkan aturan keanggotaan di komponen UI.
- Operasi admin memverifikasi identitas serta hak admin pada setiap Server Action/Route Handler dan akses data yang relevan. Proteksi layout atau Proxy saja tidak cukup.
- Public signup Supabase Auth dinonaktifkan. Join UVICS membuat registration, bukan akun. Akun admin diprovisikan secara terkontrol; pengguna yang sekadar authenticated tidak otomatis dianggap admin.
- Terapkan RLS pada tabel yang terekspos dan batasi field respons publik secara eksplisit. RLS membatasi baris, sehingga tidak menggantikan pembatasan kolom/data privat.
- Kredensial berprivilege yang melewati RLS hanya digunakan pada operasi server yang memerlukannya, dengan otorisasi eksplisit; tidak dikirim ke browser atau dijadikan jalur default semua query.
- Alur multi-record kritis, terutama konversi applicant menjadi member beserta histori dan auditnya, menggunakan transaksi melalui fungsi PostgreSQL/RPC dan constraint pencegah duplikasi. Hak eksekusi fungsi dan caller harus dibatasi sesuai operasi.
- Perubahan database dilakukan melalui migration yang direview. Tes database memakai lingkungan terisolasi dan menguji constraint, RLS, serta transaksi yang relevan.

### Media

- Signature upload dibuat di server setelah pemeriksaan izin, konteks pendaftaran, dan pembatasan permintaan yang relevan. Batasi tipe, ukuran, dan parameter upload; validasi hasil upload sebelum mengaitkannya dengan record.
- Media publik seperti poster dan dokumentasi kegiatan dapat menggunakan delivery publik. Media applicant atau dokumen privat menggunakan konfigurasi akses terbatas serta mekanisme akses yang diotorisasi.
- Signed upload tidak otomatis membuat aset privat. Jangan memperlakukan URL bertanda tangan yang dapat dibagikan sebagai pengganti pemeriksaan hak akses pengguna.
- Simpan identitas aset dan metadata yang diperlukan untuk pengelolaan di PostgreSQL. Penghapusan aset harus memeriksa referensi dan kegagalan lintas layanan; transaksi PostgreSQL tidak mencakup Cloudinary.

### UI dan CMS

- shadcn/ui adalah pilihan komponen UI yang disetujui. Gunakan komponen sesuai kebutuhan dan sesuaikan dengan token, palet, serta arah visual UVICS.
- Periksa komponen yang ada sebelum menambah komponen sejenis. Integrasi Button harus mempertahankan atau memigrasikan pemanggilnya secara teruji, termasuk perilaku link, variant, size, disabled, dan fokus.
- Jangan membuat pasangan file seperti `Button.tsx` dan `button.tsx` yang hanya berbeda kapitalisasi pada Windows. Tetapkan satu implementasi kanonis dan jalur import yang konsisten.
- Konvensi sumber komponen shadcn dapat dipertahankan bila diperlukan untuk integrasi. Jangan memaksakan rewrite sintaks atau nama file semata-mata agar menyerupai contoh komponen lama.
- Instalasi shadcn tidak boleh menimpa CSS, font, atau komponen yang sudah ada tanpa meninjau diff dan dampaknya. Perubahan ini tidak menetapkan ulang pilihan font yang masih berbeda antara `design.md` dan layout.
- Konten Tiptap harus divalidasi dan dirender secara aman. Upload media editor mengikuti mekanisme Cloudinary yang sama.

## Status dan hal yang belum ditetapkan

Pada saat keputusan dicatat, manifest repo memuat Next.js 16.3.3, React 19.2.8, TypeScript 5, Tailwind CSS 4, Motion, ikon, utility class, dan ESLint. Integrasi Supabase, Cloudinary, shadcn/ui, form/editor, testing, CI, dan layanan deployment/rate limiting belum ditambahkan oleh keputusan dokumentasi ini.

- Tambahkan dependency saat implementasi modul membutuhkannya, dengan versi yang kompatibel dan tercatat di lockfile.
- Paket layanan, region, domain, environment, kebijakan backup/retensi, serta batas upload/rate limit belum dipilih. Persetujuan stack tidak memprovisikan layanan atau mengizinkan pembelian/deployment produksi dengan sendirinya.
- Email autentikasi dan Custom SMTP dikeluarkan dari kebutuhan saat ini. Login admin tetap menggunakan email/password Supabase Auth; pengiriman undangan, verifikasi, dan reset password melalui email belum termasuk cakupan. Provisioning akun admin dilakukan secara terkontrol tanpa bergantung pada pengiriman email.
- Notifikasi email applicant tetap future enhancement sesuai PRD.
- Keputusan bisnis terbuka di PRD tetap berlaku. Pemilihan teknologi tidak menyelesaikan field registration, kebijakan direktori, atau aturan penempatan anggota.

## Referensi implementasi

- [Next.js authentication](https://nextjs.org/docs/app/guides/authentication)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [migrations](https://supabase.com/docs/guides/local-development/database-migrations), [database functions](https://supabase.com/docs/guides/database/functions)
- [Cloudinary upload](https://cloudinary.com/documentation/upload_images) dan [media access control](https://cloudinary.com/documentation/control_access_to_media)
- [shadcn/ui untuk Next.js](https://ui.shadcn.com/docs/installation/next) dan [Tailwind CSS 4](https://ui.shadcn.com/docs/tailwind-v4)
- [React Hook Form resolvers](https://github.com/react-hook-form/resolvers), [Zod](https://zod.dev/), [Tiptap](https://tiptap.dev/docs/editor/getting-started/overview)
- [Vitest dengan Next.js](https://nextjs.org/docs/app/guides/testing/vitest), [Playwright dengan Next.js](https://nextjs.org/docs/app/guides/testing/playwright), [GitHub Actions untuk Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs)
- [Next.js di Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Upstash rate limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)
