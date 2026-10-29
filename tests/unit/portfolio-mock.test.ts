import { describe, expect, it } from 'vitest';
import { UVICS_ACHIEVEMENT_MEMBERS, UVICS_ACHIEVEMENTS } from '@/data/mock/achievements';
import { UVICS_PROJECT_MEMBERS, UVICS_PROJECTS } from '@/data/mock/projects';

const projectIds = new Set(UVICS_PROJECTS.map((project) => project.id));
const achievementIds = new Set(UVICS_ACHIEVEMENTS.map((achievement) => achievement.id));
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

// Tautan contoh karangan: subdomain *.uvics.org dan repositori github.com/uvicsuvics/* belum tentu ada.
function isInventedExampleLink(raw: string): boolean {
  const { hostname, pathname } = new URL(raw);
  return (
    hostname.toLowerCase().endsWith('uvics.org') ||
    `${hostname}${pathname}`.toLowerCase().startsWith('github.com/uvicsuvics/')
  );
}

describe('portfolio mock data (relational integrity)', () => {
  it('uses unique ids and DB-valid unique slugs', () => {
    for (const rows of [UVICS_PROJECTS, UVICS_ACHIEVEMENTS, UVICS_ACHIEVEMENT_MEMBERS, UVICS_PROJECT_MEMBERS]) {
      expect(hasDuplicates(rows.map((row) => row.id))).toBe(false);
    }
    for (const rows of [UVICS_PROJECTS, UVICS_ACHIEVEMENTS]) {
      expect(hasDuplicates(rows.map((row) => row.slug))).toBe(false);
      for (const row of rows) expect(row.slug).toMatch(SLUG_PATTERN);
    }
  });

  it('links Achievement ↔ Project only to existing projects', () => {
    for (const achievement of UVICS_ACHIEVEMENTS) {
      if (achievement.projectId !== null) expect(projectIds).toContain(achievement.projectId);
    }
    expect(UVICS_ACHIEVEMENTS.some((a) => a.projectId !== null)).toBe(true);
    expect(UVICS_ACHIEVEMENTS.some((a) => a.projectId === null)).toBe(true);
  });

  it('links participations only to existing achievements and projects', () => {
    for (const row of UVICS_ACHIEVEMENT_MEMBERS) expect(achievementIds).toContain(row.achievementId);
    for (const row of UVICS_PROJECT_MEMBERS) expect(projectIds).toContain(row.projectId);
  });

  it('follows D18: each participation has a member or a name, one member once per parent', () => {
    const achievementPairs = UVICS_ACHIEVEMENT_MEMBERS.filter((r) => r.memberId).map(
      (r) => `${r.achievementId}:${r.memberId}`,
    );
    const projectPairs = UVICS_PROJECT_MEMBERS.filter((r) => r.memberId).map(
      (r) => `${r.projectId}:${r.memberId}`,
    );
    for (const row of [...UVICS_ACHIEVEMENT_MEMBERS, ...UVICS_PROJECT_MEMBERS]) {
      expect(row.memberId !== null || row.memberName !== null).toBe(true);
    }
    expect(hasDuplicates(achievementPairs)).toBe(false);
    expect(hasDuplicates(projectPairs)).toBe(false);
  });

  it('gives every achievement and project at least one participant', () => {
    for (const id of achievementIds) {
      expect(UVICS_ACHIEVEMENT_MEMBERS.some((row) => row.achievementId === id)).toBe(true);
    }
    for (const id of projectIds) {
      expect(UVICS_PROJECT_MEMBERS.some((row) => row.projectId === id)).toBe(true);
    }
  });

  it('keeps start_date <= end_date for projects', () => {
    for (const { startDate, endDate } of UVICS_PROJECTS) {
      if (startDate && endDate) expect(startDate <= endDate).toBe(true);
    }
  });

  it('contains no invented example links (uvics.org subdomains, uvicsuvics repositories)', () => {
    const rows = [...UVICS_PROJECTS, ...UVICS_ACHIEVEMENTS, ...UVICS_PROJECT_MEMBERS, ...UVICS_ACHIEVEMENT_MEMBERS];
    const urls = rows
      .flatMap((row) => Object.values(row))
      .filter((value): value is string => typeof value === 'string' && /^https?:\/\//i.test(value));
    for (const raw of urls) expect(isInventedExampleLink(raw), raw).toBe(false);
  });

  it('flags the invented example links the scan guards against', () => {
    expect(isInventedExampleLink('https://campus.uvics.org')).toBe(true);
    expect(isInventedExampleLink('https://github.com/uvicsuvics/campus-superapp')).toBe(true);
  });
});
