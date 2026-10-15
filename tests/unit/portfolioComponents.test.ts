import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AchievementCard } from '@/components/portfolio/AchievementCard';
import { EmptyState } from '@/components/portfolio/EmptyState';
import { Pagination } from '@/components/portfolio/Pagination';
import { PortfolioFilter } from '@/components/portfolio/PortfolioFilter';
import { ProjectCard } from '@/components/portfolio/ProjectCard';
import {
  LEVEL_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  formatPortfolioDate,
  getYear,
} from '@/components/portfolio/portfolioLabels';
import { MOCK_ACHIEVEMENTS, MOCK_PROJECTS } from '@/data/mock/portfolio';

const noop = () => undefined;

describe('portfolioLabels', () => {
  it('mengambil tahun dari ISO date tanpa pergeseran zona waktu', () => {
    expect(getYear('2026-01-01')).toBe(2026);
    expect(getYear('2025-12-31')).toBe(2025);
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
    const achievement = MOCK_ACHIEVEMENTS[0];
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

  it('tetap dirender tanpa gambar, level, dan anggota', () => {
    const achievement = { ...MOCK_ACHIEVEMENTS[0], coverImage: null, level: null };
    const html = renderToStaticMarkup(createElement(AchievementCard, { achievement }));
    expect(html).not.toContain('<img');
    expect(html).not.toContain('lainnya');
  });
});

describe('ProjectCard', () => {
  it('menampilkan status, ringkasan, tahun, dan kategori bila diberikan', () => {
    const project = MOCK_PROJECTS[0];
    const html = renderToStaticMarkup(createElement(ProjectCard, { project, category: 'Web App' }));
    expect(html).toContain('Selesai');
    expect(html).toContain(project.summary);
    expect(html).toContain('>2025<');
    expect(html).toContain('Web App');
    expect(html).toContain(`href="/projects/${project.slug}"`);
  });

  it('tidak menampilkan tahun bila tanggal kosong', () => {
    const project = { ...MOCK_PROJECTS[0], startDate: null, endDate: null };
    expect(renderToStaticMarkup(createElement(ProjectCard, { project }))).not.toContain('<time');
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
