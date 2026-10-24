import { describe, expect, it } from 'vitest';
import { filterAchievements, getAchievementFilterFields } from '@/components/portfolio/achievementFilters';
import { filterProjects, getProjectFilterFields } from '@/components/portfolio/projectFilters';
import { MOCK_ACHIEVEMENTS } from '@/data/mock/portfolio';
import {
  getAchievementDetail,
  getProjectDetail,
  getRelatedProjects,
  listProjects,
  getRelatedAchievements,
  listAchievements,
} from '@/lib/services/portfolioService';

describe('portfolioService', () => {
  it('mengurutkan prestasi dari yang terbaru', async () => {
    const dates = (await listAchievements()).map(({ achievement }) => achievement.achievementDate);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(dates).toHaveLength(MOCK_ACHIEVEMENTS.length);
  });

  it('menggabungkan anggota (member terdaftar dan non-member) dan project', async () => {
    const detail = await getAchievementDetail('juara-1-national-ai-hackathon-2026');
    expect(detail?.members.map((m) => m.name)).toEqual(['Dave Sumampouw', 'Sarah Manoppo', 'Kevin Kalangi']);
    expect(detail?.project?.id).toBe('proj-nusantara-vision');

    const guest = await getAchievementDetail('top-5-finalist-gemastik-xvii');
    expect(guest?.members.map((m) => m.name)).toContain('Alvin Mokodompit');
    expect(guest?.project).toBeNull();
  });

  it('mengembalikan null untuk slug yang tidak ada', async () => {
    expect(await getAchievementDetail('tidak-ada')).toBeNull();
    expect(await getRelatedAchievements('tidak-ada')).toEqual([]);
  });

  it('prestasi terkait tidak memuat dirinya sendiri dan menghormati limit', async () => {
    const slug = 'juara-1-national-ai-hackathon-2026';
    const related = await getRelatedAchievements(slug, 2);
    expect(related).toHaveLength(2);
    expect(related.some(({ achievement }) => achievement.slug === slug)).toBe(false);
  });
});

describe('achievementFilters', () => {
  it('menyusun opsi tahun (terbaru dulu) dan ranking unik dari data', async () => {
    const fields = getAchievementFilterFields(await listAchievements());
    const years = fields.find((f) => f.id === 'year')?.options.map((o) => o.value);
    expect(years).toEqual(['2026', '2025', '2024']);
    const rankings = fields.find((f) => f.id === 'ranking')?.options.map((o) => o.value);
    expect(rankings).toEqual(['Juara 1', 'Juara 2', 'Top 5 Finalis']);
  });

  it('menyaring per tahun dan ranking; nilai kosong berarti semua', async () => {
    const items = await listAchievements();
    expect(filterAchievements(items, {})).toHaveLength(items.length);
    expect(filterAchievements(items, { year: '2026' })).toHaveLength(2);
    expect(filterAchievements(items, { year: '2026', ranking: 'Juara 1' })).toHaveLength(2);
    expect(filterAchievements(items, { year: '2024', ranking: 'Juara 1' })).toHaveLength(0);
    expect(filterAchievements(items, { level: 'INTERNASIONAL' })).toHaveLength(0);
  });
});

describe('portfolioService (project)', () => {
  it('mengurutkan project dari startDate terbaru', async () => {
    const dates = (await listProjects()).map(({ project }) => project.startDate);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('menggabungkan tim dan prestasi terkait', async () => {
    const detail = await getProjectDetail('nusantaravision-crop-ai');
    expect(detail?.members.map((m) => m.role)).toContain('Project Lead');
    expect(detail?.achievements.map(({ achievement }) => achievement.slug)).toEqual([
      'juara-1-national-ai-hackathon-2026',
    ]);
    expect((await getProjectDetail('klabat-ctf-security-arena'))?.achievements).toEqual([]);
  });

  it('mengembalikan null untuk slug yang tidak ada', async () => {
    expect(await getProjectDetail('tidak-ada')).toBeNull();
    expect(await getRelatedProjects('tidak-ada')).toEqual([]);
  });

  it('project terkait tidak memuat dirinya, status sama didahulukan, dan limit dihormati', async () => {
    const related = await getRelatedProjects('klabat-campus-superapp', 2);
    expect(related).toHaveLength(2);
    expect(related.every(({ project }) => project.slug !== 'klabat-campus-superapp')).toBe(true);
    expect(related.every(({ project }) => project.status === 'COMPLETED')).toBe(true);
  });
});

describe('projectFilters', () => {
  it('menyusun opsi tahun dan menyaring per tahun/status', async () => {
    const items = await listProjects();
    const fields = getProjectFilterFields(items);
    expect(fields.find((f) => f.id === 'year')?.options.map((o) => o.value)).toEqual(['2026', '2025']);
    expect(filterProjects(items, {})).toHaveLength(items.length);
    expect(filterProjects(items, { year: '2025' })).toHaveLength(2);
    expect(filterProjects(items, { status: 'ONGOING' })).toHaveLength(1);
    expect(filterProjects(items, { year: '2025', status: 'ONGOING' })).toHaveLength(0);
  });
});
