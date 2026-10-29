import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Trophy } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import AchievementsPage from '@/app/(public)/achievements/page';
import ProjectsPage from '@/app/(public)/projects/page';
import { AchievementCard } from '@/components/portfolio/AchievementCard';
import { PortfolioFilter } from '@/components/portfolio/PortfolioFilter';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import { TeamMemberList } from '@/components/portfolio/TeamMemberList';
import {
  LEVEL_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  formatPortfolioDate,
  formatPortfolioPeriod,
  getRankTier,
  getYear,
} from '@/components/portfolio/portfolioLabels';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { UVICS_ACHIEVEMENTS } from '@/data/mock/achievements';
import { UVICS_PROJECTS } from '@/data/mock/projects';
import { getAchievementsPage } from '@/lib/services/achievementService';
import { getProjectsPage } from '@/lib/services/projectService';
import type { ProjectWithRelations } from '@/types/portfolio';

// Halaman daftar diuji pada cabang data kosong; getter konten hero tetap asli.
vi.mock('@/lib/services/achievementService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/services/achievementService')>()),
  getAchievements: async () => [],
}));
vi.mock('@/lib/services/projectService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/services/projectService')>()),
  getProjects: async () => [],
}));

const noop = () => undefined;

describe('portfolioLabels', () => {
  it('mengambil tahun dari ISO date tanpa pergeseran zona waktu', () => {
    expect(getYear('2026-01-01')).toBe(2026);
    expect(getYear('2025-12-31')).toBe(2025);
  });

  it('menurunkan tier warna dari teks ranking', () => {
    expect(getRankTier('Juara 1')).toBe('gold');
    expect(getRankTier('juara 2 (Silver Medal)')).toBe('silver');
    expect(getRankTier('Juara 3')).toBe('bronze');
    expect(getRankTier('Top 5 Finalis')).toBe('neutral');
    expect(getRankTier('Juara 10')).toBe('neutral');
  });

  it('memformat tanggal dalam bahasa Indonesia', () => {
    expect(formatPortfolioDate('2026-08-14')).toMatch(/14 Agu(s)? 2026/);
  });

  it('menyediakan opsi untuk setiap level dan status', () => {
    expect(LEVEL_OPTIONS.map((o) => o.value)).toEqual([
      'INTERNAL',
      'REGIONAL',
      'NASIONAL',
      'INTERNASIONAL',
    ]);
    expect(PROJECT_STATUS_OPTIONS.map((o) => o.value)).toEqual([
      'PLANNED',
      'ONGOING',
      'COMPLETED',
      'ARCHIVED',
    ]);
  });
});

describe('AchievementCard', () => {
  it('menampilkan ranking, kompetisi, tim, tanggal, dan tautan detail', () => {
    const achievement = UVICS_ACHIEVEMENTS[0];
    const html = renderToStaticMarkup(
      createElement(AchievementCard, { achievement, members: ['Dave', 'Sarah', 'Kevin', 'Kezia'] }),
    );
    expect(html).toContain(achievement.ranking);
    expect(html).toContain(achievement.competitionName);
    expect(html).toContain('Dave, Sarah, Kevin +1 lainnya');
    expect(html).toContain('Nasional');
    expect(html).toContain(`dateTime="${achievement.achievementDate}"`);
    expect(html).toContain(`href="/achievements/${achievement.slug}"`);
  });

  it('menggabungkan nama yang ada dan menghitung anggota tanpa nama sebagai sisanya', () => {
    const achievement = UVICS_ACHIEVEMENTS[0];
    const named = renderToStaticMarkup(
      createElement(AchievementCard, { achievement, members: ['Dave', null, 'Sarah'] }),
    );
    expect(named).toContain('Dave, Sarah +1 lainnya');
    const unnamed = renderToStaticMarkup(createElement(AchievementCard, { achievement, members: [null, null] }));
    expect(unnamed).toContain('2 Anggota UVICS');
    expect(unnamed).not.toContain('lainnya');
  });

  it('tetap dirender tanpa gambar, level, dan anggota', () => {
    const achievement = { ...UVICS_ACHIEVEMENTS[0], coverImage: null, level: null };
    const html = renderToStaticMarkup(createElement(AchievementCard, { achievement }));
    expect(html).not.toContain('<img');
    expect(html).not.toContain('lainnya');
  });
});

describe('ProjectCard', () => {
  it('menampilkan status, ringkasan, tahun, dan tautan detail', () => {
    const project = UVICS_PROJECTS[0];
    const html = renderToStaticMarkup(createElement(ProjectCard, { project }));
    expect(html).toContain('Selesai');
    expect(html).toContain(project.summary);
    expect(html).toContain('>2025<');
    expect(html).toContain(`href="/projects/${project.slug}"`);
  });

  it('tidak menampilkan tahun bila tanggal kosong', () => {
    const project = { ...UVICS_PROJECTS[0], startDate: null, endDate: null };
    expect(renderToStaticMarkup(createElement(ProjectCard, { project }))).not.toContain('<time');
  });
});

describe('ProjectsSection', () => {
  const toRelations = (project: (typeof UVICS_PROJECTS)[number]): ProjectWithRelations => ({
    project,
    members: [],
    achievements: [],
  });

  it('menampilkan project unggulan saja walau ada project non-unggulan yang lebih baru', () => {
    const newerNonFeatured = {
      ...UVICS_PROJECTS[0],
      id: 'proj-newer',
      slug: 'proyek-terbaru',
      title: 'Proyek Terbaru Non-Unggulan',
      startDate: '2026-09-01',
      featured: false,
    };
    const featured = UVICS_PROJECTS.filter(({ featured }) => featured);
    expect(featured.length).toBeGreaterThan(0);

    const html = renderToStaticMarkup(
      createElement(ProjectsSection, { projects: [newerNonFeatured, ...featured].map(toRelations) }),
    );

    for (const { slug } of featured) expect(html).toContain(`href="/projects/${slug}"`);
    expect(html).not.toContain(`href="/projects/${newerNonFeatured.slug}"`);
  });

  it('memakai semua project bila belum ada yang ditandai unggulan', () => {
    const projects = UVICS_PROJECTS.map((project) => toRelations({ ...project, featured: false }));
    const html = renderToStaticMarkup(createElement(ProjectsSection, { projects }));
    expect(html).toContain(`href="/projects/${UVICS_PROJECTS[0].slug}"`);
  });

  it('membuka Live Demo di tab baru', () => {
    const project = { ...UVICS_PROJECTS[0], projectUrl: 'https://demo.example.com/app' };
    const html = renderToStaticMarkup(createElement(ProjectsSection, { projects: [toRelations(project)] }));
    expect(html).toContain('<a href="https://demo.example.com/app" target="_blank" rel="noopener noreferrer"');
  });
});

describe('TeamMemberList', () => {
  it('menampilkan nama dan peran, dengan pengganti untuk anggota tanpa nama publik', () => {
    const html = renderToStaticMarkup(
      createElement(TeamMemberList, {
        members: [
          { id: 'a', name: 'Dave', role: 'Project Lead' },
          { id: 'b', name: null, role: null },
        ],
      }),
    );
    expect(html).toContain('Dave');
    expect(html).toContain('Project Lead');
    expect(html).toContain('Anggota UVICS');
  });

  it('menampilkan teks kosong bila tidak ada anggota', () => {
    const html = renderToStaticMarkup(createElement(TeamMemberList, { members: [] }));
    expect(html).toContain('Data tim belum tersedia.');
    expect(html).not.toContain('<li');
  });
});

describe('PortfolioFilter', () => {
  const fields = [{ id: 'level', label: 'Level Kompetisi', options: LEVEL_OPTIONS }];

  it('menampilkan label, opsi, dan jumlah hasil tanpa tombol reset saat filter kosong', () => {
    const html = renderToStaticMarkup(
      createElement(PortfolioFilter, {
        fields,
        values: {},
        onChange: noop,
        onReset: noop,
        totalResults: 4,
        resultLabel: 'prestasi',
      }),
    );
    expect(html).toContain('Level Kompetisi');
    expect(html).toContain('Internasional');
    expect(html).toContain('prestasi');
    expect(html).not.toContain('Reset filter');
  });

  it('menampilkan tombol reset saat ada filter aktif', () => {
    const html = renderToStaticMarkup(
      createElement(PortfolioFilter, {
        fields,
        values: { level: 'NASIONAL' },
        onChange: noop,
        onReset: noop,
      }),
    );
    expect(html).toContain('Reset filter');
  });
});

describe('Pagination', () => {
  const render = (currentPage: number, totalPages: number) =>
    renderToStaticMarkup(
      createElement(Pagination, { currentPage, totalPages, onPageChange: noop }),
    );

  it('tidak dirender untuk satu halaman', () => {
    expect(render(1, 1)).toBe('');
  });

  it('menandai halaman aktif dan menonaktifkan tombol sebelumnya di halaman pertama', () => {
    const html = render(1, 3);
    expect(html).toContain('aria-current="page"');
    expect(html).toMatch(/disabled=""[^>]*aria-label="Halaman sebelumnya"|aria-label="Halaman sebelumnya"[^>]*disabled=""/);
  });

  it('memakai elipsis untuk daftar halaman panjang', () => {
    const html = render(5, 10);
    expect(html).toContain('…');
    expect(html).toContain('aria-label="Halaman 10"');
    expect(html).not.toContain('aria-label="Halaman 2"');
  });
});

describe('EmptyState', () => {
  it('menampilkan pesan, judul, dan aksi', () => {
    const html = renderToStaticMarkup(
      createElement(EmptyState, {
        title: 'Tidak ditemukan',
        message: 'Belum ada prestasi untuk filter yang dipilih.',
        action: createElement('button', null, 'Reset'),
      }),
    );
    expect(html).toContain('Tidak ditemukan');
    expect(html).toContain('Belum ada prestasi untuk filter yang dipilih.');
    expect(html).toContain('Reset');
  });
});

describe('EmptyState dengan ikon', () => {
  it('merender svg hanya bila icon diberikan', () => {
    const withIcon = renderToStaticMarkup(createElement(EmptyState, { message: 'Kosong.', icon: Trophy }));
    expect(withIcon).toContain('<svg');
    expect(withIcon).toContain('Kosong.');
    expect(renderToStaticMarkup(createElement(EmptyState, { message: 'Kosong.' }))).not.toContain('<svg');
  });
});

describe('Button tautan eksternal', () => {
  it('membuka tab baru dengan rel aman bila external', () => {
    const html = renderToStaticMarkup(Button({ href: 'https://x.test', external: true, children: 'Buka' }));
    expect(html).toContain('href="https://x.test"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('tetap tautan internal tanpa target bila tidak external', () => {
    const html = renderToStaticMarkup(Button({ href: '/projects', children: 'Buka' }));
    expect(html).toContain('href="/projects"');
    expect(html).not.toContain('target=');
  });
});

describe('halaman daftar tanpa data', () => {
  it('prestasi: hero PageHero dan pesan kosong tanpa statistik', async () => {
    const { hero } = await getAchievementsPage();
    const html = renderToStaticMarkup(await AchievementsPage());
    expect(html).toContain('<h1');
    expect(html).toContain(hero.title);
    expect(html).toContain('Belum ada prestasi yang tersedia saat ini.');
    expect(html).not.toContain('<dl');
  });

  it('project: hero PageHero dan pesan kosong', async () => {
    const { hero } = await getProjectsPage();
    const html = renderToStaticMarkup(await ProjectsPage());
    expect(html).toContain('<h1');
    expect(html).toContain(hero.title);
    expect(html).toContain('Belum ada project yang tersedia.');
  });
});

describe('formatPortfolioPeriod', () => {
  it('memformat rentang, "sekarang" bila belum selesai, dan null bila kosong', () => {
    expect(formatPortfolioPeriod('2025-08-01', '2026-03-31')).toMatch(/2025 – .*2026/);
    expect(formatPortfolioPeriod('2026-05-01', null)).toMatch(/2026 – sekarang/);
    expect(formatPortfolioPeriod(null, null)).toBeNull();
  });
});
