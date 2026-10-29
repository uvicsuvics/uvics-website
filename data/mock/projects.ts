import type { PageHeroContent } from '@/data/mock/about';
import type { Project, ProjectMember } from '@/types/portfolio';

// Data relasional bergaya tabel: relasi hanya lewat id, tanpa objek bersarang.
// Penggabungan (join) dilakukan di lib/services, bukan di sini.
// Nama peserta ada di `memberName`, juga untuk baris yang punya `memberId`: proyeksi nama member belum ada.

export const UVICS_PROJECTS: Project[] = [
  {
    id: 'proj-campus-superapp',
    slug: 'klabat-campus-superapp',
    title: 'Klabat Campus SuperApp & Academic Portal',
    summary:
      'Sistem informasi manajemen kegiatan mahasiswa, notifikasi jadwal kuliah, dan verifikasi ormawa terpadu.',
    description:
      'Platform web dan mobile yang dirancang mahasiswa UVICS untuk mengintegrasikan presensi digital ormawa, kalender akademik interaktif, dan kanal pengumuman resmi Universitas Klabat.',
    coverImage: '/images/img/foto-14.webp',
    projectUrl: 'https://campus.uvics.org',
    repositoryUrl: 'https://github.com/uvicsuvics/campus-superapp',
    startDate: '2025-08-01',
    endDate: '2026-03-31',
    status: 'COMPLETED',
    featured: true,
  },
  {
    id: 'proj-nusantara-vision',
    slug: 'nusantaravision-crop-ai',
    title: 'NusantaraVision: Edge-AI Crop Disease Classifier',
    summary:
      'Model computer vision offline-first untuk mendeteksi penyakit tanaman perkebunan tropis di perangkat edge.',
    description:
      'Model deep learning CNN berlatensi rendah yang membantu petani Minahasa Utara mendeteksi infeksi hama pada tanaman cengkih dan kelapa tanpa koneksi internet.',
    coverImage: '/images/img/foto-16.webp',
    projectUrl: 'https://vision.uvics.org',
    repositoryUrl: 'https://github.com/uvicsuvics/nusantara-vision',
    startDate: '2026-01-15',
    endDate: '2026-07-31',
    status: 'COMPLETED',
    featured: true,
  },
  {
    id: 'proj-virtue-design',
    slug: 'virtuedesign-system',
    title: 'VirtueDesign: Accessible Open Component System',
    summary:
      'Pustaka komponen UI berstandar WCAG 2.1 AA yang menjadi fondasi konsistensi aplikasi web UVICS.',
    description:
      'Desain sistem dengan 40+ komponen siap pakai, token warna, tipografi terkalibrasi, dan dokumentasi interaktif untuk mempercepat prototyping tim frontend UVICS.',
    coverImage: '/images/img/foto-17.webp',
    projectUrl: 'https://design.uvics.org',
    repositoryUrl: 'https://github.com/uvicsuvics/virtue-design',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    status: 'COMPLETED',
    featured: false,
  },
  {
    id: 'proj-ctf-arena',
    slug: 'klabat-ctf-security-arena',
    title: 'Klabat Cyber Defense & CTF Simulation Arena',
    summary:
      'Platform simulasi uji penetrasi dan arena Capture The Flag internal bagi mahasiswa UNKLAB.',
    description:
      'Laboratorium siber virtual dengan container terisolasi untuk latihan peretasan etis, audit kerentanan binary, forensik digital, dan kriptografi terapan sebagai persiapan delegasi lomba cyber.',
    coverImage: '/images/img/foto-5.webp',
    projectUrl: 'https://ctf.uvics.org',
    repositoryUrl: 'https://github.com/uvicsuvics/ctf-arena',
    startDate: '2026-05-01',
    endDate: null,
    status: 'ONGOING',
    featured: false,
  },
];

export const UVICS_PROJECT_MEMBERS: ProjectMember[] = [
  { id: 'pm-1', projectId: 'proj-campus-superapp', memberId: 'mem-jonathan', memberName: 'Jonathan Rumagit', role: 'Project Lead' },
  { id: 'pm-2', projectId: 'proj-campus-superapp', memberId: 'mem-clarissa', memberName: 'Clarissa Pangkey', role: 'Frontend Engineer' },
  { id: 'pm-3', projectId: 'proj-campus-superapp', memberId: 'mem-kevin', memberName: 'Kevin Kalangi', role: 'Backend Engineer' },
  { id: 'pm-4', projectId: 'proj-nusantara-vision', memberId: 'mem-sarah', memberName: 'Sarah Manoppo', role: 'ML Engineer' },
  { id: 'pm-5', projectId: 'proj-nusantara-vision', memberId: 'mem-dave', memberName: 'Dave Sumampouw', role: 'Project Lead' },
  { id: 'pm-6', projectId: 'proj-nusantara-vision', memberId: 'mem-kevin', memberName: 'Kevin Kalangi', role: 'Backend Engineer' },
  { id: 'pm-7', projectId: 'proj-virtue-design', memberId: 'mem-kezia', memberName: 'Kezia Sondakh', role: 'Design Lead' },
  { id: 'pm-8', projectId: 'proj-virtue-design', memberId: 'mem-rachel', memberName: 'Rachel Runtu', role: 'UI/UX Designer' },
  { id: 'pm-9', projectId: 'proj-virtue-design', memberId: 'mem-clarissa', memberName: 'Clarissa Pangkey', role: 'Frontend Engineer' },
  { id: 'pm-10', projectId: 'proj-ctf-arena', memberId: 'mem-matthew', memberName: 'Matthew Tambuwun', role: 'Project Lead' },
  { id: 'pm-11', projectId: 'proj-ctf-arena', memberId: 'mem-dave', memberName: 'Dave Sumampouw', role: 'Security Engineer' },
];

export interface ProjectsPageContent {
  hero: PageHeroContent;
}

export const UVICS_PROJECTS_PAGE: ProjectsPageContent = {
  hero: {
    title: 'Project',
    titleHighlight: 'UVICS',
    description: 'Karya dan proyek teknologi yang dibangun anggota UVICS.',
    image: {
      src: '/images/img/foto-7.webp',
      alt: 'Anggota UVICS berfoto bersama di ruang kelas Universitas Klabat',
    },
  },
};
