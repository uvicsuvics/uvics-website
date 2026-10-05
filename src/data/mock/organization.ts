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
