# Frontend Convention UVICS

**Scope:** Frontend folder structure inside `src/`: where each kind of file lives and what belongs there.

**References:** [Design system](design.md) · [Public website spec](UVICS_Public_Website_Page_Specification.md)

Everything for the application lives under `src/`. This document only covers the folders that exist in the current project tree. Backend, database, and service setup are out of scope.

---

## 1. Overview of `src/`

```text
src/
├── app/            Routes, layouts, global styles
├── assets/         Static files: fonts and images
└── components/     Reusable UI, organized by Atomic Design
```

| If it is… | It goes in… |
| --- | --- |
| A URL, page, or layout | `app/` |
| A font, logo, or image file | `assets/` |
| A reusable piece of UI | `components/` |

---

## 2. `src/app/`: routing and layouts

```text
src/app/
├── (public)/       Public website (visitor-facing)
├── (auth)/         Login and other sign-in screens
├── (dashboard)/    Admin shell (sidebar, topbar)
├── admin/          Admin URL segment
├── api/            API route handlers
├── favicon.ico     Site icon
├── globals.css     Global styles and design tokens
└── layout.tsx      Root layout (html, body, fonts)
```

### Route groups

Folders in parentheses are **route groups**. They organize code and give each area its own layout, but they **do not appear in the URL**.

| Folder | Purpose | Layout | Example URLs |
| --- | --- | --- | --- |
| `(public)` | Visitor website, pages from the public spec | `SiteHeader` + `SiteFooter` | `/`, `/kompetisi`, `/berita`, `/join-uvics` |
| `(auth)` | Sign-in screens | Minimal, centered, no site header/footer | `/login` |
| `(dashboard)` | Admin screens | Admin shell (sidebar + topbar) | `/admin/news` |

### Public route naming

Public route folders use the **Indonesian slugs from the page spec**, lowercase kebab-case:

```text
(public)/
├── page.tsx                  Beranda
├── tentang/
├── visi-misi/
├── departemen/[slug]/
├── struktur-organisasi/
├── member/
├── alumni/
├── program/[slug]/
├── kompetisi/[slug]/
├── prestasi/
├── project/[slug]/
├── event/[slug]/
├── berita/[slug]/
├── galeri/
├── join-uvics/
├── kontak/
└── partner/
```

### Files in `app/`

- `page.tsx`: composes sections and components. Keep it short; no large JSX blocks.
- `layout.tsx`: wrapper for that group only. The root `layout.tsx` holds `<html>`, `<body>`, and fonts.
- `globals.css`: the single place for UVICS design tokens (see §6).
- `api/`: reserved for API route handlers. Not covered here.

### Open decision: `admin/` vs `(dashboard)/`

Both folders exist and they overlap. A route group adds no URL prefix, so the `/admin/...` prefix has to come from a real `admin` folder. Pick **one**:

- **Option A (recommended):** admin pages live in `(dashboard)/admin/<module>/`. The group supplies the shell layout, the inner `admin` folder supplies the URL prefix. Remove the empty top-level `admin/`.
- **Option B:** drop `(dashboard)` and use `admin/` with its own `layout.tsx`.

Until decided, don't add pages to both.

---

## 3. `src/assets/`: static files

```text
src/assets/
├── fonts/                  Font files
├── Images/
│   ├── blog/               Blog / news images
│   ├── brand/              Brand artwork
│   ├── icons/              Custom icon files
│   ├── img/                General images
│   ├── logo/               UVICS logo variants
│   └── og/                 Open Graph / social share images
├── CloudinaryImage.tsx
└── SphereImageGrid.tsx
```

| Folder | Put here |
| --- | --- |
| `fonts/` | Local font files only |
| `Images/blog/` | Images used by blog/news content |
| `Images/brand/` | Brand artwork and graphic elements |
| `Images/icons/` | Custom icons that are not in Lucide |
| `Images/img/` | General-purpose images that fit nowhere else |
| `Images/logo/` | Logo files (colors, sizes, formats) |
| `Images/og/` | Social share preview images |

Rules:

- Use file names in **lowercase kebab-case**: `uvics-logo-white.svg`.
- Icons come from **Lucide React** by default. `Images/icons/` is only for custom ones.
- Put a file in the most specific folder available. Use `img/` last.

### Problem: components inside `assets/`

`CloudinaryImage.tsx` and `SphereImageGrid.tsx` are React components, not static assets. `assets/` should hold files only. Move them:

| Component | Move to |
| --- | --- |
| `CloudinaryImage.tsx` | `components/atoms/CloudinaryImage/CloudinaryImage.tsx` |
| `SphereImageGrid.tsx` | `components/molecule/SphereImageGrid/SphereImageGrid.tsx` (or `components/sections/` if it is only used on one page) |

Update the imports after moving.

---

## 4. `src/components/`: Atomic Design

Reusable UI. Components here deal with **design and layout**, not page-specific content.

```text
src/components/
├── atoms/
│   └── Button/
│       └── Button.tsx
├── molecule/
│   ├── EmptyState/
│   ├── ErrorState/
│   ├── Forms/
│   ├── LoadingState/
│   ├── NavBar/
│   ├── SuccessState/
│   └── TextInput/
├── organism/
│   ├── Footer/
│   │   └── SiteFooter.tsx
│   └── Header/
│       └── SiteHeader.tsx
└── sections/
```

### Which level does a component belong to?

| Level | Definition | Examples | May import from |
| --- | --- | --- | --- |
| **atoms** | One small, single-purpose element | `Button`, `Badge`, `Avatar`, `CloudinaryImage` | other atoms only if needed |
| **molecule** | A few atoms working together as one unit | `TextInput`, `NavBar`, `EmptyState`, `ErrorState`, `LoadingState`, `SuccessState` | atoms |
| **organism** | A distinct, reusable region of the UI | `SiteHeader`, `SiteFooter` | atoms, molecules |
| **sections** | A block of one specific page | `Hero`, `DepartmentsPreview`, `JoinCta` | atoms, molecules, organisms |

**Imports go one way only:** `atoms → molecule → organism → sections → app/`. A lower level never imports from a higher one.

### How the existing components relate

- **`SiteHeader` (organism) and `NavBar` (molecule):** `NavBar` renders the navigation links, dropdowns, and mobile menu. `SiteHeader` combines the logo, `NavBar`, and the **Join UVICS** button into the full header. The menu structure follows the *Final Navbar Structure* in the page spec.
- **State molecules:** `EmptyState`, `ErrorState`, `LoadingState`, `SuccessState` are the standard way to show those states. Reuse them instead of writing a new message in each page.
- **`TextInput` and `Forms/`:** `TextInput` is one field (label, input, hint, error text). `Forms/` holds shared form pieces such as a field wrapper and a submit row.

### Folder layout per component

Each component has **its own folder** named after it, with the main file inside:

```text
Button/
├── Button.tsx          The component
└── index.ts            Optional re-export, only if it shortens imports
```

`SiteHeader.tsx` and `SiteFooter.tsx` sit in `Header/` and `Footer/` for the same reason: one folder per component.

---

## 5. `src/components/sections/`: page blocks

Sections are the large blocks that make up a page, for example the Beranda blocks in the page spec: Hero, About Preview, UVICS at a Glance, Departments Preview, Featured Competitions, Upcoming Events, Latest News, Partners, Join UVICS CTA.

**Group by page, then by section:**

```text
sections/
├── home/
│   ├── Hero/Hero.tsx
│   ├── DepartmentsPreview/DepartmentsPreview.tsx
│   ├── LatestNews/LatestNews.tsx
│   └── JoinCta/JoinCta.tsx
├── about/
├── competitions/
└── …
```

Rules:

- A section gets its content **through props**. The page passes it in.
- If a block is used on more than one page, promote it to an **organism**.
- Show `EmptyState` when a section has no content.

---

## 6. Styling

All visual values come from [`design.md`](design.md) and are defined once in `app/globals.css`.

- Use **design tokens**, not hardcoded values: `bg-primary`, not `bg-[#0230a7]`.
- Brand colors: primary `#0230a7`, secondary `#ffd000` (highlight only), accent `#0066ff`.
- Build for mobile first. Every component must work from `xs` to `2xl`.
- Interactive elements need a visible focus state and a transition.
- Icons: Lucide React, default 20px, stroke 1.5.
- Animations must respect reduced motion.

---

## 7. Naming conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component folder | PascalCase | `LoadingState/` |
| Component file | PascalCase, same as folder | `LoadingState.tsx` |
| Component export | Named export, same as file | `export function LoadingState()` |
| Next.js special files | lowercase (required by Next.js) | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Route folder | lowercase kebab-case | `struktur-organisasi/` |
| Route group | `(lowercase)` | `(public)` |
| Asset files | lowercase kebab-case | `og-default.png` |

Additional rules:

- Default exports are only for Next.js files (`page`, `layout`, etc.). Everything else uses named exports.
- One file per component. Never keep two files that differ only by capitalization (`Button.tsx` and `button.tsx`); it breaks on Windows.
- Import from `src/` with the `@/` alias: `import { Button } from "@/components/atoms/Button/Button"`. Use relative imports only inside the same component folder.
- Code and folder names are in English. Visible text follows the page spec (Indonesian).

---

## 8. Quick guide: where does it go?

**A new component:**

1. A block of one specific page? → `components/sections/<page>/`
2. A reusable region such as a header, footer, or sidebar? → `components/organism/`
3. A few atoms combined (field, nav, state message)? → `components/molecule/`
4. A single small element (button, badge, image wrapper)? → `components/atoms/`

**A new file:**

1. A font? → `assets/fonts/`
2. An image? → `assets/Images/<matching folder>/`
3. A new page? → `app/(public)/<slug>/page.tsx`

---

## 9. Open items to confirm

| # | Item | Suggested fix |
| --- | --- | --- |
| 1 | `admin/` and `(dashboard)/` overlap | Option A in §2 |
| 2 | `SuccesState` is misspelled in `molecule/` | Rename to `SuccessState` before adding files |
| 3 | `CloudinaryImage.tsx` and `SphereImageGrid.tsx` are inside `assets/` | Move to `components/` (§3) |
| 4 | `assets/fonts` is lowercase but `assets/Images` is capitalized | Pick one style. Lowercase `images` matches the rest |
| 5 | `Images/img/` is vague and overlaps with the other image folders | Merge into a better-named folder, or define what only `img/` holds |
| 6 | `Images/brand/` and `Images/logo/` may overlap | Keep logos only in `logo/`, other brand artwork in `brand/` |

*This is a living document. Update it when a new folder or atomic level is added.*
