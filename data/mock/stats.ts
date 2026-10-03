export interface GlanceStatItem {
  id: string;
  label: string;
  value: number;
  suffix: string;
  description: string;
  category: "members" | "alumni" | "achievements" | "projects" | "competitions" | "events";
  badgeText?: string;
  trendText?: string;
}

export const UVICS_GLANCE_STATS: GlanceStatItem[] = [
  {
    id: "active-members",
    label: "Active Members",
    value: 85,
    suffix: "+",
    description: "Mahasiswa bertalenta dari lintas fakultas dan program studi di Universitas Klabat.",
    category: "members",
    badgeText: "Komunitas Aktif",
    trendText: "Periode 2026/2027",
  },
  {
    id: "alumni",
    label: "Alumni Network",
    value: 120,
    suffix: "+",
    description: "Jejaring alumni yang berkarier dan berkontribusi di industri teknologi global & nasional.",
    category: "alumni",
    badgeText: "Karier Global",
    trendText: "Tersebar di 20+ Tech Companies",
  },
  {
    id: "achievements",
    label: "Achievements",
    value: 35,
    suffix: "+",
    description: "Penghargaan bergengsi pada kompetisi teknologi tingkat regional, nasional, dan internasional.",
    category: "achievements",
    badgeText: "Juara Bergengsi",
    trendText: "15+ Juara Nasional",
  },
  {
    id: "projects",
    label: "Projects Built",
    value: 28,
    suffix: "+",
    description: "Karya inovasi perangkat lunak, AI, dan sistem informasi yang berdampak nyata.",
    category: "projects",
    badgeText: "Inovasi Nyata",
    trendText: "Open-source & Terapan",
  },
  {
    id: "competitions",
    label: "Competitions Joined",
    value: 50,
    suffix: "+",
    description: "Partisipasi aktif dalam hackathon, UI/UX challenge, data science, dan competitive programming.",
    category: "competitions",
    badgeText: "Kompetitif",
    trendText: "Nasional & Internasional",
  },
  {
    id: "events",
    label: "Events & Workshops",
    value: 40,
    suffix: "+",
    description: "Sesi mentoring, pelatihan teknologi, workshop intensif, dan seminar terbuka.",
    category: "events",
    badgeText: "Edukatif",
    trendText: "Rutin Tiap Semester",
  },
];
