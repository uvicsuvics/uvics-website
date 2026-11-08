import type { PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";
import type { PublicImage } from "@/lib/media/public-image";

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

// Nama pengurus masih placeholder. Posisi dan urutannya mengikuti PRD §13 dan §31: Ketua,
// Bendahara, Sekretaris, lalu Steering Helper → Koordinator → PIC → Anggota per departemen.
// Tidak ada Wakil Ketua; Advisor belum ditampilkan sampai T07 diputuskan.
export const UVICS_MEMBERSHIPS: MembershipItem[] = [
  { periodId: "period-2025-2026", full_name: "Dave Sumampouw", photo: null, position_name: "Ketua", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Matthew Tambuwun", photo: null, position_name: "Bendahara", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Sarah Manoppo", photo: null, position_name: "Sekretaris", department_name: "Pengurus Inti" },
  { periodId: "period-2025-2026", full_name: "Kezia Sondakh", photo: null, position_name: "Steering Helper", department_name: "Public Relations" },
  { periodId: "period-2025-2026", full_name: "Rachel Runtu", photo: null, position_name: "Koordinator", department_name: "Public Relations" },
  { periodId: "period-2025-2026", full_name: "David Tumewu", photo: null, position_name: "PIC", department_name: "Public Relations" },
  { periodId: "period-2025-2026", full_name: "Grace Mamesah", photo: null, position_name: "Anggota", department_name: "Public Relations" },
  { periodId: "period-2025-2026", full_name: "Andre Kaunang", photo: null, position_name: "Steering Helper", department_name: "External Affairs" },
  { periodId: "period-2025-2026", full_name: "Samuel Mandagi", photo: null, position_name: "Koordinator", department_name: "External Affairs" },
  { periodId: "period-2025-2026", full_name: "Timothy Senduk", photo: null, position_name: "PIC", department_name: "External Affairs" },
  { periodId: "period-2025-2026", full_name: "Natalie Pinontoan", photo: null, position_name: "Anggota", department_name: "External Affairs" },
  { periodId: "period-2025-2026", full_name: "Daniel Lumempouw", photo: null, position_name: "Steering Helper", department_name: "Web Development" },
  { periodId: "period-2025-2026", full_name: "Bryan Wowor", photo: null, position_name: "Koordinator", department_name: "Web Development" },
  { periodId: "period-2025-2026", full_name: "Christian Pangemanan", photo: null, position_name: "PIC", department_name: "Web Development" },
  { periodId: "period-2025-2026", full_name: "Jessica Runtu", photo: null, position_name: "Anggota", department_name: "Web Development" },
  { periodId: "period-2025-2026", full_name: "Joshua Rumengan", photo: null, position_name: "Steering Helper", department_name: "Competition Handler" },
  { periodId: "period-2025-2026", full_name: "Michael Rondonuwu", photo: null, position_name: "Koordinator", department_name: "Competition Handler" },
  { periodId: "period-2025-2026", full_name: "Kevin Kalangi", photo: null, position_name: "PIC", department_name: "Competition Handler" },
  { periodId: "period-2025-2026", full_name: "Priscilla Walangitan", photo: null, position_name: "Anggota", department_name: "Competition Handler" },
  { periodId: "period-2025-2026", full_name: "Yohanes Wenas", photo: null, position_name: "Steering Helper", department_name: "Editor" },
  { periodId: "period-2025-2026", full_name: "Gabriella Polii", photo: null, position_name: "Koordinator", department_name: "Editor" },
  { periodId: "period-2025-2026", full_name: "Valerie Kalesaran", photo: null, position_name: "PIC", department_name: "Editor" },
  { periodId: "period-2025-2026", full_name: "Nathania Tampi", photo: null, position_name: "Anggota", department_name: "Editor" },
  { periodId: "period-2024-2025", full_name: "Andre Kaunang", photo: null, position_name: "Ketua", department_name: "Pengurus Inti" },
  { periodId: "period-2024-2025", full_name: "Dave Sumampouw", photo: null, position_name: "Koordinator", department_name: "Competition Handler" },
  { periodId: "period-2024-2025", full_name: "Bryan Wowor", photo: null, position_name: "Koordinator", department_name: "Web Development" },
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
    description:
      "Pengurus inti terdiri dari Ketua, Bendahara, dan Sekretaris. Setiap departemen diisi Steering Helper, Koordinator, PIC (Person In Charge), dan Anggota.",
    periodLabel: "Pilih periode kepengurusan",
    emptyMessage: "Struktur organisasi untuk periode ini belum tersedia.",
  },
};
