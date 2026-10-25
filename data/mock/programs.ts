import type { ClosingCtaContent, PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";

export interface ProgramItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: "Kompetisi" | "Pelatihan" | "Inovasi" | "Showcase" | "Komunitas";
  frequency: string;
  iconName: "Trophy" | "Laptop" | "Rocket" | "Presentation" | "Compass" | "Users";
  keyOutput: string;
  targetAudience: string;
  badgeText?: string;
  stepNumber: string;
  /** Kolom `programs.image`. */
  image: string;
}

export const UVICS_PROGRAMS: ProgramItem[] = [
  {
    id: "prog-comp-mentoring",
    slug: "competition-mentoring",
    title: "Competition Mentoring & Intensive Prep",
    tagline: "Bimbingan Intensif Menuju Panggung Juara",
    description: "Pendampingan terarah dari mentor berpengalaman dan alumni pemenang lomba untuk mematangkan konsep, pengujian prototipe, serta simulasi pitching delegasi UVICS di ajang nasional.",
    category: "Kompetisi",
    frequency: "Mingguan & Menjelang Lomba",
    iconName: "Trophy",
    keyOutput: "15+ Juara Nasional & GEMASTIK Finalists",
    targetAudience: "Delegasi Lomba & Anggota Tertarik Kompetisi",
    badgeText: "Program Unggulan",
    stepNumber: "01",
    image: "/images/img/foto-1.webp",
  },
  {
    id: "prog-internal-workshops",
    slug: "internal-workshops",
    title: "Internal Tech Workshops & Bootcamps",
    tagline: "Kurikulum Praktis Hands-on Standar Industri",
    description: "Sesi pelatihan berkala yang mengupas tuntas framework modern (Next.js, Tailwind), cloud architecture, rekayasa model AI/ML, dan praktik clean code yang jarang diajarkan di kelas reguler.",
    category: "Pelatihan",
    frequency: "Dwi-mingguan (Bi-weekly)",
    iconName: "Laptop",
    keyOutput: "Penguasaan Tech Stack Modern & Portofolio",
    targetAudience: "Seluruh Anggota Aktif Lintas Angkatan",
    badgeText: "Eksplorasi Skill",
    stepNumber: "02",
    image: "/images/img/foto-3.webp",
  },
  {
    id: "prog-project-incubation",
    slug: "project-collaboration",
    title: "Project Collaboration & Incubation",
    tagline: "Kolaborasi Nyata dari Gagasan hingga Rilis",
    description: "Inkubator proyek perangkat lunak di mana developer, UI/UX designer, dan researcher bergabung dalam satu tim untuk membangun produk digital terapan untuk kampus dan ekosistem open-source.",
    category: "Inovasi",
    frequency: "Semesteran (Proyek Berjalan)",
    iconName: "Rocket",
    keyOutput: "28+ Solusi Digital Terapan & Repo Publik",
    targetAudience: "Tim Multi-Disiplin Departemen",
    badgeText: "Produk Nyata",
    stepNumber: "03",
    image: "/images/img/foto-5.webp",
  },
  {
    id: "prog-showcase-days",
    slug: "achievement-showcase",
    title: "Achievement & Demo Showcase Day",
    tagline: "Apresiasi Karya & Perayaan Prestasi Kampus",
    description: "Pameran teknologi semesteran yang menjadi etalase hasil riset proyek mandiri dan presentasi prestasi kejuaraan di hadapan sivitas akademika UNKLAB, dosen, dan jejaring industri.",
    category: "Showcase",
    frequency: "Akhir Setiap Semester",
    iconName: "Presentation",
    keyOutput: "Pameran Terbuka & Networking Industri",
    targetAudience: "Sivitas Akademika UNKLAB & Publik",
    badgeText: "Eksibisi Publik",
    stepNumber: "04",
    image: "/images/img/foto-14.webp",
  },
  {
    id: "prog-comp-intelligence",
    slug: "competition-updates",
    title: "Competition Intelligence & Curation",
    tagline: "Pusat Kurasi Peluang Lomba Terpercaya",
    description: "Pemantauan aktif informasi kejuaraan teknologi bereputasi, diseminasi jadwal tenggat, bedah buku panduan teknis (guidebook), serta fasilitasi pembentukan tim kolaboratif lintas angkatan.",
    category: "Kompetisi",
    frequency: "Real-time & Pembaruan Mingguan",
    iconName: "Compass",
    keyOutput: "Akses Cepat Guidebook & Pembentukan Tim",
    targetAudience: "Seluruh Mahasiswa Fakultas Ilmu Komputer",
    badgeText: "Informasi Lomba",
    stepNumber: "05",
    image: "/images/img/foto-10.webp",
  },
  {
    id: "prog-community-talks",
    slug: "community-sharing",
    title: "Community Tech Talk & Alumni Connect",
    tagline: "Ruang Diskusi & Berbagi Pengalaman Industri",
    description: "Forum diskusi santai mengenai tren rekayasa perangkat lunak global, sesi bedah teknologi mutakhir, serta bimbingan karier eksklusif bersama alumni UVICS yang bekerja di tech enterprise terkemuka.",
    category: "Komunitas",
    frequency: "Bulanan",
    iconName: "Users",
    keyOutput: "Jejaring Alumni & Insight Karier Industri",
    targetAudience: "Anggota, Alumni, & Mahasiswa Baru",
    badgeText: "Jejaring & Karier",
    stepNumber: "06",
    image: "/images/img/foto-13.webp",
  },
];

export interface ProgramsPageContent {
  meta: PageMeta;
  hero: PageHeroContent;
  list: SectionHeading & { linkLabel: string; emptyMessage: string };
  cta: ClosingCtaContent;
}

export const UVICS_PROGRAMS_PAGE: ProgramsPageContent = {
  meta: {
    title: "Program | UVICS",
    description:
      "Program pembinaan UVICS: pendampingan kompetisi, workshop teknologi, inkubasi proyek, dan kegiatan komunitas.",
  },
  hero: {
    title: "Program Kerja",
    titleHighlight: "UVICS",
    description:
      "Kegiatan rutin yang membina kemampuan teknis, kolaborasi, dan kesiapan kompetisi anggota UVICS.",
    image: {
      src: "/images/img/foto-4.webp",
      alt: "Anggota UVICS berfoto bersama di halaman rumput kampus Universitas Klabat",
    },
  },
  list: {
    title: "Program yang kami",
    titleHighlight: "jalankan",
    description:
      "Setiap program berjalan berkesinambungan, dari penguatan dasar hingga persiapan kompetisi dan proyek nyata.",
    linkLabel: "Lihat program",
    emptyMessage: "Belum ada program yang tersedia saat ini.",
  },
  cta: {
    title: "Ingin ikut program UVICS?",
    description: "Bergabunglah sebagai anggota untuk mengikuti program pembinaan dan kegiatan departemen.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Lihat departemen", href: "/departments" },
  },
};
