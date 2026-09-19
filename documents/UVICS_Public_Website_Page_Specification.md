# UVICS Public Website Page Specification

**Document Version:** 1.0  
**Status:** Ready for UI/UX & Development  
**Product:** UVICS Website Platform  
**Document Type:** Public Website Information Architecture & Page Specification  
**Primary Audience:** Product Team, UI/UX Designer, Frontend Developer, Backend Developer, QA  

---

# 1. Purpose

Dokumen ini mendefinisikan struktur halaman website publik UVICS secara lengkap agar:

- setiap halaman memiliki tujuan yang jelas;
- informasi yang tampil tidak ambigu;
- UI/UX designer mengetahui section yang perlu dibuat;
- frontend developer mengetahui struktur halaman;
- backend developer mengetahui sumber data;
- admin mengetahui konten yang dikelola;
- QA dapat menguji berdasarkan requirement yang konsisten.

Dokumen ini fokus pada **website publik UVICS** dan hubungannya dengan dashboard admin.

---

# 2. Final Navbar Structure

```text
[UVICS Logo]

Beranda

Tentang ▼
├── Tentang UVICS
├── Visi & Misi
└── Departemen

Organisasi ▼
├── Struktur Organisasi
├── Member
└── Alumni

Program
Kompetisi
Prestasi
Project

Informasi ▼
├── Event
├── Berita
└── Galeri

Join UVICS
```

Informasi seperti **Kontak**, **Partner**, dan **Social Media** ditempatkan terutama pada footer agar navbar tetap ringkas.

---

# 3. Global Website Elements

## 3.1 Navbar

Navbar harus memiliki:

- Logo UVICS;
- seluruh menu utama;
- dropdown untuk menu Tentang, Organisasi, dan Informasi;
- active state;
- mobile navigation;
- tombol Join UVICS yang lebih menonjol;
- logo yang mengarah ke Beranda.

## 3.2 Footer

Footer berisi:

### Brand
- Logo UVICS;
- short description.

### Explore
- Tentang UVICS;
- Program;
- Kompetisi;
- Prestasi;
- Project.

### Organization
- Struktur Organisasi;
- Departemen;
- Member;
- Alumni.

### Information
- Event;
- Berita;
- Galeri;
- Join UVICS.

### Connect
- Email;
- Instagram;
- LinkedIn;
- GitHub;
- YouTube jika tersedia.

### Copyright
```text
© 2026 UVICS. All rights reserved.
```

---

# 4. Page 01 — Beranda

## Purpose

Memberikan gambaran UVICS dalam waktu singkat dan mengarahkan visitor ke aktivitas, prestasi, project, organisasi, dan recruitment.

## Section Order

```text
Hero
↓
About UVICS Preview
↓
UVICS at a Glance
↓
Departments Preview
↓
Programs / What We Do
↓
Featured Competitions
↓
Upcoming Events
↓
Featured Projects
↓
Latest Achievements
↓
Latest News
↓
Current Organization Preview
↓
Partners
↓
Join UVICS CTA
```

## Hero Section

Informasi:
- headline;
- tagline;
- short description;
- primary CTA;
- secondary CTA;
- main visual/photo/video.

Contoh CTA:
```text
[Explore UVICS]
[Join UVICS]
```

Admin source:
```text
Admin → Homepage Settings / Website Settings
```

## About UVICS Preview

Menampilkan:
- title;
- 2–3 paragraf singkat;
- image;
- CTA ke halaman Tentang.

CTA:
```text
Learn More About UVICS
```

## UVICS at a Glance

Statistik yang dapat ditampilkan:
- active members;
- alumni;
- achievements;
- projects;
- competitions;
- events.

Data idealnya dihitung otomatis dari database.

## Departments Preview

Setiap card:
- department name;
- short description;
- icon/logo optional;
- CTA.

CTA utama:
```text
View All Departments
```

## Programs / What We Do

Possible items:
- Competition Update;
- Competition Mentoring;
- Achievement Showcase;
- Workshop;
- Internal Training;
- Project Collaboration;
- Community Development.

## Featured Competitions

Card:
- poster;
- competition name;
- organizer;
- category;
- level;
- deadline;
- status.

CTA:
```text
View Competition
View All Competitions
```

## Upcoming Events

Menampilkan:
- event title;
- date;
- time;
- location;
- poster;
- short description.

## Featured Projects

Menampilkan:
- project image;
- title;
- category;
- short description;
- status;
- optional technology.

## Latest Achievements

Menampilkan:
- achievement title;
- ranking;
- competition name;
- member/team;
- year/date;
- image.

## Latest News

Menampilkan 3–4 news terbaru:
- thumbnail;
- title;
- date;
- excerpt;
- category optional.

## Current Organization Preview

Menampilkan pengurus inti:
- current period;
- president;
- vice president;
- secretary;
- treasurer.

CTA:
```text
View Organization Structure
```

## Partners

Menampilkan logo partner aktif.

## Join UVICS CTA

Jika registration open:
```text
Ready to Be Part of UVICS?
[Join UVICS]
```

Jika registration closed:
```text
Registration is currently closed.
Follow UVICS social media for the next recruitment.
```

---

# 5. Page 02 — Tentang UVICS

## Purpose

Menjelaskan identitas, sejarah, arah, dan karakter UVICS.

## Sections

```text
Hero
↓
About UVICS
↓
History
↓
Vision
↓
Mission
↓
Core Values
↓
What We Do
↓
Milestones
↓
CTA
```

## Content

### About UVICS
- organization overview;
- founding purpose;
- community/university context.

### History
- founding year;
- background;
- key development phases.

### Vision
- official vision.

### Mission
- official missions in structured list.

### Core Values
Contoh:
- Collaboration;
- Innovation;
- Growth;
- Integrity;
- Achievement;
- Community.

### What We Do
- competitions;
- mentoring;
- workshops;
- projects;
- achievement development;
- community activities.

### Milestones
Timeline perkembangan organisasi.

Admin source:
```text
Admin → Pages → About UVICS
```

---

# 6. Page 03 — Visi & Misi

## Purpose

Memberikan halaman khusus untuk arah organisasi.

## Sections

```text
Hero
↓
Vision
↓
Mission
↓
Core Principles / Values
↓
Closing CTA
```

## Information

### Vision
- official vision statement;
- optional supporting explanation.

### Mission
- numbered mission items.

### Core Principles
- principles supporting UVICS programs.

Admin source:
```text
Admin → Pages → Vision & Mission
```

---

# 7. Page 04 — Departemen

## Purpose

Menjelaskan seluruh divisi/departemen UVICS.

## Listing Page

```text
Hero
↓
Introduction
↓
Department Grid
↓
How Departments Collaborate
↓
CTA
```

## Department Card

- name;
- short description;
- icon/logo optional;
- coordinator optional;
- member count optional.

CTA:
```text
View Department
```

## Department Detail

Route:
```text
/departments/{slug}
```

Sections:
```text
Department Hero
↓
About Department
↓
Responsibilities
↓
Programs
↓
Current Coordinator
↓
Current Members
↓
Projects / Activities
↓
Achievements optional
```

Data source:
```text
Departments
Membership History
Programs
Projects
```

---

# 8. Page 05 — Struktur Organisasi

## Purpose

Menampilkan struktur UVICS berdasarkan periode.

## Sections

```text
Hero
↓
Period Selector
↓
Core Management
↓
Department Structure
↓
Members by Department
```

## Period Selector

Default ke active period.

Example:
```text
Organization Period
[2026/2027 ▼]
```

Historical period tetap dapat dibuka.

## Core Management

Recommended:
- President;
- Vice President;
- Secretary;
- Treasurer.

Card:
- photo;
- name;
- position;
- short bio optional;
- social link optional.

## Department Structure

Untuk setiap department:
- department name;
- coordinator;
- positions;
- member list;
- display order.

Empty state:
```text
Organization structure for this period is not available yet.
```

Data source:
```text
Organization Period
Departments
Positions
Membership History
Members
```

---

# 9. Page 06 — Member

## Purpose

Menampilkan anggota aktif yang diizinkan tampil secara publik.

## Sections

```text
Hero
↓
Search & Filter
↓
Member Grid
↓
Pagination
```

## Search
- name.

## Filter
- department;
- batch;
- optional organization period.

## Member Card
- photo;
- name;
- position;
- department;
- batch optional;
- LinkedIn/GitHub optional.

## Privacy

Tidak ditampilkan:
- NIM;
- phone;
- personal email;
- admin notes;
- registration answers.

Visibility rule:
```text
status = ACTIVE
public_profile = true
```

---

# 10. Page 07 — Alumni

## Purpose

Menampilkan alumni dan menjaga histori organisasi.

## Sections

```text
Hero
↓
Alumni Introduction
↓
Filter
↓
Alumni Grid
↓
Pagination
```

## Filters
- graduation year;
- organization period;
- former department.

## Alumni Card
- photo;
- name;
- former position;
- former department;
- organization period;
- current occupation optional;
- LinkedIn optional.

Visibility:
```text
status = ALUMNI
public_profile = true
```

---

# 11. Page 08 — Program

## Purpose

Menjelaskan program kerja dan aktivitas rutin UVICS.

## Sections

```text
Hero
↓
Program Introduction
↓
Program Grid
↓
Program Detail Preview
↓
CTA
```

## Possible Programs
- Competition Update;
- Competition Mentoring;
- Achievement Showcase;
- Internal Training;
- Workshop;
- Project Collaboration;
- Community Sharing.

## Program Card
- name;
- short description;
- image/icon;
- category optional;
- active status.

## Program Detail
Possible information:
- about;
- objectives;
- activities;
- target participants;
- schedule/frequency;
- related events;
- related projects.

Data source:
```text
Admin → Programs
```

---

# 12. Page 09 — Kompetisi

## Purpose

Menjadi pusat informasi kompetisi.

## Sections

```text
Hero
↓
Featured Competition
↓
Search & Filter
↓
Competition Grid
↓
Pagination
```

## Filters

Status:
```text
All
Open
Upcoming
Closed
Ongoing
Finished
```

Optional:
- category;
- level;
- individual/team.

## Competition Card
- poster;
- competition name;
- organizer;
- category;
- level;
- deadline;
- status badge.

## Competition Detail

Route:
```text
/competitions/{slug}
```

Sections:
```text
Competition Header
↓
Poster
↓
Key Information
↓
Description
↓
Eligibility
↓
Team Size
↓
Important Dates
↓
Guidebook
↓
Registration CTA
↓
Related Competitions
```

Key information:
- organizer;
- category;
- level;
- registration deadline;
- competition date;
- team size;
- status.

CTA:
```text
Register Now
```

Jika closed:
```text
Registration Closed
```

Empty state:
```text
Belum ada kompetisi yang tersedia saat ini.
```

---

# 13. Page 10 — Prestasi

## Purpose

Menampilkan pencapaian UVICS dan member/tim.

## Sections

```text
Hero
↓
Achievement Statistics optional
↓
Featured Achievements
↓
Filters
↓
Achievement Grid
↓
Pagination
```

## Filters
- year;
- competition level;
- category;
- ranking optional.

## Achievement Card
- image;
- achievement title;
- ranking;
- competition name;
- member/team;
- date/year.

## Detail Page

Route:
```text
/achievements/{slug}
```

Sections:
```text
Achievement Header
↓
Achievement Image
↓
Competition Information
↓
Result / Ranking
↓
Team Members
↓
Related Project optional
↓
Description
↓
Documentation
↓
Related Achievements
```

Data source:
```text
Achievements
Members
Projects optional
```

---

# 14. Page 11 — Project

## Purpose

Menjadi portfolio karya UVICS.

## Sections

```text
Hero
↓
Featured Projects
↓
Project Filter optional
↓
Project Grid
↓
Pagination
```

## Project Card
- cover image;
- title;
- category;
- status;
- short description;
- year.

## Project Detail

Route:
```text
/projects/{slug}
```

Sections:
```text
Project Hero
↓
Project Overview
↓
Problem / Background optional
↓
Solution
↓
Team Members
↓
Technology / Tools
↓
Gallery
↓
Project Links
↓
Related Achievements optional
↓
Related Projects
```

Possible links:
- Live Demo;
- GitHub;
- Figma;
- Documentation.

---

# 15. Page 12 — Event

## Purpose

Menampilkan kegiatan internal maupun publik UVICS.

## Sections

```text
Hero
↓
Upcoming Events
↓
Past Events
↓
Pagination
```

## Event Card
- poster;
- title;
- date;
- time;
- location;
- status;
- short description.

## Event Detail

Route:
```text
/events/{slug}
```

Sections:
```text
Event Header
↓
Poster
↓
Date & Time
↓
Location
↓
Description
↓
Registration CTA
↓
Related Gallery optional
↓
Related Events
```

Status:
```text
UPCOMING
ONGOING
FINISHED
CANCELLED
```

---

# 16. Page 13 — Berita

## Purpose

Menampilkan news, announcement, dan artikel organisasi.

## Sections

```text
Hero
↓
Featured Article
↓
Search
↓
Category Filter optional
↓
Article Grid
↓
Pagination
```

## News Card
- thumbnail;
- title;
- date;
- excerpt;
- category optional.

## News Detail

Route:
```text
/news/{slug}
```

Sections:
```text
Article Title
↓
Publication Information
↓
Cover Image
↓
Article Content
↓
Related Articles
```

Optional:
- author;
- share buttons.

Visibility:
```text
status = PUBLISHED
```

---

# 17. Page 14 — Galeri

## Purpose

Mendokumentasikan aktivitas UVICS secara visual.

## Listing

Gunakan album, bukan gambar acak.

Sections:
```text
Hero
↓
Album Grid
↓
Pagination optional
```

## Album Card
- cover image;
- album title;
- activity date;
- photo count optional.

## Album Detail

Route:
```text
/gallery/{slug}
```

Sections:
```text
Album Header
↓
Activity Description optional
↓
Photo Grid
↓
Lightbox
```

---

# 18. Page 15 — Join UVICS

## Purpose

Menjadi recruitment landing page resmi UVICS.

## Sections

```text
Hero
↓
Why Join UVICS?
↓
Benefits
↓
Departments
↓
Requirements
↓
Recruitment Process
↓
Important Dates
↓
FAQ
↓
Registration Form / CTA
```

## Hero

Example:
```text
Grow With UVICS

Learn, collaborate, compete, and build meaningful projects
with a community of motivated students.

[Register Now]
```

## Benefits
- skill development;
- mentorship;
- competition opportunities;
- project experience;
- networking;
- portfolio development;
- leadership;
- teamwork.

## Requirements
Requirement final dikelola admin.

## Recruitment Process

```text
Registration
↓
Screening
↓
Interview
↓
Announcement
↓
Onboarding
```

## Important Dates
- opening;
- closing;
- interview;
- announcement;
- onboarding.

## FAQ
Possible questions:
- apakah harus berpengalaman?;
- apakah boleh memilih lebih dari satu department?;
- apakah semua program studi dapat mendaftar?;
- apakah ada biaya?;
- bagaimana proses interview?.

## Registration State

Jika open:
- tampilkan form.

Jika closed:
```text
Registration is currently closed.

Follow UVICS social media for the next recruitment period.
```

---

# 19. Page 16 — Contact

## Purpose

Memberikan saluran komunikasi resmi UVICS.

## Sections

```text
Hero
↓
Contact Information
↓
Social Media
↓
Location optional
↓
Contact Form optional
```

Information:
- official email;
- Instagram;
- LinkedIn;
- GitHub;
- YouTube optional;
- organization address optional.

Contact form optional:
- name;
- email;
- subject;
- message.

---

# 20. Page 17 — Partners

## Purpose

Menampilkan institusi, sponsor, atau partner UVICS.

Halaman dapat berdiri sendiri atau hanya menjadi section homepage.

Information:
- logo;
- partner name;
- description optional;
- website URL.

---

# 21. Page-to-Admin Data Mapping

| Public Page | Admin Data Source |
|---|---|
| Beranda | Multiple Modules |
| Tentang UVICS | Pages |
| Visi & Misi | Pages |
| Departemen | Departments |
| Struktur Organisasi | Period + Members + Departments + Positions |
| Member | Members |
| Alumni | Members + Membership History |
| Program | Programs |
| Kompetisi | Competitions |
| Prestasi | Achievements |
| Project | Projects |
| Event | Events |
| Berita | News |
| Galeri | Gallery |
| Join UVICS | Registration Settings + Registrations |
| Contact | Website Settings |
| Partners | Partners |

---

# 22. Content Visibility Rules

## Published Content
Hanya konten publish yang muncul.

## Member
```text
status = ACTIVE
public_profile = true
```

## Alumni
```text
status = ALUMNI
public_profile = true
```

## Competitions
Competition selesai tetap dapat disimpan sebagai archive/history.

## Events
Past events tetap dapat tampil pada Past Events.

---

# 23. Empty State Standards

Examples:

### Competition
```text
Belum ada kompetisi yang tersedia saat ini.
```

### Event
```text
Belum ada event mendatang.
```

### Achievement
```text
Belum ada prestasi untuk filter yang dipilih.
```

### Project
```text
Belum ada project yang tersedia.
```

### News
```text
Belum ada berita yang dipublikasikan.
```

---

# 24. Search & Filter Standards

Recommended untuk:
- Member;
- Alumni;
- Competition;
- Achievement;
- News;
- Project optional.

Setiap filter harus:
- mudah direset;
- responsive;
- memiliki empty result state.

---

# 25. CTA Standards

Primary CTA:
```text
Join UVICS
Register Now
View Competition
Explore Projects
```

Secondary CTA:
```text
Learn More
View Details
Read More
View All
```

---

# 26. Responsive Requirements

Semua halaman harus mendukung:

```text
Mobile
Tablet
Desktop
```

Pada mobile:
- dropdown menjadi accordion/menu;
- grid berubah sesuai space;
- text tetap readable;
- CTA mudah disentuh;
- filter tidak memenuhi layar.

---

# 27. Accessibility Requirements

Minimum:
- semantic heading;
- alt text;
- keyboard navigation;
- focus state;
- sufficient color contrast;
- form labels;
- descriptive buttons.

---

# 28. SEO Requirements

Setiap halaman minimal memiliki:

```text
meta_title
meta_description
canonical_url
open_graph_title
open_graph_description
open_graph_image
```

Detail content menggunakan slug.

---

# 29. Recommended Public Routes

```text
/

/about
/vision-mission

/departments
/departments/{slug}

/organization
/members
/alumni

/programs
/programs/{slug} optional

/competitions
/competitions/{slug}

/achievements
/achievements/{slug}

/projects
/projects/{slug}

/events
/events/{slug}

/news
/news/{slug}

/gallery
/gallery/{slug}

/join
/contact
/partners optional
```

---

# 30. Homepage Content Priority

Homepage tidak menampilkan seluruh informasi penuh.

Priority:
```text
1. Identity
2. What UVICS Does
3. Current Activities
4. Achievements
5. Projects
6. Organization Preview
7. Join CTA
```

Detail diarahkan ke halaman masing-masing.

---

# 31. Main User Flows

## New Visitor

```text
Home
↓
About
↓
Program / Organization
↓
Competition / Achievement / Project
↓
Join UVICS
```

## Competition Visitor

```text
Home
↓
Competition
↓
Competition Detail
↓
Registration Link
```

## Applicant

```text
Home
↓
Join UVICS
↓
Requirements
↓
Registration Form
↓
Submission Success
```

## Portfolio Visitor

```text
Home
↓
Achievements
↓
Projects
↓
Organization
```

---

# 32. Design Direction

Public website sebaiknya:
- modern;
- youthful;
- technology-oriented;
- clean;
- professional;
- energetic;
- tidak terlalu corporate;
- menggunakan visual hierarchy yang kuat;
- menggunakan foto aktivitas nyata UVICS;
- menonjolkan achievement, competition, dan project.

---

# 33. CMS Principle

```text
CONTENT SHOULD NOT BE HARDCODED
WHEN IT IS EXPECTED TO CHANGE REGULARLY
```

Data dinamis dari admin:
- news;
- events;
- competitions;
- achievements;
- projects;
- departments;
- members;
- alumni;
- organization period;
- gallery;
- partners;
- registration state;
- website settings.

---

# 34. Final Website Structure

```text
UVICS PUBLIC WEBSITE

HOME

ABOUT
├── About UVICS
├── Vision & Mission
└── Departments
    └── Department Detail

ORGANIZATION
├── Organization Structure
├── Members
└── Alumni

PROGRAM
└── Program Detail optional

COMPETITIONS
└── Competition Detail

ACHIEVEMENTS
└── Achievement Detail

PROJECTS
└── Project Detail

INFORMATION
├── Events
│   └── Event Detail
├── News
│   └── News Detail
└── Gallery
    └── Album Detail

JOIN UVICS

CONTACT

PARTNERS
(optional standalone page)
```

---

# 35. Minimum Public Website MVP

Minimum pages:

```text
1. Beranda
2. Tentang UVICS
3. Departemen
4. Struktur Organisasi
5. Program
6. Kompetisi
7. Prestasi
8. Project
9. Event
10. Berita
11. Galeri
12. Join UVICS
13. Contact
```

Member dan Alumni public directory dapat masuk MVP jika kebijakan privasi sudah final.

---

# 36. Final Recommendation

Navbar final:

```text
Beranda
Tentang
Organisasi
Program
Kompetisi
Prestasi
Project
Informasi
Join UVICS
```

Dropdown:

```text
Tentang
├── Tentang UVICS
├── Visi & Misi
└── Departemen

Organisasi
├── Struktur Organisasi
├── Member
└── Alumni

Informasi
├── Event
├── Berita
└── Galeri
```

Struktur ini menjaga website tetap mudah dipahami, scalable, mendukung CMS, recruitment, dokumentasi achievement dan project, serta histori member dan alumni.

---

**End of Document**
