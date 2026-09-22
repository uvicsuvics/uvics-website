# Backend foundation — kontrak issue #7

Kontrak integrasi bagi frontend, membership/organisasi, dan CMS. Gunakan bersama [runbook operasional](BACKEND_OPERATIONS.md) untuk setup, migration, provisioning, dan pengujian.

## Batas modul dan route

- Next.js App Router + Supabase PostgreSQL/Auth/SDK, SQL migrations; tanpa ORM/backend/Redis tambahan.
- Hanya admin memiliki akun. `/join` dan `/register` merupakan recruitment, bukan signup Auth.
- `/admin/login` dan `/admin/dashboard` kanonis. `/admin`, `/dashboard`, `/dashboard/settings` menuju dashboard terlindungi; `/login` menuju login admin. Tidak membangun settings/reset password email.
- Root layout menyimpan font/provider; shell navigasi publik pada route group publik. Login terpisah dari layout admin terlindungi. URL publik dipertahankan.
- Guard page/layout membantu navigasi. Setiap action/handler/query privat memeriksa identitas terbaru dan izin database; jangan mengandalkan layout atau Proxy saja.
- Server Action untuk form internal, Route Handler untuk HTTP media. Fungsi domain sederhana memanggil SDK/RPC; hindari framework repository/controller generik.

## Kontrak data

Tabel/kolom `snake_case`; PK bisnis UUID `gen_random_uuid()`, TypeScript/API `string`. `admins.id` adalah UUID yang sama dengan Auth user. Mock konsumen yang masih memakai ID angka harus dimigrasikan ke string UUID ketika integrasi. NIM/slug/nomor pendaftaran bukan PK.

Kejadian: `timestamptz`, dikirim ISO 8601 UTC (`Z`). Tanggal kalender: `date`, dikirim `YYYY-MM-DD`. Status uppercase per domain, dengan constraint SQL. Soft delete dipilih per entitas; FK/histori tidak dihapus cascade secara massal. Index mengikuti query nyata.

Pagination: `page=1`, `page_size=20`, maksimum 100, bilangan bulat positif; invalid → 422, bukan clamp. Output `{ items, pagination: { page, page_size, total_items, total_pages } }`. Order stabil `created_at DESC, id DESC` kecuali domain menetapkan order lain dengan tie-breaker ID. Slug lowercase kebab-case, uniqueness di SQL; collision → conflict.

DTO publik menggunakan projection field eksplisit dan filter publikasi. Jangan mengirim row mentah, draft, NIM, email/telepon pribadi, jawaban recruitment, atau catatan admin ke publik.

## Validasi dan error

Zod memvalidasi input server; client validation hanya feedback. Password tidak dinormalisasi. Allowlist field tulis, sort, dan filter.

Hasil operasi: `{ ok: true, data }` atau `{ ok: false, error: { code, message, field_errors?, request_id? } }`. Login sukses boleh redirect. HTTP: `VALIDATION_ERROR` 422, `UNAUTHENTICATED`/`INVALID_CREDENTIALS` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT` 409, `RATE_LIMITED` 429 + Retry-After, `SERVICE_UNAVAILABLE` 503, `INTERNAL_ERROR` 500. Server Actions memakai kode yang sama; tidak menjanjikan status HTTP identik. Jangan menangkap redirect/notFound sebagai error biasa atau membocorkan error provider.

## Auth, database, dan audit

SSR Supabase memakai cookie per request. Masa admin maksimal satu jam absolut dari `auth.sessions.created_at`; refresh tidak memperpanjangnya. Predicate database tanpa argumen memeriksa `auth.uid()`, claim `session_id`, admin aktif, row sesi, dan rentang waktu server. Predicate yang sama wajib dipakai pada RLS/RPC privat dan DAL. Logout memakai `scope: 'local'`; sesi lain tetap sah. Error izin/database fail closed.

Public signup dan anonymous sign-in harus OFF; email/password ON, single-session OFF. Provisioning lewat script operator Auth Admin API (`email_confirm: true`) lalu profil admin, tanpa SMTP. Tidak menulis ke tabel Auth. Admin existing tidak dipromosikan/reset otomatis.

Migration membawa grants, RLS, constraint, index, dan fungsi. Cabut EXECUTE PUBLIC, gunakan nama schema eksplisit dan search_path aman untuk security definer. Service client hanya untuk operasi khusus; query umum melalui sesi pengguna. Generated types diperbarui dari schema.

Audit persisten berasal dari sesi/context server terverifikasi, payload allowlist tanpa password/token/PII. Mutation + audit satu transaksi SQL. Tidak ada generic audit-write RPC untuk client. Login belum dianggap berhasil bila audit gagal; sesi yang baru dibuat dikompensasi dengan logout.

## Rate limit dan request

RPC PostgreSQL atomik fixed window, DB clock: login 5/15 menit per email+IP **dan** 30/15 menit per IP; signature 10/menit/admin; complete 30/menit/admin. Key server dipseudonimkan, counter privat. RPC selesai sebelum Auth/business sehingga gagal credential tetap dihitung. Fixed window memungkinkan burst di batas dua window. Kegagalan limiter → 503; quota → 429. Proteksi Auth bawaan tetap melindungi endpoint Auth langsung. CDN gambar tidak memanggil limiter.

Origin mutasi harus sama persis dengan `APP_ORIGIN`, termasuk port. Missing/null/asing/subdomain ditolak. Jangan mengambil origin dari Host client. Media menerima POST JSON, tanpa credentialed CORS lintas origin. Cookie Secure pada HTTPS, SameSite=Lax, Path=/, host-only; response privat/auth tidak masuk shared cache.

## Media

`POST /api/admin/media/signature` membuat intent milik admin sebelum mengeluarkan signature allowlist. `POST /api/admin/media/complete` menerima identitas hasil minimum dan memverifikasi metadata Cloudinary, owner, sesi, expiry, serta completion atomik. Client tidak memilih public ID, overwrite, preset, atau akses.

Kategori: profile ≤2 MiB JPEG/PNG/WebP; poster/thumbnail/gallery ≤5 MiB JPEG/PNG/WebP; certificate ≤10 MiB PDF atau ≤5 MiB gambar; document ≤10 MiB PDF. Profile internal, certificate, dan document default privat. Poster/thumbnail/gallery hanya dipublikasikan setelah izin publikasi konten domain; upload sendiri tidak memberi izin publikasi.

Semua pending memakai `authenticated` dan ACL token-only sehingga signed delivery URL respons upload tetap ditolak CDN. Download privat melalui server yang memeriksa admin/owner. Completion idempotent untuk identitas identik; konflik berbeda ditolak. Publikasi server membuat salinan baru dengan ID deterministik tanpa overwrite, lalu mencatat status rekonsiliasi; original tetap terlindungi dan menutup slot replay. Signature provider tidak sekali pakai dan tidak mengikat file/resource_type. Cleanup baru membebaskan slot setelah issued_at + 65 menit, berdasarkan manifest/intent dan asset ID, bukan prefix global. Dokumen privat tidak pernah fallback publik/optimizer publik.

Delivery publik memakai resize + `q_auto,f_auto` dan loader `next/image`, dimensions/sizes. Target transfer avatar 50 KB, thumbnail 150 KB, detail 300 KB (desimal; bukan batas upload). Lazy di bawah layar, gambar utama segera dimuat. Modul domain bertanggung jawab publikasi, pencabutan, dan referensi; foundation bukan seluruh CMS/galeri.

## Operasional

Satu project Supabase dan cloud Cloudinary hingga production. Tidak reset database bersama. Fixture sintetis dicatat per ID/run, dengan cleanup terarah; setelah go-live hentikan tes mutasi rutin terhadap layanan live. `.env.local` dan manifest test tidak masuk Git. Script di luar Next.js memakai `@next/env`; jangan menganggap CLI otomatis membaca `.env.local`.

Migration hanya pada langkah operator/release, tidak saat build/request. PR/review/deployment terpisah dari bukti lokal. Tidak menambah SMTP, Tiptap, domain CRUD, atau fitur masa depan di issue #7.

## Contoh integrasi

```ts
const client = await serverClient(); // lib/supabase/server.ts
const admin = await requireAdmin(client); // lib/auth/admin.ts
const { data, error } = await client.from('admins').select('id,name').eq('id', admin.id).single();
if (error) databaseError(error);
```

`paginationSchema` di `lib/backend/validation.ts` menerima query mentah. Range inklusif adalah `(page-1)*page_size` sampai `page*page_size-1`; order `created_at DESC,id DESC`. `paginationMeta()` membentuk metadata. Contoh kontrak CMS berikut **sintetis, bukan endpoint CMS #7**:

```json
{"ok":true,"data":{"items":[{"id":"00000000-0000-4000-8000-000000000001","slug":"contoh-sintetis","title":"Contoh sintetis","status":"PUBLISHED","poster_url":"https://res.cloudinary.com/example/image/upload/c_limit,w_600,q_auto,f_auto/v1/uvics/published/00000000-0000-4000-8000-000000000002.png","published_at":"2026-09-22T00:00:00Z"}],"pagination":{"page":1,"page_size":20,"total_items":1,"total_pages":1}}}
```

POST signature `{category:'poster',kind:'image'}`, lalu kirim file bersama seluruh `params`, `api_key`, `signature` ke `upload_url`. POST complete `{intent_id,asset_id,version}` menghasilkan DTO PRIVATE dengan `download_url` relatif. Jangan menyimpan `secure_url` provider sebagai URL publik. Publikasi hanya melalui `publishMedia` internal setelah izin domain; tidak ada endpoint publish umum.

`CloudinaryImage` menerima `asset` PUBLIC, width, height, sizes, alt, dan priority opsional. Simpan asset/public ID, resource/delivery type, version, format, ukuran/dimensi, serta referensi; jangan hanya URL. Recovery dan ACL dijelaskan di [runbook](BACKEND_OPERATIONS.md).

Mutasi domain+audit dilakukan dalam **satu fungsi SQL**: periksa `private.has_active_admin_session()`, validasi state, UPDATE/INSERT, panggil `private.write_audit(auth.uid(),...)` dengan payload allowlist, return DTO. Cabut EXECUTE PUBLIC; audit bukan generic client RPC. Contoh runtime ada di `record_admin_login`/`complete_upload_intent`; rollback bersama dibuktikan `tests/db/foundation.sql`.

`admins.password` pada contoh PRD dipetakan ke Supabase Auth, **bukan kolom aplikasi**. Migration fondasi milik #7, modul domain menambah migration sendiri. Frontend boleh mengganti UI minimum dengan kontrak route/auth yang sama; koordinasikan perubahan layout bersama #1/#6. Dokumen ini tidak menyatakan tim lain sudah mengintegrasikan/mereviewnya.
