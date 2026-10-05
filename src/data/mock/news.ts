export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: "Prestasi" | "Akademik" | "Komunitas" | "Rekrutmen" | "Teknologi";
  date: string;
  isoDate: string;
  readingTime: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  image: string;
  featured?: boolean;
}

export const UVICS_NEWS: NewsItem[] = [
  {
    id: "news-1",
    slug: "uvics-buka-pendaftaran-open-recruitment-batch-2026",
    title: "UVICS Resmi Membuka Pendaftaran Open Recruitment Anggota Baru Batch 2026",
    excerpt:
      "Kesempatan bagi mahasiswa Fakultas Ilmu Komputer UNKLAB untuk bergabung dalam wadah akselerasi riset, kompetisi teknologi, dan proyek kolaboratif industri berskala nasional.",
    category: "Rekrutmen",
    date: "20 September 2026",
    isoDate: "2026-09-20",
    readingTime: "3 mnt baca",
    author: {
      name: "BPH UVICS",
      role: "Badan Pengurus Harian",
      avatar: "/images/img/foto-1.webp",
    },
    image: "/images/img/foto-14.webp",
    featured: true,
  },
  {
    id: "news-2",
    slug: "delegasi-uvics-raih-emas-di-national-ai-innovation-summit",
    title: "Kembangkan Deteksi Citra Medis, Delegasi UVICS Raih Podium 1 Tingkat Nasional",
    excerpt:
      "Melalui karya berbasis edge computing, tim mahasiswa Informatika berhasil mengungguli puluhan universitas ternama dalam ajang inovasi kecerdasan buatan Puspresnas.",
    category: "Prestasi",
    date: "14 Agustus 2026",
    isoDate: "2026-08-14",
    readingTime: "4 mnt baca",
    author: {
      name: "Divisi Riset & AI",
      role: "Tim Riset",
      avatar: "/images/img/foto-2.webp",
    },
    image: "/images/img/foto-16.webp",
    featured: false,
  },
  {
    id: "news-3",
    slug: "workshop-desain-inklusif-dan-design-system-modern",
    title: "Workshop Desain Inklusif: Membangun Antarmuka Berstandar Aksesibilitas Global",
    excerpt:
      "Rangkuman materi praktis implementasi WCAG 2.2, kontras adaptif, dan navigasi ramah screen-reader yang diikuti oleh lebih dari 80 peserta.",
    category: "Akademik",
    date: "28 Juli 2026",
    isoDate: "2026-07-28",
    readingTime: "5 mnt baca",
    author: {
      name: "Divisi UI/UX",
      role: "Departemen Desain",
      avatar: "/images/img/foto-3.webp",
    },
    image: "/images/img/foto-17.webp",
    featured: false,
  },
  {
    id: "news-4",
    slug: "kolaborasi-proyek-open-source-klabat-campus-superapp",
    title: "Peluncuran Versi Beta Klabat Campus SuperApp: Inisiatif Open Source Mahasiswa",
    excerpt:
      "Platform mobile terintegrasi untuk jadwal kuliah, navigasi gedung kampus, dan notifikasi kegiatan akademik kini memasuki fase pengujian tertutup.",
    category: "Teknologi",
    date: "10 Juni 2026",
    isoDate: "2026-06-10",
    readingTime: "4 mnt baca",
    author: {
      name: "Divisi Software Dev",
      role: "Lead Engineer",
      avatar: "/images/img/foto-4.webp",
    },
    image: "/images/img/foto-5.webp",
    featured: false,
  },
];
