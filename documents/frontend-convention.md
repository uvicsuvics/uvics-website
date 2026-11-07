# Konvensi Frontend UVICS

**Cakupan:** cara menambah halaman publik, mengambil data, menampilkan state, dan membaca environment di frontend. Aturan umum kode (TypeScript, warna, gambar, animasi, import, a11y) ada di [AGENTS.md](../AGENTS.md) dan tidak diulang di sini.

**Acuan:** [Design system](../design.md) · [Spesifikasi halaman publik](UVICS_Public_Website_Page_Specification.md) · [Arsitektur](ARCHITECTURE.md) · [Keputusan](DECISIONS.md) · Issue #1 (fondasi) dan #24 (kontrak data access Sprint 2)

---

## 1. Lokasi file

Struktur tetap di root repo seperti di AGENTS.md; tidak ada folder `src/`.

| Jenis | Lokasi |
| --- | --- |
| Halaman publik | `app/(public)/<route>/page.tsx`; halaman informasi di `app/(public)/(marketing)/` |
| Header, footer | `components/layout/` |
| Blok besar satu halaman | `components/sections/` |
| Primitif reusable (Button, Badge, state, Pagination) | `components/ui/` |
| Komponen satu domain | `components/<domain>/`, mis. `components/competitions/` |
| Struktur navigasi | `config/public-navigation.ts` |
| DTO publik (bentuk data yang dibaca UI) | `types/<domain>.ts`, mis. `types/competition.ts` |
| Fungsi pengambil data | `lib/services/<domain>Service.ts` |
| Kontrak query (parameter URL, pagination) | `lib/services/query.ts` |
| Format tanggal dan label tampilan | `lib/format/date.ts`, `lib/format/labels.ts` |
| Mock data | `data/mock/<domain>.ts` |
| Gambar dan logo statis | `public/images/...`, `public/logo/` (disajikan Next.js dari `public/`) |

## 2. Routing publik

Route memakai slug bahasa Inggris dari PRD dan navbar, huruf kecil, kebab-case. Detail memakai `[slug]`, mis. `/competitions/[slug]`.

| Status | Route |
| --- | --- |
| Sudah dibangun | `/`, `/about`, `/vision-mission`, `/organization`, `/departments` dan `/departments/[slug]`, `/programs` dan `/programs/[slug]`, `/competitions` dan `/competitions/[slug]`, `/achievements` dan `/achievements/[slug]`, `/projects` dan `/projects/[slug]`, `/contact`, `/join`, `/register` |
| Placeholder | `/members`, `/alumni`, `/events`, `/news`, `/gallery` |
| Sisa template (menunggu U09) | `/blog`, `/pricing`, `/batch`, `/forgot-password` |

- Placeholder memakai `PagePlaceholder` (`components/sections/PagePlaceholder.tsx`) agar link navigasi tidak 404. Halaman sebenarnya **mengganti isi file yang sama**; jangan membuat route baru dengan nama lain.
- Route yang masih menunggu keputusan PM: `/join` vs `/register` ([U03](DECISIONS.md#u03--route-pendaftaran)), `/news` vs `/blog` serta route sisa template `/pricing`, `/batch`, `/forgot-password` ([U09](DECISIONS.md#u09--route-berita-dan-route-template)), `/members` dan `/alumni` ([U12](DECISIONS.md#u12--halaman-members-dan-alumni)). `/vision-mission` sudah diputuskan menjadi halaman sendiri ([D19](DECISIONS.md#b-keputusan-produk-dan-data-yang-diterima)).

## 3. Layout dan navigasi

- `app/(public)/layout.tsx` merender `SiteHeader`, satu `<main>`, dan `SiteFooter`. Halaman membungkus isinya dengan `<div>` atau `<section>`, bukan `<main>`.
- Navbar dan kolom footer dibaca dari `PUBLIC_NAVIGATION`. Menambah atau mengganti route di menu cukup di config itu; footer ikut berubah.

## 4. Mengambil data

```text
Server Component (page.tsx)
  → lib/services/<domain>Service.ts      fungsi async, signature stabil, mengembalikan DTO dari types/
      → saat ini: data/mock/<domain>.ts
      → Sprint 2: serverClient() + fungsi lib/backend/content.ts, hasilnya dipetakan ke DTO
  → props → section / komponen (boleh client component)
```

Aturan:

- Service adalah satu-satunya pintu data dan selalu mengembalikan DTO dari `types/`. Page dan komponen tidak mengimpor `@/data/...`, nilai dari `@/lib/mock-data/...`, maupun `@/types/database` (dijaga `tests/unit/public-data-boundary.test.ts`).
- UI tidak mengimpor `@/types/database`. Daftar nilai enum yang dibutuhkan UI diekspor ulang dari `types/<domain>.ts`, contoh `COMPETITION_STATUSES` di `types/competition.ts`.
- Service bersifat `async` walau sumbernya mock, supaya pemanggil tidak berubah saat sumber diganti.
- Daftar berpagination: `get<Domain>s(query?): Promise<Paginated<T>>`, contoh `getCompetitions`. Domain kecil yang tidak dipaginasi: `Promise<T[]>`.
- Detail: `get<Domain>BySlug(slug): Promise<T | null>` dibungkus `cache()` dari `react`, dengan `notFound()` di halaman bila `null`.
- Halaman daftar berpagination (belum ada di produksi; pola untuk Prestasi dan Project di #26) yang page-nya di luar jangkauan membungkus pemanggilan dengan `orNotFound` (sumber melempar `AppError` `NOT_FOUND`, helper mengubahnya menjadi `notFound()`). Kegagalan sumber data lain dilempar ke `error.tsx`.
- Halaman komposit (beranda): kegagalan satu section tidak boleh menjatuhkan seluruh halaman. Data section ditangkap dengan `.catch` yang mencatat error di server dan mengembalikan list kosong. Pola ini ditambahkan saat sumber data berpindah ke backend (§11); sumber mock tidak gagal.
- Baca publik dari backend memakai `serverClient()` (`lib/supabase/server.ts`) dan fungsi `lib/backend/content.ts` (`listPublicCompetitions`, `getPublicCompetitionBySlug`, dan sejenisnya).
- Tidak ada `generateStaticParams` yang membaca database, karena build CI tidak punya database.
- Client component menerima data lewat props dari Server Component, bukan memanggil service sendiri.

## 5. Mock data

- Mock bertipe DTO, bukan tipe lokal: `UVICS_<DOMAIN>S: <Domain>[]`, contoh `UVICS_COMPETITIONS: Competition[]` di `data/mock/competitions.ts`. Domain yang DTO-nya belum dipindah ke `types/` masih memakai `interface <Domain>Item` di file mock (lihat §10).
- Nilai mengikuti backend: kode enum database (`OPEN`, `NASIONAL`), tanggal `YYYY-MM-DD`, field nullable bernilai `null`, dan urutan array mengikuti urutan backend.
- Isinya nilai polos yang bisa diserialisasi: string, angka, boolean, array, object. Tidak ada fungsi, komponen ikon, atau `Date`, karena data dikirim dari Server ke Client Component.
- Mock hanya dibaca service. Batas ini dijaga `tests/unit/public-data-boundary.test.ts`; allowlist `KNOWN_DEBT` mencatat utang yang masih ada: delapan section beranda (#51) dan `/batch` (U09, #49). Entri dihapus saat file dimigrasikan; tes gagal bila entri usang. Tes e2e halaman publik yang harus berjalan di CI diberi nama berawalan `public navigation:`, karena CI hanya menjalankan `--grep 'guest routes|origin/method|public navigation'`.

## 6. State UI

| State | Komponen (`components/ui/`) | Kapan |
| --- | --- | --- |
| Loading | `LoadingState`, `ListSkeleton` | `loading.tsx` memakai `<LoadingState className="pt-28" />` (`pt-28` menjaga indikator di bawah navbar fixed); fallback `<Suspense>`; `ListSkeleton` untuk grid kartu |
| Error | `ErrorState` | `error.tsx` (client component) menerima prop `retry`, bukan `reset`, dan meneruskannya ke `onRetry` |
| Empty | `EmptyState` | Request berhasil tanpa data, atau filter tanpa hasil. Beri ikon dan, bila ada filter aktif, aksi reset berupa `Button` ke daftar tanpa filter. Teks mengikuti spesifikasi §23 |
| Not found | `app/(public)/not-found.tsx` | Dipicu `notFound()` di page atau lewat `orNotFound`; satu halaman untuk seluruh `(public)` |
| Success | `SuccessState` | Hasil aksi pengguna (submit form), bukan hasil fetch |

Warna state memakai token `success` dan `error` dari `app/globals.css`.

**Soft 404.** Segment yang punya `loading.tsx` (saat ini `competitions`, `departments`, `organization`, `programs`) di-stream. Header HTTP sudah terkirim sebelum `notFound()` dipanggil, sehingga slug yang tidak ada atau page di luar jangkauan menghasilkan status 200 dengan UI not-found dan `<meta name="robots" content="noindex">` (dokumentasi Next.js, `loading.md` bagian "Status Codes"). Segment tanpa `loading.tsx` menghasilkan 404 sungguhan. Aturan: tambahkan `loading.tsx` hanya bila soft 404 diterima; bila tidak, andalkan render server yang cepat.

## 7. Environment

Aplikasi full-stack Next.js; tidak ada API terpisah, jadi tidak ada `API_BASE_URL`. Variabel dibaca hanya lewat helper tervalidasi Zod:

| Helper | Variabel | Dipakai di |
| --- | --- | --- |
| `publicEnv()` di `lib/env/public.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser dan server |
| `lib/env/server.ts` (`server-only`) | `APP_ORIGIN`, kunci Supabase server, Cloudinary, `RATE_LIMIT_NAMESPACE` | Server saja |

- Daftar lengkap di `.env.example`; salin ke `.env.local` untuk lokal.
- Jangan membaca `process.env` langsung di komponen. Variabel yang perlu sampai ke browser wajib berawalan `NEXT_PUBLIC_` dan tidak boleh berisi rahasia.
- Perbedaan lingkungan memakai `NODE_ENV` bawaan Next.js dan environment Vercel; tidak ada `APP_ENV` terpisah.

## 8. Query: filter dan pagination lewat URL

Filter dan halaman daftar hidup di URL supaya bisa dibagikan dan tombol back bekerja. Page membaca `searchParams` (tipe `SearchParams`, berupa `Promise` di versi Next.js ini) lalu meneruskan nilai tervalidasi ke service. Contoh filter di URL: `app/(public)/competitions/page.tsx` dan `CompetitionFilter`. Belum ada halaman produksi yang memakai `page`, `readPage`, `orNotFound`, dan `Pagination` mode `getHref`; bagian di bawah adalah pola untuk daftar berpagination berikutnya (Prestasi dan Project di #26).

| Parameter | Pembaca (`lib/services/query.ts`) | Aturan |
| --- | --- | --- |
| `page` | `readPage` | Bilangan bulat positif; selain itu menjadi 1. Hanya untuk halaman daftar berpagination |
| `search` | `readSearch` | Dirapikan, maksimal 100 karakter; kosong menjadi `undefined` |
| `status` | `readEnum(params, 'status', COMPETITION_STATUSES)` | Harus termasuk daftar nilai; selain itu `undefined` (jatuh ke default, bukan error) |
| `level` | `readEnum(params, 'level', CONTENT_LEVELS)` | Kode `content_level`; `CONTENT_LEVELS` diekspor `types/portfolio.ts` |
| `category` | `readEnum(params, 'category', categories)` | Harus termasuk daftar dari service (`getCompetitionCategories`); selain itu diabaikan |
| `featured` | tidak dibaca dari URL | Dipakai internal oleh page (mis. kompetisi unggulan), bukan filter pengguna |

- `page_size` adalah konstanta per halaman, tidak muncul di URL. Default service `DEFAULT_PAGE_SIZE` (20) menyamai default backend.
- Filter "Semua" berarti parameter dihilangkan. Jangan mengirim `status=ALL`.
- Href dibuat dengan `listHref(pathname, params)`: nilai kosong dan `page=1` dibuang, urutan key dipertahankan.
- Saat filter berubah, `page` tidak disertakan sehingga daftar kembali ke halaman 1. Pencarian di-debounce 300 ms dan memakai `router.replace` agar riwayat tidak penuh; contohnya `CompetitionFilter`.
- `Pagination` (`components/ui/Pagination.tsx`) punya dua mode: callback `onPageChange`, atau mode tautan `getHref`. Komponen ini tanpa `'use client'`, sehingga Server Component boleh meneruskan `getHref`.
- Service berpagination memotong dengan `paginate(items, page, page_size)`. Page di luar jangkauan melempar `AppError` `NOT_FOUND` (menyamai PostgREST `PGRST103`), dan page memakai `orNotFound`. Di segment dengan `loading.tsx` hasilnya soft 404 (lihat §6); tanpa `loading.tsx` menghasilkan 404 sungguhan.
- `/competitions` tidak berpagination: halaman ini memakai `getCompetitionBoard(filters)` yang mengelompokkan kompetisi per status (`COMPETITION_STATUS_ORDER`) dan mengurutkannya menurut tanggal. Backend belum bisa mengurutkan menurut tanggal, jadi service mengambil semua kompetisi publik sekali (maksimal 100) lalu menyaring dan mengurutkan di memori. Hitungan status untuk filter mengabaikan filter status tetapi mengikuti pencarian, tingkat, dan kategori. Bila data melewati 100, ganti dengan query per status (komentar `shortcut:` di service). Kartu "Deadline terdekat" hanya memilih kompetisi berstatus dibuka yang batas pendaftarannya belum lewat menurut tanggal WITA (`todayInWita`), karena status masih diubah manual ([T06](DECISIONS.md#d-isu-terbuka)). Keputusan tata letak ini tercatat sebagai [D23](DECISIONS.md#b-keputusan-produk-dan-data-yang-diterima).

## 9. Tanggal dan label

- `formatDate`, `formatPeriod`, dan `getYear` (`lib/format/date.ts`) hanya menerima tanggal `YYYY-MM-DD`. `formatDate` melempar `RangeError` untuk datetime, karena `new Date()` pada zona waktu berbeda menggeser hari. Datetime berjam menunggu [T06](DECISIONS.md#d-isu-terbuka).
- Label tampilan hanya dari `lib/format/labels.ts`: `CONTENT_LEVEL_LABELS`, `COMPETITION_STATUS_LABELS`, `PROJECT_STATUS_LABELS`. `toOptions(labels)` mengubahnya menjadi opsi filter dengan urutan key yang sama.
- Satu kode punya satu label (keputusan PM untuk #24): badge dan filter memakai teks yang sama. Jangan membuat peta label lokal di komponen.
- Level memakai kode `content_level` ([D20](DECISIONS.md#b-keputusan-produk-dan-data-yang-diterima)); label dipetakan di sini, bukan di service.

## 10. Kontrak per domain

| Domain | DTO (lokasi sekarang) | Service | Sumber sekarang | Fungsi backend publik | Penghambat |
| --- | --- | --- | --- | --- | --- |
| Kompetisi | `Competition`, `CompetitionQuery`, `CompetitionBoard` di `types/competition.ts` | `getCompetitions`, `getCompetitionBySlug`, `getRelatedCompetitions`, `getCompetitionBoard`, `getCompetitionCategories` | `data/mock/competitions.ts` | `listPublicCompetitions`, `getPublicCompetitionBySlug` | #26 |
| Prestasi | `Achievement`, `AchievementWithRelations` di `types/portfolio.ts` | `getAchievements`, `getAchievementBySlug`, `getRelatedAchievements` | `data/mock/achievements.ts` | `listPublicAchievements`, `getPublicAchievementBySlug` | U22 / #26 |
| Project | `Project`, `ProjectWithRelations` di `types/portfolio.ts` | `getProjects`, `getProjectBySlug`, `getRelatedProjects` | `data/mock/projects.ts` | `listPublicProjects`, `getPublicProjectBySlug` | U22 / #26 |
| Program | `PublicProgram` di `lib/services/programService.ts` (diturunkan dari `ProgramItem`) | `getPrograms`, `getProgramBySlug` | `data/mock/programs.ts` | belum ada | U05 / #30 |
| Department | `PublicDepartment` di `lib/services/departmentService.ts` (diturunkan dari `DepartmentItem`) | `getDepartments`, `getDepartmentBySlug` | `data/mock/departments.ts` | belum ada | U02 / #48 |
| Organisasi | `OrganizationPeriodItem` di `data/mock/organization.ts`; anggota `PublicMember` di `lib/backend/dto.ts` | `getOrganizationPeriods`, `getActivePeriod`, `getPeriodMembers` | `data/mock/organization.ts` | belum ada | U02 / #48 |

Catatan: memindahkan DTO Program, Department, dan periode organisasi ke `types/` sebagai DTO eksplisit masih tertunda (#24 Task 6, setelah PR #62 di-merge atau ditutup). Prestasi dan Project belum memakai `Paginated`; konversinya dikerjakan bersama integrasi backend (#26).

## 11. Migrasi mock ke backend

Contoh kompetisi (#26). Page dan komponen tidak berubah; hanya isi service, mapper, dan tes.

1. Tambah mapper `toCompetition(row)` yang mengubah snake_case menjadi DTO `Competition`, termasuk `poster` dari referensi media menjadi URL, dengan tes dari baris contoh.
2. Ganti isi `getCompetitions` dengan `listPublicCompetitions(await serverClient(), query)` lalu petakan `items` dengan `toCompetition`; `pagination` diteruskan apa adanya. Backend membaca nilai berbentuk GET, jadi service mengubah `featured` menjadi string (`String(query.featured)`) sebelum memanggil backend; boolean ditolak `z.stringbool()` dengan VALIDATION_ERROR. Filter backend bersifat AND, sehingga `getRelatedCompetitions` (sama kategori ATAU sama level), juga `getRelatedAchievements` dan `getRelatedProjects`, butuh dua query lalu dedupe, atau aturan relasinya diputuskan ulang di #26.
3. Di `getCompetitionBySlug`, tangkap `AppError` `NOT_FOUND` dari `getPublicCompetitionBySlug` lalu kembalikan `null`. Kegagalan lain dilempar.
4. Hapus filter dan `paginate` di memori dari `getCompetitions`; backend yang menyaring dan memotong. `getCompetitionBoard` dan `getCompetitionCategories` membaca lewat `getCompetitions({ page_size: 100 })`, jadi ikut berpindah tanpa perubahan; penyaringan dan pengurutan papan tetap di memori sampai backend mendukung urutan tanggal.
5. Tes service memakai fake client (pola `tests/unit/content.test.ts`).
6. Tambahkan fallback section beranda (`.catch` yang mencatat error dan mengembalikan list kosong, lihat §4).

## 12. Modul admin CMS

Pola #27 (Halaman, Program, Pengaturan Website), dipakai ulang untuk modul admin CRUD berikutnya. Tata letak mengikuti konsep desain A: daftar berupa tabel ringkas, form di route terpisah.

| Bagian | Lokasi | Aturan |
| --- | --- | --- |
| Route | `app/admin/(protected)/<modul>/page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `loading.tsx` | Server Component. Data dibaca dengan `loadForAdmin(fn)` dari `lib/admin/server.ts`: sesi bukan admin diarahkan ke login, galat lain menjadi `ErrorState` dengan pesan `toFailure`. `NOT_FOUND` di halaman edit memanggil `notFound()` (`app/admin/(protected)/not-found.tsx`). |
| Mutasi | `app/admin/(protected)/<modul>/actions.ts` | Satu Server Action per mutasi lewat `mutate(path, run)`: memanggil fungsi domain `lib/backend/*` (requireAdmin, Zod, RPC ter-audit), `revalidatePath(path, "layout")`, lalu mengembalikan `OperationResult`. UI tidak pernah menampilkan teks provider. |
| Daftar | `components/admin/cms/CmsIndex.tsx` | Tab status dan pencarian lewat URL (`status`, `search`, dibaca dengan `readEnum`/`readSearch`). Pencarian memakai form GET biasa. Filter dijalankan di server atas hasil daftar admin (komentar `shortcut:` di `lib/admin/cms.ts`). |
| Aksi status | `CmsStatusAction`, `StatusActionButton`, `ConfirmDialog` | DRAFT: Terbitkan. PUBLISHED: Arsipkan (konfirmasi). ARCHIVED: Terbitkan ulang (konfirmasi). Sukses kembali ke URL yang sama dengan `notice`, yang ditampilkan `CmsBanner`. |
| Form | `PageForm`, `ProgramForm`, `SettingsForm`, `CmsFormShell`, `FormField` | React Hook Form + `zodResolver(skema, { error: cmsErrorMap })`. Galat server dipetakan `cmsFailureView`: pesan Indonesia per field dari `CMS_FIELD_MESSAGES`, `CONFLICT` saat simpan menjadi galat slug, selain itu banner. Input membawa `defaultValue` agar HTML server sudah terisi sebelum hidrasi. Pakai `useWatch`, bukan `watch()` (React Compiler). |
| Pengaturan | `lib/admin/settings.ts` | Hanya key yang berubah dikirim, karena setiap key ditulis ulang dan diaudit. Validasi klien mengikuti `read_public_settings()` (D03); ubah keduanya bersamaan. |
