# Catatan Keputusan UVICS

**Diperbarui:** 29 Oktober 2026
**Rujukan:** [PRD](PRD.md) · [Spesifikasi halaman publik](UVICS_Public_Website_Page_Specification.md) · [Tech stack](TECH_STACK.md) · [Kontrak backend](BACKEND_CONVENTIONS.md)

Dokumen ini adalah satu-satunya tempat mencatat keputusan produk, data, dan teknis yang tidak tertulis jelas di PRD atau spesifikasi. Jika PRD, spesifikasi, dan dokumen ini berbeda, keputusan berstatus **Diterima** di sini yang berlaku sampai PRD diperbarui.

## Cara memakai

| Status | Arti |
| --- | --- |
| **Diterima** | Sudah disepakati atau sudah diterapkan di `development`. Wajib diikuti. |
| **Usulan** | Rekomendasi dengan bukti, menunggu persetujuan PM. Jangan dibangun dengan asumsi lain tanpa diskusi. |
| **Terbuka** | Belum ada rekomendasi kuat. Perlu diskusi tim. |
| **Perlu dilengkapi** | Nomor keputusan sudah dipakai di kode/PR, tetapi isinya belum tercatat. |

Alur perubahan:

1. Owner domain atau PM menambah baris baru dengan status **Usulan** beserta bukti dan dampaknya.
2. PM (penanggung jawab issue `S{n}-PM-01`) mengubah status menjadi **Diterima** atau menolaknya.
3. Keputusan yang mengubah schema dikerjakan lewat issue/PR dengan migration baru, lalu PRD diperbarui pada revisi berikutnya.

Penomoran: `D` untuk keputusan yang diterima atau berasal dari kontrak teknis, `U` untuk usulan, `T` untuk isu terbuka. Usulan yang diterima mendapat nomor `D` baru; nomor lama tidak dipakai ulang.

---

## A. Keputusan teknis D01–D05 (kontrak #31/#33)

Nomor D01–D05 dipakai di PR #17 dan PR #33 (`BACKEND_CONVENTIONS.md` versi draf #33).

| ID | Keputusan | Status | Dasar | Diterapkan di |
| --- | --- | --- | --- | --- |
| D01 | #31 boleh memperbaiki RLS, grants, dan audit melalui migration **additive** baru. Struktur bisnis, CRUD, dan rekonsiliasi migration domain tetap milik owner (#29 Andi, #30 Jofan); migration yang sudah diterapkan tidak diedit. | Diterima | Keputusan pengguna saat wawancara #31 (8 Oktober 2026) | #33 (`20261008100000_backend_security_guardrails.sql`) |
| D02 | Akses publik langsung ke tabel `members`, `registrations`, dan data alumni **ditutup**. Data member yang tampil publik hanya lewat DTO proyeksi field (`toPublicMember`: nama, foto berstatus PUBLIC, posisi, departemen). `public_profile` bukan bukti persetujuan. | Diterima | PRD §33, §47 · BACKEND_CONVENTIONS draf #33 | #17 (policy publik member dihapus) |
| D03 | Settings publik hanya dibaca lewat `read_public_settings()` dengan allowlist key; nilai malformed tidak dikirim. | Diterima | BACKEND_CONVENTIONS draf #33 · diterima PM 21 Oktober 2026 (#12) | #33 (`20261008100000_backend_security_guardrails.sql`, `tests/db/security.sql`) |
| D04 | Nomor telepon disimpan ternormalisasi `+kodenegara` diikuti digit, total 8–15 digit (`^\+[1-9][0-9]{7,14}$`). Input `08…` dinormalisasi menjadi `+628…` sebelum disimpan. | Diterima | PRD §22.3 · `lib/backend/validation.ts` draf #33 | #17 (constraint SQL + Zod); normalisasi input menunggu #33 |
| D05 | Branch fitur dan PR integrasi #31 menuju `development`, bukan `main`. Kasus khusus dari aturan umum D16. | Diterima | Keputusan pengguna saat wawancara #31 (8 Oktober 2026) · D16 | #33 |

## B. Keputusan produk dan data yang diterima

Keputusan berikut menjawab pertanyaan PRD §79 atau bagian PRD yang ambigu, dan sudah diterapkan di `development` kecuali kolom **Diterapkan di** menyebut lain.

| ID | Keputusan | Menjawab | Diterapkan di |
| --- | --- | --- | --- |
| D06 | Schema registration mengikuti daftar field issue #8. Field PRD §22.2 lainnya belum disimpan (lihat T05). | Q3 (sebagian) | #17 |
| D07 | Periode organisasi memakai nama bebas (mis. `2026/2027`) dengan `start_date` dan `end_date`. Maksimal satu periode `ACTIVE`, ditegakkan unique index. | Q8, §30 | #16 |
| D08 | Boleh ada beberapa akun admin dengan hak yang sama; tidak ada multi-role. Akun dibuat lewat script provisioning operator. | Q14, §5 | #7 |
| D09 | `members.nim` dan `members.email` unik: satu orang, satu record member, termasuk setelah menjadi alumni. | §66 | #17 |
| D10 | Registration tidak menerima upload CV. Portofolio berupa `portfolio_url`. | Q15 | #17 |
| D11 | Design system resmi adalah `design.md` dengan token di `app/globals.css`. | Q19 | AGENTS.md |
| D12 | Satu registration menghasilkan paling banyak satu member, dan hanya registration berstatus `ACCEPTED` yang boleh dikonversi. Ditegakkan di database (check constraint + trigger). | §24, §60 butir 6–7 | #17 |
| D13 | Admin hanya membaca tabel organisasi dan membership secara langsung. Mutasi dilakukan lewat fungsi SQL yang memeriksa sesi admin dan menulis audit dalam satu transaksi. | §60 butir 15, §67 | #16, #17 |
| D14 | Histori keanggotaan tidak pernah dihapus otomatis: FK `membership_histories` memakai `on delete restrict`; member memakai soft delete (`deleted_at`). | §29, §40 | #16, #17 |
| D15 | Competition hanya berisi informasi lomba, bukan tracking tim. Tracking tim tetap future enhancement. | Q9 | PRD §77 |
| D16 | `development` adalah branch integrasi; `main` adalah branch rilis. Detail di [workflow pengembangan](DEVELOPMENT_WORKFLOW.md). | — | Sejak 4 Oktober 2026 |
| D17 | Visibilitas konten publik memakai `content_status` (`DRAFT/PUBLISHED/ARCHIVED`, default `DRAFT`), terpisah dari lifecycle. `competitions`, `achievements`, dan `projects` memakai kolom `publication_status`; lifecycle tetap kolom `status` (`competition_status`, `project_status`). `achievements.published` tidak dipakai. Lifecycle `ARCHIVED` pada project berarti proyek tidak lagi dikelola dan tetap tampil bila `PUBLISHED`. Lifecycle dihitung dari tanggal belum diputuskan (T06). | §17–19, §60 butir 12 (dari U06) | #20 |
| D18 | `achievement_members` dan `project_members` memakai `member_id` nullable (FK ke `members`, `on delete restrict`) dan `member_name` nullable untuk peserta non-member; minimal salah satu terisi, satu member sekali per induk. Nama member tertaut tampil publik hanya lewat proyeksi D02. | §18, §19, Q10, Q11 (dari U07) | #20 |
| D19 | Visi & Misi punya halaman sendiri `/vision-mission`. Navbar menautkan ke route ini, bukan `/about#visi-misi`. | Spesifikasi §6 (dari U10) | #18 (`config/public-navigation.ts`) |
| D20 | `competitions.level` dan `achievements.level` (nullable) memakai enum `public.content_level` = `INTERNAL`, `REGIONAL`, `NASIONAL`, `INTERNASIONAL`. Label tampilan dipetakan di frontend. Setelah migration diterapkan ke hosted, perubahan nilai butuh migration baru. | Kontrak awal #11, review PR #20 M2 (dari U17) | #36 (`20261004080000_content_foundation.sql`); pemetaan label FE di #26 |
| D21 | `certificate_file` disimpan di `achievement_certificates` yang hanya terbaca admin aktif. `member_id` pada konten `PUBLISHED` tetap terbaca `authenticated` non-admin sebagai risiko yang diterima sementara (UUID tanpa data pribadi; signup publik mati, D08) dan ditutup lewat RPC/view admin saat mutasi admin konten dibangun. `anon` tidak bisa membaca `member_id`. | Review PR #20 M4 (dari U18) | #36 |
| D22 | *Achievers Guidebook* 2026 (Main Rules Batch 3.5) adalah sumber resmi konten organisasi: identitas, visi, misi, culture & value, struktur, departemen, program, dan ketentuan keanggotaan. Ringkasannya ada di PRD §9.1, §12.1, §13, §14, §21A, dan §31. Konten lain (sejarah selain tahun berdiri 2024, tonggak, statistik) tidak boleh dikarang sampai ada data resmi. Aturan internal guidebook tidak dipublikasikan. | Guidebook diserahkan pengguna, 25 Oktober 2026 | Dokumen (PRD v1.2, spesifikasi). Mock data dan konten halaman publik belum diselaraskan. |

## C. Usulan yang menunggu keputusan PM

Diurutkan dari yang paling menghambat Sprint 2. Kolom **Menghambat** menunjukkan issue yang tidak bisa diselesaikan dengan benar sebelum usulan diputuskan.

| ID | Topik | Rekomendasi | Menghambat |
| --- | --- | --- | --- |
| U01 | Pengurus inti tanpa departemen | `membership_histories.department_id` dibuat nullable | #25, #29 |
| U02 | Akses publik data organisasi | View/RPC publik berproyeksi field | #24, #25 |
| U03 | Route pendaftaran | `/join` kanonis, `/register` redirect | #24, #28 |
| U04 | Sumber status pendaftaran dibuka | Tabel periode pendaftaran | #28 |
| U05 | Field Programs | Tambah kolom yang dipakai halaman | #25, #27, #30 |
| U08 | Level posisi | `positions.level` jadi enum | #25 |
| U09 | Route berita dan route template | `/news` kanonis, route template dihapus | #24 |
| U11 | Default `public_profile` | `false` (opt-in) | Go-live |
| U12 | Halaman `/members` dan `/alumni` | Tidak masuk MVP | #24 |
| U13 | Form kontak | Tautan kontak resmi, tanpa penyimpanan | #24 |
| U14 | Galeri | Album wajib dengan slug | Sprint berikut |
| U15 | Homepage | Urutan tetap sesuai spesifikasi | Sprint berikut |
| U16 | Bahasa | Bahasa Indonesia untuk MVP | Semua frontend |
| U19 | Aturan duplikat registration sementara | Satu registration aktif per NIM tanpa entitas periode | #28 (diterapkan), U04 |
| U20 | Persetujuan data pendaftar | Simpan `consent_at`; gender/semester/minat tidak disimpan | #28 (diterapkan), T05 |
| U21 | Landing page `/join` | Issue frontend untuk Why Join, Benefits, Departments, Requirements, Process, Dates, FAQ | Recruitment (spesifikasi Page 15) |
| U22 | Field schema untuk halaman Prestasi dan Project | Migration additive: `achievements.project_id`, kategori, `achievements.featured`, dan field detail project | #5 (kategori, documentation, detail project) |

### U01 — Pengurus inti tanpa departemen

- **Masalah:** President, Treasurer, dan Secretary (core team) tidak berada di departemen, tetapi `membership_histories.department_id` bersifat `not null`. Struktur resmi tidak punya posisi Wakil Ketua.
- **Bukti:** PRD §13 (struktur resmi dari guidebook: core team di atas lima departemen) dan US-ORG-02 ("department dipilih jika applicable") · `20260922110000_organization_foundation.sql`.
- **Rekomendasi:** Migration baru yang membuat `department_id` nullable. Validasi di RPC penempatan: posisi level inti boleh tanpa departemen, posisi lain wajib.
- **Owner:** Andi (#29).

### U02 — Akses publik data organisasi

- **Masalah:** Role `anon` tidak punya akses ke `departments`, `positions`, `organization_periods`, maupun struktur organisasi, sehingga halaman publik tidak bisa memakai data nyata.
- **Bukti:** PRD §13, §14, §32 · grants dan policy di migration organization (hanya admin aktif).
- **Rekomendasi:** View atau RPC publik yang hanya mengeluarkan field yang disetujui: departemen aktif, posisi, periode `ACTIVE`/`ENDED`, dan struktur periode dengan data member lewat proyeksi D02.
- **Owner:** Jordan (#31) untuk RLS dan grants; Andi untuk query domain.

### U03 — Route pendaftaran

- **Masalah:** PRD §63 memakai `/register`, spesifikasi memakai `/join`; di kode navbar menuju `/register` sementara footer, halaman departemen, dan halaman program menuju `/join` (404).
- **Rekomendasi:** `/join` menjadi route kanonis karena dipakai spesifikasi dan label "Join UVICS". `/register` diarahkan permanen ke `/join`.

### U04 — Sumber status "pendaftaran dibuka"

- **Masalah:** PRD §22.1 meminta judul, deskripsi, periode, dan pengumuman pendaftaran, sementara §36 hanya menyediakan flag `registration_open`. Aturan "unik per periode pendaftaran" (§22.3) tidak bisa ditegakkan tanpa entitas periode.
- **Rekomendasi:** Tabel periode pendaftaran (judul, deskripsi, tanggal buka/tutup, pengumuman) dan kolom periode di `registrations` dengan keunikan per periode + NIM. Flag `registration_open` diturunkan dari periode aktif. Menjawab Q4.
- **Owner:** Jordan (#28) dan Andi.

### U05 — Field Programs

- **Masalah:** Programs ada di IA dan spesifikasi (§11 halaman Programs), tabel `programs` sudah ada, tetapi PRD tidak punya modulnya. Spesifikasi meminta kategori, ikon, dan relasi departemen yang tidak ada di tabel.
- **Rekomendasi:** PRD v1.1 mendokumentasikan tabel yang ada (§21A). Tambahan kolom diputuskan berdasarkan elemen yang benar-benar dirender halaman #25, lalu dibuat lewat migration baru. Guidebook 2026 menetapkan pengelola tiap program per departemen (PRD §21A), jadi relasi program–departemen adalah kandidat kolom pertama.
- **Owner:** Jofan (#30).

### U08 — Level posisi

- **Masalah:** `positions.level` berupa teks bebas, sementara spesifikasi membedakan pengurus inti, koordinator, dan anggota.
- **Bukti:** Guidebook 2026 memakai hierarki Advisor → President → core team (Treasurer, Secretary) → Steering Helper → Koordinator → PIC → Anggota (PRD §31).
- **Rekomendasi:** Nilai tetap dengan check constraint yang mengikuti hierarki itu, mis. `ADVISOR`, `CORE`, `STEERING_HELPER`, `COORDINATOR`, `PIC`, `MEMBER`; urutan tampilan memakai `display_order`.

### U09 — Route berita dan route template

- **Masalah:** PRD dan spesifikasi memakai `/news`, kode memakai `/blog`. Ada route sisa template yang tidak ada di dokumen: `/pricing`, `/batch`, `/forgot-password`.
- **Rekomendasi:** `/news` dan `/news/{slug}` kanonis; `/blog` diarahkan ke `/news`. `/pricing` dan `/forgot-password` dihapus (reset password lewat email di luar cakupan, lihat TECH_STACK). Nasib `/batch` diputuskan PM.

### U11 — Default `public_profile`

- **Masalah:** `members.public_profile` default `true` (opt-out), padahal Q20 menanyakan opt-in dan D02 menyatakan flag ini bukan persetujuan.
- **Rekomendasi:** Migration baru dengan default `false` sebelum data member nyata masuk.

### U12 — Halaman `/members` dan `/alumni`

- **Masalah:** Navbar memuat Member dan Alumni, tetapi Q1/Q2 belum dijawab dan D02 menutup akses publik.
- **Rekomendasi:** Tidak masuk MVP. Sembunyikan dari navbar; struktur pengurus tetap tampil di halaman organisasi lewat U02.

### U13 — Form kontak

- **Masalah:** `app/api/contact` membalas `OK` tanpa menyimpan atau mengirim apa pun, sehingga pesan pengunjung hilang. Q17 belum dijawab.
- **Rekomendasi:** MVP menampilkan email, WhatsApp, dan media sosial resmi dari `website_settings`, tanpa form. Route stub dihapus. Penyimpanan pesan menjadi future enhancement.

### U14 — Galeri

- **Rekomendasi:** Album wajib dan punya slug, mengikuti spesifikasi (`/gallery/{slug}`). PRD §20 menyebut album opsional.

### U15 — Homepage

- **Rekomendasi:** Urutan section tetap mengikuti spesifikasi §4 untuk MVP (menjawab Q12). Konten diambil dari flag `featured` dan data terbaru; hero lewat `website_settings`; statistik dihitung dari query.

### U16 — Bahasa

- **Rekomendasi:** MVP hanya Bahasa Indonesia (menjawab Q13). Teks UI tetap dikumpulkan di config atau konstanta agar siap diterjemahkan, sesuai aturan AGENTS.md.

### U19 — Aturan duplikat registration sementara

- **Masalah:** PRD §22.3 meminta registration unik per periode pendaftaran, tetapi entitas periode (U04) belum diputuskan, sementara #28 harus mencegah duplikat sekarang.
- **Rekomendasi:** unique index parsial `registrations_one_active_per_nim`: satu registration aktif per NIM, dengan aktif = `SUBMITTED`, `UNDER_REVIEW`, atau `ACCEPTED` yang belum dikonversi. Pendaftar `REJECTED` boleh mendaftar ulang. NIM yang sudah ada di `members` ditolak dengan respons yang sama dengan duplikat agar status keanggotaan tidak terungkap (D02).
- **Dampak:** ditegakkan database (aman terhadap request bersamaan). Bila U04 diterima, index diganti dengan keunikan `(periode, nim)` lewat migration lanjutan tanpa memindahkan data.
- **Menunggu:** konfirmasi PM. Sudah diterapkan di #28 atas keputusan PIC.

### U20 — Persetujuan data pendaftar

- **Masalah:** PRD §22.2 meminta persetujuan penggunaan data dan konfirmasi kebenaran data; T05 belum memutuskan field tambahan.
- **Rekomendasi:** kedua persetujuan wajib di server dan dicatat sebagai `registrations.consent_at` (waktu database). Gender, semester, dan minat tidak disimpan sampai ada pemakainya.
- **Dampak:** `consent_at` nullable karena baris lama tidak punya persetujuan; `submit_registration` (satu-satunya jalur insert) selalu mengisinya. Menjawab sebagian T05.
- **Menunggu:** konfirmasi PM. Sudah diterapkan di #28 atas keputusan PIC.

### U21 — Landing page `/join`

- **Masalah:** spesifikasi publik Page 15 menempatkan form pendaftaran di dalam landing page rekrutmen (Why Join, Benefits, Departments, Requirements, Recruitment Process, Important Dates, FAQ). Tidak ada issue frontend Sprint 2 (#24–#27) yang mencakupnya.
- **Rekomendasi:** buat issue frontend terpisah untuk bagian landing. #28 hanya menyediakan form fungsional minimal dan state tertutup/berhasil agar MVP §74 butir 10 terpenuhi.
- **Dampak:** `/join` saat ini berisi judul, deskripsi singkat, dan form atau pesan tertutup.
- **Menunggu:** keputusan PM untuk membuat issue.

### U22 — Field schema untuk halaman Prestasi dan Project

- **Masalah:** halaman publik Prestasi dan Project membutuhkan data yang belum ada di tabel `achievements` dan `projects`: relasi prestasi ke project (`achievements.project_id`), kategori untuk keduanya, `achievements.featured`, dan field detail project (latar belakang/masalah, solusi, teknologi/tools, galeri, `figma_url`, `documentation_url`).
- **Bukti:**
  - Spesifikasi §13 (Page 10): filter kategori, Featured Achievements, Related Project, Documentation. Spesifikasi §14 (Page 11): kartu memuat kategori; detail memuat Problem/Background, Solution, Technology/Tools, Gallery, dan tautan Live Demo, GitHub, Figma, Documentation.
  - Issue #5: mock relasi Achievement ↔ Project dan tautan project (Live Demo, GitHub, Figma, Documentation, External URL).
  - `20261004080000_content_foundation.sql` (#36): `achievements` tidak punya `project_id`, kategori, maupun `featured`. `projects` punya `featured`, `project_url`, dan `repository_url`, tetapi tidak punya kategori, field detail, `figma_url`, maupun `documentation_url`. Hanya `competitions` yang punya `category`.
- **Rekomendasi:** satu migration additive baru (migration #36 tidak diedit):
  - `achievements.project_id` (FK ke `projects`, `on delete set null`, diberi index) dan `achievements.featured boolean not null default false`. Grant kolom `anon` pada `achievements` ditambah secara eksplisit, dan relasi ke project non-`PUBLISHED` tidak boleh terlihat publik.
  - Kategori `text` nullable dengan batas 120 karakter pada `achievements` dan `projects`, mengikuti `competitions.category`. PM menetapkan daftar kategori awal untuk filter.
  - Project: `problem`, `solution`, `technologies`, `figma_url`, dan `documentation_url` (nullable, URL berpola `^https?://` seperti `project_url`). Section yang kosong disembunyikan. Galeri memakai tabel anak berisi referensi media, bentuk final mengikuti alur upload #28/#29.
  - Setelah diterima: nomor `D` baru, `types/database.ts` diperbarui, dan tes `tests/db` mencakup RLS untuk admin aktif, `authenticated` non-admin, dan `anon`.
- **Owner:** PM memutuskan; owner backend konten (owner baru, lihat BACKEND_CONVENTIONS) mengerjakan migration dan tes DB.
- **Dampak:** sampai diputuskan, frontend hanya menyimpan `projectId` di mock (`Achievement.projectId`) dan tidak membangun filter kategori, penanda featured prestasi (sementara yang disorot adalah prestasi terbaru), section Documentation, maupun section detail project (masalah, solusi, teknologi, galeri, Figma). Mock project tidak memuat tautan karena tautan contoh sebelumnya karangan: repositori dan subdomain `*.uvics.org` yang dirujuk belum tentu ada; detail project menampilkan "Belum ada tautan untuk project ini."
- **Menunggu:** keputusan PM.

## D. Isu terbuka

| ID | Pertanyaan | Asal | Catatan |
| --- | --- | --- | --- |
| T01 | Apakah hasil interview applicant disimpan? | Q5 | Saat ini hanya `admin_notes`. |
| T02 | Bolehkah satu member punya lebih dari satu departemen atau posisi dalam periode yang sama? | Q6, Q7 | Belum ada constraint unik di `membership_histories`. |
| T03 | Apakah alumni punya field pekerjaan/perusahaan saat ini? | Q16, §28 | Kolom belum ada di `members`. |
| T04 | Apakah diperlukan newsletter? | Q18 | Tidak ada di cakupan MVP. |
| T05 | Field registration tambahan PRD §22.2 (gender, semester, interest, persetujuan data) disimpan atau tidak? | Q3 | Perlu diputuskan sebelum #28. |
| T06 | Apakah lifecycle competition dan event dihitung dari tanggal, dan kapan admin boleh menimpanya? | Sisa U06 | Saat ini lifecycle disimpan dan diisi admin. |
| T07 | Apa status **Internal Development** (KABEL, Bonding, Champion of Change) dan **Officer** (UVICS Impact, UVICS Vibes, Perlombaan)? Keduanya ada di halaman "Departemen & Program" guidebook, tetapi bagan struktur hanya memuat Public Relations, External Affairs, Web Development, Competition Handler, dan Editor. Apa program dan deskripsi External Affairs? Apakah Advisor ditampilkan di halaman publik? | Achievers Guidebook 2026 (D22) | Sampai diputuskan, halaman publik hanya menampilkan lima departemen di bagan dan tidak menampilkan Advisor. |
| T08 | Apakah label Culture & Value ditampilkan dalam bahasa Inggris seperti di guidebook atau diterjemahkan (U16)? Ejaan "Transparant" dan "Willing to Learned" dikoreksi menjadi "Transparent" dan "Willing to Learn" di PRD §12.1; apakah koreksi ini disetujui? | Achievers Guidebook 2026 (D22) | PRD memakai ejaan terkoreksi. |
