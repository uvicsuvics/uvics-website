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

## Kontrak integrasi Sprint 2 — issue #31

Ownership: Jordan memegang security, RLS, grants, dan audit melalui migration additive. Andi memegang runtime membership/organization/registration (#29), Jofan memegang runtime CMS (#30). Kontrak ini tidak membangun CRUD domain.

**Authorization.** Satu guard: `requireAdmin(client)` di `lib/auth/admin.ts`, dengan `serverClient()` per request, dan `requirePageAdmin()` hanya untuk navigasi page. Setiap Server Action/Route Handler privat memanggilnya; RPC/RLS memeriksa ulang `private.has_active_admin_session()`. Entry point privat saat ini: `app/admin/actions.ts` (login/logout), `app/api/admin/media/*`, `app/admin/(protected)/*`. Service client hanya untuk limiter pra-login (`lib/backend/rate-limit.ts`) dan media (`lib/media/service.ts`, `lib/media/publication.ts`) setelah `requireAdmin`; tidak ada fallback service-role untuk denial.

**Mutation.** Urutan: `requireAdmin` → validasi Zod (`unknown`, field allowlist) → satu RPC SQL yang memeriksa sesi, state terkini (`for update`/update bersyarat), lalu mutation + audit → DTO aman. SDK write lalu SDK insert audit **bukan** transaksi. ID tidak ditemukan → `raise no_data_found` (P0002 → `NOT_FOUND`), bukan sukses. Invalidasi cache setelah RPC sukses. Contoh: `public.publish_page`/`publish_program`; rollback saat audit gagal dibuktikan `tests/db/security.sql`.

**Audit writer** (EXECUTE dicabut dari semua role client):

- RPC sesi pengguna: `private.write_audit(auth.uid(), action, entity_type, entity_id, old, new)`. Session diambil dari JWT; actor selain `auth.uid()` ditolak.
- Service RPC (media): `private.write_audit(p_actor, p_session, ...)`. Writer memvalidasi ulang `admin_session_is_active`. Login tetap memakai `record_admin_login` yang idempotent per sesi.
- Payload allowlist per action, tanpa raw row/PII/secret:

| Action | entity | old/new |
| --- | --- | --- |
| `ADMIN_LOGIN` | admin | — |
| `MEDIA_COMPLETED` | upload_intent | `category`, `kind` |
| `MEDIA_PUBLISHED` | upload_intent | `reference_type`, `reference_id` |
| `PAGE_PUBLISHED` / `PROGRAM_PUBLISHED` | page / program | `status` |
| Settings (milik #30) | website_settings, `entity_id = null` | `key`; nilai hanya untuk flag publik boolean |

**Direct DML.** `authenticated` dan `service_role` tidak memiliki INSERT/UPDATE/DELETE pada `pages`, `programs`, `website_settings`. Tersedia: `publish_page`, `publish_program`. Belum tersedia dan tetap tertutup sampai owner menambah RPC ter-audit: create/update/archive/delete page/program dan write settings.

**DTO dan privasi.** `lib/backend/dto.ts`:

- `toPublicMember()` hanya mengeluarkan `name`, `photo` (`PublicImage` PUBLIC, selain itu `null`), `position`, dan `department`. Definisi ini tidak mengaktifkan direktori dan tidak menganggap `public_profile` sebagai consent; akses publik database member/alumni/registration tetap ditutup (D02).
- Settings publik hanya lewat `rpc('read_public_settings')` + `toPublicSettings()`. Allowlist: branding (`organization_name`, `website_title`, `logo`, `favicon`, `footer_text`), kontak resmi organisasi (`email`, `phone`, `address`, `instagram_url`, `linkedin_url`, `github_url`, `youtube_url`), SEO (`default_meta_title`, `default_meta_description`), serta flag boolean `registration_open` dan `maintenance_mode`. Unknown key, `updated_by`, dan nilai malformed tidak keluar; validasi per key ditegakkan di reader SQL (aman untuk pemanggil Data API langsung) sebagai subset konservatif dari DTO: URL sosial tanpa port dengan host ASCII bertld huruf dan tanpa label `xn--` (punycode), email memakai regex Zod yang sama, teks wajib memuat karakter alfanumerik. Ubah keduanya bersamaan. `logo`/`favicon` hanya path statis same-origin (`/dir/file.png`) atau salinan Cloudinary `uvics/published/<uuid>`; aset pending/authenticated dan protokol lain ditolak. `phone` publik wajib tersimpan ternormalisasi `+digit`. Consumer menafsirkan `registration_open !== true` sebagai tertutup.
- Proyeksi list registration admin (diselaraskan nama kolom kanonis): `id, full_name, nim, study_program, batch, preferred_department, status, submitted_at`. Jawaban, kontak, catatan, dan dokumen hanya pada operasi detail berizin.

**Validasi** (`lib/backend/validation.ts`): `emailSchema`, `phoneSchema`, `httpUrlSchema` (HTTP/S tanpa credential), `datetimeSchema` (offset wajib → UTC `Z`), `paginationSchema`, `slugSchema`, `calendarDateSchema` (`YYYY-MM-DD`, rollover seperti 2026-02-30 ditolak). UUID memakai `z.uuid()`. Enum memakai `z.enum` dengan nilai kanonis domain. Telepon: spasi/hyphen dibuang, `08…` → `+628…`, selain itu wajib `+kodenegara`; panjang dihitung dari digit setelah normalisasi tanpa `+`, 8–15 digit (`PHONE_MIN_DIGITS`/`PHONE_MAX_DIGITS`), sama dengan constraint SQL `registrations.phone`/`members.phone` (D04). Kesetaraan batas diuji di `tests/db/security.sql`; ubah keduanya bersamaan.

**Error.** Reuse `AppError`, `toFailure`, `httpFailure`, `databaseError`: `42501` → FORBIDDEN, `23505`/`P0001` → CONFLICT, `P0002` → NOT_FOUND, lainnya → SERVICE_UNAVAILABLE tanpa detail SQL/provider.

**Types.** Urutan: migration → `npm run test:db` → `npm run db:types` → `npm run typecheck`, dari schema yang sama. Jangan menulis types manual untuk RPC/tabel baru.

**Matrix RLS/grants.** Status pada branch ini:

| Tabel | Anon / non-admin | Active admin | Tulis |
| --- | --- | --- | --- |
| pages, programs | SELECT row `PUBLISHED` | SELECT semua | RPC publish ter-audit; DML langsung ditutup |
| website_settings | Hanya `read_public_settings()` | SELECT raw | Tertutup sampai RPC ter-audit #30 |
| registrations, members, membership_histories, departments, positions, organization_periods | Schema #16/#17 sudah terintegrasi; review grants/RLS gabungan tertunda (T4 #31) | — | — |

## Kontrak konten #11

Berlaku untuk `lib/backend/content.ts` (competition, achievement, project). Field DTO memakai snake_case sesuai kolom database.

- **Tanggal:** `registration_deadline`, `competition_date`, `achievement_date`, `start_date`, dan `end_date` bertipe `date`, dikirim `YYYY-MM-DD` tanpa jam dan zona waktu.
- **Level:** kode `content_level` = `INTERNAL`, `REGIONAL`, `NASIONAL`, `INTERNASIONAL` ([U17](DECISIONS.md#u17--nilai-baku-level)). Label tampilan menjadi urusan frontend. Filter `level` di luar kode ini menghasilkan `VALIDATION_ERROR`.
- **Media:** `poster` (competition) dan `cover_image` (achievement, project) berisi referensi media, bukan URL, maksimal 500 karakter. Bentuk final ditetapkan alur upload #28/#29. Sertifikat ada di tabel `achievement_certificates` yang hanya terbaca admin aktif ([U18](DECISIONS.md#u18--data-privat-konten-untuk-authenticated-non-admin)).
- **Anggota:** proyeksi publik `achievement_members`/`project_members` hanya `member_name` dan `role`. Anggota yang tertaut lewat `member_id` tampil dengan `member_name: null` sampai proyeksi D02 tersedia.
- **Visibilitas:** query publik selalu memfilter `publication_status = 'PUBLISHED'` dan tidak mengirim field `publication_status`.
- **Pencarian:** competition mencari `title` dan `organizer`, achievement mencari `title` dan `competition_name`, project mencari `title`. Karakter `, ( ) " ' \ * % _ :` dibuang dari kata kunci; hasil kosong berarti tanpa filter.
- **Pagination:** page di luar total baris (PostgREST `PGRST103`) menghasilkan `NOT_FOUND` 404. Mapping ini ada di `databaseError()` sehingga berlaku untuk semua domain.

Pemetaan DTO competition ke `types/competition.ts` (frontend #15), untuk issue integrasi frontend:

| DTO backend | `Competition` frontend | Catatan |
| --- | --- | --- |
| `id` (UUID string) | `id` | Mock memakai `comp-1`; ganti ke UUID |
| `title`, `slug`, `organizer`, `description` | sama | |
| `category` (nullable) | `category` (wajib) | Tangani `null` |
| `level` (`NASIONAL`, …; nullable) | `level` (`'Nasional'`, …) | Petakan kode ke label; `REGIONAL` belum ada di union frontend |
| `registration_deadline` (`YYYY-MM-DD`) | `registrationDeadline` (datetime berjam) | Tanpa jam; aturan zona waktu WITA menunggu [T06](DECISIONS.md#d-isu-terbuka) |
| `competition_date` (`YYYY-MM-DD`, nullable) | `competitionDate` (wajib) | Sama seperti di atas; tangani `null` |
| `registration_url`, `guidebook_url` | `registrationUrl`, `guidebookUrl` | |
| `poster` (referensi media) | `poster` (path gambar) | Diubah menjadi URL lewat alur media publik |
| `team_size`, `eligibility` | `teamSize`, `eligibility` | |
| `status` | `status` | Nilai sama (`UPCOMING` … `FINISHED`) |
| `featured`, `created_at`, `updated_at` | `featured`, `createdAt`, `updatedAt` | |
| Filter kosong (`status=`, `level=`) | Filter `'ALL'` | Kirim kosong atau hilangkan parameter; `ALL` ditolak |
