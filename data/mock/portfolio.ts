import type {
  Achievement,
  AchievementMember,
  Member,
  Project,
  ProjectMember,
} from '@/types/portfolio';

// Data relasional bergaya tabel: relasi hanya lewat id, tanpa objek bersarang.
// Penggabungan (join) dilakukan di lib/services, bukan di sini.

export const MOCK_MEMBERS: Member[] = [
  { id: 'mem-dave', name: 'Dave Sumampouw' },
  { id: 'mem-sarah', name: 'Sarah Manoppo' },
  { id: 'mem-kevin', name: 'Kevin Kalangi' },
  { id: 'mem-matthew', name: 'Matthew Tambuwun' },
  { id: 'mem-kezia', name: 'Kezia Sondakh' },
  { id: 'mem-rachel', name: 'Rachel Runtu' },
  { id: 'mem-jonathan', name: 'Jonathan Rumagit' },
  { id: 'mem-clarissa', name: 'Clarissa Pangkey' },
];

export const MOCK_PROJECTS: Project[] = [
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

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-ai-hackathon-2026',
    slug: 'juara-1-national-ai-hackathon-2026',
    title: 'Juara 1 & Best Technical Innovation',
    competitionName: 'National AI Innovation Summit 2026',
    organizer: 'Puspresnas Kemdikbudristek RI & Kemenristek',
    level: 'NASIONAL',
    ranking: 'Juara 1',
    achievementDate: '2026-08-14',
    description:
      'Meraih podium pertama melalui sistem pendeteksi anomali citra biomedis dengan akurasi 98,4% dan inferensi latensi rendah berbasis edge computing.',
    coverImage: '/images/img/foto-1.webp',
    projectId: 'proj-nusantara-vision',
  },
  {
    id: 'ach-hackathon-merdeka-2025',
    slug: 'juara-2-hackathon-merdeka-nusantara',
    title: 'Juara 2 Nasional Hackathon Merdeka',
    competitionName: 'Hackathon Merdeka Nusantara 2025',
    organizer: 'Kementerian Komunikasi dan Informatika RI',
    level: 'NASIONAL',
    ranking: 'Juara 2',
    achievementDate: '2025-11-08',
    description:
      'Mengembangkan platform tata kelola logistik maritim terdistribusi untuk mempercepat rantai pasok kepulauan 3T di kawasan Indonesia Timur.',
    coverImage: '/images/img/foto-10.webp',
    projectId: null,
  },
  {
    id: 'ach-uiux-techfair-2026',
    slug: 'juara-1-ui-ux-design-challenge-2026',
    title: 'Juara 1 National UI/UX Design Challenge',
    competitionName: 'Klabat Annual Tech Fair 2026',
    organizer: 'Universitas Klabat & Mitra Industri',
    level: 'NASIONAL',
    ranking: 'Juara 1',
    achievementDate: '2026-05-22',
    description:
      'Merancang antarmuka perbankan digital inklusif dengan navigasi ramah screen reader dan kontras adaptif untuk lansia.',
    coverImage: '/images/img/foto-11.webp',
    projectId: 'proj-virtue-design',
  },
  {
    id: 'ach-gemastik-xvii-2024',
    slug: 'top-5-finalist-gemastik-xvii',
    title: 'Top 5 Finalist GEMASTIK XVII Bidang Software Development',
    competitionName: 'GEMASTIK XVII 2024',
    organizer: 'Balai Pengembangan Talenta Indonesia (BPTI)',
    level: 'NASIONAL',
    ranking: 'Top 5 Finalis',
    achievementDate: '2024-09-18',
    description:
      'Membawa nama Universitas Klabat ke babak final nasional melalui sistem audit dan pemantauan emisi karbon perkebunan berbasis microservices.',
    coverImage: '/images/img/foto-12.webp',
    projectId: null,
  },
];

export const MOCK_ACHIEVEMENT_MEMBERS: AchievementMember[] = [
  { id: 'am-1', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-dave', memberName: null, role: 'Ketua Tim' },
  { id: 'am-2', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-sarah', memberName: null, role: 'ML Engineer' },
  { id: 'am-3', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-kevin', memberName: null, role: 'Backend Engineer' },
  { id: 'am-4', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-matthew', memberName: null, role: 'Ketua Tim' },
  { id: 'am-5', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-kezia', memberName: null, role: 'UI/UX Designer' },
  { id: 'am-6', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-dave', memberName: null, role: 'Backend Engineer' },
  { id: 'am-7', achievementId: 'ach-uiux-techfair-2026', memberId: 'mem-kezia', memberName: null, role: 'Ketua Tim' },
  { id: 'am-8', achievementId: 'ach-uiux-techfair-2026', memberId: 'mem-rachel', memberName: null, role: 'UI/UX Designer' },
  { id: 'am-9', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-jonathan', memberName: null, role: 'Ketua Tim' },
  { id: 'am-10', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-clarissa', memberName: null, role: 'Frontend Engineer' },
  { id: 'am-11', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-dave', memberName: null, role: 'Backend Engineer' },
  // Peserta non-member (D18): hanya nama, tanpa tautan ke members.
  { id: 'am-12', achievementId: 'ach-gemastik-xvii-2024', memberId: null, memberName: 'Alvin Mokodompit', role: 'Anggota Tamu' },
];

export const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  { id: 'pm-1', projectId: 'proj-campus-superapp', memberId: 'mem-jonathan', memberName: null, role: 'Project Lead' },
  { id: 'pm-2', projectId: 'proj-campus-superapp', memberId: 'mem-clarissa', memberName: null, role: 'Frontend Engineer' },
  { id: 'pm-3', projectId: 'proj-campus-superapp', memberId: 'mem-kevin', memberName: null, role: 'Backend Engineer' },
  { id: 'pm-4', projectId: 'proj-nusantara-vision', memberId: 'mem-sarah', memberName: null, role: 'ML Engineer' },
  { id: 'pm-5', projectId: 'proj-nusantara-vision', memberId: 'mem-dave', memberName: null, role: 'Project Lead' },
  { id: 'pm-6', projectId: 'proj-nusantara-vision', memberId: 'mem-kevin', memberName: null, role: 'Backend Engineer' },
  { id: 'pm-7', projectId: 'proj-virtue-design', memberId: 'mem-kezia', memberName: null, role: 'Design Lead' },
  { id: 'pm-8', projectId: 'proj-virtue-design', memberId: 'mem-rachel', memberName: null, role: 'UI/UX Designer' },
  { id: 'pm-9', projectId: 'proj-virtue-design', memberId: 'mem-clarissa', memberName: null, role: 'Frontend Engineer' },
  { id: 'pm-10', projectId: 'proj-ctf-arena', memberId: 'mem-matthew', memberName: null, role: 'Project Lead' },
  { id: 'pm-11', projectId: 'proj-ctf-arena', memberId: 'mem-dave', memberName: null, role: 'Security Engineer' },
];
