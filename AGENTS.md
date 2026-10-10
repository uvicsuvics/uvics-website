<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# UVICS Agent Rules & Project Guide

> Panduan kerja repo ini digunakan bersama PRD, spesifikasi halaman publik, design system, dan keputusan teknis dalam `documents/TECH_STACK.md`.

## Keputusan Tech Stack — 22 September 2026

Stack yang disepakati pengguna tercatat di [documents/TECH_STACK.md](documents/TECH_STACK.md): full-stack Next.js, Supabase PostgreSQL/Auth/SDK/SQL migrations, Cloudinary, shadcn/ui, Zod + React Hook Form, Tiptap, Vitest + Playwright, GitHub Actions, Vercel, serta rate limiting melalui PostgreSQL Supabase dan proteksi bawaan Supabase Auth. Dokumen tersebut menetapkan pilihan teknis; `package.json` dan lockfile menunjukkan dependency yang sudah ditambahkan. Limiter aplikasi menggunakan tabel privat dan RPC atomik; tidak memerlukan layanan Redis terpisah.

shadcn/ui diizinkan untuk komponen baru dengan token desain UVICS. Integrasikan dengan komponen yang ada secara bertahap, pertahankan kontrak pemanggil atau migrasikan secara teruji, dan hindari duplikasi file yang hanya berbeda kapitalisasi. Konvensi sumber komponen shadcn dapat dipertahankan; contoh penamaan dan sintaks komponen di bawah tidak mewajibkan rewrite komponen tersebut. Persetujuan ini tidak memerintahkan penggantian massal UI atau font.

---

## LANGKAH PERTAMA: Baca Dokumen Ini

Setiap kali memulai sesi baru di proyek ini, lakukan hal berikut SECARA BERURUTAN sebelum menulis satu baris kode pun:

1. Baca `design.md` - Berisi seluruh Design System resmi (warna, tipografi, spacing, komponen, animasi). Semua kode visual harus mengacu ke sini.
2. Baca `documents/PRD.md` - Berisi Product Requirements Document lengkap. Semua fitur, halaman, dan konten harus sesuai dengan PRD.
3. Baca `documents/DECISIONS.md` - Keputusan yang melengkapi atau mengoreksi PRD. Keputusan berstatus Diterima berlaku; jangan membangun bagian berstatus Usulan dengan asumsi lain tanpa diskusi.
4. Baca `app/globals.css` - Berisi token CSS aktual yang sudah didefinisikan dan siap dipakai.
5. Tinjau komponen yang sudah ada di `components/` sebelum membuat komponen baru untuk menghindari duplikasi.

Dokumen pendukung sesuai jenis pekerjaan:

| Pekerjaan | Dokumen |
| --- | --- |
| Halaman publik | `documents/UVICS_Public_Website_Page_Specification.md` |
| Backend, database, auth, media | `documents/BACKEND_CONVENTIONS.md`, `documents/ARCHITECTURE.md` |
| Migration dan operasi hosted | `documents/BACKEND_OPERATIONS.md` |
| Branch, commit, PR, rilis | `documents/DEVELOPMENT_WORKFLOW.md` |
| Pilihan teknologi | `documents/TECH_STACK.md` |

---

## DESIGN SYSTEM - Aturan Wajib

### Identitas Visual Proyek

- Nama Organisasi  : UVICS (Unklab Virtue In Computer Science)
- Universitas      : Universitas Klabat (UNKLAB), Airmadidi, Minahasa Utara
- Brand Colors     : Primary Blue (#0230a7), Secondary Yellow (#ffd000), Accent (#0066ff)
- Font Heading     : Playfair Display (via CSS variable --font-heading)
- Font Body        : Plus Jakarta Sans (via CSS variable --font-sans)
- Animation Lib    : motion/react (package: motion v13+)
- Icon Libraries   : lucide-react (utama) + @tabler/icons-react (pendukung)

### Warna - Jangan Pernah Hardcode

Selalu gunakan token Tailwind yang terdefinisi di app/globals.css. Dilarang menggunakan nilai HEX/RGB langsung di JSX.

Token yang tersedia:
- bg-primary / text-primary           = #0230a7 (CTA, tombol primer, link aktif)
- bg-primary-50 hingga bg-primary-900 = shade lengkap primary
- bg-secondary / text-secondary       = #ffd000 (badge, highlight, aksen)
- bg-accent / text-accent             = #0066ff (hover state, ikon interaktif)
- bg-muted                            = #f0f0f0 (background section alternatif)
- shadow-primary                      = efek shadow biru untuk tombol primer
- shadow-accent                       = efek shadow biru cerah untuk elemen aksen

Contoh BENAR:
  className="bg-primary text-white hover:bg-primary-600"
  className="bg-primary-50 text-primary-900"

Contoh SALAH:
  style={{ backgroundColor: '#0230a7' }}
  className="bg-[#0230a7]"

### Komponen UI yang Sudah Ada - Periksa Sebelum Menambah

Sebelum membuat komponen baru, selalu periksa komponen di components/ui/:
- Button           : components/ui/Button.tsx          (komponen bersama saat ini; integrasi shadcn mengikuti TECH_STACK.md)
- Navbar           : components/ui/Navbar.tsx           (navigasi, sudah terintegrasi di SiteHeader)
- SphereImageGrid  : components/ui/SphereImageGrid.tsx  (galeri 3D sphere interaktif)
- ImageStreamHero  : components/sections/ImageStreamHero.tsx (koridor foto 3D di Hero)

Contoh penggunaan Button yang BENAR:
  import { Button } from '@/components/ui/Button';
  <Button variant="primary" size="lg" href="/join">Daftar Gratis</Button>
  <Button variant="outline" size="md" onClick={handleClick}>Lihat Lebih</Button>

Varian Button: primary | secondary | accent | outline | ghost
Ukuran Button: sm | md | lg | xl

---

## STRUKTUR PROYEK & KONVENSI FILE

### Direktori

  uvics/
  app/                      Next.js App Router - HALAMAN & API
    (public)/               Website publik + layout navigasi publik
      (marketing)/          Halaman informasi (about, contact, dll)
    (auth)/, (dashboard)/   Alias lama: redirect ke /admin/login dan /admin/dashboard
    admin/
      login/                Login admin
      (protected)/          Semua halaman dashboard admin (dilindungi)
    api/                    Route Handlers (media upload admin, contact)
    globals.css             CSS global & design tokens - JANGAN diedit sembarangan
    layout.tsx              Root layout - JANGAN diedit sembarangan
  components/
    admin/                  Shell dan widget dashboard admin
    competitions/           Komponen halaman kompetisi
    forms/                  Komponen form yang reusable
    icons/                  Ikon kustom (bukan dari library)
    layout/                 SiteHeader, SiteFooter
    sections/               Section besar untuk halaman (Hero, About, dll)
    ui/                     Komponen UI primitif yang reusable (Button, dll)
  config/                   Navigasi publik dan admin
  data/, lib/mock-data/     Data mock sementara (diganti data Supabase)
  documents/                Dokumentasi proyek (lihat tabel di atas)
  lib/
    auth/                   Guard admin dan alur login
    backend/                Error, validasi Zod, rate limit, schema domain
    env/                    Pembacaan environment
    media/                  Upload dan publikasi media Cloudinary
    supabase/               Client browser, server, service
    utils.ts                cn()
  proxy.ts                  Cek origin mutasi + refresh cookie sesi
  public/
    images/
      img/                  Foto kegiatan UVICS
      blog/                 Cover foto artikel blog
      brand/                Asset branding
      og/                   Open Graph images
    logo/                   Logo UVICS
  scripts/                  Tooling operator (migrate, provisioning, seed, test DB)
  supabase/migrations/      Schema, RLS, dan fungsi SQL
  tests/
    unit/                   Vitest (*.test.ts)
    db/                     Tes SQL per domain (PostgreSQL disposable)
    e2e/                    Playwright
  types/                    Type global, termasuk database.ts

  Folder hooks/, constants/, styles/, dan utils/ boleh dibuat bila benar-benar dibutuhkan, mengikuti konvensi penamaan di bawah.

### Penamaan File

  KOMPONEN         : PascalCase  -> HeroSection.tsx, Button.tsx
  PAGES            : lowercase   -> app/(marketing)/about/page.tsx
  HOOKS            : camelCase + prefix use -> useScrollPosition.ts
  TYPES            : PascalCase  -> types/Competition.ts
  KONSTANTA        : UPPER_SNAKE_CASE di dalam file -> NAV_ITEMS
  UTILITY FUNCTION : camelCase   -> utils/formatDate.ts

---

## KONVENSI PENULISAN KODE

### 1. TypeScript - Wajib Strict, Dilarang any

  BENAR:
    interface CompetitionCard {
      id: string;
      title: string;
      level: 'Nasional' | 'Internasional' | 'Internal';
      status: 'Open' | 'Closed' | 'Coming Soon';
      posterUrl?: string;
    }

  SALAH:
    const data: any = fetchData();
    function handleClick(e: any) { ... }

### 2. Komponen React - Functional + Named Export

  BENAR:
    interface HeroSectionProps {
      title?: string;
      subtitle?: string;
    }

    export function HeroSection({ title, subtitle }: HeroSectionProps) {
      return (...)
    }

  Default export HANYA untuk page.tsx (aturan Next.js App Router):
    export default function AboutPage() { ... }

  SALAH:
    export default function HeroSection() { ... }  // bukan page.tsx
    const HeroSection = () => { ... }              // arrow function untuk komponen

### 3. Server vs Client Components

  Gunakan Server Component sebisa mungkin. Tambahkan 'use client' HANYA jika butuh:
  - useState, useEffect, useReducer
  - Event handlers (onClick, onChange)
  - Browser-only APIs
  - Library yang tidak support server rendering

  BENAR - Server Component (tidak perlu 'use client'):
    export default async function CompetitionsPage() {
      const competitions = await getCompetitions();
      return <CompetitionList items={competitions} />;
    }

  BENAR - Client Component (perlu interaktivitas):
    'use client';
    export function CompetitionFilter({ onFilterChange }: FilterProps) {
      const [active, setActive] = useState('all');
      ...
    }

### 4. Tailwind CSS - Urutan Class

  Urutan yang benar: layout -> spacing -> sizing -> typography -> color -> border -> effect -> state

  BENAR:
    className="flex flex-col items-center gap-4 px-6 py-12 w-full max-w-7xl text-lg font-semibold text-gray-700 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-250"

  Gunakan cn() dari lib/utils untuk class kondisional:
    import { cn } from '@/lib/utils';
    <div className={cn('px-4 py-2 rounded-lg', isActive && 'bg-primary text-white', className)}>

### 5. Animasi - Wajib motion/react (Bukan framer-motion)

  BENAR:
    import { motion, AnimatePresence } from 'motion/react';

    // Pola scroll reveal standar proyek ini
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>

  SALAH:
    import { motion } from 'framer-motion';  // JANGAN, konflik dengan motion v13

### 6. Gambar - Wajib next/image

  BENAR:
    import Image from 'next/image';

    // Gambar dengan ukuran tetap
    <Image
      src="/images/img/foto-1.webp"
      alt="Anggota UVICS berkolaborasi di hackathon"
      width={400}
      height={300}
      className="rounded-2xl object-cover"
    />

    // Gambar yang mengisi container (fill layout)
    <div className="relative w-full h-64">
      <Image src="..." alt="..." fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    </div>

  SALAH:
    <img src="/images/img/foto-1.webp" alt="..." />

### 7. Urutan Import

  1. React dan Next.js core
     import React, { useState, useEffect } from 'react';
     import Image from 'next/image';
     import Link from 'next/link';

  2. Library eksternal
     import { motion } from 'motion/react';
     import { IconTrophy } from '@tabler/icons-react';
     import { ChevronRight } from 'lucide-react';

  3. Internal components (gunakan path alias @/)
     import { Button } from '@/components/ui/Button';
     import { SiteHeader } from '@/components/layout/SiteHeader';

  4. Internal data, types, utils
     import { BATCH_INFO_DATA } from '@/data/batchData';
     import type { BatchMember } from '@/data/batchData';
     import { cn } from '@/lib/utils';

  SALAH:
    import { Button } from '../../../components/ui/Button';  // relative path dalam

### 8. Aksesibilitas (a11y)

  - Satu <h1> per halaman, hierarchy heading harus benar (h1 > h2 > h3)
  - Alt text yang deskriptif pada semua Image
  - Tombol ikon selalu punya aria-label
  - Link eksternal: target="_blank" rel="noopener noreferrer"
  - JANGAN nested <main> - layout.tsx sudah punya <main>, gunakan <div> atau <section> di page.tsx

### 9. Error & Loading State

  Selalu handle loading dan empty state:

    export default async function CompetitionsPage() {
      const competitions = await getCompetitions();
      if (!competitions.length) {
        return <EmptyState message="Belum ada info lomba saat ini." />;
      }
      return <CompetitionList items={competitions} />;
    }

  Gunakan Suspense untuk async components:
    <Suspense fallback={<CompetitionSkeleton />}>
      <CompetitionList />
    </Suspense>

### 10. Komentar & Dokumentasi

  BENAR - komentar untuk logika yang tidak jelas:
    // Fibonacci sphere distribution untuk posisi gambar yang merata di bola 3D
    const phi = Math.acos(1 - 2 * (i + 0.5) / totalImages);

  BENAR - JSDoc untuk fungsi/komponen yang diekspor:
    /**
     * Kartu info lomba dengan status badge dan countdown timer.
     * @param competition - Data lomba
     * @param className - CSS class tambahan (opsional)
     */
    export function CompetitionCard({ competition, className }: CompetitionCardProps) { ... }

  SALAH - komentar yang hanya menduplikasi kode:
    // Set isOpen to true
    setIsOpen(true);

  SALAH - kode yang dikomentari (gunakan git untuk history):
    // const oldFunction = () => { ... }

### 11. Tes dan Database

  - Logika bisnis, validasi, dan bug fix ditulis dengan TDD: tulis tes yang gagal dulu, baru implementasi.
  - Unit test di `tests/unit/<nama>.test.ts` (Vitest, import memakai alias `@/`).
  - Perubahan schema selalu berupa migration baru di `supabase/migrations/YYYYMMDDHHMMSS_<topik>.sql`. Migration yang sudah diterapkan tidak boleh diedit.
  - Tes SQL di `tests/db/<domain>.sql`, didaftarkan di `scripts/test-database.mjs`. Setiap file membuka transaksi sendiri, membuat fixture sendiri, dan diakhiri `rollback`.
  - RLS diuji untuk admin aktif, authenticated non-admin, dan `anon`.
  - `types/database.ts` diperbarui setiap kali schema berubah.
  - Detail alur kerja di `documents/DEVELOPMENT_WORKFLOW.md`; kontrak backend di `documents/BACKEND_CONVENTIONS.md`.

---

## ATURAN LIBRARY

  Ikon:
  - lucide-react          Diutamakan untuk ikon umum (UI, aksi, navigasi)
  - @tabler/icons-react   Untuk ikon khusus yang tidak ada di Lucide

  Utility:
  - cn() dari lib/utils.ts  Untuk semua class kondisional (clsx + tailwind-merge)
  - Jangan install library CSS tambahan tanpa diskusi

---

## LARANGAN KERAS

1. Jangan buat file di luar struktur yang sudah ada tanpa alasan jelas
2. Jangan install package baru tanpa memastikan tidak ada alternatif di package.json
3. Jangan edit app/globals.css dan app/layout.tsx sembarangan
4. Jangan gunakan warna di luar palet yang ada di design.md dan globals.css
5. Jangan buat komponen duplikat - selalu cek components/ terlebih dahulu
6. Jangan gunakan <img> biasa - wajib next/image
7. Jangan import dari framer-motion - gunakan motion/react
8. Jangan nested <main> - layout.tsx sudah punya satu <main>
9. Jangan hardcode teks statis yang suatu saat akan di-i18n
10. Jangan commit script Python residu (add_template14.py, dll) ke dalam kode produksi

---

## CHECKLIST SEBELUM SELESAI

Sebelum menyatakan pekerjaan selesai, pastikan:

[ ] Semua warna menggunakan token Tailwind, bukan hardcode HEX
[ ] Semua gambar menggunakan next/image dengan alt yang deskriptif
[ ] Komponen baru menggunakan named export, bukan default export
[ ] Tidak ada any dalam TypeScript
[ ] Animasi menggunakan motion/react, bukan framer-motion
[ ] Tidak ada <main> bersarang (hanya satu per halaman)
[ ] Tombol menggunakan komponen <Button> yang sudah ada
[ ] Responsive di breakpoint mobile (min. xs dan lg)
[ ] Heading hierarchy benar (satu h1 per halaman)
[ ] Kode baru sesuai dengan konten yang dijelaskan di documents/PRD.md

---

*Dokumen ini adalah living document. Update setiap kali ada perubahan signifikan pada arsitektur, design system, atau standar kode proyek.*

UVICS - Unklab Virtue In Computer Science
Universitas Klabat, Airmadidi, Minahasa Utara, Sulawesi Utara
