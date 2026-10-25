import type { ClosingCtaContent, PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";

/** Baris `programs`. Kategori, ikon, dan relasi ke departemen menunggu U05. */
export interface ProgramItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Kolom `programs.image`. */
  image: string;
}

// Program resmi Achievers Guidebook 2026 (PRD §21A). Enam program pertama tampil di beranda.
export const UVICS_PROGRAMS: ProgramItem[] = [
  {
    id: "prog-mentor-community",
    slug: "mentor-community",
    title: "Mentor Community",
    description: "Pendampingan tim lomba dan solusi atas kendala yang dihadapi selama persiapan lomba.",
    image: "/images/img/foto-1.webp",
  },
  {
    id: "prog-competition-finder",
    slug: "competition-finder",
    title: "Competition Finder",
    description: "Mencarikan lomba yang sesuai dengan permintaan tim yang sudah terbentuk.",
    image: "/images/img/foto-10.webp",
  },
  {
    id: "prog-kabel",
    slug: "kabel",
    title: "KABEL (Kamar Belajar)",
    description: "Belajar bersama lewat sesi sharing dari expert sesuai topik, juga memanfaatkan platform MySkill.",
    image: "/images/img/foto-3.webp",
  },
  {
    id: "prog-uvics-vibes",
    slug: "uvics-vibes",
    title: "UVICS Vibes",
    description: "Webinar atau seminar tentang teknologi dan pengembangan diri.",
    image: "/images/img/foto-13.webp",
  },
  {
    id: "prog-uvics-impact",
    slug: "uvics-impact",
    title: "UVICS Impact",
    description: "Kampanye edukasi kepada masyarakat tentang isu tertentu, diadakan tiga bulan sekali.",
    image: "/images/img/foto-14.webp",
  },
  {
    id: "prog-devhub",
    slug: "devhub",
    title: "DevHub",
    description: "Wadah belajar dan diskusi seputar web development serta proyek departemen.",
    image: "/images/img/foto-5.webp",
  },
  {
    id: "prog-uvics-activity-content",
    slug: "uvics-activity-content",
    title: "UVICS Activity Content",
    description: "Video reels pengenalan program atau event UVICS yang sedang berjalan.",
    image: "/images/img/foto-2.webp",
  },
  {
    id: "prog-educational-content",
    slug: "educational-content",
    title: "Educational Content",
    description: "Konten edukasi seputar karier dan perkuliahan.",
    image: "/images/img/foto-4.webp",
  },
  {
    id: "prog-fun-trends-content",
    slug: "fun-trends-content",
    title: "Fun Trends Content",
    description: "Konten kreatif tentang keseruan internal anggota dalam bentuk reels atau story.",
    image: "/images/img/foto-7.webp",
  },
  {
    id: "prog-interact-with-followers",
    slug: "interact-with-followers",
    title: "Interact with Followers",
    description: "Konten interaksi di Instagram Story dan live report kegiatan.",
    image: "/images/img/foto-8.webp",
  },
  {
    id: "prog-content-summary",
    slug: "content-summary",
    title: "Content Summary",
    description: "Rangkuman pembelajaran dari setiap event, misalnya KABEL dan webinar.",
    image: "/images/img/foto-9.webp",
  },
  {
    id: "prog-template",
    slug: "template",
    title: "Template",
    description: "Template Instagram dan program lain, termasuk untuk hari peringatan.",
    image: "/images/img/foto-11.webp",
  },
  {
    id: "prog-editing-documentation",
    slug: "editing-documentation",
    title: "Editing & Documentation",
    description: "Menyunting konten atau dokumen organisasi dan mendokumentasikan kegiatan.",
    image: "/images/img/foto-12.webp",
  },
  {
    id: "prog-website-building",
    slug: "website-building",
    title: "Website Building",
    description: "Pembuatan website resmi organisasi UVICS.",
    image: "/images/img/foto-16.webp",
  },
  {
    id: "prog-bonding",
    slug: "bonding",
    title: "Bonding",
    description: "Kegiatan untuk memperkuat kebersamaan antaranggota.",
    image: "/images/img/foto-17.webp",
  },
  {
    id: "prog-champion-of-change",
    slug: "champion-of-change",
    title: "Champion of Change (CoC)",
    description: "Apresiasi bagi anggota yang aktif berkontribusi di acara dan kegiatan development.",
    image: "/images/img/foto15.webp",
  },
  {
    id: "prog-perlombaan",
    slug: "perlombaan",
    title: "Perlombaan",
    description: "Merancang dan menyelenggarakan kompetisi secara profesional.",
    image: "/images/img/foto-4.webp",
  },
];

export interface ProgramsPageContent {
  meta: PageMeta;
  hero: PageHeroContent;
  list: SectionHeading & { linkLabel: string; emptyMessage: string };
  cta: ClosingCtaContent;
  /** Halaman /programs/{slug}. */
  detail: { cta: ClosingCtaContent };
}

export const UVICS_PROGRAMS_PAGE: ProgramsPageContent = {
  meta: {
    title: "Program | UVICS",
    description:
      "Program kerja UVICS: pendampingan dan pencarian lomba, belajar bersama, konten media sosial, website, dan kegiatan untuk masyarakat.",
  },
  hero: {
    title: "Program Kerja",
    titleHighlight: "UVICS",
    description:
      "Kegiatan rutin yang membantu anggota UVICS bertumbuh, berkarya, dan berprestasi bersama di perlombaan.",
    image: {
      src: "/images/img/foto-4.webp",
      alt: "Anggota UVICS berfoto bersama di halaman rumput kampus Universitas Klabat",
    },
  },
  list: {
    title: "Program yang kami",
    titleHighlight: "jalankan",
    description:
      "Dari pendampingan lomba dan belajar bersama hingga konten media sosial dan kampanye edukasi untuk masyarakat.",
    linkLabel: "Lihat program",
    emptyMessage: "Belum ada program yang tersedia saat ini.",
  },
  cta: {
    title: "Ingin ikut program UVICS?",
    description: "Bergabunglah sebagai anggota untuk mengikuti program dan kegiatan departemen UVICS.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Lihat departemen", href: "/departments" },
  },
  detail: {
    cta: {
      title: "Ingin ikut program ini?",
      description: "Bergabunglah sebagai anggota UVICS untuk mengikuti program dan kegiatan departemen.",
      primaryCta: { label: "Join UVICS", href: "/join" },
      secondaryCta: { label: "Lihat semua program", href: "/programs" },
    },
  },
};
