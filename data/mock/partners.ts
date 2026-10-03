export interface PartnerItem {
  id: string;
  name: string;
  category: "Universitas & Akademik" | "Industri Teknologi" | "Komunitas & Ekosistem";
  shortDesc: string;
  badge: string;
  logoMonogram: string;
  tier: "strategic" | "network";
  since: string;
  collaborativeInitiatives: string[];
  websiteUrl?: string;
}

export const UVICS_PARTNERS: PartnerItem[] = [
  {
    id: "partner-filkom",
    name: "Fakultas Ilmu Komputer UNKLAB",
    category: "Universitas & Akademik",
    shortDesc: "Induk institusional, penyedia laboratorium riset komputasi, dan pembina utama organisasi.",
    badge: "Induk Akademik",
    logoMonogram: "FIK",
    tier: "strategic",
    since: "2018",
    collaborativeInitiatives: [
      "Penyediaan Laboratorium Riset AI & Software",
      "Rekomendasi Hibah Program Kreativitas Mahasiswa",
      "Integrasi Konversi SKS Aktivitas Kompetisi",
    ],
    websiteUrl: "https://unklab.ac.id",
  },
  {
    id: "partner-puspresnas",
    name: "Puspresnas Kemdikbudristek RI",
    category: "Universitas & Akademik",
    shortDesc: "Pusat Prestasi Nasional pembina talenta kompetisi resmi GEMASTIK, PKM, dan LIDM.",
    badge: "Mitra Nasional",
    logoMonogram: "BPTI",
    tier: "strategic",
    since: "2020",
    collaborativeInitiatives: [
      "Delegasi Kontingen GEMASTIK Nasional",
      "Pembinaan Proposal Riset Terapan",
      "Pencatatan Rekor Talenta Mahasiswa Dikti",
    ],
    websiteUrl: "https://pusatprestasinasional.kemdikbud.go.id",
  },
  {
    id: "partner-gdg",
    name: "Google Developer Groups Manado",
    category: "Komunitas & Ekosistem",
    shortDesc: "Jejaring engineer Google eksternal untuk workshop cloud, Android, dan machine learning.",
    badge: "Tech Community",
    logoMonogram: "GDG",
    tier: "strategic",
    since: "2022",
    collaborativeInitiatives: [
      "Google I/O Extended Watch Party & Hackathon",
      "DevFest Speaker & Tech Mentorship",
      "Akses Program Google Cloud Credits",
    ],
    websiteUrl: "https://gdg.community.dev",
  },
  {
    id: "partner-dicoding",
    name: "Dicoding Indonesia",
    category: "Industri Teknologi",
    shortDesc: "Platform pelatihan dan sertifikasi developer berstandar kurikulum industri global.",
    badge: "Industry Partner",
    logoMonogram: "DCD",
    tier: "strategic",
    since: "2023",
    collaborativeInitiatives: [
      "Beasiswa Kelas Pengembang Web & Android",
      "Ujian Sertifikasi Kompetensi Internasional",
      "Penyaluran Talenta ke Mitra Hiring Partner",
    ],
    websiteUrl: "https://dicoding.com",
  },
  {
    id: "partner-diskominfo",
    name: "Diskominfo Provinsi Sulawesi Utara",
    category: "Komunitas & Ekosistem",
    shortDesc: "Mitra pemerintah daerah untuk riset digitalisasi layanan publik kepulauan dan smart province.",
    badge: "Pemerintah Daerah",
    logoMonogram: "KOM",
    tier: "network",
    since: "2024",
    collaborativeInitiatives: [
      "Uji Coba Sistem Informasi Berbasis GIS",
      "Studi Kelayakan Infrastruktur Digital 3T",
    ],
    websiteUrl: "https://diskominfo.sulutprov.go.id",
  },
  {
    id: "partner-mikrotik",
    name: "MikroTik Academy UNKLAB",
    category: "Industri Teknologi",
    shortDesc: "Lembaga pelatihan sertifikasi jaringan komputer dan infrastruktur telekomunikasi kampus.",
    badge: "Certification Lab",
    logoMonogram: "MKT",
    tier: "network",
    since: "2021",
    collaborativeInitiatives: [
      "Pelatihan Sertifikasi MTCNA untuk Mahasiswa",
      "Dukungan Server CTF & Lomba Cyber Security",
    ],
    websiteUrl: "https://mikrotik.com",
  },
  {
    id: "partner-github",
    name: "GitHub Campus Program",
    category: "Industri Teknologi",
    shortDesc: "Penyedia tools version control, student developer pack, dan platform open-source kolaborasi.",
    badge: "Developer Tools",
    logoMonogram: "GIT",
    tier: "network",
    since: "2023",
    collaborativeInitiatives: [
      "Repository Organisasi UVICS Unlimited Private",
      "GitHub Copilot Student Mentorship",
    ],
    websiteUrl: "https://github.com",
  },
  {
    id: "partner-aws",
    name: "AWS Cloud Club UNKLAB",
    category: "Komunitas & Ekosistem",
    shortDesc: "Komunitas mahasiswa pegiat cloud computing dan arsitektur serverless Amazon Web Services.",
    badge: "Cloud Community",
    logoMonogram: "AWS",
    tier: "network",
    since: "2024",
    collaborativeInitiatives: [
      "Cloud Practitioner Study Jam",
      "Infrastruktur Hosting Proyek Riset Mahasiswa",
    ],
    websiteUrl: "https://aws.amazon.com",
  },
];
