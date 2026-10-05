export interface CompetitionItem {
  id: string;
  slug: string;
  title: string;
  organizer: string;
  description: string;
  category: "Hackathon" | "Competitive Programming" | "UI/UX Design" | "Data Science" | "Software Engineering";
  level: "Nasional" | "Internasional" | "Regional";
  registrationDeadline: string;
  deadlineDate: string;
  competitionDate: string;
  registrationUrl: string;
  guidebookUrl?: string;
  poster: string;
  teamSize: string;
  eligibility: string;
  status: "OPEN" | "UPCOMING" | "CLOSED" | "ONGOING";
  featured?: boolean;
  prizePool?: string;
  daysRemaining?: number;
}

export const UVICS_COMPETITIONS: CompetitionItem[] = [
  {
    id: "comp-gemastik-2026",
    slug: "gemastik-xviii-2026",
    title: "GEMASTIK XVIII: Divisi Software Development & UX Design",
    organizer: "Puspresnas Kemdikbudristek RI",
    description: "Kompetisi teknologi informasi dan komunikasi nasional paling bergengsi antar perguruan tinggi se-Indonesia untuk menguji inovasi perangkat lunak dan keunggulan desain antarmuka.",
    category: "Software Engineering",
    level: "Nasional",
    registrationDeadline: "15 November 2026",
    deadlineDate: "2026-11-15",
    competitionDate: "10-14 Desember 2026",
    registrationUrl: "https://gemastik.kemdikbud.go.id",
    guidebookUrl: "https://gemastik.kemdikbud.go.id/guidebook",
    poster: "/images/img/foto-1.webp",
    teamSize: "3 Orang / Tim",
    eligibility: "Mahasiswa Aktif S1/D4 Seluruh Indonesia",
    status: "OPEN",
    featured: true,
    prizePool: "Rp 150.000.000+",
    daysRemaining: 50,
  },
  {
    id: "comp-icpc-jakarta-2026",
    slug: "icpc-asia-jakarta-regional-2026",
    title: "The 2026 ICPC Asia Jakarta Regional Contest",
    organizer: "ICPC Foundation & Universitas Bina Nusantara",
    description: "Kontes pemrograman kompetitif internasional tingkat regional Asia untuk menguji kecepatan logika matematika, perancangan algoritma lanjut, dan ketahanan problem solving beregu.",
    category: "Competitive Programming",
    level: "Internasional",
    registrationDeadline: "28 Oktober 2026",
    deadlineDate: "2026-10-28",
    competitionDate: "21-22 November 2026",
    registrationUrl: "https://icpc.global",
    guidebookUrl: "https://icpc.global/regionals/rules",
    poster: "/images/img/foto-10.webp",
    teamSize: "3 Orang / Tim",
    eligibility: "Mahasiswa Terdaftar Resmi (Eligibility Rules ICPC)",
    status: "OPEN",
    featured: true,
    prizePool: "Medal & World Finals Ticket",
    daysRemaining: 32,
  },
  {
    id: "comp-hackathon-merdeka-2026",
    slug: "hackathon-merdeka-nusantara",
    title: "Nusantara AI & Web3 Innovation Hackathon",
    organizer: "Kementerian Komunikasi dan Informatika RI",
    description: "Ajang hackathon 48 jam nonstop merancang aplikasi berbasis Artificial Intelligence untuk akselerasi smart city dan layanan publik digital di Indonesia.",
    category: "Hackathon",
    level: "Nasional",
    registrationDeadline: "05 November 2026",
    deadlineDate: "2026-11-05",
    competitionDate: "18-20 November 2026",
    registrationUrl: "https://kominfo.go.id/hackathon",
    guidebookUrl: "https://kominfo.go.id/guidebook-2026.pdf",
    poster: "/images/img/foto-11.webp",
    teamSize: "2 - 4 Orang / Tim",
    eligibility: "Mahasiswa & Talenta Muda < 25 Tahun",
    status: "OPEN",
    featured: false,
    prizePool: "Rp 75.000.000",
    daysRemaining: 40,
  },
  {
    id: "comp-findit-uiux-2026",
    slug: "find-it-ui-ux-competition",
    title: "FIND IT! National UI/UX Design Challenge",
    organizer: "DTETI Universitas Gadjah Mada",
    description: "Perlombaan perancangan user experience dan UI interaktif memecahkan problematika aksesibilitas produk teknologi finansial dan inklusif di Indonesia.",
    category: "UI/UX Design",
    level: "Nasional",
    registrationDeadline: "20 Oktober 2026",
    deadlineDate: "2026-10-20",
    competitionDate: "05 November 2026",
    registrationUrl: "https://find-it.id",
    guidebookUrl: "https://find-it.id/guidebook",
    poster: "/images/img/foto-4.webp",
    teamSize: "2 - 3 Orang / Tim",
    eligibility: "Mahasiswa D3/D4/S1 Aktif",
    status: "OPEN",
    featured: false,
    prizePool: "Rp 25.000.000",
    daysRemaining: 24,
  },
  {
    id: "comp-compfest-ds-2026",
    slug: "compfest-data-science-academy",
    title: "COMPFEST: National Data Science Challenge",
    organizer: "Fasilkom Universitas Indonesia",
    description: "Tantangan analisis big data, machine learning modeling, and insight visualization untuk optimasi supply chain berkelanjutan.",
    category: "Data Science",
    level: "Nasional",
    registrationDeadline: "01 Oktober 2026",
    deadlineDate: "2026-10-01",
    competitionDate: "15-18 Oktober 2026",
    registrationUrl: "https://compfest.id",
    poster: "/images/img/foto-7.webp",
    teamSize: "3 Orang / Tim",
    eligibility: "Mahasiswa Aktif Seluruh Indonesia",
    status: "CLOSED",
    featured: false,
    prizePool: "Rp 35.000.000",
    daysRemaining: 0,
  },
  {
    id: "comp-joints-algo-2026",
    slug: "joints-competitive-programming",
    title: "JOINTS Programming Contest 2026",
    organizer: "Universitas Gadjah Mada",
    description: "Lomba competitive programming perorangan dengan standar ICPC untuk menguji efisiensi algoritma graf, dynamic programming, dan teori bilangan.",
    category: "Competitive Programming",
    level: "Nasional",
    registrationDeadline: "25 November 2026",
    deadlineDate: "2026-11-25",
    competitionDate: "08 Desember 2026",
    registrationUrl: "https://joints.id",
    poster: "/images/img/foto-8.webp",
    teamSize: "Individu (1 Orang)",
    eligibility: "Mahasiswa Aktif",
    status: "UPCOMING",
    featured: false,
    prizePool: "Rp 15.000.000",
    daysRemaining: 60,
  },
];
