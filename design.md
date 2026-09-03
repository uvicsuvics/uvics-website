# 🎨 Design System

Dokumentasi design system resmi untuk website ini. Semua komponen, warna, tipografi, dan spacing harus mengacu pada panduan ini untuk menjaga konsistensi visual di seluruh halaman.

---

## 📌 Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Border & Radius](#border--radius)
5. [Shadows](#shadows)
6. [Breakpoints](#breakpoints)
7. [Icons](#icons)
8. [Components](#components)
9. [Motion & Animation](#motion--animation)
10. [Do`s & Don`ts](#dos--donts)

---

## 🎨 Color Palette

### Brand Colors

| Token               | HEX       | RGB                  | Usage                                             |
|---------------------|-----------|----------------------|---------------------------------------------------|
| `--color-primary`   | `#0230a7` | `rgb(2, 48, 167)`    | CTA utama, tombol primer, link aktif, header      |
| `--color-secondary` | `#ffd000` | `rgb(255, 208, 0)`   | Badge, highlight, elemen aksen pendukung          |
| `--color-accent`    | `#0066ff` | `rgb(0, 102, 255)`   | Hover state, ikon interaktif, progress bar        |
| `--color-base`      | `#ffffff` | `rgb(255, 255, 255)` | Background utama, teks pada background gelap      |
| `--color-muted`     | `#f0f0f0` | `rgb(240, 240, 240)` | Background section alternatif, divider, input bg  |
| `--color-card`      | `#ffffff` | `rgb(255, 255, 255)` | Background card, modal, dropdown                  |

### Color Shades (Tints & Shades)

#### Primary (`#0230a7`)

| Shade   | HEX       | Usage                         |
|---------|-----------|-------------------------------|
| 50      | `#e6eaf9` | Background sangat terang      |
| 100     | `#b3bef0` | Hover ringan / highlight      |
| 200     | `#8096e7` | Border aktif                  |
| 300     | `#4d6adf` | Icon outline                  |
| 400     | `#1a44d6` | Hover tombol primer           |
| **500** | `#0230a7` | **Base — Warna utama**        |
| 600     | `#022890` | Active/pressed state          |
| 700     | `#011f72` | Deep background accent        |
| 800     | `#011554` | Dark mode element             |
| 900     | `#000b36` | Teks sangat gelap / footer bg |

#### Secondary (`#ffd000`)

| Shade   | HEX       | Usage                     |
|---------|-----------|---------------------------|
| 50      | `#fffbe6` | Background badge terang   |
| 100     | `#fff3b3` | Highlight ringan          |
| 200     | `#ffeb80` | Tag / chip background     |
| 300     | `#ffe34d` | Warning light             |
| 400     | `#ffdb1a` | Hover badge               |
| **500** | `#ffd000` | **Base — Warna sekunder** |
| 600     | `#e6bb00` | Active state badge        |
| 700     | `#b38f00` | Border badge              |
| 800     | `#806700` | Teks pada badge cerah     |
| 900     | `#4d3e00` | Teks gelap di atas kuning |

#### Accent (`#0066ff`)

| Shade   | HEX       | Usage                     |
|---------|-----------|---------------------------|
| 50      | `#e6f0ff` | Background tooltip terang |
| 100     | `#b3d1ff` | Link underline            |
| 200     | `#80b2ff` | Focused input border      |
| 300     | `#4d93ff` | Ikon interaktif           |
| 400     | `#1a74ff` | Hover accent              |
| **500** | `#0066ff` | **Base — Warna aksen**    |
| 600     | `#0057db` | Active accent             |
| 700     | `#0043ab` | Pressed state             |
| 800     | `#00307a` | Dark accent               |
| 900     | `#001c4a` | Deep accent               |

### Semantic Colors

| Token             | HEX       | Usage                                    |
|-------------------|-----------|------------------------------------------|
| `--color-success` | `#16a34a` | Pesan sukses, status aktif, checkmark    |
| `--color-warning` | `#d97706` | Peringatan, indikator hati-hati          |
| `--color-error`   | `#dc2626` | Error, validasi gagal, notifikasi kritis |
| `--color-info`    | `#0066ff` | Informasi umum, tooltip, help text       |

### Neutral / Grayscale

| Token       | HEX       | Usage                     |
|-------------|-----------|---------------------------|
| `--gray-50` | `#fafafa` | Background halaman        |
| `--gray-100`| `#f4f4f5` | Sidebar, panel            |
| `--gray-200`| `#e4e4e7` | Border ringan             |
| `--gray-300`| `#d4d4d8` | Divider                   |
| `--gray-400`| `#a1a1aa` | Placeholder teks          |
| `--gray-500`| `#71717a` | Label sekunder            |
| `--gray-600`| `#52525b` | Body text sekunder        |
| `--gray-700`| `#3f3f46` | Body text utama           |
| `--gray-800`| `#27272a` | Heading                   |
| `--gray-900`| `#18181b` | Heading utama / judul besar|

---

## ✍️ Typography

### Font Family

```css
--font-primary: 'Inter', sans-serif;
--font-heading: 'Plus Jakarta Sans', sans-serif;
--font-mono:    'JetBrains Mono', monospace;
```

> Import dari Google Fonts:
> ```html
> <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
> ```

### Font Scale

| Token         | Size   | Line Height | Weight | Usage                             |
|---------------|--------|-------------|--------|-----------------------------------|
| `--text-xs`   | `12px` | `16px`      | 400    | Label kecil, caption              |
| `--text-sm`   | `14px` | `20px`      | 400    | Body teks sekunder, meta info     |
| `--text-base` | `16px` | `24px`      | 400    | Body teks utama                   |
| `--text-lg`   | `18px` | `28px`      | 500    | Lead paragraph                    |
| `--text-xl`   | `20px` | `30px`      | 600    | Card title, sub-heading kecil     |
| `--text-2xl`  | `24px` | `32px`      | 600    | Section title                     |
| `--text-3xl`  | `30px` | `38px`      | 700    | Page subtitle                     |
| `--text-4xl`  | `36px` | `44px`      | 700    | Page heading                      |
| `--text-5xl`  | `48px` | `58px`      | 800    | Hero heading                      |
| `--text-6xl`  | `60px` | `72px`      | 800    | Display / landing hero            |
| `--text-7xl`  | `72px` | `86px`      | 800    | Extra large display               |

### Font Weight

| Token               | Value | Usage                     |
|---------------------|-------|---------------------------|
| `--weight-regular`  | 400   | Body teks                 |
| `--weight-medium`   | 500   | UI label, caption penting |
| `--weight-semibold` | 600   | Sub-heading, card title   |
| `--weight-bold`     | 700   | Heading                   |
| `--weight-extrabold`| 800   | Hero, display text        |

---

## 📐 Spacing & Layout

### Spacing Scale (basis 4px)

| Token        | Value  | Usage                              |
|--------------|--------|------------------------------------|
| `--space-1`  | `4px`  | Gap antar ikon kecil               |
| `--space-2`  | `8px`  | Padding dalam badge / chip         |
| `--space-3`  | `12px` | Gap antar elemen inline            |
| `--space-4`  | `16px` | Padding dalam komponen kecil       |
| `--space-5`  | `20px` | Gap antar komponen medium          |
| `--space-6`  | `24px` | Padding section kecil              |
| `--space-8`  | `32px` | Margin antar komponen besar        |
| `--space-10` | `40px` | Padding section medium             |
| `--space-12` | `48px` | Section padding atas/bawah         |
| `--space-16` | `64px` | Jarak antar section besar          |
| `--space-20` | `80px` | Hero section padding               |
| `--space-24` | `96px` | Section padding ekstra besar       |

### Container

| Nama            | Max Width | Padding Horizontal |
|-----------------|-----------|--------------------|
| `container-sm`  | `640px`   | `16px`             |
| `container-md`  | `768px`   | `24px`             |
| `container-lg`  | `1024px`  | `32px`             |
| `container-xl`  | `1280px`  | `32px`             |
| `container-2xl` | `1440px`  | `40px`             |

---

## 🔲 Border & Radius

### Border Width

| Token            | Value | Usage              |
|------------------|-------|--------------------|
| `--border-thin`  | `1px` | Card, input        |
| `--border-base`  | `2px` | Focus ring, active |
| `--border-thick` | `4px` | Highlight, callout |

### Border Radius

| Token          | Value    | Usage                              |
|----------------|----------|------------------------------------|
| `--radius-sm`  | `4px`    | Badge, chip, tag                   |
| `--radius-md`  | `8px`    | Button, input, card kecil          |
| `--radius-lg`  | `12px`   | Card, panel                        |
| `--radius-xl`  | `16px`   | Modal, drawer                      |
| `--radius-2xl` | `24px`   | Hero card, feature block           |
| `--radius-full`| `9999px` | Pill button, avatar, badge bulat   |

---

## 🌑 Shadows

| Token              | Value                                     | Usage                    |
|--------------------|-------------------------------------------|--------------------------|
| `--shadow-xs`      | `0 1px 2px rgba(0,0,0,0.05)`             | Input default            |
| `--shadow-sm`      | `0 2px 4px rgba(0,0,0,0.08)`             | Card default             |
| `--shadow-md`      | `0 4px 12px rgba(0,0,0,0.10)`            | Card hover, dropdown     |
| `--shadow-lg`      | `0 8px 24px rgba(0,0,0,0.12)`            | Modal, popover           |
| `--shadow-xl`      | `0 16px 48px rgba(0,0,0,0.14)`           | Floating element         |
| `--shadow-primary` | `0 8px 24px rgba(2,48,167,0.25)`         | Tombol primer hover      |
| `--shadow-accent`  | `0 8px 24px rgba(0,102,255,0.20)`        | Elemen aksen hover       |

---

## 📱 Breakpoints

| Token | Width     | Target Device                  |
|-------|-----------|-------------------------------|
| `xs`  | `< 480px` | Handphone kecil               |
| `sm`  | `≥ 480px` | Handphone standar             |
| `md`  | `≥ 768px` | Tablet portrait               |
| `lg`  | `≥ 1024px`| Tablet landscape / laptop     |
| `xl`  | `≥ 1280px`| Desktop                       |
| `2xl` | `≥ 1440px`| Desktop besar / wide screen   |

```css
@media (min-width: 480px)  { /* sm  */ }
@media (min-width: 768px)  { /* md  */ }
@media (min-width: 1024px) { /* lg  */ }
@media (min-width: 1280px) { /* xl  */ }
@media (min-width: 1440px) { /* 2xl */ }
```

---

## 🔠 Icons

- **Library**: Lucide Icons (https://lucide.dev) — konsisten, clean, open source
- **Ukuran default**: `20px` (sm: `16px`, lg: `24px`, xl: `32px`)
- **Stroke width**: `1.5px`
- **Warna**: Mengikuti konteks warna komponen (`currentColor`)

---

## 🧩 Components

### Button

| Variant     | Background | Teks      | Hover                  | Border              |
|-------------|------------|-----------|------------------------|---------------------|
| `primary`   | `#0230a7`  | `#ffffff` | `#022890` + shadow     | none                |
| `secondary` | `#ffd000`  | `#18181b` | `#e6bb00` + shadow     | none                |
| `accent`    | `#0066ff`  | `#ffffff` | `#0057db` + shadow     | none                |
| `outline`   | transparent| `#0230a7` | bg `#e6eaf9`           | `2px solid #0230a7` |
| `ghost`     | transparent| `#3f3f46` | bg `#f0f0f0`           | none                |
| `danger`    | `#dc2626`  | `#ffffff` | `#b91c1c`              | none                |

**Ukuran Button:**

| Size | Padding     | Font Size | Border Radius |
|------|-------------|-----------|---------------|
| `sm` | `8px 16px`  | `14px`    | `8px`         |
| `md` | `12px 24px` | `16px`    | `8px`         |
| `lg` | `16px 32px` | `18px`    | `10px`        |
| `xl` | `20px 40px` | `20px`    | `12px`        |

---

### Card

```
Background : #ffffff
Border     : 1px solid #e4e4e7
Radius     : 12px
Padding    : 24px
Shadow     : 0 2px 4px rgba(0,0,0,0.08)

Hover state:
  Shadow     : 0 8px 24px rgba(0,0,0,0.12)
  Transform  : translateY(-2px)
  Transition : all 0.25s ease
```

---

### Input / Form

```
Background   : #ffffff
Border       : 1px solid #d4d4d8
Radius       : 8px
Padding      : 12px 16px
Font Size    : 16px
Color        : #27272a
Placeholder  : #a1a1aa

Focus state:
  Border  : 2px solid #0066ff
  Shadow  : 0 0 0 3px rgba(0,102,255,0.15)
  Outline : none

Error state:
  Border  : 2px solid #dc2626
  Shadow  : 0 0 0 3px rgba(220,38,38,0.15)
```

---

### Badge / Chip

| Variant     | Background | Teks      | Border Radius |
|-------------|------------|-----------|---------------|
| `primary`   | `#e6eaf9`  | `#0230a7` | `4px`         |
| `secondary` | `#fffbe6`  | `#806700` | `4px`         |
| `accent`    | `#e6f0ff`  | `#0066ff` | `4px`         |
| `success`   | `#dcfce7`  | `#16a34a` | `4px`         |
| `warning`   | `#fef3c7`  | `#d97706` | `4px`         |
| `error`     | `#fee2e2`  | `#dc2626` | `4px`         |

---

### Navigation / Navbar

```
Background   : #ffffff (dengan backdrop blur jika sticky)
Border Bottom: 1px solid #e4e4e7
Height       : 64px - 72px
Padding X    : 32px
Logo Color   : #0230a7
Link Color   : #3f3f46
Link Active  : #0230a7
Link Hover   : #0230a7
CTA Button   : primary variant
```

---

### Footer

```
Background    : #0230a7 atau #18181b
Teks Utama    : #ffffff
Teks Sekunder : rgba(255,255,255,0.65)
Link Hover    : #ffd000
Divider       : rgba(255,255,255,0.15)
Padding Y     : 64px - 96px
```

---

## 🎬 Motion & Animation

### Durasi

| Token              | Value   | Usage                         |
|--------------------|---------|-------------------------------|
| `--duration-fast`  | `150ms` | Hover, tooltip                |
| `--duration-base`  | `250ms` | Tombol, state change          |
| `--duration-slow`  | `400ms` | Modal open, page transition   |
| `--duration-xslow` | `600ms` | Hero entrance, scroll reveal  |

### Easing

| Token               | Value                              | Usage                          |
|---------------------|------------------------------------|--------------------------------|
| `--ease-standard`   | `cubic-bezier(0.4, 0, 0.2, 1)`    | Transisi umum                  |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)`      | Elemen masuk ke layar          |
| `--ease-accelerate` | `cubic-bezier(0.4, 0, 1, 1)`      | Elemen keluar dari layar       |
| `--ease-spring`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`| Bounce / playful animation    |

### Pola Animasi Umum

```css
/* Fade In Up — scroll reveal */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scale In — modal / popover */
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

/* Slide In Right — sidebar / drawer */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Shimmer — skeleton loading */
@keyframes shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}
```

---

## ✅ Do`s & Don`ts

### ✅ Do`s

- Selalu gunakan CSS variable token, bukan nilai warna hardcode.
- Gunakan `color-primary` untuk tombol CTA utama.
- Gunakan `color-secondary` hanya sebagai aksen/highlight, bukan elemen dominan.
- Pastikan rasio kontras warna memenuhi standar WCAG AA minimum (4.5:1 untuk teks normal).
- Gunakan `color-muted` untuk background section yang membutuhkan pemisahan visual.
- Terapkan `transition` pada semua elemen interaktif.
- Gunakan `shadow-primary` pada tombol primer saat hover untuk kesan premium.

### ❌ Don`ts

- Jangan gunakan warna di luar palet yang telah ditentukan.
- Jangan menempatkan teks `#0230a7` di atas background `#0066ff` (kontras tidak cukup).
- Jangan gunakan `color-secondary (#ffd000)` sebagai warna teks pada background putih tanpa konteks visual tambahan (kontras rendah).
- Jangan menggunakan lebih dari 3 warna brand dalam 1 komponen.
- Jangan abaikan responsivitas — semua komponen harus berfungsi di breakpoint xs hingga 2xl.
- Jangan gunakan animasi berlebihan; prioritaskan kecepatan dan kejelasan.

---

## 🗂️ CSS Custom Properties — Quick Reference

```css
:root {
  /* === Brand Colors === */
  --color-primary:   #0230a7;
  --color-secondary: #ffd000;
  --color-accent:    #0066ff;
  --color-base:      #ffffff;
  --color-muted:     #f0f0f0;
  --color-card:      #ffffff;

  /* === Semantic === */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error:   #dc2626;
  --color-info:    #0066ff;

  /* === Neutral === */
  --gray-50:  #fafafa;
  --gray-100: #f4f4f5;
  --gray-200: #e4e4e7;
  --gray-300: #d4d4d8;
  --gray-400: #a1a1aa;
  --gray-500: #71717a;
  --gray-600: #52525b;
  --gray-700: #3f3f46;
  --gray-800: #27272a;
  --gray-900: #18181b;

  /* === Typography === */
  --font-primary: 'Inter', sans-serif;
  --font-heading: 'Plus Jakarta Sans', sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* === Spacing === */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  /* === Border Radius === */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-xs:      0 1px 2px rgba(0,0,0,0.05);
  --shadow-sm:      0 2px 4px rgba(0,0,0,0.08);
  --shadow-md:      0 4px 12px rgba(0,0,0,0.10);
  --shadow-lg:      0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl:      0 16px 48px rgba(0,0,0,0.14);
  --shadow-primary: 0 8px 24px rgba(2,48,167,0.25);
  --shadow-accent:  0 8px 24px rgba(0,102,255,0.20);

  /* === Transitions === */
  --duration-fast:   150ms;
  --duration-base:   250ms;
  --duration-slow:   400ms;
  --duration-xslow:  600ms;
  --ease-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

*Design System ini bersifat living document — update setiap kali ada penambahan komponen atau token baru.*
