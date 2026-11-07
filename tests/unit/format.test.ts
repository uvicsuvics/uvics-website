import { describe, expect, it } from 'vitest';
import { formatDate, formatDayMonth, formatPeriod, getYear, todayInWita } from '@/lib/format/date';
import {
  COMPETITION_STATUS_LABELS,
  CONTENT_LEVEL_LABELS,
  PROJECT_STATUS_LABELS,
  toOptions,
} from '@/lib/format/labels';
import { Constants } from '@/types/database';

describe('format date', () => {
  it('memformat tanggal YYYY-MM-DD tanpa pergeseran zona waktu', () => {
    expect(formatDate('2026-01-01')).toBe('1 Jan 2026');
    expect(formatDate('2025-12-31', 'long')).toBe('31 Desember 2025');
    expect(getYear('2026-01-01')).toBe(2026);
    expect(getYear('2025-12-31')).toBe(2025);
  });

  it('menolak datetime agar tanggal tidak bergeser diam-diam', () => {
    expect(() => formatDate('2026-10-15T23:59:00+08:00')).toThrow(RangeError);
  });

  it('memformat periode dan null bila kosong', () => {
    expect(formatPeriod('2025-08-01', '2026-03-31')).toMatch(/2025 – .*2026/);
    expect(formatPeriod('2026-05-01', null)).toMatch(/2026 – sekarang/);
    expect(formatPeriod(null, null)).toBeNull();
  });
});

describe('format day-month', () => {
  it('memecah tanggal YYYY-MM-DD untuk ubin tanggal', () => {
    expect(formatDayMonth('2026-10-05')).toEqual({ day: '5', month: 'Okt' });
    expect(formatDayMonth('2026-01-31')).toEqual({ day: '31', month: 'Jan' });
    expect(() => formatDayMonth('2026-10-05T23:00:00Z')).toThrow(RangeError);
  });

  it('memberi tanggal hari ini menurut WITA (UTC+8)', () => {
    expect(todayInWita(new Date('2026-11-06T15:59:00Z'))).toBe('2026-11-06');
    expect(todayInWita(new Date('2026-11-06T16:00:00Z'))).toBe('2026-11-07');
  });
});

describe('format labels', () => {
  it('punya label untuk setiap kode enum DB', () => {
    expect(Object.keys(CONTENT_LEVEL_LABELS)).toEqual([...Constants.public.Enums.content_level]);
    expect(Object.keys(COMPETITION_STATUS_LABELS)).toEqual([
      ...Constants.public.Enums.competition_status,
    ]);
    expect(Object.keys(PROJECT_STATUS_LABELS)).toEqual([...Constants.public.Enums.project_status]);
    expect(toOptions(PROJECT_STATUS_LABELS)[0]).toEqual({ value: 'PLANNED', label: 'Direncanakan' });
  });
});
