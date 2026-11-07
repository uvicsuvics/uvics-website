# Catatan Keputusan UVICS

**Diperbarui:** 8 November 2026
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

D24 sampai D40 berasal dari usulan U01 sampai U22 dan diputuskan PM (Dion) pada 8 November 2026 di #32 (S2-PM-01 K6). D41 sampai D44 berasal dari rencana #52, #53, dan #27 yang diputuskan PM pada hari yang sama. Kolom **Diterapkan di** yang diawali "Belum" menyebut issue yang mengerjakannya.

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
| D22 | *Achievers Guidebook* 2026 (Main Rules Batch 3.5) adalah sumber resmi konten organisasi: identitas, visi, misi, culture & value, struktur, departemen, program, dan ketentuan keanggotaan. Ringkasannya ada di PRD §9.1, §12.1, §13, §14, §21A, dan §31. Konten lain (sejarah selain tahun berdiri 2024, tonggak, statistik) tidak boleh dikarang sampai ada data resmi. Aturan internal guidebook tidak dipublikasikan. | Guidebook diserahkan pengguna, 25 Oktober 2026 | Dokumen (PRD v1.2, spesifikasi) dan #62 (mock data serta halaman Tentang, Visi & Misi, Program, Departemen, Struktur Organisasi, dan section beranda terkait; daftar program dijaga tes unit). Mock domain lain (statistik, mitra, batch, berita, event) belum diselaraskan. |
| D23 | Halaman `/competitions` memakai tata letak linimasa per status (desain "Konsep B"), bukan grid kartu dengan pagination seperti spesifikasi §12. Urutan grup: dibuka, segera dibuka, berlangsung, lalu ditutup dan selesai yang dilipat. Filter di URL: `search`, `status`, `level`, `category`. Tanpa pagination: service mengambil semua kompetisi publik sekali (maksimal 100) lalu mengelompokkan dan mengurutkan menurut tanggal di memori, sampai backend mendukung urutan tanggal. "Deadline terdekat" hanya memilih batas yang belum lewat menurut tanggal WITA. | Spesifikasi §12 (Competition), pilihan PM (Dion) atas tiga konsep desain, 7 November 2026 | #66 (`103a1f9`) |
| D24 | Pengurus inti (President, Treasurer, Secretary) tidak berada di departemen, jadi `membership_histories.department_id` nullable. Struktur resmi tidak punya posisi Wakil Ketua. Aturan "posisi non-inti wajib departemen" ditegakkan di RPC penempatan setelah level posisi baku (D29). | PRD §13, US-ORG-02 (dari U01) | #40 (`20261029174600_registration_review_conversion.sql`); aturan posisi non-inti belum |
| D25 | Pengunjung membaca data organisasi hanya lewat view atau RPC publik berproyeksi field: departemen aktif, posisi, periode `ACTIVE`/`ENDED`, dan struktur periode dengan data member lewat proyeksi D02. Tabel `departments`, `positions`, `organization_periods`, dan `membership_histories` tetap tertutup untuk `anon`. | PRD §13, §14, §32 (dari U02) | Belum: #48 |
| D26 | `/join` adalah route kanonis pendaftaran; `/register` diarahkan permanen ke `/join`. Semua CTA "Join UVICS" menuju `/join`. | PRD §63, spesifikasi Page 15 (dari U03) | `/join` di #41; redirect dan navbar belum: #49 |
| D27 | Untuk MVP, status "pendaftaran dibuka" hanya berasal dari key `registration_open` lewat `read_public_settings()` (D03), diubah admin di Pengaturan Website. Tabel periode pendaftaran (judul, deskripsi, tanggal buka/tutup, pengumuman, keunikan per periode + NIM) ditunda ke modul konfigurasi pendaftaran (PRD Phase 3); sampai itu duplikat dicegah D37. | Q4, PRD §22.1, §36 (dari U04) | #41 (`/join`); toggle admin belum: #27 bersama #30 |
| D28 | `programs` mendapat satu kolom `department_id` (nullable, FK ke `departments`) untuk departemen pengelola program (PRD §21A). Nullable karena T07. Kategori dan ikon tidak ditambah selama halaman tidak merendernya. Migration dibuat terpisah setelah runtime CMS #30 merge; sampai itu halaman publik memakai peta sementara `UVICS_PROGRAM_DEPARTMENTS` dan form admin hanya memuat kolom yang ada (D44). | Spesifikasi §11 (dari U05) | Belum: migration setelah #30 |
| D29 | `positions.level` memakai nilai tetap `ADVISOR`, `CORE`, `STEERING_HELPER`, `COORDINATOR`, `PIC`, `MEMBER` dengan check constraint, mengikuti hierarki guidebook (PRD §31). Urutan tampilan memakai `display_order`. | PRD §31 (dari U08) | Belum: migration organisasi, sebelum #48 |
| D30 | `/news` dan `/news/{slug}` kanonis; `/blog` dan `/blog/{slug}` diarahkan permanen ke `/news`. `/pricing` dan `/forgot-password` dihapus (reset password di luar cakupan, TECH_STACK). `/batch` disembunyikan dari navigasi sampai ada data resmi (D22). | Spesifikasi §15 dan IA berita (dari U09) | Belum: redirect `/blog` di #52; `/pricing`, `/forgot-password`, `/batch` di #49 |
| D31 | `members.public_profile` default `false` (opt-in), lewat migration baru sebelum data member nyata masuk. Flag ini tetap bukan bukti persetujuan (D02). | Q20 (dari U11) | Belum: migration membership (Sprint 3) |
| D32 | `/members` dan `/alumni` tidak masuk MVP dan disembunyikan dari navbar. Struktur pengurus tampil di halaman organisasi lewat D25. | Q1, Q2 (dari U12) | Belum: #49 |
| D33 | MVP tanpa form kontak: email, WhatsApp, dan media sosial resmi ditampilkan dari `website_settings`. Route stub `app/api/contact` dihapus. Penyimpanan pesan menjadi future enhancement. | Q17 (dari U13) | Belum: #49 |
| D34 | Galeri memakai album wajib dengan slug (`/gallery/{slug}`), mengikuti spesifikasi. | PRD §20 (dari U14) | Belum: modul galeri |
| D35 | Urutan section beranda mengikuti spesifikasi §4 untuk MVP. Konten diambil dari flag `featured` dan data terbaru; hero lewat `website_settings`; statistik dihitung dari query. | Q12 (dari U15) | Belum: urutan di #60 (#50), data di #51 |
| D36 | MVP hanya Bahasa Indonesia; teks UI dikumpulkan di config atau konstanta agar siap diterjemahkan (AGENTS.md). Label Culture & Value tetap berbahasa Inggris seperti guidebook dengan ejaan terkoreksi "Transparent" dan "Willing to Learn" (PRD §12.1). | Q13 (dari U16), T08 | Semua frontend; label Culture & Value di #62 |
| D37 | Duplikat registration dicegah index parsial `registrations_one_active_per_nim`: satu registration aktif per NIM, aktif = `SUBMITTED`, `UNDER_REVIEW`, atau `ACCEPTED` yang belum dikonversi. Pendaftar `REJECTED` boleh mendaftar ulang. NIM yang sudah ada di `members` ditolak dengan respons yang sama dengan duplikat (D02). Bila periode pendaftaran dibangun (D27), index diganti keunikan `(periode, nim)` lewat migration lanjutan. | PRD §22.3 (dari U19) | #41 (`20261011100000_public_registration_submission.sql`) |
| D38 | Persetujuan penggunaan data dan kebenaran data wajib di server dan dicatat sebagai `registrations.consent_at` (waktu database; nullable untuk baris lama). Gender, semester, dan minat tidak disimpan sampai ada pemakainya. | PRD §22.2, T05 (dari U20) | #41 |
| D39 | `/join` menjadi landing page rekrutmen (Why Join, Benefits, Departments, Requirements, Recruitment Process, Important Dates, FAQ) lewat issue frontend terpisah. Sampai itu `/join` berisi judul, deskripsi singkat, dan form atau pesan tertutup. | Spesifikasi Page 15, PRD §74 butir 10 (dari U21) | Belum: issue Sprint 3 |
| D40 | Migration additive menambah `achievements.project_id` (FK ke `projects`, `on delete set null`, ber-index; relasi ke project non-`PUBLISHED` tidak terlihat publik), `achievements.featured boolean not null default false`, dan `category` text nullable (maksimal 120 karakter) di `achievements` dan `projects`, dengan grant kolom `anon` eksplisit dan tes RLS tiga peran. Daftar kategori awal ditetapkan PM saat migration dibuat. Sisa usulan U22 menjadi T09. | Spesifikasi §13, §14, issue #5 (dari U22, sebagian) | Belum: owner backend konten (Sprint 3) |
| D41 | Event dan berita. DTO `PublicEvent`: `id`, `slug`, `title`, `description`, `location`, `startAt`, `endAt`, `registrationUrl`, `poster`, `status` (`UPCOMING`, `ONGOING`, `FINISHED`, `CANCELLED`), `featured`; `location`, `endAt`, `registrationUrl`, `poster` nullable; waktu ISO 8601 ber-offset, ditampilkan WITA. DTO `NewsArticle`: `id`, `slug`, `title`, `excerpt`, `content` (teks polos sampai ada renderer CMS berita), `thumbnail`, `category`, `author` (teks), `publishedAt` (`YYYY-MM-DD` WITA); `thumbnail`, `category`, `author` nullable, dan tabel `posts` perlu kolom `category` dan `author`. `/events` dibagi Mendatang (`UPCOMING`, `ONGOING`, tanpa pagination) dan Lampau (`FINISHED`, `CANCELLED`, 9 per halaman) menurut `status` tersimpan sampai T06. `/news` menampilkan artikel terbaru sebagai featured di halaman 1, lalu grid 9 per halaman dengan `?search=`. Mock berisi contoh berjudul "Contoh:" (D22). Desain: konsep A untuk event, konsep B untuk berita. | PRD §15, §16, §41, §46 · spesifikasi §15 · pilihan PM atas #52 K2 sampai K4 | Belum: #52 (berjalan) |
| D42 | KPI dashboard admin dihitung langsung dari tabel lewat sesi admin (RLS, D13), tanpa RPC agregat. Anggota aktif = `members.status = ACTIVE` dan `deleted_at is null`; alumni = `ALUMNI` dan `deleted_at is null`; pendaftaran menunggu = `SUBMITTED` atau `UNDER_REVIEW`; kompetisi dibuka = `status = OPEN` dan `publication_status = PUBLISHED` (sama dengan D23, ikut T06). KPI dan widget yang tabelnya belum ada (event, berita) menampilkan "Belum tersedia", bukan 0. Pendaftaran Terbaru (nama, status, tanggal; tanpa NIM, email, telepon) dan Prestasi Terbaru membaca data nyata. Aktivitas terbaru dari `audit_logs`, termasuk `ADMIN_LOGIN`, hanya menampilkan aksi, jenis entitas, waktu WITA, dan nama admin; `old_values`/`new_values` tidak dibaca di UI. | PRD dashboard summary · pilihan PM atas #53 K1 sampai K4 | Belum: #53 (PR menyusul) |
| D43 | Modul admin CRUD memakai tabel ringkas dengan form di route terpisah (`/admin/<modul>/new`, `/admin/<modul>/[id]`), desain konsep A, dan pola ini dipakai modul admin berikutnya (berita, event, dan seterusnya). Listing CMS punya filter status dan pencarian judul/slug di URL yang disaring di memori sampai backend menyediakannya (maksimal 100 baris, tanpa pagination). | Pilihan PM atas #27 K6, K8 | Belum: #27 (berjalan) |
| D44 | Cakupan form CMS admin: form program hanya memuat kolom yang ada (`name`, `slug`, `short_description`, `description`, `display_order`) dengan status lewat aksi terbit/arsip, dan departemen pengelola menyusul D28; `programs.image`, `logo`, dan `favicon` tidak diedit dari admin sampai ada jalur publikasi media CMS; isi halaman disimpan sebagai teks polos tanpa Tiptap sampai renderer publik dan format final diputuskan; Pengaturan Website menampilkan 13 key dalam lima grup (identitas, kontak, media sosial, SEO, pendaftaran), `registration_open` diubah dengan konfirmasi (D27), dan `maintenance_mode` disembunyikan sampai ada konsumen. | Pilihan PM atas #27 K2 sampai K5 | Belum: #27 (berjalan) |

## C. Usulan yang menunggu keputusan PM

Tidak ada usulan terbuka per 8 November 2026. Nomor U tidak dipakai ulang, jadi usulan berikutnya mulai dari U23.

Riwayat nomor usulan. Penanda di kolom pertama menjaga tautan lama ke `DECISIONS.md#u..` tetap mendarat di baris yang benar.

| Usulan | Topik | Menjadi | Diputuskan |
| --- | --- | --- | --- |
| <a name="u01--pengurus-inti-tanpa-departemen"></a>U01 | Pengurus inti tanpa departemen | D24 | 8 November 2026 (#32) |
| <a name="u02--akses-publik-data-organisasi"></a>U02 | Akses publik data organisasi | D25 | 8 November 2026 (#32) |
| <a name="u03--route-pendaftaran"></a>U03 | Route pendaftaran | D26 | 8 November 2026 (#32) |
| <a name="u04--sumber-status-pendaftaran-dibuka"></a>U04 | Sumber status "pendaftaran dibuka" | D27 | 8 November 2026 (#32) |
| <a name="u05--field-programs"></a>U05 | Field Programs | D28 | 8 November 2026 (#32) |
| U06 | Status publikasi konten | D17 | Sprint 1 (#20) |
| U07 | Peserta prestasi dan project | D18 | Sprint 1 (#20) |
| <a name="u08--level-posisi"></a>U08 | Level posisi | D29 | 8 November 2026 (#32) |
| <a name="u09--route-berita-dan-route-template"></a>U09 | Route berita dan route template | D30 | 8 November 2026 (#32, #52) |
| <a name="u10--halaman-visi--misi"></a>U10 | Halaman Visi & Misi | D19 | 21 Oktober 2026 (#12) |
| <a name="u11--default-public_profile"></a>U11 | Default `public_profile` | D31 | 8 November 2026 (#32) |
| <a name="u12--halaman-members-dan-alumni"></a>U12 | Halaman `/members` dan `/alumni` | D32 | 8 November 2026 (#32) |
| <a name="u13--form-kontak"></a>U13 | Form kontak | D33 | 8 November 2026 (#32) |
| <a name="u14--galeri"></a>U14 | Galeri | D34 | 8 November 2026 (#32) |
| <a name="u15--homepage"></a>U15 | Homepage | D35 | 8 November 2026 (#32) |
| <a name="u16--bahasa"></a>U16 | Bahasa | D36 | 8 November 2026 (#32) |
| <a name="u17--nilai-baku-level"></a>U17 | Nilai baku level konten | D20 | 21 Oktober 2026 (#12) |
| <a name="u18--data-privat-konten-untuk-authenticated-non-admin"></a>U18 | Data privat konten untuk `authenticated` non-admin | D21 | 21 Oktober 2026 (#12) |
| <a name="u19--aturan-duplikat-registration-sementara"></a>U19 | Aturan duplikat registration sementara | D37 | 8 November 2026 (#32) |
| <a name="u20--persetujuan-data-pendaftar"></a>U20 | Persetujuan data pendaftar | D38 | 8 November 2026 (#32) |
| <a name="u21--landing-page-join"></a>U21 | Landing page `/join` | D39 | 8 November 2026 (#32) |
| <a name="u22--field-schema-untuk-halaman-prestasi-dan-project"></a>U22 | Field schema untuk halaman Prestasi dan Project | D40, sisanya T09 | 8 November 2026 (#32) |

## D. Isu terbuka

| ID | Pertanyaan | Asal | Catatan |
| --- | --- | --- | --- |
| T01 | Apakah hasil interview applicant disimpan? | Q5 | Saat ini hanya `admin_notes`. |
| T02 | Bolehkah satu member punya lebih dari satu departemen atau posisi dalam periode yang sama? | Q6, Q7 | Belum ada constraint unik di `membership_histories`. |
| T03 | Apakah alumni punya field pekerjaan/perusahaan saat ini? | Q16, §28 | Kolom belum ada di `members`. |
| T04 | Apakah diperlukan newsletter? | Q18 | Tidak ada di cakupan MVP. |
| T06 | Apakah lifecycle competition dan event dihitung dari tanggal, dan kapan admin boleh menimpanya? | Sisa U06 | Saat ini lifecycle disimpan dan diisi admin. |
| T07 | Apa status **Internal Development** (KABEL, Bonding, Champion of Change) dan **Officer** (UVICS Impact, UVICS Vibes, Perlombaan)? Keduanya ada di halaman "Departemen & Program" guidebook, tetapi bagan struktur hanya memuat Public Relations, External Affairs, Web Development, Competition Handler, dan Editor. Apa program dan deskripsi External Affairs? Apakah Advisor ditampilkan di halaman publik? | Achievers Guidebook 2026 (D22) | Sampai diputuskan, halaman publik hanya menampilkan lima departemen di bagan dan tidak menampilkan Advisor. |
| T09 | Sisa U22 untuk halaman Prestasi dan Project: field detail project (`problem`, `solution`, `technologies`, `figma_url`, `documentation_url`, galeri berupa tabel anak berisi referensi media), sumber section Documentation di detail prestasi, statistik "Anggota Terlibat" (agregat count-only untuk `anon` atau dihapus), dan `id` partisipasi di proyeksi publik `achievement_members`/`project_members`. | U22 (D40) | Ditunda sampai ada konten project nyata. Sampai diputuskan, frontend tidak membangun section tersebut. |
