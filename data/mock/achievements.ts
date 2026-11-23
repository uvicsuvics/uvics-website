import type { PageHeroContent } from '@/data/mock/about';
import type { Achievement, AchievementMember } from '@/types/portfolio';

// Data relasional bergaya tabel: relasi hanya lewat id, tanpa objek bersarang.
// Penggabungan (join) dilakukan di lib/services, bukan di sini.
// Nama peserta ada di `memberName`, juga untuk baris yang punya `memberId`: proyeksi nama member belum ada.
// Satu baris tertaut (am-8) sengaja tanpa nama, meniru kontrak #11 supaya placeholder teruji.

export const UVICS_ACHIEVEMENTS: Achievement[] = [
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

export const UVICS_ACHIEVEMENT_MEMBERS: AchievementMember[] = [
  { id: 'am-1', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-dave', memberName: 'Dave Sumampouw', role: 'Ketua Tim' },
  { id: 'am-2', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-sarah', memberName: 'Sarah Manoppo', role: 'ML Engineer' },
  { id: 'am-3', achievementId: 'ach-ai-hackathon-2026', memberId: 'mem-kevin', memberName: 'Kevin Kalangi', role: 'Backend Engineer' },
  { id: 'am-4', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-matthew', memberName: 'Matthew Tambuwun', role: 'Ketua Tim' },
  { id: 'am-5', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-kezia', memberName: 'Kezia Sondakh', role: 'UI/UX Designer' },
  { id: 'am-6', achievementId: 'ach-hackathon-merdeka-2025', memberId: 'mem-dave', memberName: 'Dave Sumampouw', role: 'Backend Engineer' },
  { id: 'am-7', achievementId: 'ach-uiux-techfair-2026', memberId: 'mem-kezia', memberName: 'Kezia Sondakh', role: 'Ketua Tim' },
  { id: 'am-8', achievementId: 'ach-uiux-techfair-2026', memberId: 'mem-rachel', memberName: null, role: 'UI/UX Designer' },
  { id: 'am-9', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-jonathan', memberName: 'Jonathan Rumagit', role: 'Ketua Tim' },
  { id: 'am-10', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-clarissa', memberName: 'Clarissa Pangkey', role: 'Frontend Engineer' },
  { id: 'am-11', achievementId: 'ach-gemastik-xvii-2024', memberId: 'mem-dave', memberName: 'Dave Sumampouw', role: 'Backend Engineer' },
  // Peserta non-member (D18): hanya nama, tanpa tautan ke members.
  { id: 'am-12', achievementId: 'ach-gemastik-xvii-2024', memberId: null, memberName: 'Alvin Mokodompit', role: 'Anggota Tamu' },
];

export interface AchievementsPageContent {
  hero: PageHeroContent;
}

export const UVICS_ACHIEVEMENTS_PAGE: AchievementsPageContent = {
  hero: {
    title: 'Prestasi',
    titleHighlight: 'UVICS',
    description: 'Capaian mahasiswa UVICS di kompetisi nasional dan internasional.',
    image: {
      src: '/images/img/foto-8.webp',
      alt: 'Anggota UVICS berkaus biru berfoto bersama di pantai dengan pohon kelapa dan gazebo',
    },
  },
};
