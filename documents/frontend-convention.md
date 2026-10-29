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
| Primitif reusable (Button, Badge, state) | `components/ui/` |
| Komponen satu domain | `components/<domain>/`, mis. `components/competitions/` |
| Struktur navigasi | `config/public-navigation.ts` |
| Fungsi pengambil data | `lib/services/<domain>Service.ts` |
| Mock data | `data/mock/<domain>.ts` |
| Gambar dan logo statis | `public/images/...`, `public/logo/` (disajikan Next.js dari `public/`) |

## 2. Routing publik

Route memakai slug bahasa Inggris dari PRD dan navbar, huruf kecil, kebab-case. Detail memakai `[slug]`, mis. `/competitions/[slug]`.

| Status | Route |
| --- | --- |
| Sudah dibangun | `/`, `/about`, `/departments`, `/programs`, `/competitions`, `/contact` |
| Placeholder | `/organization`, `/members`, `/alumni`, `/achievements`, `/projects`, `/events`, `/news`, `/gallery`, `/join` |

- Placeholder memakai `PagePlaceholder` (`components/sections/PagePlaceholder.tsx`) agar link navigasi tidak 404. Halaman sebenarnya **mengganti isi file yang sama**; jangan membuat route baru dengan nama lain.
- Route yang masih menunggu keputusan PM: `/join` vs `/register` ([U03](DECISIONS.md#u03--route-pendaftaran)), `/news` vs `/blog` serta route sisa template `/pricing`, `/batch`, `/forgot-password` ([U09](DECISIONS.md#u09--route-berita-dan-route-template)), `/members` dan `/alumni` ([U12](DECISIONS.md#u12--halaman-members-dan-alumni)). `/vision-mission` sudah diputuskan menjadi halaman sendiri ([D19](DECISIONS.md#b-keputusan-produk-dan-data-yang-diterima)).

## 3. Layout dan navigasi

- `app/(public)/layout.tsx` merender `SiteHeader`, satu `<main>`, dan `SiteFooter`. Halaman membungkus isinya dengan `<div>` atau `<section>`, bukan `<main>`.
- Navbar dan kolom footer dibaca dari `PUBLIC_NAVIGATION`. Menambah atau mengganti route di menu cukup di config itu; footer ikut berubah.

## 4. Mengambil data

```text
Server Component (page.tsx)
  → lib/services/<domain>Service.ts      fungsi async, signature stabil
      → saat ini: data/mock/<domain>.ts
      → Sprint 2: Supabase lewat lib/supabase/server + DTO publik (#24, ARCHITECTURE §4.1)
  → props → section / komponen (boleh client component)
```

Aturan:

- Kode baru tidak mengimpor `data/mock` langsung dari page atau komponen; panggil service. Contoh yang sudah memakai pola ini: `app/(public)/page.tsx`.
- Service bersifat `async` walau sumbernya mock, supaya pemanggil tidak berubah saat sumber diganti.
- Daftar: `get<Domain>s(options?: { limit })`. Detail: `get<Domain>BySlug(slug)` yang mengembalikan `null` bila tidak ada; halaman lalu memanggil `notFound()`.
- Client component menerima data lewat props dari Server Component, bukan memanggil service sendiri.
- Filter, pagination, mapping status, dan DTO final ditetapkan di #24.

## 5. Mock data

- Satu file per domain di `data/mock/`, mengekspor `interface <Domain>Item` dan konstanta `UVICS_<DOMAIN>S`.
- Isinya nilai polos yang bisa diserialisasi: string (tanggal ISO `YYYY-MM-DD`), angka, boolean, array, object. Tidak ada fungsi, komponen ikon, atau `Date`, karena data dikirim dari Server ke Client Component.
- Utang yang diketahui: `lib/mock-data/competitions.ts` (dipakai `/competitions`) menduplikasi `data/mock/competitions.ts` (dipakai beranda) dengan bentuk berbeda. Disatukan saat integrasi backend (#24, #26); jangan menambah mock di `lib/mock-data/`.

## 6. State UI

| State | Komponen (`components/ui/`) | Kapan |
| --- | --- | --- |
| Loading | `LoadingState`, `ListSkeleton` | `loading.tsx` atau fallback `<Suspense>`; `ListSkeleton` untuk grid kartu |
| Error | `ErrorState` | `error.tsx` (teruskan `reset` ke `onRetry`) atau request yang gagal |
| Empty | `EmptyState` | Request berhasil tanpa data, atau filter tanpa hasil. Teks mengikuti spesifikasi §23 |
| Success | `SuccessState` | Hasil aksi pengguna (submit form), bukan hasil fetch |

Warna state memakai token `success` dan `error` dari `app/globals.css`.

## 7. Environment

Aplikasi full-stack Next.js; tidak ada API terpisah, jadi tidak ada `API_BASE_URL`. Variabel dibaca hanya lewat helper tervalidasi Zod:

| Helper | Variabel | Dipakai di |
| --- | --- | --- |
| `publicEnv()` di `lib/env/public.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser dan server |
| `lib/env/server.ts` (`server-only`) | `APP_ORIGIN`, kunci Supabase server, Cloudinary, `RATE_LIMIT_NAMESPACE` | Server saja |

- Daftar lengkap di `.env.example`; salin ke `.env.local` untuk lokal.
- Jangan membaca `process.env` langsung di komponen. Variabel yang perlu sampai ke browser wajib berawalan `NEXT_PUBLIC_` dan tidak boleh berisi rahasia.
- Perbedaan lingkungan memakai `NODE_ENV` bawaan Next.js dan environment Vercel; tidak ada `APP_ENV` terpisah.
