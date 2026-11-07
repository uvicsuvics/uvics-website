import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import AchievementsPage from '@/app/(public)/achievements/page';
import { UVICS_ACHIEVEMENTS } from '@/data/mock/achievements';

// Tanpa mock: statistik hanya dirender bila ada data prestasi (lihat portfolioComponents.test.ts untuk cabang kosong).
describe('statistik halaman prestasi', () => {
  it('merender label sebagai dt dan angka sebagai dd, dengan class order agar angka tampil di atas', async () => {
    const html = renderToStaticMarkup(await AchievementsPage());
    const dl = /<dl[\s\S]*?<\/dl>/.exec(html)?.[0] ?? '';
    const pairs = [
      ...dl.matchAll(/<dt class="([^"]*)">([^<]*)<\/dt><dd class="([^"]*)">([^<]*)<\/dd>/g),
    ];

    expect(pairs).toHaveLength(3);
    const [first] = pairs;
    expect(first[1]).toContain('order-2');
    expect(first[2]).toBe('Total Prestasi');
    expect(first[3]).toContain('order-1');
    expect(first[4]).toBe(String(UVICS_ACHIEVEMENTS.length));
  });
});
