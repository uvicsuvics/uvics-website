export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: "Web Platform" | "Artificial Intelligence" | "Design System" | "Cybersecurity" | "Mobile App";
  shortDescription: string;
  description: string;
  coverImage: string;
  technologies: string[];
  status: "COMPLETED" | "ONGOING" | "PLANNED";
  year: string;
  projectUrl?: string;
  repositoryUrl?: string;
  contributorsCount: number;
  highlightStat: {
    label: string;
    value: string;
  };
  featured?: boolean;
}

export const UVICS_PROJECTS: ProjectItem[] = [
  {
    id: "proj-campus-superapp",
    slug: "klabat-campus-superapp",
    title: "Klabat Campus SuperApp & Academic Portal",
    category: "Web Platform",
    shortDescription: "Sistem informasi cerdas manajemen kegiatan mahasiswa, notifikasi jadwal kuliah real-time, dan verifikasi ormawa terpadu.",
    description: "Platform web dan mobile komprehensif yang dirancang oleh mahasiswa UVICS untuk mengintegrasikan presensi digital ormawa, kalender akademik interaktif, dan kanal pengumuman resmi kampus Universitas Klabat.",
    coverImage: "/images/img/foto-14.webp",
    technologies: ["Next.js 16", "Supabase", "TypeScript", "Tailwind CSS", "Docker"],
    status: "COMPLETED",
    year: "2026",
    projectUrl: "https://campus.uvics.org",
    repositoryUrl: "https://github.com/uvicsuvics/campus-superapp",
    contributorsCount: 6,
    highlightStat: {
      label: "Pengguna Aktif",
      value: "1.200+ Mahasiswa",
    },
    featured: true,
  },
  {
    id: "proj-nusantara-vision",
    slug: "nusantaravision-crop-ai",
    title: "NusantaraVision: Edge-AI Crop Disease Classifier",
    category: "Artificial Intelligence",
    shortDescription: "Model computer vision offline-first untuk mendeteksi penyakit tanaman perkebunan tropis berbasis perangkat edge mini.",
    description: "Inovasi kecerdasan buatan berbasis deep learning convolutional neural network (CNN) berlatensi ultra-rendah yang membantu petani lokal Minahasa Utara mendeteksi infeksi hama tanaman cengkih dan kelapa secara akurat tanpa internet.",
    coverImage: "/images/img/foto-16.webp",
    technologies: ["Python", "PyTorch", "FastAPI", "OpenCV", "Edge TPU"],
    status: "COMPLETED",
    year: "2026",
    projectUrl: "https://vision.uvics.org",
    repositoryUrl: "https://github.com/uvicsuvics/nusantara-vision",
    contributorsCount: 4,
    highlightStat: {
      label: "Akurasi Model",
      value: "98.4% Top-1",
    },
    featured: true,
  },
  {
    id: "proj-virtue-design",
    slug: "virtuedesign-system",
    title: "VirtueDesign: Accessible Open Component System",
    category: "Design System",
    shortDescription: "Pustaka komponen UI interaktif berstandar WCAG 2.1 AA yang menjadi fondasi konsistensi seluruh web aplikasi UVICS.",
    description: "Desain sistem komprehensif yang mencakup 40+ komponen siap pakai, token warna berwibawa, tipografi terkalibrasi, dan dokumentasi interaktif untuk mempercepat akselerasi prototyping tim frontend UVICS.",
    coverImage: "/images/img/foto-17.webp",
    technologies: ["React 19", "Tailwind CSS 4", "Storybook", "Figma Tokens"],
    status: "COMPLETED",
    year: "2025",
    projectUrl: "https://design.uvics.org",
    repositoryUrl: "https://github.com/uvicsuvics/virtue-design",
    contributorsCount: 5,
    highlightStat: {
      label: "Standar Aksesibilitas",
      value: "WCAG 2.1 AA",
    },
    featured: false,
  },
  {
    id: "proj-ctf-arena",
    slug: "klabat-ctf-security-arena",
    title: "Klabat Cyber Defense & CTF Simulation Arena",
    category: "Cybersecurity",
    shortDescription: "Platform simulasi uji penetrasi keamanan siber dan arena kompetisi Capture The Flag internal bagi mahasiswa UNKLAB.",
    description: "Laboratorium siber virtual dengan arsitektur container terisolasi yang memfasilitasi latihan peretasan etis, audit kerentanan binary, forensik digital, dan kriptografi terapan untuk persiapan delegasi lomba cyber.",
    coverImage: "/images/img/foto-5.webp",
    technologies: ["Go", "Kubernetes", "Linux Kernel", "PostgreSQL", "Docker"],
    status: "ONGOING",
    year: "2026",
    projectUrl: "https://ctf.uvics.org",
    repositoryUrl: "https://github.com/uvicsuvics/ctf-arena",
    contributorsCount: 4,
    highlightStat: {
      label: "Skenario Lab",
      value: "35+ Challenges",
    },
    featured: false,
  },
];
