# 📋 Product Requirements Document (PRD)
# Website Resmi UVICS — Unklab Virtue In Computer Science

**Versi:** 1.0.0
**Tanggal:** 17 September 2026
**Penulis:** Tim UVICS
**Status:** Draft

---

## 📌 Daftar Isi

1. Visi dan Tujuan Produk
2. Target Pengguna
3. Sitemap dan Arsitektur Halaman
4. Spesifikasi Halaman Publik
5. Spesifikasi Panel Admin (/admin)
6. Fitur Global dan Non-Fungsional
7. Rekomendasi Tambahan
8. Scope dan Batasan

---

## 1. Visi dan Tujuan Produk

### Visi
Menjadikan website UVICS sebagai portal digital resmi yang menjadi satu-satunya sumber kebenaran bagi ekosistem UVICS, mulai dari pengenalan organisasi, dokumentasi prestasi, hingga distribusi informasi kompetisi kepada seluruh civitas akademika UNKLAB dan komunitas teknologi lebih luas.

### Tujuan Utama
1. **Branding dan Rekrutmen** — Menarik mahasiswa UNKLAB berbakat untuk bergabung ke UVICS melalui tampilan prestasi, profil anggota, dan cerita keberhasilan organisasi.
2. **Pusat Informasi Lomba** — Menjadi agregator dan distributor info kompetisi teknologi (nasional & internasional) yang terkurasi, sehingga anggota dan mahasiswa tidak melewatkan satu pun peluang kompetisi.
3. **Portofolio Digital** — Mendokumentasikan rekam jejak perjuangan, proyek, dan kemenangan setiap generasi (batch) anggota UVICS untuk diwariskan kepada generasi berikutnya.
4. **Koneksi Sponsor dan Mitra** — Mempresentasikan kapabilitas UVICS secara profesional kepada calon sponsor, mitra industri, dan perusahaan teknologi.

---

## 2. Target Pengguna

| ID  | Segmen Pengguna                  | Kebutuhan Utama                                                       |
|-----|----------------------------------|-----------------------------------------------------------------------|
| U1  | Mahasiswa UNKLAB (calon anggota) | Mengetahui UVICS, melihat prestasi, mendaftar rekrutmen               |
| U2  | Anggota Aktif UVICS              | Mendapatkan info lomba terkini, melihat profil organisasi             |
| U3  | Alumni UVICS                     | Melihat profil batch mereka, memantau perkembangan organisasi         |
| U4  | Sponsor / Mitra Perusahaan       | Melihat prestasi dan profesionalisme UVICS, mencari kontak            |
| U5  | Admin UVICS                      | Mengelola semua konten website dari satu panel terpusat               |

---

## 3. Sitemap dan Arsitektur Halaman

`
uvics.org/
├── /                              Landing Page
├── /competitions                  Info Lomba (Daftar Kompetisi)
│   └── /competitions/[id]         Detail Lomba
├── /batch                         Direktori Angkatan
├── /achievements                  Halaman Prestasi
├── /projects                      Halaman Proyek dan Portofolio
├── /blog                          Daftar Artikel
│   └── /blog/[slug]               Artikel Lengkap
├── /about                         Tentang UVICS
├── /divisions                     Profil Divisi
├── /join                          Rekrutmen Anggota Baru
├── /faq                           Pertanyaan Umum
├── /contact                       Kontak
│
└── /admin                         Panel Admin (Akses Terbatas)
    ├── /admin/login               Halaman Login Admin
    ├── /admin/dashboard           Dashboard dan Statistik
    ├── /admin/competitions        Manajemen Info Lomba
    ├── /admin/blog                Manajemen Artikel
    ├── /admin/members             Manajemen Anggota dan Batch
    ├── /admin/recruitment         Manajemen Pendaftaran Anggota
    ├── /admin/gallery             Manajemen Galeri
    ├── /admin/achievements        Manajemen Prestasi
    ├── /admin/projects            Manajemen Proyek
    ├── /admin/about               Manajemen Halaman About
    ├── /admin/faq                 Manajemen FAQ
    └── /admin/settings            Pengaturan Website
`

---

## 4. Spesifikasi Halaman Publik

### 4.1. Landing Page (/)

Halaman utama yang menjadi kesan pertama bagi semua pengunjung. Harus mampu menyampaikan identitas, energi, dan keunggulan UVICS dalam hitungan detik.

#### Sections dan Konten:

| Section                  | Komponen                       | Konten                                                                                         |
|--------------------------|--------------------------------|-----------------------------------------------------------------------------------------------|
| Hero                     | Animasi teks & 3D image corridor | Tagline berputar (typewriter), foto kegiatan dalam koridor 3D, tombol CTA "Jelajahi Profil Kami" |
| Stats Bar                | Statistik angka animasi        | Total anggota, jumlah lomba dimenangkan, angkatan berdiri                                     |
| About Snippet            | 2 kolom: teks + foto grid      | Deskripsi singkat UVICS, 2 poin pilar utama, tombol "Selengkapnya"                           |
| Upcoming Competitions    | Card list / horizontal scroll  | 3 info lomba terdekat deadline yang sedang Open, dengan status badge dan countdown timer      |
| Hall of Fame (Showcase)  | Bento grid                     | 1 pencapaian utama, counter statistik, 2-3 pencapaian sekunder                               |
| Latest Blog              | Artikel horizontal             | 2 artikel paling baru dari blog                                                               |
| Gallery                  | 3D Sphere / Masonry            | Galeri foto kegiatan interaktif yang dapat di-rotate                                         |
| Visionaries              | Kartu profil animasi           | Bagian tentang founder/visioner dengan efek scroll animasi                                   |
| CTA Join                 | Full-width banner              | Banner ajakan "Bergabunglah ke UVICS" menuju /join                                           |
| Footer                   | 4 kolom                        | Logo, deskripsi, navigasi divisi, kontak, sosial media                                       |

---

### 4.2. Halaman Info Lomba (/competitions)

Halaman agregator semua informasi kompetisi yang dikurasi dan dikelola oleh admin UVICS.

#### Informasi di Setiap Card Lomba:
- Nama Lomba — Judul lengkap kompetisi
- Penyelenggara — Nama institusi atau komunitas penyelenggara
- Kategori / Bidang — AI/ML, UI/UX, Competitive Programming, Cybersecurity, Web Dev, dll.
- Tingkat — Badge: Nasional / Internasional / Internal Kampus
- Status — Badge: Open / Closed / Coming Soon
- Tanggal Buka Pendaftaran
- Deadline Pendaftaran
- Poster / Banner — Gambar visual lomba
- Link Pendaftaran — Tombol eksternal menuju sumber resmi lomba

#### Fitur Halaman:
- Filter: Bidang, Tingkat, Status
- Search bar berdasarkan nama lomba / penyelenggara
- Sort: Deadline terdekat, Terbaru ditambahkan
- Tampilan: Grid card (default) / List view (toggle)

#### Halaman Detail Lomba (/competitions/[id]):
- Semua informasi di atas beserta deskripsi lengkap dan syarat & ketentuan
- Tombol share ke WhatsApp dan sosial media
- Section "Anggota UVICS yang mengikuti lomba ini" (diisi manual oleh admin)

---

### 4.3. Halaman Batch / Living Legacies (/batch)

Buku tahunan (yearbook) digital anggota UVICS per angkatan dalam format editorial majalah premium.

#### Informasi yang Ditampilkan:
- Tab Pilih Angkatan: Batch 2024 (Vanguard), 2023 (Innovators), 2022 (Trailblazers), 2021 (Genesis)
- Hero Editorial Angkatan: Foto ketua, nama kode angkatan, deskripsi karakter angkatan
- Statistik Angkatan: Total anggota, jumlah trofi, proyek yang dibangun, komposisi spesialisasi (chart)
- Milestone: Daftar pencapaian kompetisi utama angkatan
- Yearbook Roster: Grid profil semua anggota, dapat difilter per spesialisasi
- Modal Profil Anggota: Nama, role, spesialisasi, kutipan inspiratif, skill chips, achievements, link GitHub & LinkedIn

---

### 4.4. Halaman Achievements (/achievements)

Dedicated page untuk menampilkan seluruh rekam jejak kemenangan dan penghargaan UVICS sepanjang sejarahnya.

#### Informasi yang Ditampilkan:
- Header: Judul dan deskripsi halaman
- Filter: Berdasarkan tahun, bidang lomba, tingkat kompetisi
- Grid/Timeline Pencapaian, setiap item berisi:
  - Nama penghargaan / lomba
  - Penyelenggara dan tahun
  - Peringkat yang diraih (1st Place, Runner Up, Finalis, dll)
  - Foto dokumentasi (opsional)
  - Anggota / tim yang berprestasi
- Stats Banner: Total lomba dimenangkan, total peserta lomba, tahun pertama berdiri

---

### 4.5. Halaman Projects / Portofolio (/projects)

Menampilkan proyek-proyek teknologi yang telah dibangun oleh anggota UVICS, baik untuk kompetisi maupun proyek mandiri.

#### Informasi di Setiap Proyek:
- Nama Proyek dan Tagline
- Deskripsi singkat (masalah yang diselesaikan, solusi yang dibangun)
- Bidang Teknologi: Web, Mobile, AI/ML, Data Science, Game, dll.
- Anggota yang terlibat (dengan foto kecil)
- Tahun dan Angkatan
- Konteks: Proyek Kompetisi / Proyek Mandiri / Proyek Akademis
- Gambar / Screenshot
- Tautan: GitHub, demo/live app (jika ada)

---

### 4.6. Halaman Blog (/blog)

Pusat artikel dan konten tulis yang dipublikasikan oleh tim UVICS.

#### Informasi di List Blog:
- Artikel Unggulan (Featured): 1 artikel terbesar di bagian atas
- Grid Artikel, setiap item berisi:
  - Foto cover artikel
  - Judul artikel
  - Ringkasan (excerpt)
  - Penulis dan tanggal terbit
  - Tags / Kategori (Hackathon, Workshop, Tutorial, Berita, Kompetisi)
  - Estimasi waktu baca

#### Halaman Detail Artikel (/blog/[slug]):
- Konten lengkap artikel (dukungan rich-text)
- Informasi penulis + foto
- Tags artikel
- Tombol share sosial media
- Related Articles — 3 artikel terkait di bawah

---

### 4.7. Halaman About (/about)

Penjelasan mendalam tentang identitas, sejarah, misi, dan nilai-nilai UVICS.

| Section               | Konten                                                                                      |
|-----------------------|---------------------------------------------------------------------------------------------|
| Hero                  | Foto kegiatan + tagline "Who We Are"                                                        |
| Our Story             | Narasi sejarah pendirian UVICS, kapan berdiri, siapa pendiri, dan perkembangan hingga kini |
| Misi dan Visi         | Pernyataan misi dan visi organisasi secara resmi                                             |
| Core Values           | 3-5 nilai inti UVICS (misal: Virtue, Innovation, Collaboration, Excellence)                 |
| Struktur Organisasi   | Bagan kepengurusan + foto dan nama ketua, wakil, sekretaris, bendahara, kepala divisi      |
| Milestone Organisasi  | Timeline perjalanan UVICS dari tahun ke tahun                                               |
| Partners and Sponsors | Logo mitra dan sponsor jika ada                                                              |

---

### 4.8. Halaman Divisi (/divisions)

Profil dan deskripsi setiap divisi yang ada di dalam UVICS.

#### Informasi per Divisi:
- Nama Divisi (Web Development, AI/ML, UI/UX Design, Competition Handler, Public Relations, Internal Development, Editor)
- Ikon / Ilustrasi representatif divisi
- Deskripsi: Fokus kerja dan peran divisi
- Keahlian yang dikembangkan (skill tags)
- Pencapaian terkait divisi — highlight lomba / project per bidang
- Anggota aktif di divisi tersebut (grid foto)

---

### 4.9. Halaman Rekrutmen / Join Us (/join)

Halaman yang diaktifkan saat UVICS membuka periode rekrutmen anggota baru.

#### Mode Halaman:
- **Mode Aktif:** Form pendaftaran aktif dapat diisi dan disubmit
- **Mode Tidak Aktif:** Form tersembunyi, diganti notifikasi "Saat ini rekrutmen sedang ditutup. Pantau sosial media kami untuk pengumuman selanjutnya."

#### Informasi yang Ditampilkan:
- Hero / Header: Judul ajakan bergabung dan foto kegiatan
- Mengapa Bergabung UVICS? — Manfaat menjadi anggota (mentoring, jaringan, kompetisi, portofolio)
- Apa yang Kami Cari? — Kriteria ideal calon anggota
- Timeline Rekrutmen: Pendaftaran > Seleksi Berkas > Wawancara > Pengumuman
- Pertanyaan Umum Rekrutmen (mini FAQ)

#### Form Pendaftaran (saat rekrutmen dibuka):

| Field                                  | Wajib? |
|----------------------------------------|--------|
| Nama Lengkap                           | Ya     |
| NIM (Nomor Induk Mahasiswa)            | Ya     |
| Fakultas / Program Studi               | Ya     |
| Angkatan / Tahun Masuk                 | Ya     |
| Email aktif                            | Ya     |
| Nomor WhatsApp                         | Ya     |
| Pilihan Divisi yang diminati           | Ya     |
| Motivasi bergabung (textarea)          | Ya     |
| Pengalaman / portfolio sebelumnya      | Tidak  |
| Link CV / Portofolio                   | Tidak  |

---

### 4.10. Halaman FAQ (/faq)

Kumpulan pertanyaan yang sering diajukan tentang UVICS.

#### Informasi yang Ditampilkan:
- Kategori FAQ: Umum, Tentang Keanggotaan, Tentang Kompetisi, Tentang Rekrutmen
- Accordion Q&A: Pertanyaan yang bisa diklik untuk membuka jawaban
- Tombol "Masih ada pertanyaan?" — link menuju /contact

---

### 4.11. Halaman Kontak (/contact)

Sarana komunikasi bagi pihak luar untuk menghubungi UVICS.

#### Informasi yang Ditampilkan:
- Judul dan Sub-judul: "Hubungi Kami"
- Informasi Kontak: Email, Nomor WhatsApp, Alamat (Universitas Klabat, Airmadidi)
- Sosial Media: Instagram, LinkedIn, GitHub (dengan ikon yang dapat diklik)
- Form Kontak: Nama, Email, Subjek, Pesan, Tombol kirim
- Peta / Map Embed (Google Maps Universitas Klabat) — opsional

---

## 5. Spesifikasi Panel Admin (/admin)

Panel admin adalah sistem manajemen konten (CMS) internal resmi UVICS yang dibangun dengan konsep **Modern Clean SaaS Dashboard**. 

### 5.0. Konsep Arsitektur & UI/UX Admin
- **Layout Shell**: Collapsible sidebar dengan tema biru dongker resmi (`bg-primary`) dan area kerja putih/abu-abu bersih (`bg-muted`/`bg-white`).
- **Header / Topbar**: Breadcrumb navigasi dinamis, indikator status sistem, dan menu profil Master Admin.
- **Tabel & Interaktivitas**: Data table interaktif yang mendukung pencarian instan (search), filter multi-kategori, pagination, dan animasi transisi halus dengan `motion/react`.
- **Form Input**: Slide-over drawer dari samping atau modal terpusat untuk input/edit data cepat tanpa reload halaman.
- **Backend & Database**: **Supabase** (PostgreSQL untuk relasi data, Supabase Auth untuk proteksi rute, dan Supabase Storage untuk upload gambar/berkas).
- **Hak Akses & Autentikasi**: Master Admin (Single/Shared akun Pengurus Inti UVICS) menggunakan email dan password yang diproteksi HTTP-only cookie dan middleware Next.js.

---

### 5.1. Halaman Login Admin

Pintu masuk ke panel admin (/admin/login).
- Form login email & password dengan validasi ketat
- Toggle show/hide password
- Rate limiting sederhana & CSRF protection
- Redirect otomatis ke `/admin/dashboard` jika sudah terotentikasi

---

### 5.2. Dashboard Admin

Ringkasan metrik dan operasional UVICS secara real-time:
- **Quick Metrics Card**: 
  - Total Anggota Aktif vs Alumni
  - Info Lomba Aktif (Open) & Mendekati Deadline (< 7 hari)
  - Pendaftar Rekrutmen Baru (Pending Approval)
  - Total Artikel Blog (Published & Draft)
- **Aksi Cepat (Quick Actions)**:
  - "+ Tambah Info Lomba"
  - "+ Tambah Anggota / Alumni"
  - "+ Tulis Artikel"
  - Toggle Cepat: Status Rekrutmen (Buka / Tutup)
- **Tabel Monitoring**: 5 pendaftar terbaru dan 3 lomba paling mendesak

---

### 5.3. Manajemen Info Lomba (Competition Hub)

Modul utama UVICS untuk mengkurasi dan mendistribusikan informasi kompetisi:
- **Tampilan List**: Tabel interaktif dengan nama lomba, tingkat (Internal, Regional, Nasional, Internasional), bidang, deadline, dan status badge.
- **Fitur Khusus Otomatisasi**:
  1. **Auto-Status Deadline**: Sistem secara otomatis mengecek tanggal deadline; jika telah terlewati, status lomba otomatis berubah dari `Open` menjadi `Closed/Selesai`.
  2. **Quick Broadcast WhatsApp Generator**: Tombol 1-klik di setiap baris lomba yang menghasilkan teks pengumuman lomba berformat rapi dengan emoji, siap dicopy atau langsung dibuka via WhatsApp Web untuk dishare ke grup chat anggota.
- **Form Tambah / Edit Lomba (Modal / Drawer)**:
  - Nama Kompetisi, Penyelenggara, Tingkat (Dropdown)
  - Bidang / Kategori (AI/ML, Web Dev, UI/UX, Mobile, Cybersecurity, Competitive Programming, Data Science)
  - Tanggal Buka & Deadline Pendaftaran (Date picker)
  - Status (Open / Coming Soon / Closed)
  - Link Pendaftaran Resmi
  - Poster Lomba (Upload ke Supabase Storage)
  - Syarat & Ketentuan / Deskripsi Singkat

---

### 5.4. Manajemen Blog & Artikel

Modul publikasi artikel kegiatan, tutorial, dan tips lomba:
- **Tampilan List**: Tabel judul, penulis, status (Draft / Published), tanggal terbit, dan aksi.
- **Editor**: Rich-text / Markdown editor dengan upload foto cover ke Supabase Storage.
- **Pengaturan Metadata**: Tags/Kategori, slug URL otomatis, estimasi waktu baca, dan meta description SEO.

---

### 5.5. Manajemen Member & Direktori Alumni

Modul satu pintu untuk seluruh database insan UVICS dengan sistem transisi mulus:
- **Tampilan List (Master Directory)**:
  - **Tab Switcher**: Tab `Anggota Aktif` dan Tab `Alumni` dalam satu halaman master.
  - **Tabel Data**: Foto profil, Nama Lengkap, Angkatan/Batch, Spesialisasi Tech Stack, Jabatan/Role, Status, Aksi.
  - **Filter Cepat**: Berdasarkan Angkatan (2021, 2022, dst) dan Bidang Keahlian.
- **Alur Transisi Member ke Alumni**:
  - Admin dapat mengubah status anggota dari `Aktif` menjadi `Alumni` dengan 1-klik toggle atau memilih tahun kelulusan.
  - Ketika status menjadi **Alumni**, form otomatis menampilkan field tambahan khusus alumni:
    - Pekerjaan / Jabatan Saat Ini (contoh: Software Engineer, AI Researcher)
    - Tempat Kerja / Perusahaan / Institusi (contoh: Tokopedia, Google, Dosen)
    - Pesan & Nasihat Inspiratif untuk Junior UVICS
- **Field Data Lengkap Anggota**:
  - Biodata: Nama, NIM, Angkatan, Role/Divisi, Foto Profil
  - Tech Stack & Skills (tagging)
  - Media Sosial & Portofolio: GitHub, LinkedIn, Website Portofolio
  - Flagging Khusus: `Is Core Leader?` (tampil di struktur kepengurusan publik)

---

### 5.6. Manajemen Rekrutmen & Approval Calon Anggota

Modul pengelolaan pendaftaran saat periode rekrutmen UVICS dibuka:
- **Kontrol Global Rekrutmen**:
  - Toggle Saklar "Buka / Tutup Rekrutmen" (otomatis mengubah status formulir di halaman `/join`).
- **Daftar Pendaftar Masuk**:
  - Tabel: Nama, NIM, Fakultas/Prodi, Pilihan Divisi, Tanggal Daftar, Status Seleksi (Pending / Wawancara / Diterima / Ditolak).
  - Modal Detail Pendaftar: membaca seluruh jawaban formulir motivasi, pengalaman, dan link CV.
  - Export data pendaftar ke format **CSV / Excel**.
- **Fitur Khusus "Convert to Member"**:
  - Ketika pendaftar diubah statusnya menjadi `Diterima / Lolos`, admin dapat mengklik tombol **"Jadikan Anggota Aktif"**.
  - Sistem akan otomatis membuat entri data baru di tabel Member UVICS menggunakan data yang sudah diinput pelamar, tanpa perlu diketik ulang secara manual oleh pengurus.

---

### 5.7. Manajemen Galeri

#### Form Upload / Edit Foto:

| Field               | Tipe                    | Wajib? |
|---------------------|-------------------------|--------|
| Foto                | Upload gambar (multiple)| Ya     |
| Judul / Keterangan  | Text input              | Tidak  |
| Tanggal Kegiatan    | Date picker             | Tidak  |
| Tags Kegiatan       | Multi-select            | Tidak  |

---

### 5.8. Manajemen Halaman About dan Profil Organisasi

#### Field yang Dapat Diedit:
- Narasi "Our Story" (rich-text editor)
- Pernyataan Misi dan Visi
- Core Values (tambah, edit, hapus, drag-reorder)
- Struktur Kepengurusan: nama, jabatan, foto per anggota pengurus
- Milestone Organisasi: tahun, judul event, deskripsi
- Partners and Sponsors: logo, nama, link website

---

### 5.9. Manajemen Achievements dan Projects

#### Form per Prestasi:

| Field                | Tipe                             |
|----------------------|----------------------------------|
| Nama Lomba           | Text                             |
| Penyelenggara        | Text                             |
| Peringkat / Award    | Text (1st Place, Runner Up, dll) |
| Tahun                | Year picker                      |
| Bidang               | Dropdown                         |
| Anggota / Tim        | Multi-select dari daftar anggota |
| Foto Dokumentasi     | Upload                           |

#### Form per Proyek:

| Field                | Tipe                                              |
|----------------------|---------------------------------------------------|
| Nama Proyek          | Text                                              |
| Tagline              | Text singkat                                      |
| Deskripsi            | Rich-text                                         |
| Bidang Teknologi     | Multi-select tag                                  |
| Anggota yang terlibat| Multi-select dari daftar anggota                  |
| Angkatan             | Dropdown                                          |
| Konteks              | Dropdown (Kompetisi / Mandiri / Akademis)         |
| Screenshot / Gambar  | Upload (multi)                                    |
| Link GitHub          | URL                                               |
| Link Demo / Live     | URL                                               |

---

### 5.10. Statistik Website

#### Data yang Ditampilkan:
- Grafik pengunjung — harian, mingguan, bulanan
- Halaman paling banyak dikunjungi — Top 5 halaman
- Perangkat pengunjung — Mobile vs Desktop (pie chart)
- Total klik pada tombol "Daftar Lomba"
- Total pengiriman form kontak
- Total pendaftar rekrutmen per periode

> Implementasi menggunakan layanan analitik pihak ketiga seperti Vercel Analytics atau Google Analytics.

---

### 5.11. Manajemen FAQ dan Kontak

#### Manajemen FAQ:
- Tambah, edit, hapus pertanyaan dan jawaban
- Atur kategori FAQ
- Drag-and-drop untuk reorder urutan tampilan

#### Manajemen Pesan Kontak:
- List semua pesan yang masuk dari form kontak
- Tampilkan: Nama pengirim, email, subjek, tanggal
- Klik untuk melihat isi pesan lengkap
- Tandai sebagai "Sudah Dibaca" / "Belum Dibaca"

---

## 6. Fitur Global dan Non-Fungsional

### 6.1. Internasionalisasi (i18n)
- Website mendukung 2 bahasa: Bahasa Indonesia (default) dan Bahasa Inggris
- Toggle bahasa di navbar (ID / EN)
- Konten berubah secara dinamis tanpa perubahan rute URL

### 6.2. Responsivitas
- Responsif di semua breakpoint: xs (< 480px) hingga 2xl (>= 1440px)
- Mobile-first design

### 6.3. SEO
- Setiap halaman memiliki title dan meta description yang unik
- Open Graph tags untuk preview saat dibagikan di sosial media
- URL bersih dan ramah SEO (contoh: /blog/judul-artikel-saya)
- sitemap.xml yang digenerate otomatis
- Struktur heading semantik (h1 > h2 > h3)

### 6.4. Performa
- Target skor Lighthouse: >= 85 (Performance, Accessibility, SEO)
- Gambar menggunakan format WebP dan komponen next/image
- Lazy loading untuk gambar di below-the-fold

### 6.5. Keamanan Admin
- Semua rute /admin/* diproteksi oleh middleware autentikasi Next.js
- Sesi admin menggunakan HTTP-only cookies atau JWT
- Password di-hash menggunakan bcrypt
- CSRF protection pada form

### 6.6. Design System
- Token warna mengacu pada design.md dan globals.css
- Warna: #0230a7 (Primary Blue), #ffd000 (Secondary Yellow), #0066ff (Accent)
- Font: Plus Jakarta Sans (body) dan Playfair Display (heading)
- Animasi menggunakan motion/react (motion v13+)

---

## 7. Rekomendasi Tambahan

Fitur berikut tidak termasuk scope v1.0 namun direkomendasikan untuk iterasi berikutnya:

| Rekomendasi                    | Alasan                                                                                      |
|--------------------------------|---------------------------------------------------------------------------------------------|
| Notifikasi Email Otomatis      | Kirim email ke pendaftar rekrutmen saat status berubah via Resend atau Nodemailer          |
| Share Info Lomba ke WhatsApp   | Tombol share 1-klik menghasilkan teks berformat untuk dishare ke grup                      |
| Widget Countdown Timer         | Countdown di setiap card lomba yang menghitung waktu mundur deadline                       |
| OG Image Dinamis               | Generate gambar Open Graph per artikel blog dan info lomba menggunakan next/og              |
| Dark Mode                      | Toggle dark/light mode untuk kenyamanan pengguna di malam hari                             |
| Rich Text Editor (Tiptap)      | Editor konten blog yang lebih baik di panel admin                                          |
| Optimasi next/image Menyeluruh | Blur placeholder di semua gambar untuk meningkatkan Core Web Vitals                        |

---

## 8. Scope dan Batasan

### Dalam Scope (v1.0):
- Semua halaman publik yang disebutkan di seksi 4
- Panel admin lengkap yang disebutkan di seksi 5
- Dukungan bilingual (ID / EN) dengan toggle
- Autentikasi admin: 1 akun, email + password
- Tidak ada sistem role/permission bertingkat
- Tidak ada member area / login untuk anggota biasa

### Di Luar Scope (v1.0):
- Forum diskusi atau fitur komunitas real-time (chat)
- Sistem pembayaran apapun
- Integrasi dengan sistem akademik UNKLAB
- Mobile app (Android / iOS)
- Member area (portal login untuk anggota non-admin)

---

*Dokumen ini bersifat living document — akan diperbarui seiring perkembangan kebutuhan dan feedback tim.*

---
**UVICS — Unklab Virtue In Computer Science**
*Universitas Klabat, Airmadidi, Minahasa Utara, Sulawesi Utara*
