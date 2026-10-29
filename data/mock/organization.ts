import type { PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";
import type { PublicImage } from "@/lib/media/public-image";

export interface OfficerItem {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  major: string;
  batch: string;
  image: string;
  period: string;
  quote: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface CabinetPeriod {
  periodName: string;
  cabinetName: string;
  tagline: string;
  description: string;
  officers: OfficerItem[];
}

export const CURRENT_CABINET: CabinetPeriod = {
  periodName: "Periode 2025 / 2026",
  cabinetName: "Kabinet Sinergi Virtu",
  tagline: "Inovasi Berintegritas, Dedikasi Tanpa Batas",
  description:
    "Badan Pengurus Harian (BPH) yang mengemban amanah kepemimpinan UVICS periode berjalan, mengorkestrasi program riset, kompetisi nasional, dan pengembangan talenta komputasi Universitas Klabat.",
  officers: [
    {
      id: "officer-president",
      name: "Dave Sumampouw",
      role: "Ketua Umum",
      roleTitle: "President of UVICS",
      major: "Informatika '23",
      batch: "Batch 2023",
      image: "/images/img/foto-1.webp",
      period: "2025/2026",
      quote: "Membangun budaya riset dan engineering yang berdaya saing global dengan berlandaskan integritas Kristiani.",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
    },
    {
      id: "officer-vice-president",
      name: "Kezia Sondakh",
      role: "Wakil Ketua Umum",
      roleTitle: "Vice President of UVICS",
      major: "Sistem Informasi '23",
      batch: "Batch 2023",
      image: "/images/img/foto-11.webp",
      period: "2025/2026",
      quote: "Menghubungkan potensi setiap anggota dengan ekosistem kompetisi dan kolaborasi industri yang nyata.",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
    },
    {
      id: "officer-secretary",
      name: "Sarah Manoppo",
      role: "Sekretaris Umum",
      roleTitle: "General Secretary",
      major: "Informatika '24",
      batch: "Batch 2024",
      image: "/images/img/foto-2.webp",
      period: "2025/2026",
      quote: "Mewujudkan tata kelola organisasi yang akuntabel, terdokumentasi rapi, dan adaptif.",
      linkedinUrl: "https://linkedin.com",
    },
    {
      id: "officer-treasurer",
      name: "Matthew Tambuwun",
      role: "Bendahara Umum",
      roleTitle: "Chief Financial Officer",
      major: "Sistem Informasi '24",
      batch: "Batch 2024",
      image: "/images/img/foto-10.webp",
      period: "2025/2026",
      quote: "Mengoptimalkan alokasi dana organisasi untuk mendukung pendanaan riset, delegasi lomba, dan karya mahasiswa.",
      linkedinUrl: "https://linkedin.com",
      githubUrl: "https://github.com",
    },
  ],
};

/** Baris `organization_periods`. Status disimpan admin (T06), bukan dihitung dari tanggal. */
export interface OrganizationPeriodItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "ENDED";
}

/**
 * Baris gabungan membership + member + position + department, berbentuk input
 * `toPublicMember` (D02). Pengurus inti memakai departemen "Pengurus Inti" sampai U01 diputuskan.
 */
export interface MembershipItem {
  periodId: string;
  full_name: string;
  photo: PublicImage | null;
  position_name: string;
  department_name: string;
}

export const UVICS_ORGANIZATION_PERIODS: OrganizationPeriodItem[] = [
  { id: "period-2026-2027", name: "2026/2027", startDate: "2026-08-01", endDate: "2027-07-31", status: "UPCOMING" },
  { id: "period-2025-2026", name: "2025/2026", startDate: "2025-08-01", endDate: "2026-07-31", status: "ACTIVE" },
  { id: "period-2024-2025", name: "2024/2025", startDate: "2024-08-01", endDate: "2025-07-31", status: "ENDED" },
];

// Nama pengurus inti sama dengan CURRENT_CABINET, koordinator sama dengan UVICS_DEPARTMENTS.
export const UVICS_MEMBERSHIPS: MembershipItem[] = [
  { periodId: "period-2025-2026", full_name: "Dave Sumampouw", photo: null, position_name: "Ketua Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Kezia Sondakh", photo: null, position_name: "Wakil Ketua Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Sarah Manoppo", photo: null, position_name: "Sekretaris Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Matthew Tambuwun", photo: null, position_name: "Bendahara Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Bryan Wowor", photo: null, position_name: "Koordinator", department_name: "Software Engineering" },
  { periodId: "period-2025-2026", full_name: "Christian Pangemanan", photo: null, position_name: "Anggota", department_name: "Software Engineering" },
  { periodId: "period-2025-2026", full_name: "Jessica Runtu", photo: null, position_name: "Anggota", department_name: "Software Engineering" },
  { periodId: "period-2025-2026", full_name: "Nathania Tampi", photo: null, position_name: "Koordinator", department_name: "Artificial Intelligence & Data" },
  { periodId: "period-2025-2026", full_name: "Priscilla Walangitan", photo: null, position_name: "Anggota", department_name: "Artificial Intelligence & Data" },
  { periodId: "period-2025-2026", full_name: "Gabriella Polii", photo: null, position_name: "Koordinator", department_name: "UI/UX & Product Design" },
  { periodId: "period-2025-2026", full_name: "Valerie Kalesaran", photo: null, position_name: "Anggota", department_name: "UI/UX & Product Design" },
  { periodId: "period-2025-2026", full_name: "Michael Rondonuwu", photo: null, position_name: "Koordinator", department_name: "Competitive Programming" },
  { periodId: "period-2025-2026", full_name: "Samuel Mandagi", photo: null, position_name: "Anggota", department_name: "Competitive Programming" },
  { periodId: "period-2025-2026", full_name: "Kevin Kalangi", photo: null, position_name: "Koordinator", department_name: "Cybersecurity & Cloud" },
  { periodId: "period-2025-2026", full_name: "Timothy Senduk", photo: null, position_name: "Anggota", department_name: "Cybersecurity & Cloud" },
  { periodId: "period-2025-2026", full_name: "Rachel Runtu", photo: null, position_name: "Koordinator", department_name: "PR & Community Development" },
  { periodId: "period-2025-2026", full_name: "David Tumewu", photo: null, position_name: "Anggota", department_name: "PR & Community Development" },
  { periodId: "period-2024-2025", full_name: "Andre Kaunang", photo: null, position_name: "Ketua Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2024-2025", full_name: "Dave Sumampouw", photo: null, position_name: "Wakil Ketua Umum", department_name: "Pengurus Inti" },
  { periodId: "period-2024-2025", full_name: "Bryan Wowor", photo: null, position_name: "Koordinator", department_name: "Software Engineering" },
  { periodId: "period-2024-2025", full_name: "Kevin Kalangi", photo: null, position_name: "Koordinator", department_name: "Cybersecurity & Cloud" },
];

export interface OrganizationPageContent {
  meta: PageMeta;
  hero: PageHeroContent;
  structure: SectionHeading & { periodLabel: string; emptyMessage: string };
}

export const UVICS_ORGANIZATION_PAGE: OrganizationPageContent = {
  meta: {
    title: "Struktur Organisasi | UVICS",
    description: "Pengurus inti dan pengurus departemen UVICS untuk setiap periode kepengurusan.",
  },
  hero: {
    title: "Struktur",
    titleHighlight: "Organisasi",
    description: "Pengurus inti dan pengurus departemen yang menjalankan program UVICS di setiap periode.",
    image: {
      src: "/images/img/foto-10.webp",
      alt: "Enam pengurus UVICS berseragam biru berpose di tangga kampus Universitas Klabat",
    },
  },
  structure: {
    title: "Kepengurusan",
    titleHighlight: "per periode",
    periodLabel: "Pilih periode kepengurusan",
    emptyMessage: "Struktur organisasi untuk periode ini belum tersedia.",
  },
};
