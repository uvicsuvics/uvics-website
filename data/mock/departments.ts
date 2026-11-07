import type { ClosingCtaContent, PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";

/** Baris `departments`. Departemen resmi Achievers Guidebook 2026 (PRD §14). */
export interface DepartmentItem {
  id: string;
  slug: string;
  name: string;
  description: string;
}

// Internal Development dan Officer tidak dimasukkan sampai T07 diputuskan.
export const UVICS_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-public-relations",
    slug: "public-relations",
    name: "Public Relations",
    description:
      "Mengelola konten dan interaksi media sosial UVICS lewat program UVICS Activity Content, Educational Content, Fun Trends Content, Interact with Followers, dan Content Summary.",
  },
  {
    id: "dept-external-affairs",
    slug: "external-affairs",
    name: "External Affairs",
    // Program dan deskripsi belum dijabarkan di guidebook (T07).
    description: "Deskripsi dan program departemen External Affairs sedang disiapkan.",
  },
  {
    id: "dept-web-development",
    slug: "web-development",
    name: "Web Development",
    description:
      "Membangun website resmi UVICS dan menjadi wadah belajar serta diskusi web development lewat program Website Building dan DevHub.",
  },
  {
    id: "dept-competition-handler",
    slug: "competition-handler",
    name: "Competition Handler",
    description:
      "Mendampingi tim lomba dan mencarikan lomba yang sesuai kebutuhan tim lewat program Mentor Community dan Competition Finder.",
  },
  {
    id: "dept-editor",
    slug: "editor",
    name: "Editor",
    description:
      "Menyiapkan template konten, menyunting konten dan dokumen organisasi, serta mendokumentasikan kegiatan lewat program Template dan Editing & Documentation.",
  },
];

export interface DepartmentsPageContent {
  meta: PageMeta;
  /** `image` hanya dipakai hero halaman detail; listing memakai hero teks. */
  hero: PageHeroContent & { eyebrow: string; breadcrumbHome: string };
  stats: { departments: string; members: string; period: string };
  list: SectionHeading & {
    coordinatorLabel: string;
    linkLabel: string;
    emptyMessage: string;
    /** Diikuti nama periode aktif. */
    periodNote: string;
    membersSuffix: string;
  };
  cta: ClosingCtaContent;
  /** Halaman /departments/{slug}; judul pengurus diakhiri nama periode aktif. */
  detail: {
    /** Diikuti nomor urut resmi, mis. "Departemen 03". */
    eyebrowPrefix: string;
    breadcrumbParent: string;
    stats: { coordinator: string; members: string; period: string };
    programs: SectionHeading & { emptyMessage: string; linkLabel: string };
    membersTitle: string;
    membersEmptyMessage: string;
    others: SectionHeading;
    cta: ClosingCtaContent;
  };
}

export const UVICS_DEPARTMENTS_PAGE: DepartmentsPageContent = {
  meta: {
    title: "Departemen | UVICS",
    description: "Lima departemen UVICS beserta program dan pengurusnya di Universitas Klabat.",
  },
  hero: {
    eyebrow: "Struktur organisasi",
    breadcrumbHome: "Beranda",
    title: "Departemen",
    titleHighlight: "UVICS",
    description:
      "Lima departemen yang menjalankan program kerja UVICS, dari konten media sosial dan website hingga pendampingan lomba.",
    image: {
      src: "/images/img/foto-14.webp",
      alt: "Anggota UVICS berseragam biru berpose di bawah pepohonan kampus Universitas Klabat",
    },
  },
  stats: { departments: "Departemen", members: "Pengurus departemen", period: "Periode aktif" },
  list: {
    title: "Departemen yang menjalankan",
    titleHighlight: "program UVICS",
    coordinatorLabel: "Koordinator",
    linkLabel: "Lihat departemen",
    emptyMessage: "Belum ada departemen yang tersedia saat ini.",
    periodNote: "Koordinator periode",
    membersSuffix: "pengurus",
  },
  cta: {
    title: "Tertarik bergabung dengan UVICS?",
    description: "Daftar sebagai anggota UVICS dan pilih departemen sesuai minatmu saat pendaftaran.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Lihat struktur organisasi", href: "/organization" },
  },
  detail: {
    eyebrowPrefix: "Departemen",
    breadcrumbParent: "Departemen",
    stats: { coordinator: "Koordinator", members: "Pengurus", period: "Periode aktif" },
    programs: {
      title: "Program",
      titleHighlight: "departemen",
      emptyMessage: "Program departemen ini belum dijabarkan.",
      linkLabel: "Lihat program",
    },
    membersTitle: "Pengurus periode",
    membersEmptyMessage: "Belum ada data pengurus untuk departemen ini.",
    others: { title: "Departemen", titleHighlight: "lainnya" },
    cta: {
      title: "Tertarik bergabung dengan departemen ini?",
      description: "Daftar sebagai anggota UVICS dan pilih departemen sesuai minatmu saat pendaftaran.",
      primaryCta: { label: "Join UVICS", href: "/join" },
      secondaryCta: { label: "Lihat semua departemen", href: "/departments" },
    },
  },
};
