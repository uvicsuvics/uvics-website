# Product Requirements Document (PRD)
# UVICS Website Platform

**Document Version:** 1.1  
**Status:** Draft for Development  
**Product:** UVICS Website Platform  
**Document Type:** Product Requirements Document  
**Primary Users:** Public Visitor, Applicant, Admin  
**Prepared For:** UVICS Development Team  

**Keputusan teknis:** Stack implementasi telah disepakati pada 22 September 2026 dalam [TECH_STACK.md](TECH_STACK.md), termasuk full-stack Next.js, Supabase, Cloudinary, dan shadcn/ui. Status draft serta open questions bisnis dalam PRD ini tetap berlaku.

**Keputusan produk:** Jawaban open questions (§79) dan penyelesaian bagian yang ambigu dicatat di [DECISIONS.md](DECISIONS.md). Keputusan berstatus *Diterima* di sana berlaku sampai PRD diperbarui. Penanda **Catatan v1.1** di dokumen ini menunjuk bagian yang masih menunggu keputusan.

### Riwayat Perubahan

| Versi | Tanggal | Perubahan |
| --- | --- | --- |
| 1.1 | 10 Oktober 2026 | Menyelaraskan istilah autentikasi, keamanan, dan error dengan TECH_STACK (§8, §45.1, §48, §54); menambah modul Programs (§21A) sesuai tabel yang sudah dibuat; menandai bagian yang bertentangan dengan spesifikasi atau implementasi; mengubah §79 menjadi tabel status; memperbarui struktur dokumentasi (§81). |
| 1.0 | — | Draft awal. |

---

## 1. Executive Summary

UVICS Website Platform adalah sistem berbasis web yang berfungsi sebagai pusat informasi resmi UVICS sekaligus platform administrasi organisasi.

Sistem tidak hanya berfungsi sebagai website organisasi/public profile, tetapi juga menyediakan dashboard admin yang digunakan untuk mengelola seluruh konten website, pendaftaran calon anggota, data anggota aktif, alumni, struktur organisasi, program, kegiatan, kompetisi, proyek, prestasi, galeri, serta informasi organisasi lainnya.

Untuk menjaga implementasi tetap sederhana dan sesuai kebutuhan saat ini, hanya **Admin** yang memiliki akun dan akses autentikasi ke dashboard. Visitor, applicant, member aktif, dan alumni tidak memiliki dashboard atau role autentikasi khusus.

Applicant, member aktif, inactive member, rejected applicant, dan alumni merupakan **status data keanggotaan**, bukan role user aplikasi.

---

# 2. Product Vision

Membangun satu platform resmi UVICS yang:

1. Menjadi sumber informasi publik utama mengenai UVICS.
2. Memudahkan administrator memperbarui isi website tanpa harus mengubah source code.
3. Memusatkan data pendaftaran anggota.
4. Memudahkan pengelolaan member aktif dan alumni.
5. Menyimpan histori struktur organisasi dan keanggotaan setiap periode.
6. Mendokumentasikan kegiatan, kompetisi, proyek, dan prestasi UVICS secara terstruktur.
7. Mengurangi penggunaan data organisasi yang tersebar pada spreadsheet, chat, atau dokumen terpisah.
8. Menjadi fondasi digital UVICS yang dapat dikembangkan lebih lanjut pada masa mendatang.

---

# 3. Problem Statement

## 3.1 Pengelolaan Konten

Tanpa Content Management System, perubahan informasi seperti berita, kegiatan, prestasi, kompetisi, proyek, struktur organisasi, galeri, dan informasi kontak harus dilakukan melalui perubahan source code. Hal ini membuat pembaruan website bergantung kepada developer.

## 3.2 Data Keanggotaan

Data applicant, anggota aktif, dan alumni dapat tersebar pada Google Forms, spreadsheet, chat, file dokumentasi, atau database manual. Akibatnya, administrator sulit mendapatkan satu sumber data yang konsisten.

## 3.3 Histori Organisasi

Perubahan pengurus setiap periode dapat menyebabkan histori organisasi sulit ditelusuri apabila struktur hanya ditampilkan secara statis.

## 3.4 Dokumentasi Prestasi dan Aktivitas

Prestasi, kegiatan, project, dan kompetisi UVICS perlu disimpan sebagai structured data agar dapat dicari, ditampilkan, dan dikelola secara konsisten.

---

# 4. Product Goals

## 4.1 Primary Goals

Sistem harus mampu:

- menyediakan website publik UVICS;
- menyediakan dashboard admin;
- menyediakan CMS untuk seluruh konten utama website;
- menerima pendaftaran calon anggota;
- menyediakan proses review pendaftaran;
- mengelola data anggota aktif;
- mengelola alumni;
- mengelola periode organisasi;
- mengelola departemen dan posisi organisasi;
- mempertahankan histori keanggotaan;
- mendokumentasikan achievement, event, competition, dan project;
- menyediakan audit terhadap aktivitas penting administrator.

## 4.2 Secondary Goals

Sistem sebaiknya:

- mudah digunakan oleh admin non-teknis;
- responsive pada mobile, tablet, dan desktop;
- memiliki struktur database yang scalable;
- mudah dikembangkan di masa mendatang;
- memiliki keamanan yang memadai;
- memiliki performa website publik yang baik;
- mendukung SEO dasar.

---

# 5. Non-Goals

Untuk versi awal, fitur berikut tidak menjadi prioritas:

- dashboard khusus member;
- akun login untuk applicant;
- akun login untuk alumni;
- sistem pembayaran;
- forum komunitas;
- private messaging;
- chat internal;
- attendance management;
- payroll;
- kompleksitas multi-role administrator;
- advanced workflow engine;
- mobile application native;
- AI recommendation system.

Fitur-fitur tersebut dapat dipertimbangkan pada versi mendatang apabila diperlukan.

---

# 6. Product Scope

UVICS Website Platform terdiri atas empat domain utama.

```text
UVICS WEBSITE PLATFORM

1. PUBLIC WEBSITE
   └── Website informasi publik UVICS

2. CONTENT MANAGEMENT SYSTEM
   └── Admin mengelola seluruh konten website

3. MEMBERSHIP MANAGEMENT
   └── Applicant → Active Member → Alumni

4. ORGANIZATION MANAGEMENT
   └── Period → Department → Position → Member
```

---

# 7. System Actors

## 7.1 Visitor

Visitor adalah pengguna publik yang membuka website UVICS.

Visitor dapat:

- melihat homepage;
- membaca informasi organisasi;
- melihat struktur organisasi;
- melihat department;
- membaca berita;
- melihat event;
- melihat kompetisi;
- melihat achievement;
- melihat project;
- melihat galeri;
- melihat informasi kontak;
- mengisi formulir pendaftaran apabila pendaftaran sedang dibuka.

Visitor tidak memiliki akun.

## 7.2 Applicant

Applicant adalah visitor yang telah mengirimkan formulir pendaftaran member UVICS.

Applicant:

- tidak memiliki dashboard;
- tidak memiliki akun sistem;
- direpresentasikan sebagai data pendaftaran;
- memiliki status proses seleksi.

Possible status:

```text
SUBMITTED
UNDER_REVIEW
ACCEPTED
REJECTED
```

Jika diterima, data applicant dapat dikonversi menjadi member.

## 7.3 Admin

Admin adalah satu-satunya role autentikasi pada sistem.

Admin dapat:

- login;
- logout;
- melihat dashboard;
- mengelola halaman website;
- mengelola berita;
- mengelola event;
- mengelola competition;
- mengelola achievement;
- mengelola project;
- mengelola gallery;
- mengelola partners;
- mengelola pendaftaran member;
- mengelola member aktif;
- mengelola alumni;
- mengelola department;
- mengelola position;
- mengelola organization period;
- mengelola struktur organisasi;
- mengelola website settings;
- melihat audit log.

---

# 8. Authentication Model

Hanya admin yang membutuhkan authentication.

```text
PUBLIC USER
    ↓
No Login Required

ADMIN
    ↓
Login
    ↓
Admin Dashboard
```

Minimum authentication requirement:

- login email dan password melalui Supabase Auth (hashing password dikelola Supabase Auth);
- sesi berbasis cookie SSR (`@supabase/ssr`) dengan masa maksimal satu jam absolut sejak login;
- logout;
- pesan error yang tidak membedakan email salah dan password salah;
- rate limit percobaan login;
- akun admin dibuat lewat provisioning operator; signup publik dinonaktifkan.

Detail teknis ada di [BACKEND_CONVENTIONS.md](BACKEND_CONVENTIONS.md#auth-database-dan-audit).

Optional future enhancement:

- two-factor authentication;
- SSO;
- login activity history.

---

# 9. Membership Concept

Status keanggotaan bukan merupakan role aplikasi.

Recommended membership status:

```text
APPLICANT
ACTIVE
INACTIVE
ALUMNI
REJECTED
```

Namun pada implementasi database, applicant dapat disimpan pada tabel registration terpisah sebelum dikonversi menjadi member.

Recommended lifecycle:

```text
Visitor
   ↓
Registration Submitted
   ↓
Applicant
   ↓
Admin Review
   ├── Rejected
   │
   └── Accepted
          ↓
     Active Member
          ↓
       Inactive
          ↓
        Alumni
```

---

# 10. High-Level Information Architecture

## 10.1 Public Website

```text
Home
About UVICS
Organization
Departments
Programs
News
Events
Competitions
Projects
Achievements
Gallery
Members
Alumni
Partners
Contact
Registration
```

Tidak semua halaman harus muncul sebagai top navigation. Beberapa dapat ditempatkan dalam submenu atau section homepage.

## 10.2 Admin Dashboard

```text
Dashboard

WEBSITE
├── Pages
├── Programs
├── News
├── Events
├── Competitions
├── Achievements
├── Projects
├── Gallery
└── Partners

MEMBERSHIP
├── Registrations
├── Members
├── Alumni
├── Departments
├── Positions
└── Organization Periods

SYSTEM
├── Admin Account
├── Website Settings
└── Audit Logs
```

---

# 11. Public Website Requirements

## 11.1 Homepage

Homepage harus berfungsi sebagai ringkasan utama UVICS.

Possible sections:

1. Hero Section
2. About UVICS
3. Main Programs
4. Departments
5. Latest News
6. Upcoming Events
7. Open Competitions
8. Featured Projects
9. Latest Achievements
10. Organization Statistics
11. Partners
12. CTA Registration
13. Contact / Footer

Admin harus dapat menentukan konten yang tampil melalui CMS.

### Acceptance Criteria

- homepage dapat diakses tanpa login;
- tampil responsive;
- featured content berasal dari database;
- section dapat menampilkan data terbaru;
- tidak membutuhkan perubahan source code untuk update konten utama.

---

# 12. About UVICS

Halaman About dapat berisi:

- organization overview;
- history;
- vision;
- mission;
- values;
- objectives;
- organizational identity.

Admin dapat mengubah konten melalui Pages Management.

---

# 13. Organization Structure

Halaman struktur organisasi harus menggunakan data dinamis.

Data ditentukan oleh:

```text
Organization Period
Department
Position
Member
Display Order
```

Example:

```text
UVICS 2026/2027

President
Vice President
Secretary
Treasurer

Departments
├── Department A
├── Department B
└── Department C
```

Admin dapat mengganti periode yang ingin ditampilkan.

> **Catatan v1.1:** Pengurus inti tidak berada di departemen, tetapi kolom departemen pada histori keanggotaan saat ini wajib diisi ([U01](DECISIONS.md#u01--pengurus-inti-tanpa-departemen)). Pengunjung belum punya jalur baca data organisasi ([U02](DECISIONS.md#u02--akses-publik-data-organisasi)).

---

# 14. Departments

Department memiliki informasi:

- name;
- slug;
- description;
- logo/icon optional;
- responsibilities;
- active status;
- display order.

Public website dapat menampilkan:

- department name;
- description;
- current members;
- department leader;
- selected projects/programs.

---

# 15. News Management

Admin dapat membuat dan mengelola news/article.

Data:

```text
title
slug
excerpt
content
thumbnail
category
author
status
published_at
created_at
updated_at
```

Status:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Admin actions:

- create;
- edit;
- preview;
- publish;
- archive;
- delete.

### Business Rules

- slug harus unique;
- draft tidak tampil pada website publik;
- archived content tidak tampil pada listing utama;
- published_at menentukan tanggal publikasi.

---

# 16. Events Management

Data event:

```text
title
slug
description
location
start_at
end_at
registration_url
poster
status
featured
```

Event status:

```text
UPCOMING
ONGOING
FINISHED
CANCELLED
```

Status dapat dihitung otomatis berdasarkan waktu atau diubah admin apabila diperlukan.

> **Catatan v1.1:** Aturan prioritas antara status otomatis dan status dari admin, serta cara menyembunyikan event yang belum siap tayang, menunggu [U06](DECISIONS.md#u06--status-publikasi-dan-lifecycle).

Public pages:

```text
/events
/events/{slug}
```

---

# 17. Competition Management

Competition harus menjadi module tersendiri.

Data:

```text
title
slug
organizer
description
category
level
registration_deadline
competition_date
registration_url
guidebook_url
poster
team_size
eligibility
status
featured
```

Competition status:

```text
UPCOMING
OPEN
CLOSED
ONGOING
FINISHED
```

Admin dapat:

- create competition;
- edit;
- publish;
- close;
- archive;
- set featured.

> **Catatan v1.1:** Status di atas hanya lifecycle; aksi publish/archive belum punya status visibilitas. Lihat [U06](DECISIONS.md#u06--status-publikasi-dan-lifecycle).

Public dapat:

- melihat listing;
- filter berdasarkan status;
- melihat detail;
- membuka registration link;
- membuka guidebook jika tersedia.

---

# 18. Achievement Management

Data achievement:

```text
title
slug
competition_name
organizer
level
ranking
achievement_date
description
cover_image
certificate_file
published
```

Achievement dapat dikaitkan dengan satu atau lebih member.

```text
achievements
      ↓
achievement_members
      ↓
members
```

Admin dapat menentukan apakah achievement ditampilkan secara publik.

> **Catatan v1.1:** Cara mencatat peserta non-member (Q11) dan bentuk relasi ke `members` menunggu [U07](DECISIONS.md#u07--anggota-pada-achievement-dan-project).

---

# 19. Projects Management

Project digunakan untuk mendokumentasikan karya atau aktivitas UVICS.

Data:

```text
title
slug
summary
description
cover_image
project_url
repository_url
start_date
end_date
status
featured
```

Possible status:

```text
PLANNED
ONGOING
COMPLETED
ARCHIVED
```

Project dapat dikaitkan dengan beberapa member apabila dibutuhkan.

---

# 20. Gallery Management

Gallery digunakan untuk dokumentasi foto kegiatan.

Data:

```text
title
description
event_date
images
album_cover
published
```

Requirement:

- multiple image upload;
- image preview;
- delete image;
- image compression;
- optional album grouping.

> **Catatan v1.1:** Spesifikasi halaman publik memakai album wajib dengan route `/gallery/{slug}`. Lihat [U14](DECISIONS.md#u14--galeri).

---

# 21. Partners Management

Data partner:

```text
name
logo
website_url
description
display_order
active
```

Admin dapat menentukan partner mana yang ditampilkan.

---

# 21A. Programs Management

Program adalah kegiatan rutin UVICS (mis. workshop, study group, bootcamp) yang ditampilkan di homepage dan halaman Programs. Modul ini ditambahkan pada v1.1 untuk mendokumentasikan tabel yang sudah dibuat di migration CMS foundation (issue #10).

Data (tabel `programs`):

```text
name
slug
short_description
description
image
status
display_order
created_at
updated_at
```

Status mengikuti status konten:

```text
DRAFT
PUBLISHED
ARCHIVED
```

Admin dapat:

- create;
- edit;
- publish;
- archive;
- mengatur urutan tampil.

Public pages:

```text
/programs
/programs/{slug}
```

### Business Rules

- slug harus unique;
- hanya program `PUBLISHED` yang tampil di website publik;
- publish dilakukan lewat fungsi database yang memeriksa sesi admin.

> **Catatan v1.1:** Spesifikasi halaman publik meminta informasi tambahan (kategori, ikon, relasi ke departemen) yang belum ada di tabel. Lihat [U05](DECISIONS.md#u05--field-programs).

---

# 22. Member Registration

## 22.1 Registration Availability

Admin harus dapat:

- membuka registration;
- menutup registration;
- menentukan title;
- menentukan description;
- menentukan registration period;
- menentukan announcement text.

Public registration hanya dapat digunakan ketika registration aktif.

> **Catatan v1.1:** Status "pendaftaran dibuka" saat ini punya dua sumber (periode di bagian ini dan flag `registration_open` di §36), dan aturan unik per periode (§22.3) belum punya entitas periode. Lihat [U04](DECISIONS.md#u04--sumber-status-pendaftaran-dibuka). Route halaman pendaftaran menunggu [U03](DECISIONS.md#u03--route-pendaftaran).

## 22.2 Registration Form

Suggested fields:

### Personal Information

- full name;
- student ID / NIM;
- email;
- WhatsApp number;
- gender jika diperlukan;
- profile photo optional.

### Academic Information

- faculty;
- study program;
- year of entry / batch;
- current semester optional.

### Membership Information

- preferred department;
- interest;
- skills;
- previous experience;
- motivation;
- portfolio URL;
- GitHub / LinkedIn optional.

### Consent

- data consent checkbox;
- confirmation that information is correct.

## 22.3 Registration Validation

Minimum validation:

- required fields;
- valid email;
- valid phone format;
- unique application according to configured registration period;
- file type validation;
- file size validation;
- URL validation.

---

# 23. Registration Management

Admin dapat melihat seluruh application.

Listing fields:

```text
Applicant Name
NIM
Study Program
Batch
Preferred Department
Status
Submitted At
```

Admin dapat:

- search;
- filter;
- view detail;
- change status;
- add internal notes;
- accept;
- reject;
- convert accepted applicant to member.

Registration status:

```text
SUBMITTED
UNDER_REVIEW
ACCEPTED
REJECTED
```

---

# 24. Convert Applicant to Member

Ketika admin menerima applicant:

1. Admin membuka registration detail.
2. Admin memilih Accept.
3. Sistem mengubah status registration menjadi ACCEPTED.
4. Admin dapat memilih "Create Member".
5. Sistem menyalin data relevan ke member.
6. Admin menentukan organization period, department, position, dan membership start date.
7. Member menjadi ACTIVE.

### Business Rule

Satu registration tidak boleh menghasilkan member lebih dari satu kali.

---

# 25. Member Management

Data member:

```text
full_name
nim
email
phone
faculty
study_program
batch
photo
status
joined_at
graduated_at
bio
linkedin_url
github_url
instagram_url
public_profile
```

Possible status:

```text
ACTIVE
INACTIVE
ALUMNI
```

Admin dapat:

- add member manually;
- edit;
- view detail;
- change membership status;
- assign organization history;
- convert to alumni;
- archive;
- search;
- filter;
- export future enhancement.

---

# 26. Member Listing

Admin listing harus mendukung:

### Search

- name;
- NIM;
- email.

### Filter

- status;
- department;
- position;
- batch;
- organization period.

### Sort

- name;
- newest;
- oldest;
- batch.

### Pagination

```text
10
25
50
```

---

# 27. Member Detail

Member detail minimal memiliki sections:

```text
Profile
Academic Information
Contact Information
Membership Status
Organization History
Achievements
Projects
Admin Notes
```

---

# 28. Alumni Management

Alumni tidak direkomendasikan sebagai entity yang sepenuhnya berbeda dari member.

Alumni adalah member dengan:

```text
status = ALUMNI
```

Dengan model ini:

- histori member tetap tersimpan;
- achievement relationship tidak hilang;
- organization history tetap tersedia;
- tidak perlu duplikasi data.

Alumni listing dapat menggunakan query/filter dari member.

Admin dapat:

- convert active member menjadi alumni;
- menentukan alumni date;
- menambahkan current occupation optional;
- menambahkan LinkedIn;
- menentukan apakah profil alumni tampil publik.

---

# 29. Membership History

Membership history wajib disediakan untuk mempertahankan histori organisasi.

Data:

```text
member_id
organization_period_id
department_id
position_id
start_date
end_date
notes
```

Histori lama tidak boleh dihapus hanya karena periode baru dimulai.

---

# 30. Organization Period Management

Data:

```text
name
start_date
end_date
status
```

Example:

```text
2025/2026
2026/2027
```

Status:

```text
UPCOMING
ACTIVE
ENDED
```

Business rules:

- hanya satu period yang aktif pada satu waktu, kecuali requirement berubah;
- period yang memiliki histori member tidak boleh dihapus sembarangan;
- ended period tetap dapat dilihat.

---

# 31. Position Management

Data:

```text
name
description
level
display_order
active
```

Examples:

```text
President
Vice President
Secretary
Treasurer
Coordinator
Member
```

Position bersifat configurable melalui admin dashboard.

---

# 32. Organization Structure Management

Admin dapat membangun struktur organisasi berdasarkan:

```text
period
member
department
position
display_order
```

Public organization page dapat memilih period tertentu.

Default public display menggunakan active organization period.

---

# 33. Public Member Directory

Website dapat menyediakan directory anggota aktif.

Data publik hanya boleh menampilkan field yang disetujui.

Suggested public fields:

```text
Name
Photo
Position
Department
Batch optional
Short Bio optional
LinkedIn optional
GitHub optional
```

Field internal seperti phone number, personal email, NIM, dan admin notes tidak boleh ditampilkan.

> **Catatan v1.1:** Akses publik langsung ke data member ditutup ([D02](DECISIONS.md#a-keputusan-teknis-d01d05-kontrak-3133)); data member hanya tampil lewat proyeksi field. Apakah halaman `/members` dan `/alumni` masuk MVP menunggu [U12](DECISIONS.md#u12--halaman-members-dan-alumni), dan default `public_profile` menunggu [U11](DECISIONS.md#u11--default-public_profile).

---

# 34. Public Alumni Directory

Jika diperlukan, public alumni directory dapat menampilkan:

- name;
- photo;
- UVICS organization history;
- graduation year;
- LinkedIn;
- current occupation optional.

Alumni dapat memiliki flag:

```text
public_profile = true / false
```

---

# 35. Website Pages CMS

Untuk halaman semi-statis seperti About, Vision Mission, Contact, Terms, Privacy, dan Registration Information, admin dapat menggunakan Pages module.

Data:

```text
title
slug
content
meta_title
meta_description
status
published_at
```

---

# 36. Website Settings

General settings:

```text
organization_name
website_title
logo
favicon
email
phone
address
instagram_url
linkedin_url
youtube_url
github_url
footer_text
```

Additional settings:

```text
default_meta_title
default_meta_description
registration_open
maintenance_mode
```

Admin tidak perlu mengubah source code untuk memperbarui informasi tersebut.

---

# 37. Media Management

Upload media harus memiliki standar.

Supported media:

```text
Images
Profile Photos
Post Thumbnails
Event Posters
Competition Posters
Project Images
Certificates
Documents
```

Minimum requirements:

- allowed MIME validation;
- maximum file size;
- unique filename;
- safe storage;
- image compression;
- generated thumbnails optional;
- delete unused files safely.

Recommended image formats:

```text
JPG
JPEG
PNG
WEBP
```

Recommended document formats:

```text
PDF
```

---

# 38. Admin Dashboard Overview

Admin dashboard harus memberikan ringkasan kondisi sistem.

Suggested KPI cards:

```text
Active Members
Alumni
Pending Registrations
Published News
Upcoming Events
Open Competitions
Achievements
```

Suggested widgets:

- recent registrations;
- upcoming events;
- latest news;
- recent achievements;
- member distribution by department;
- recent admin activities.

---

# 39. Audit Logs

Aktivitas penting admin harus dapat direkam.

Audit data:

```text
actor
action
entity_type
entity_id
old_values
new_values
ip_address optional
created_at
```

Events yang disarankan untuk dicatat:

- login;
- update settings;
- create/update/delete news;
- accept/reject applicant;
- update member;
- alumni transition;
- change organization structure;
- delete important records.

---

# 40. Delete and Archive Strategy

Hard delete tidak selalu disarankan.

Untuk data historis seperti members, alumni, organization periods, achievements, news, dan events, gunakan salah satu:

```text
soft delete
archive
inactive status
```

Data yang masih direferensikan oleh record lain tidak boleh dihapus tanpa validasi.

Example: Organization Period tidak boleh dihapus jika masih digunakan oleh membership history.

---

# 41. Search Requirements

Global search tidak wajib untuk MVP.

Namun masing-masing module harus memiliki search relevan.

### Members

```text
name
nim
email
```

### News

```text
title
content
```

### Competition

```text
title
organizer
```

### Achievement

```text
title
competition_name
member
```

---

# 42. Filtering Requirements

### Registrations

- status;
- batch;
- study program;
- preferred department.

### Members

- status;
- department;
- batch;
- period.

### Competitions

- status;
- category;
- level.

### Events

- status;
- date.

---

# 43. Suggested Database Domain Model

High-level entities:

```text
admins

pages
programs
posts
events
competitions
achievements
projects
gallery_albums
gallery_items
partners

registrations
members
membership_histories
organization_periods
departments
positions

achievement_members
project_members

website_settings
audit_logs
```

---

# 44. Suggested Relationship Model

```text
registrations
    ↓ accepted
members
    │
    ├── membership_histories
    │       ├── organization_periods
    │       ├── departments
    │       └── positions
    │
    ├── achievement_members
    │       └── achievements
    │
    └── project_members
            └── projects
```

---

# 45. Suggested Core Tables

## 45.1 admins

```text
id
name
is_active
last_login_at
created_at
updated_at
```

Email dan password tidak disimpan di tabel aplikasi; keduanya dikelola Supabase Auth. `admins.id` sama dengan ID user Auth.

## 45.2 registrations

```text
id
full_name
nim
email
phone
faculty
study_program
batch
preferred_department_id
skills
experience
motivation
portfolio_url
photo
status
admin_notes
submitted_at
accepted_at
rejected_at
converted_member_id
created_at
updated_at
```

## 45.3 members

```text
id
full_name
nim
email
phone
faculty
study_program
batch
photo
bio
status
joined_at
graduated_at
linkedin_url
github_url
instagram_url
public_profile
created_at
updated_at
deleted_at
```

## 45.4 membership_histories

```text
id
member_id
organization_period_id
department_id
position_id
start_date
end_date
notes
created_at
updated_at
```

## 45.5 organization_periods

```text
id
name
start_date
end_date
status
created_at
updated_at
```

## 45.6 departments

```text
id
name
slug
description
display_order
active
created_at
updated_at
```

## 45.7 positions

```text
id
name
description
level
display_order
active
created_at
updated_at
```

---

# 46. Content Tables

## 46.1 posts

```text
id
title
slug
excerpt
content
thumbnail
status
published_at
created_at
updated_at
deleted_at
```

## 46.2 events

```text
id
title
slug
description
location
start_at
end_at
registration_url
poster
status
featured
created_at
updated_at
```

## 46.3 competitions

```text
id
title
slug
organizer
description
category
level
registration_deadline
competition_date
registration_url
guidebook_url
poster
team_size
eligibility
status
featured
created_at
updated_at
```

## 46.4 achievements

```text
id
title
slug
competition_name
organizer
level
ranking
achievement_date
description
cover_image
certificate_file
published
created_at
updated_at
```

## 46.5 projects

```text
id
title
slug
summary
description
cover_image
project_url
repository_url
start_date
end_date
status
featured
created_at
updated_at
```

---

# 47. Data Privacy

## Public Data

Possible:

- name;
- photo;
- department;
- position;
- organization period;
- public achievements;
- public projects;
- LinkedIn / GitHub jika diberikan.

## Internal Data

Tidak boleh tampil pada public website tanpa requirement khusus:

- phone;
- personal email;
- NIM;
- registration answers;
- admin notes;
- interview result;
- private documents.

---

# 48. Security Requirements

Minimum security requirements:

- password dikelola Supabase Auth (tidak ada kolom password di tabel aplikasi);
- pemeriksaan admin di setiap Server Action, Route Handler, dan query privat, bukan hanya di layout atau `proxy.ts`;
- penolakan mutasi lintas origin (Origin harus sama persis dengan `APP_ORIGIN`) dan cookie `SameSite=Lax` sebagai pengganti token CSRF;
- validasi input di server dengan Zod;
- output escaping (bawaan React; konten rich text dirender dengan sanitasi);
- upload aman lewat signature server dan verifikasi hasil upload;
- validasi tipe dan ukuran file per kategori media;
- rate limiting login;
- rate limiting registration;
- sesi baru dari Supabase Auth di setiap login, dengan masa maksimal satu jam absolut;
- cookie `Secure` di production;
- query lewat Supabase SDK/RPC yang terparameter, tanpa SQL dinamis dari input pengguna;
- Row Level Security di semua tabel yang terekspos Data API.

Detail teknis ada di [BACKEND_CONVENTIONS.md](BACKEND_CONVENTIONS.md) dan [ARCHITECTURE.md](ARCHITECTURE.md#5-keamanan).

---

# 49. Registration Security

Public registration endpoint perlu:

- server-side validation;
- spam protection;
- rate limiting;
- duplicate detection;
- file upload validation;
- optional CAPTCHA apabila spam menjadi masalah.

---

# 50. Performance Requirements

Target awal:

- public page harus terasa cepat pada koneksi mobile;
- image harus dioptimasi;
- query listing harus menggunakan pagination;
- eager loading relationship harus digunakan jika diperlukan;
- database indexes harus ditambahkan pada field pencarian/filter utama;
- static assets harus melalui production build;
- caching dapat digunakan untuk frequently accessed public data.

Suggested target:

```text
LCP < 2.5 seconds pada kondisi wajar
Admin list response < 1 second untuk dataset normal
```

---

# 51. Responsive Requirements

Sistem wajib mendukung:

```text
Mobile
Tablet
Desktop
```

Public website dan admin dashboard harus tetap usable pada berbagai ukuran layar.

---

# 52. Accessibility

Target minimum:

- semantic HTML;
- form labels;
- keyboard accessibility;
- visible focus state;
- sufficient color contrast;
- meaningful alt text;
- button dan link dapat dibedakan;
- validation error mudah dipahami.

Target ideal:

```text
WCAG 2.1 AA
```

---

# 53. SEO Requirements

Untuk public website:

- unique page title;
- meta description;
- OpenGraph metadata;
- canonical URL;
- sitemap.xml;
- robots.txt;
- semantic headings;
- clean slug;
- image alt text;
- structured data optional.

---

# 54. Error Handling

Sistem harus menyediakan error states yang jelas.

Examples:

```text
401 Belum login atau sesi berakhir (UNAUTHENTICATED)
403 Tidak berhak (FORBIDDEN)
404 Halaman tidak ditemukan (NOT_FOUND)
409 Konflik data, mis. slug sudah dipakai (CONFLICT)
422 Validasi gagal (VALIDATION_ERROR)
429 Terlalu banyak percobaan (RATE_LIMITED)
500 Kesalahan server (INTERNAL_ERROR)
503 Layanan sementara tidak tersedia (SERVICE_UNAVAILABLE)
Upload Errors
```

Kode error dan format respons mengikuti [BACKEND_CONVENTIONS.md](BACKEND_CONVENTIONS.md#validasi-dan-error).

Admin form harus mempertahankan input apabila validation gagal sejauh memungkinkan.

---

# 55. Empty States

Setiap data listing harus memiliki empty state yang menjelaskan kondisi dan tindakan berikutnya.

Example:

```text
Belum ada member aktif.
Tambahkan member baru atau terima applicant dari halaman Registrations.
```

---

# 56. Confirmation Dialogs

Action destructive wajib memiliki confirmation.

Examples:

- delete post;
- delete event;
- archive member;
- convert member to alumni;
- reject applicant;
- remove gallery image.

---

# 57. Notifications

Untuk MVP, notification cukup berupa UI feedback:

```text
Success Toast
Error Toast
Validation Message
Confirmation Message
```

Email notification dapat menjadi future enhancement.

---

# 58. Admin UX Requirements

Dashboard admin harus:

- konsisten;
- memiliki sidebar jelas;
- menggunakan breadcrumbs jika diperlukan;
- memiliki page title;
- search/filter dekat dengan data table;
- action create terlihat jelas;
- destructive action dibedakan secara visual;
- form dikelompokkan ke section;
- menggunakan loading state.

---

# 59. Public Website UX Requirements

Website publik harus:

- modern;
- professional;
- mencerminkan identitas UVICS;
- memiliki navigasi sederhana;
- mobile friendly;
- menonjolkan achievement dan activity UVICS;
- memiliki CTA registration ketika registration open;
- memberikan akses cepat ke competition dan event.

---

# 60. Core Business Rules

1. Hanya Admin yang dapat login.
2. Public Visitor tidak membutuhkan akun.
3. Applicant tidak mendapatkan akun.
4. Member aktif tidak mendapatkan akun pada MVP.
5. Alumni tidak mendapatkan akun pada MVP.
6. Applicant accepted dapat dikonversi menjadi member.
7. Satu registration tidak boleh dikonversi dua kali.
8. Member dapat memiliki banyak membership histories.
9. Member tetap satu record walaupun pindah department atau position.
10. Alumni tetap menggunakan record member yang sama.
11. Organization history tidak boleh dihapus saat periode berakhir.
12. Published content hanya tampil jika status valid.
13. Internal member data tidak boleh tampil di public website.
14. Record yang memiliki reference aktif tidak boleh di-hard-delete tanpa guard.
15. Admin action penting harus dapat diaudit.

---

# 61. Core User Stories

## US-ADM-01 Admin Login

**As an** Admin  
**I want to** login  
**So that** saya dapat mengelola website UVICS.

### Acceptance Criteria

- admin membuka login page;
- admin memasukkan email dan password;
- credential valid menghasilkan session;
- credential invalid menampilkan error;
- authenticated admin diarahkan ke dashboard.

## US-CMS-01 Manage News

**As an** Admin  
**I want to** membuat dan memperbarui news  
**So that** website selalu memiliki informasi terbaru.

### Acceptance Criteria

- admin dapat create news;
- title wajib;
- slug unique;
- admin dapat save as draft;
- admin dapat publish;
- published news tampil di website publik.

## US-REG-01 Submit Registration

**As a** Visitor  
**I want to** mendaftar menjadi member  
**So that** saya dapat mengikuti proses penerimaan UVICS.

### Acceptance Criteria

- registration hanya dapat dikirim ketika open;
- required fields tervalidasi;
- application tersimpan;
- user menerima confirmation state;
- submission muncul di admin dashboard.

## US-REG-02 Review Applicant

**As an** Admin  
**I want to** melihat applicant  
**So that** saya dapat melakukan review pendaftaran.

### Acceptance Criteria

- admin dapat membuka registration list;
- admin dapat search;
- admin dapat filter status;
- admin dapat melihat detail applicant;
- admin dapat menambahkan notes;
- admin dapat accept atau reject.

## US-MEM-01 Convert Applicant

**As an** Admin  
**I want to** mengubah applicant accepted menjadi member  
**So that** member baru tercatat dalam database organisasi.

### Acceptance Criteria

- hanya applicant accepted yang dapat dikonversi;
- conversion tidak boleh dilakukan dua kali;
- admin menentukan period;
- admin dapat menentukan department dan position;
- member dibuat dengan status ACTIVE.

## US-MEM-02 View Members

**As an** Admin  
**I want to** melihat semua member  
**So that** saya dapat mengelola keanggotaan.

### Acceptance Criteria

- listing menampilkan name, batch, department, position, status;
- admin dapat search;
- admin dapat filter;
- admin dapat paginate;
- admin dapat membuka detail.

## US-MEM-03 Convert to Alumni

**As an** Admin  
**I want to** mengubah member menjadi alumni  
**So that** status keanggotaan tetap akurat tanpa menghapus histori.

### Acceptance Criteria

- admin memilih member;
- admin memilih Convert to Alumni;
- confirmation muncul;
- status menjadi ALUMNI;
- graduated/alumni date dapat disimpan;
- membership history tetap tersedia.

## US-ORG-01 Manage Organization Period

**As an** Admin  
**I want to** mengelola periode organisasi  
**So that** struktur UVICS dapat disimpan berdasarkan periode.

### Acceptance Criteria

- admin dapat create period;
- admin dapat edit period;
- admin dapat activate period;
- historical period tetap dapat dilihat.

## US-ORG-02 Assign Member Position

**As an** Admin  
**I want to** assign member ke department dan position  
**So that** struktur organisasi dapat dibangun secara dinamis.

### Acceptance Criteria

- member dipilih;
- organization period dipilih;
- department dipilih jika applicable;
- position dipilih;
- history record dibuat;
- public structure dapat menggunakan data tersebut.

## US-ACH-01 Manage Achievement

**As an** Admin  
**I want to** mencatat achievement  
**So that** prestasi UVICS terdokumentasi.

### Acceptance Criteria

- achievement dapat dibuat;
- achievement dapat dikaitkan dengan member;
- cover image dapat diupload;
- achievement dapat dipublish;
- published achievement tampil di public site.

---

# 62. Admin Dashboard Pages

Recommended routes:

```text
/admin/login
/admin/dashboard
/admin/pages
/admin/programs
/admin/news
/admin/events
/admin/competitions
/admin/achievements
/admin/projects
/admin/gallery
/admin/partners
/admin/registrations
/admin/members
/admin/alumni
/admin/departments
/admin/positions
/admin/organization-periods
/admin/settings
/admin/profile
/admin/audit-logs
```

Exact route dapat disesuaikan dengan framework.

---

# 63. Public Routes

Recommended:

```text
/
/about
/organization
/departments
/departments/{slug}
/programs
/programs/{slug}
/news
/news/{slug}
/events
/events/{slug}
/competitions
/competitions/{slug}
/achievements
/achievements/{slug}
/projects
/projects/{slug}
/gallery
/members
/alumni
/contact
/register
```

> **Catatan v1.1:** Beberapa route berbeda dengan spesifikasi halaman publik dan kode:
>
> - pendaftaran `/register` vs `/join` ([U03](DECISIONS.md#u03--route-pendaftaran));
> - berita `/news` vs `/blog`, serta route template `/pricing`, `/batch`, `/forgot-password` ([U09](DECISIONS.md#u09--route-berita-dan-route-template));
> - halaman Visi & Misi `/vision-mission` ([U10](DECISIONS.md#u10--halaman-visi--misi));
> - detail galeri `/gallery/{slug}` ([U14](DECISIONS.md#u14--galeri));
> - `/members` dan `/alumni` ([U12](DECISIONS.md#u12--halaman-members-dan-alumni)).

---

# 64. Suggested API / Backend Resource Areas

Jika frontend dan backend berkomunikasi melalui API, domain dapat dipisahkan menjadi:

```text
Auth
Pages
News
Events
Competitions
Achievements
Projects
Gallery
Partners
Registration
Members
Organization
Settings
Audit
```

Jika menggunakan server-driven architecture, domain tetap dapat digunakan sebagai service/module boundaries.

---

# 65. Validation Standards

Setiap form harus memiliki:

- client-side feedback jika tersedia;
- server-side validation mandatory;
- meaningful validation messages;
- file validation;
- unique validation;
- date consistency validation.

Example:

```text
event.end_at >= event.start_at
organization_period.end_date >= start_date
registration_deadline <= competition_date jika applicable
```

---

# 66. Data Integrity

Database perlu menggunakan:

- foreign key;
- unique constraints;
- indexes;
- nullable fields secara intentional;
- timestamp;
- soft delete untuk entity tertentu.

Potential unique constraints:

```text
admins.email
pages.slug
posts.slug
events.slug
competitions.slug
projects.slug
achievements.slug
```

Untuk NIM, unique rule perlu disesuaikan kebijakan karena alumni/member lama dapat muncul lintas periode namun tetap merupakan orang yang sama.

---

# 67. Recommended Audit Strategy

Audit harus mencatat minimal:

```text
CREATE
UPDATE
DELETE
ARCHIVE
RESTORE
STATUS_CHANGE
LOGIN
```

High-value entities:

```text
Registration
Member
OrganizationPeriod
MembershipHistory
News
Event
Competition
Achievement
Project
WebsiteSettings
```

---

# 68. Reporting Requirements

MVP cukup menyediakan dashboard summary.

Future reporting:

- members per department;
- members per batch;
- alumni count per year;
- applicants per period;
- applicant acceptance rate;
- achievements per year;
- competitions per category;
- event history.

---

# 69. Export Requirements

Export bukan mandatory MVP.

Future export:

```text
Members → XLSX / CSV
Alumni → XLSX / CSV
Registrations → XLSX / CSV
Achievements → CSV
```

---

# 70. Backup and Recovery

Production system harus memiliki:

- database backup;
- media backup;
- documented restore procedure;
- retention policy;
- restricted backup access.

Exact infrastructure bergantung deployment environment.

---

# 71. Logging and Monitoring

Application harus mencatat:

- application errors;
- failed authentication;
- upload failures;
- critical background errors jika digunakan.

Production error tidak boleh menampilkan stack trace kepada public user.

---

# 72. Environment Configuration

Environment minimal:

```text
local
staging optional
production
```

Secrets tidak boleh disimpan dalam repository.

Examples:

```text
database credentials
application secret
mail credentials
storage credentials
```

---

# 73. Recommended Development Phases

## Phase 1 — Foundation

Scope:

- project setup;
- database foundation;
- admin authentication;
- admin layout;
- website settings;
- core media upload;
- audit foundation.

Deliverable: Admin dapat login dan mengakses dashboard dasar.

## Phase 2 — Public Website + CMS

Scope:

- homepage;
- pages;
- news;
- events;
- competitions;
- achievements;
- projects;
- gallery;
- partners.

Deliverable: Seluruh konten utama website dapat dikelola dari dashboard.

## Phase 3 — Membership Registration

Scope:

- registration configuration;
- public registration form;
- registration validation;
- registrations dashboard;
- review status;
- accept/reject;
- admin notes.

Deliverable: Pendaftaran member dapat dilakukan end-to-end.

## Phase 4 — Member Management

Scope:

- member CRUD;
- member detail;
- search/filter;
- department;
- position;
- organization period;
- membership history.

Deliverable: Admin dapat mengelola anggota aktif dan struktur organisasi.

## Phase 5 — Alumni

Scope:

- alumni transition;
- alumni listing;
- public alumni directory optional;
- alumni history.

Deliverable: Histori keanggotaan tetap tersedia setelah member menjadi alumni.

## Phase 6 — Quality and Optimization

Scope:

- audit refinement;
- SEO;
- accessibility;
- performance;
- backup;
- security testing;
- UI polish;
- automated tests.

---

# 74. MVP Definition

MVP dianggap selesai apabila:

1. Public website dapat digunakan.
2. Admin dapat login.
3. Admin dapat mengubah konten utama.
4. News dapat dipublish.
5. Event dapat dikelola.
6. Competition dapat dikelola.
7. Achievement dapat dikelola.
8. Project dapat dikelola.
9. Registration dapat dibuka/ditutup.
10. Visitor dapat mengirim registration.
11. Admin dapat accept/reject applicant.
12. Applicant accepted dapat menjadi member.
13. Member dapat dikelola.
14. Organization period dapat dikelola.
15. Department dan position dapat dikelola.
16. Member dapat memiliki organization history.
17. Member dapat dikonversi menjadi alumni.
18. Website settings dapat dikelola.
19. Core admin action tercatat.
20. Sistem responsive dan secure secara minimum.

---

# 75. Testing Requirements

Automated tests sangat disarankan untuk business flow utama.

## Authentication Tests

- admin login success;
- invalid password rejected;
- guest cannot access admin routes;
- logout ends session.

## Registration Tests

- registration disabled rejects submission;
- valid registration succeeds;
- required fields validated;
- invalid upload rejected;
- duplicate registration rules work.

## Applicant Tests

- admin can view applicant;
- admin can accept;
- admin can reject;
- accepted applicant can be converted;
- rejected applicant cannot be converted unless status changed;
- applicant cannot be converted twice.

## Member Tests

- admin can create member;
- admin can update member;
- member can have history;
- member can become alumni;
- alumni conversion preserves history.

## CMS Tests

- draft post hidden publicly;
- published post visible;
- unique slug enforced;
- event date validation works;
- admin route protected.

## Delete Guard Tests

- referenced organization period cannot be deleted;
- referenced department cannot be deleted without safe handling;
- member with historical references is not hard-deleted accidentally.

---

# 76. Manual QA Checklist

Before production release:

- mobile navigation tested;
- all forms tested;
- all admin tables tested;
- image upload tested;
- large image tested;
- invalid file tested;
- registration open/close tested;
- applicant conversion tested;
- alumni conversion tested;
- public/private data checked;
- SEO metadata checked;
- 404 page checked;
- logout checked;
- session expiration checked;
- permissions checked;
- database backup tested.

---

# 77. Future Enhancements

Possible future scope:

- member login;
- alumni login;
- member self-profile;
- email verification;
- applicant tracking portal;
- interview scheduling;
- attendance;
- competition team management;
- mentor database;
- internal document management;
- email notification;
- WhatsApp integration;
- analytics dashboard;
- advanced export;
- API for mobile app;
- single sign-on;
- multi-admin permission model;
- automated alumni transition rules.

Future enhancements tidak boleh mempersulit MVP secara tidak perlu.

---

# 78. Product Decisions

Keputusan utama PRD ini:

1. Hanya Admin yang memiliki login.
2. Applicant bukan role aplikasi.
3. Member bukan role aplikasi pada MVP.
4. Alumni bukan role aplikasi pada MVP.
5. Member dan alumni menggunakan entity yang sama.
6. Histori organisasi disimpan pada membership history.
7. Website content dikelola melalui CMS.
8. Competition, achievement, project, dan event menggunakan structured data, bukan sekadar static page.
9. Data private member tidak boleh tampil publik.
10. Historical records harus dipertahankan.

---

# 79. Open Questions

Beberapa keputusan bisnis perlu dikonfirmasi sebelum implementation final. Status per v1.1 (detail di [DECISIONS.md](DECISIONS.md)):

| No | Pertanyaan | Status | Rujukan |
| --- | --- | --- | --- |
| 1 | Apakah halaman Members akan tampil publik? | Usulan: tidak masuk MVP | U12, D02 |
| 2 | Apakah halaman Alumni akan tampil publik? | Usulan: tidak masuk MVP | U12, D02 |
| 3 | Field apa saja yang harus tersedia pada registration? | Sebagian diterima: field issue #8; field tambahan masih terbuka | D06, T05 |
| 4 | Apakah registration memiliki periode/batch penerimaan? | Usulan: ya, tabel periode pendaftaran | U04 |
| 5 | Apakah admin perlu menyimpan hasil interview? | Terbuka | T01 |
| 6 | Apakah satu member dapat berada pada lebih dari satu department dalam periode yang sama? | Terbuka | T02 |
| 7 | Apakah satu member dapat memiliki lebih dari satu position? | Terbuka | T02 |
| 8 | Apakah organization period menggunakan tahun akademik atau periode kepengurusan bebas? | Diterima: nama bebas dengan tanggal mulai/selesai | D07 |
| 9 | Apakah competition hanya informasi lomba atau juga tracking tim lomba? | Diterima: informasi lomba saja | D15 |
| 10 | Apakah project perlu contributor/member relationship? | Usulan: ya, dengan dukungan non-member | U07 |
| 11 | Apakah achievement dapat berasal dari individu non-member? | Usulan: ya | U07 |
| 12 | Apakah homepage sections harus configurable urutannya? | Usulan: tidak, urutan tetap | U15 |
| 13 | Apakah diperlukan bilingual Indonesia/English? | Usulan: Bahasa Indonesia untuk MVP | U16 |
| 14 | Apakah admin terdiri dari satu akun atau beberapa akun dengan hak yang sama? | Diterima: beberapa akun, hak sama | D08 |
| 15 | Apakah registration memerlukan upload CV/portfolio? | Diterima: tanpa CV, hanya URL portofolio | D10 |
| 16 | Apakah alumni memiliki current occupation/company field? | Terbuka | T03 |
| 17 | Apakah contact form perlu disimpan di database atau cukup external link/email? | Usulan: tautan kontak resmi tanpa penyimpanan | U13 |
| 18 | Apakah diperlukan newsletter? | Terbuka | T04 |
| 19 | Apakah website memiliki brand/design system resmi? | Diterima: `design.md` | D11 |
| 20 | Apakah public member profile harus memiliki opt-in privacy? | Usulan: opt-in (`public_profile` default false) | U11, D02 |

Open questions harus diselesaikan sebelum fitur terkait masuk ke tahap development final.

---

# 80. Definition of Done

Sebuah feature dianggap selesai jika:

- requirement terpenuhi;
- acceptance criteria lulus;
- validation diterapkan;
- error state tersedia;
- responsive tested;
- security basic checked;
- automated test tersedia untuk business-critical flow;
- code review selesai;
- tidak terdapat blocker bug;
- documentation diperbarui.

---

# 81. Recommended Documentation Structure

Dokumentasi berada di folder `documents/` (kecuali aturan kode di `AGENTS.md` dan design system di `design.md` pada root repository):

| Dokumen | Isi |
| --- | --- |
| `documents/PRD.md` | Kebutuhan produk (dokumen ini) |
| `documents/UVICS_Public_Website_Page_Specification.md` | Spesifikasi halaman website publik |
| `documents/DECISIONS.md` | Catatan keputusan dan jawaban open questions |
| `documents/TECH_STACK.md` | Pilihan teknologi dan batas arsitektur |
| `documents/ARCHITECTURE.md` | Peta sistem, struktur kode, domain data, dan alur utama |
| `documents/BACKEND_CONVENTIONS.md` | Kontrak backend: data, validasi, error, auth, audit, media |
| `documents/BACKEND_OPERATIONS.md` | Runbook operator: environment, migration, pengujian hosted |
| `documents/DEVELOPMENT_WORKFLOW.md` | Branch, issue, commit, PR, merge, rilis, Definition of Done |
| `AGENTS.md` | Aturan penulisan kode dan struktur proyek |
| `design.md` | Design system |

PRD ini tetap menjadi dokumen utama. Requirement yang semakin detail dapat dipisahkan ke file khusus bila sebuah modul sudah terlalu besar untuk PRD.

---

# 82. Final Product Model

```text
                         ┌─────────────────────┐
                         │   PUBLIC WEBSITE    │
                         └──────────┬──────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
     Content                    Registration                Directory
        │                           │                           │
        │                           ▼                           │
        │                       Applicant                      │
        │                           │                           │
        │                           ▼                           │
        │                     Admin Review                     │
        │                           │                           │
        │                     ┌─────┴─────┐                     │
        │                     ▼           ▼                     │
        │                  Accepted    Rejected                 │
        │                     │                                 │
        │                     ▼                                 │
        │               Active Member ───────────────┐          │
        │                     │                      │          │
        │                     ▼                      │          │
        │                  Inactive                  │          │
        │                     │                      │          │
        │                     ▼                      │          │
        │                   Alumni                   │          │
        │                                            │          │
        └────────────────────────────────────────────┼──────────┘
                                                     │
                                                     ▼
                                            ADMIN DASHBOARD
```

---

# 83. Conclusion

UVICS Website Platform harus dikembangkan bukan hanya sebagai website organisasi, tetapi sebagai sistem terintegrasi yang menggabungkan:

- public information;
- content management;
- membership registration;
- member management;
- alumni management;
- organization history;
- achievement documentation;
- competition information;
- project documentation;
- event management.

Sistem tetap dibuat sederhana dengan hanya satu role autentikasi:

```text
ADMIN
```

Sedangkan:

```text
Applicant
Active Member
Inactive Member
Alumni
```

merupakan status/domain data organisasi.

Pendekatan ini mengurangi kompleksitas autentikasi, menjaga implementasi MVP tetap realistis, dan tetap menyediakan struktur data yang cukup kuat untuk pengembangan UVICS dalam jangka panjang.

---

**End of Product Requirements Document**
