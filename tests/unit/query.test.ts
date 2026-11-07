import { describe, expect, it } from 'vitest';
import { listHref, paginate, readEnum, readPage, readSearch } from '@/lib/services/query';

describe('kontrak query dan pagination', () => {
  it('membaca page, search, dan enum dengan default aman', () => {
    for (const page of ['abc', '0', '-1', '1.5', undefined]) expect(readPage({ page })).toBe(1);
    expect(readPage({ page: ['3', '4'] })).toBe(3);
    expect(readSearch({ search: '  ai   ml  ' })).toBe('ai ml');
    expect(readSearch({ search: 'x'.repeat(300) })).toHaveLength(100);
    expect(readSearch({ search: '   ' })).toBeUndefined();
    expect(readEnum({ status: 'foo' }, 'status', ['OPEN', 'CLOSED'])).toBeUndefined();
    expect(readEnum({ status: ['OPEN', 'CLOSED'] }, 'status', ['OPEN', 'CLOSED'])).toBe('OPEN');
  });

  it('memotong halaman dengan meta kontrak backend', () => {
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual({
      items: [3, 4],
      pagination: { page: 2, page_size: 2, total_items: 5, total_pages: 3 },
    });
    expect(paginate([], 1, 6).items).toEqual([]);
    expect(() => paginate([1, 2], 3, 2)).toThrow(expect.objectContaining({ code: 'NOT_FOUND' }));
    expect(() => paginate([1], 1, 101)).toThrow(RangeError);
    expect(() => paginate([1], 0, 10)).toThrow(RangeError);
  });

  it('membangun href tanpa nilai kosong dan tanpa page 1', () => {
    expect(listHref('/competitions', { search: 'ai ml', status: 'OPEN', page: 1 })).toBe(
      '/competitions?search=ai+ml&status=OPEN',
    );
    expect(listHref('/competitions', { search: undefined, status: '', page: 2 })).toBe(
      '/competitions?page=2',
    );
    expect(listHref('/competitions', {})).toBe('/competitions');
  });
});
