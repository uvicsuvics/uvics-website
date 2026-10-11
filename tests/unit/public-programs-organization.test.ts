import { describe, expect, it } from 'vitest';
import {
  MOCK_PERIODS,
  MOCK_ORGANIZATION_2025_2026,
  MOCK_ORGANIZATION_2024_2025,
} from '@/lib/mock-data/organization';
import { UVICS_PROGRAMS } from '@/data/mock/programs';
import { UVICS_DEPARTMENTS } from '@/data/mock/departments';

describe('Public Organization & Programs Data Integrity (Issue #25)', () => {
  describe('Organization Structure & Safe DTO compliance (D02)', () => {
    it('has an active period for 2025/2026 and ended period for 2024/2025', () => {
      const activePeriod = MOCK_PERIODS.find((p) => p.status === 'ACTIVE');
      expect(activePeriod).toBeDefined();
      expect(activePeriod?.id).toBe('period-2025-2026');

      const endedPeriod = MOCK_PERIODS.find((p) => p.status === 'ENDED');
      expect(endedPeriod).toBeDefined();
      expect(endedPeriod?.id).toBe('period-2024-2025');
    });

    it('provides archived historical period data for 2024/2025', () => {
      expect(MOCK_ORGANIZATION_2024_2025.period.status).toBe('ENDED');
      expect(MOCK_ORGANIZATION_2024_2025.bph.length).toBeGreaterThanOrEqual(2);
    });

    it('contains BPH officers with public-safe attributes and no sensitive leaks', () => {
      const bph = MOCK_ORGANIZATION_2025_2026.bph;
      expect(bph.length).toBeGreaterThanOrEqual(4);

      bph.forEach((officer) => {
        expect(officer.name).toBeTruthy();
        expect(officer.role).toBeTruthy();
        expect(officer.image).toBeTruthy();
        expect(officer.batch).toBeTruthy();
        // Strict privacy check: ensure no raw NIM or phone number leaked in officer object
        expect((officer as unknown as Record<string, unknown>).nim).toBeUndefined();
        expect((officer as unknown as Record<string, unknown>).phone).toBeUndefined();
      });
    });

    it('contains departments and coordinators without sensitive member leaks', () => {
      const departments = MOCK_ORGANIZATION_2025_2026.departments;
      expect(departments.length).toBeGreaterThanOrEqual(4);

      departments.forEach((dept) => {
        expect(dept.name).toBeTruthy();
        expect(dept.slug).toBeTruthy();
        expect(dept.coordinator).toBeDefined();
        expect(dept.coordinator?.name).toBeTruthy();

        // Check privacy of active members list
        dept.members.forEach((member) => {
          expect(member.name).toBeTruthy();
          expect((member as unknown as Record<string, unknown>).nim).toBeUndefined();
          expect((member as unknown as Record<string, unknown>).phone).toBeUndefined();
        });
      });
    });
  });

  describe('Programs Catalog Integrity', () => {
    it('contains valid programs with required fields for Bento showcase', () => {
      expect(UVICS_PROGRAMS.length).toBeGreaterThanOrEqual(6);

      UVICS_PROGRAMS.forEach((prog) => {
        expect(prog.title).toBeTruthy();
        expect(prog.slug).toBeTruthy();
        expect(prog.category).toBeTruthy();
        expect(prog.frequency).toBeTruthy();
        expect(prog.keyOutput).toBeTruthy();
        expect(prog.description).toBeTruthy();
      });
    });

    it('has unique slugs across all programs', () => {
      const slugs = UVICS_PROGRAMS.map((p) => p.slug);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(slugs.length);
    });
  });

  describe('Departments Catalog Integrity', () => {
    it('contains all 6 core technical divisions of UVICS FIK UNKLAB', () => {
      expect(UVICS_DEPARTMENTS.length).toBe(6);
      const expectedSlugs = [
        'software-engineering',
        'artificial-intelligence',
        'ui-ux-design',
        'competitive-programming',
        'cybersecurity-cloud',
        'public-relations',
      ];

      expectedSlugs.forEach((slug) => {
        const found = UVICS_DEPARTMENTS.find((d) => d.slug === slug);
        expect(found).toBeDefined();
        expect(found?.coordinator).toBeTruthy();
        expect(found?.focusAreas.length).toBeGreaterThan(0);
      });
    });
  });
});
