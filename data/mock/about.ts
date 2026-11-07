// Konten sementara untuk Admin → Pages → About UVICS dan Vision & Mission.
// Sumber: Achievers Guidebook 2026 (PRD §12.1, D22). Tahun berdiri 2024 dikonfirmasi pengguna.
// Statistik, narasi sejarah, dan tonggak per tahun belum ada datanya; jangan dikarang.

export interface CtaLink {
  label: string;
  href: string;
}

/** meta_title dan meta_description halaman (spesifikasi §28). */
export interface PageMeta {
  title: string;
  description: string;
}

export interface ImageContent {
  src: string;
  alt: string;
}

export interface SectionHeading {
  title: string;
  /** Kata penutup judul yang diberi warna biru. */
  titleHighlight: string;
  description?: string;
}

export interface PageHeroContent {
  title: string;
  /** Kata penutup judul yang diberi warna biru, mis. "UVICS". */
  titleHighlight: string;
  description: string;
  /** Foto latar hero. */
  image: ImageContent;
}

export interface ClosingCtaContent {
  title: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
}

/** Kelompok label Culture & Value resmi (PRD §12.1). */
export interface CultureValueGroup {
  title: string;
  items: string[];
}

export type CultureValueContent = SectionHeading & { groups: CultureValueGroup[] };

export interface AboutContent {
  meta: PageMeta;
  hero: PageHeroContent;
  overview: SectionHeading & { paragraphs: string[] };
  history: SectionHeading & { paragraphs: string[]; image: ImageContent };
  /** Pratinjau; butir visi dan misi dibaca dari UVICS_VISION_MISSION. */
  visionMission: SectionHeading & { visionLabel: string; missionLabel: string; link: CtaLink };
  values: CultureValueContent;
  activities: SectionHeading & { competitionTypes: string[]; link: CtaLink };
  cta: ClosingCtaContent;
}

export interface VisionMissionContent {
  meta: PageMeta;
  hero: PageHeroContent;
  /** Butir resmi, ditampilkan apa adanya tanpa parafrase (PRD §12.1). */
  vision: SectionHeading & { items: string[] };
  mission: SectionHeading & { items: string[] };
  principles: CultureValueContent;
  cta: ClosingCtaContent;
}

// Label dibiarkan berbahasa Inggris seperti di guidebook sampai T08 diputuskan.
const CULTURE_VALUE_GROUPS: CultureValueGroup[] = [
  {
    title: "Culture",
    items: ["Discipline", "Active and Communicative", "Innovative", "Sharing and Caring", "Transparent"],
  },
  {
    title: "Value",
    items: ["Willing to Learn", "Dare to Do Extra", "Grow Together", "Enthusiasm", "Inspired"],
  },
];

export const UVICS_ABOUT: AboutContent = {
  meta: {
    title: "Tentang UVICS",
    description:
      "Profil UVICS, organisasi mahasiswa Universitas Klabat dari berbagai tingkat dan jurusan yang bertumbuh dan berprestasi bersama di perlombaan.",
  },
  hero: {
    title: "Be an Achiever, Carve Your",
    titleHighlight: "Future",
    description:
      "UVICS adalah wadah mahasiswa Universitas Klabat untuk menggali dan mengembangkan potensi diri, khususnya di jenjang perlombaan, serta mewujudkan aspirasi positif bersama.",
    image: {
      src: "/images/img/foto-2.webp",
      alt: "Foto bersama anggota UVICS di ruang kelas Universitas Klabat",
    },
  },
  overview: {
    title: "Wadah berprestasi mahasiswa",
    titleHighlight: "Universitas Klabat",
    paragraphs: [
      "UVICS (Unklab Virtue in Computer Science) adalah organisasi yang dibentuk atas inisiatif mahasiswa Universitas Klabat sebagai wadah untuk menggali dan mengembangkan potensi diri, khususnya di jenjang perlombaan.",
      "Anggota UVICS berasal dari berbagai tingkat dan jurusan, bukan hanya program studi komputer. UVICS mempertemukan mahasiswa dengan minat serupa untuk berprestasi secara kolektif dalam organisasi yang terstruktur.",
      "Semangat itu dirangkum dalam tagline kami: Be an Achiever, Carve Your Future.",
    ],
  },
  history: {
    title: "Berdiri sejak",
    titleHighlight: "2024",
    paragraphs: [
      "UVICS berdiri pada 2024 atas inisiatif mahasiswa Universitas Klabat yang ingin bertumbuh dan berprestasi bersama dalam lomba.",
      "Organisasi dipimpin oleh Ketua bersama core team (Bendahara dan Sekretaris), dengan lima departemen yang menjalankan program kerja: Public Relations, External Affairs, Web Development, Competition Handler, dan Editor.",
    ],
    image: {
      src: "/images/img/foto-10.webp",
      alt: "Enam pengurus UVICS berseragam biru berpose di tangga kampus Universitas Klabat",
    },
  },
  visionMission: {
    title: "Arah dan",
    titleHighlight: "komitmen UVICS",
    visionLabel: "Visi",
    missionLabel: "Misi",
    link: { label: "Buka halaman Visi & Misi", href: "/vision-mission" },
  },
  values: {
    title: "Culture dan value yang",
    titleHighlight: "kami pegang",
    groups: CULTURE_VALUE_GROUPS,
  },
  activities: {
    title: "Lomba yang",
    titleHighlight: "kami dukung",
    description: "UVICS mendukung anggota di berbagai bidang perlombaan, tidak terbatas pada lomba teknologi.",
    competitionTypes: [
      "Business Case Competition",
      "Business Plan Competition",
      "Hackathon",
      "Web Competition",
      "Sayembara arsitektur",
      "Karya tulis ilmiah",
      "Nursing study case",
      "Health educational creative video",
      "Lomba lainnya",
    ],
    link: { label: "Lihat program UVICS", href: "/programs" },
  },
  cta: {
    title: "Siap bergabung dengan UVICS?",
    description:
      "Bergabung dengan mahasiswa dari berbagai jurusan untuk bertumbuh, berkolaborasi, dan berprestasi bersama di perlombaan.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Lihat Departemen", href: "/departments" },
  },
};

export const UVICS_VISION_MISSION: VisionMissionContent = {
  meta: {
    title: "Visi & Misi | UVICS",
    description: "Visi, misi, serta culture dan value UVICS di Universitas Klabat.",
  },
  hero: {
    title: "Visi dan Misi",
    titleHighlight: "UVICS",
    description:
      "Arah dan komitmen yang memandu UVICS sebagai wadah mahasiswa Universitas Klabat untuk bertumbuh dan berprestasi bersama.",
    image: {
      src: "/images/img/foto-16.webp",
      alt: "Tujuh pengurus UVICS berseragam biru berpose di bangku taman kampus Universitas Klabat",
    },
  },
  vision: {
    title: "Visi",
    titleHighlight: "UVICS",
    items: [
      "Menjadi wadah untuk mahasiswa-mahasiswa yang ingin bertumbuh dan berprestasi dalam lomba.",
      "Menjadi organisasi yang membawa prestasi dan nama baik bagi kampus Universitas Klabat.",
      "Menjadi tempat mahasiswa untuk mengasah dan meningkatkan hard skill dan soft skill mereka untuk meningkatkan pengalaman dan portofolio.",
      "Menjadi organisasi yang memberikan manfaat dan dampak yang berkelanjutan dalam masyarakat.",
    ],
  },
  mission: {
    title: "Misi",
    titleHighlight: "UVICS",
    items: [
      "Mengumpulkan mahasiswa dari berbagai tingkat dan jurusan untuk sama-sama bertumbuh dan berprestasi membangun portofolio.",
      "Memberikan sistem dan kesempatan yang sama kepada mahasiswa untuk melatih kerja sama, komunikasi, dan leadership mereka.",
      "Menyediakan media belajar bersama untuk setiap anggota meningkatkan hard skill dan soft skill mereka.",
      "Menciptakan program-program inovatif yang dapat memberikan dampak dalam masyarakat dan mengasah pola pikir kreatif member UVICS.",
    ],
  },
  principles: {
    title: "Culture dan value",
    titleHighlight: "UVICS",
    description: "Budaya dan nilai yang dijalankan setiap anggota dalam kegiatan organisasi.",
    groups: CULTURE_VALUE_GROUPS,
  },
  cta: {
    title: "Wujudkan visi ini bersama UVICS",
    description:
      "Bergabunglah dengan mahasiswa dari berbagai tingkat dan jurusan untuk bertumbuh dan berprestasi bersama.",
    primaryCta: { label: "Join UVICS", href: "/join" },
    secondaryCta: { label: "Kembali ke Tentang UVICS", href: "/about" },
  },
};
