export interface AchievementItem {
  id: string;
  slug: string;
  title: string;
  ranking: string;
  rankTier: "gold" | "silver" | "bronze";
  competitionName: string;
  organizer: string;
  level: "Nasional" | "Internasional" | "Regional";
  date: string;
  year: string;
  teamName: string;
  teamMembers: string[];
  image: string;
  description: string;
  certificateUrl?: string;
  featured?: boolean;
}

export const UVICS_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: "ach-ai-hackathon-2026",
    slug: "juara-1-national-ai-hackathon-2026",
    title: "Juara 1 & Best Technical Innovation",
    ranking: "Juara 1 (Gold Medal)",
    rankTier: "gold",
    competitionName: "National AI Innovation Summit 2026",
    organizer: "Puspresnas Kemdikbudristek RI & Kemenristek",
    level: "Nasional",
    date: "Agustus 2026",
    year: "2026",
    teamName: "Tim Alpha Klabat",
    teamMembers: ["Dave Sumampouw", "Sarah Manoppo", "Kevin Kalangi"],
    image: "/images/img/foto-1.webp",
    description: "Meraih podium pertama melalui karya sistem pendeteksi anomali citra biomedis dengan akurasi 98.4% dan inferensi latensi rendah berbasis edge computing.",
    certificateUrl: "https://uvics.org/certificates/ai-summit-2026.pdf",
    featured: true,
  },
  {
    id: "ach-hackathon-merdeka-2025",
    slug: "juara-2-hackathon-merdeka-nusantara",
    title: "Juara 2 Nasional Hackathon Merdeka",
    ranking: "Juara 2 (Silver Medal)",
    rankTier: "silver",
    competitionName: "Hackathon Merdeka Nusantara 2025",
    organizer: "Kementerian Komunikasi dan Informatika RI",
    level: "Nasional",
    date: "November 2025",
    year: "2025",
    teamName: "Tim Klabat Vanguard",
    teamMembers: ["Matthew Tambuwun", "Kezia Sondakh", "Dave Sumampouw"],
    image: "/images/img/foto-10.webp",
    description: "Mengembangkan platform tata kelola logistik maritim terdistribusi untuk mempercepat rantai pasok kepulauan 3T di kawasan Indonesia Timur.",
    certificateUrl: "https://uvics.org/certificates/hackathon-merdeka-2025.pdf",
    featured: true,
  },
  {
    id: "ach-uiux-techfair-2026",
    slug: "juara-1-ui-ux-design-challenge-2026",
    title: "Juara 1 National UI/UX Design Challenge",
    ranking: "Juara 1 (Gold Medal)",
    rankTier: "gold",
    competitionName: "Klabat Annual Tech Fair 2026",
    organizer: "Universitas Klabat & Mitra Industri",
    level: "Nasional",
    date: "Mei 2026",
    year: "2026",
    teamName: "Tim Pixel Virtue",
    teamMembers: ["Kezia Sondakh", "Rachel Runtu"],
    image: "/images/img/foto-11.webp",
    description: "Merancang inovasi antarmuka perbankan digital inklusif dengan navigasi ramah pembaca layar (screen reader) dan kontras adaptif untuk lansia.",
    featured: false,
  },
  {
    id: "ach-gemastik-xvii-2024",
    slug: "top-5-finalist-gemastik-xvii",
    title: "Top 5 Finalist GEMASTIK XVII Bidang Software Development",
    ranking: "Top 5 Finalist (Nasional)",
    rankTier: "bronze",
    competitionName: "GEMASTIK XVII 2024",
    organizer: "Balai Pengembangan Talenta Indonesia (BPTI)",
    level: "Nasional",
    date: "September 2024",
    year: "2024",
    teamName: "Tim Virtuous Engineers",
    teamMembers: ["Jonathan Rumagit", "Clarissa Pangkey", "Dave Sumampouw"],
    image: "/images/img/foto-12.webp",
    description: "Membawa nama Universitas Klabat ke babak final nasional melalui sistem audit dan pemantauan emisi karbon perkebunan berbasis microservices.",
    featured: false,
  },
];
