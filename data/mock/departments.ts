import type { ClosingCtaContent, PageHeroContent, PageMeta, SectionHeading } from "@/data/mock/about";

export interface DepartmentItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  iconName: "Code2" | "BrainCircuit" | "Palette" | "Trophy" | "ShieldCheck" | "Megaphone";
  coordinator: string;
  coordinatorRole: string;
  memberCount: number;
  projectsCount: number;
  focusAreas: string[];
  featured?: boolean;
}

export const UVICS_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-se",
    slug: "software-engineering",
    name: "Software Engineering",
    shortDescription: "Pengembangan web scalable, mobile apps, dan arsitektur backend modern berstandar industri.",
    description: "Departemen Software Engineering berfokus pada penguasaan siklus hidup pengembangan perangkat lunak modern, mulai dari fullstack web development, arsitektur microservices, hingga pengembangan aplikasi mobile native dan multiplatform.",
    iconName: "Code2",
    coordinator: "Bryan Wowor",
    coordinatorRole: "Head of Software Engineering",
    memberCount: 28,
    projectsCount: 14,
    focusAreas: ["Fullstack Web", "Mobile Apps", "Cloud APIs", "Open Source"],
    featured: true,
  },
  {
    id: "dept-ai",
    slug: "artificial-intelligence",
    name: "Artificial Intelligence & Data",
    shortDescription: "Riset machine learning, NLP, computer vision, dan rekayasa data untuk solusi komputasi cerdas.",
    description: "Departemen AI & Data Science mengeksplorasi algoritma kecerdasan buatan terapan, deep learning, dan pengolahan data berskala besar untuk memecahkan tantangan nyata di bidang kesehatan, pendidikan, dan otomasi.",
    iconName: "BrainCircuit",
    coordinator: "Nathania Tampi",
    coordinatorRole: "Head of AI & Data",
    memberCount: 22,
    projectsCount: 9,
    focusAreas: ["Deep Learning", "Computer Vision", "NLP", "Predictive Analytics"],
    featured: true,
  },
  {
    id: "dept-uiux",
    slug: "ui-ux-design",
    name: "UI/UX & Product Design",
    shortDescription: "Riset pengalaman pengguna, interaksi digital intuitif, dan implementasi design system presisi.",
    description: "Departemen UI/UX Design memadukan empati pengguna, riset interaksi, dan estetika visual tingkat tinggi untuk merancang antarmuka digital yang memikat, fungsional, dan memenuhi standar aksesibilitas internasional.",
    iconName: "Palette",
    coordinator: "Gabriella Polii",
    coordinatorRole: "Head of Product Design",
    memberCount: 16,
    projectsCount: 12,
    focusAreas: ["Design Systems", "User Research", "Wireframing", "Interaction Design"],
    featured: false,
  },
  {
    id: "dept-cp",
    slug: "competitive-programming",
    name: "Competitive Programming",
    shortDescription: "Pelatihan algoritma tingkat lanjut, struktur data kompleks, dan persiapan lomba komputasi nasional.",
    description: "Departemen Competitive Programming membina logika pemecahan masalah secara intensif untuk mempersiapkan delegasi UVICS di ajang bergengsi seperti ICPC, GEMASTIK, dan hackathon tingkat nasional.",
    iconName: "Trophy",
    coordinator: "Michael Rondonuwu",
    coordinatorRole: "Head of Competitive Programming",
    memberCount: 18,
    projectsCount: 6,
    focusAreas: ["Algorithms", "Data Structures", "Math Modeling", "ICPC Prep"],
    featured: false,
  },
  {
    id: "dept-cyber",
    slug: "cybersecurity-cloud",
    name: "Cybersecurity & Cloud",
    shortDescription: "Keamanan jaringan, ethical hacking, otomasi CI/CD, dan manajemen infrastruktur cloud modern.",
    description: "Departemen Cybersecurity & Cloud Infrastructure membekali anggota dengan keahlian pengujian penetrasi etis, audit kerentanan sistem, serta orkestrasi container dan DevOps pada ekosistem cloud terkemuka.",
    iconName: "ShieldCheck",
    coordinator: "Kevin Kalangi",
    coordinatorRole: "Head of Cloud & Security",
    memberCount: 14,
    projectsCount: 8,
    focusAreas: ["DevOps / CI-CD", "Cloud Architecture", "Network Defense", "Penetration Testing"],
    featured: false,
  },
  {
    id: "dept-pr",
    slug: "public-relations",
    name: "PR & Community Development",
    shortDescription: "Pengembangan relasi industri teknologi, kemitraan strategis, workshop, dan publikasi organisasi.",
    description: "Departemen Public Relations & Community memegang peranan vital dalam membangun citra UVICS, menginisiasi kolaborasi dengan industri teknologi dan komunitas developer eksternal, serta menyelenggarakan workshop edukatif.",
    iconName: "Megaphone",
    coordinator: "Rachel Runtu",
    coordinatorRole: "Head of Public Relations",
    memberCount: 12,
    projectsCount: 15,
    focusAreas: ["Tech Partnerships", "Community Events", "Branding", "Media Relations"],
    featured: false,
  },
];

export interface DepartmentsPageContent {
  meta: PageMeta;
  hero: PageHeroContent;
  list: SectionHeading & { coordinatorLabel: string; linkLabel: string; emptyMessage: string };
  /** Halaman /departments/{slug}; judul pengurus diakhiri nama periode aktif. */
  detail: { membersTitle: string; membersEmptyMessage: string; cta: ClosingCtaContent };
}

export const UVICS_DEPARTMENTS_PAGE: DepartmentsPageContent = {
  meta: {
    title: "Departemen | UVICS",
    description: "Departemen UVICS beserta bidang kajian dan pengurusnya di Universitas Klabat.",
  },
  hero: {
    title: "Departemen",
    titleHighlight: "UVICS",
    description:
      "Departemen menjadi wadah anggota mendalami bidang teknologi tertentu sekaligus menjalankan program organisasi.",
    image: {
      src: "/images/img/foto-14.webp",
      alt: "Anggota UVICS berseragam biru berpose di bawah pepohonan kampus Universitas Klabat",
    },
  },
  list: {
    title: "Bidang yang bisa",
    titleHighlight: "kamu tekuni",
    coordinatorLabel: "Koordinator",
    linkLabel: "Lihat departemen",
    emptyMessage: "Belum ada departemen yang tersedia saat ini.",
  },
  detail: {
    membersTitle: "Pengurus periode",
    membersEmptyMessage: "Belum ada data pengurus untuk departemen ini.",
    cta: {
      title: "Tertarik bergabung dengan departemen ini?",
      description: "Daftar sebagai anggota UVICS dan pilih departemen sesuai minatmu saat pendaftaran.",
      primaryCta: { label: "Join UVICS", href: "/join" },
      secondaryCta: { label: "Lihat semua departemen", href: "/departments" },
    },
  },
};
