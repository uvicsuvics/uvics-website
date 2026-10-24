import { describe, expect, it } from 'vitest';
import {
  MOCK_ACHIEVEMENT_MEMBERS,
  MOCK_ACHIEVEMENTS,
  MOCK_MEMBERS,
  MOCK_PROJECT_MEMBERS,
  MOCK_PROJECTS,
} from '@/data/mock/portfolio';

const memberIds = new Set(MOCK_MEMBERS.map((member) => member.id));
const projectIds = new Set(MOCK_PROJECTS.map((project) => project.id));
const achievementIds = new Set(MOCK_ACHIEVEMENTS.map((achievement) => achievement.id));
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

describe('portfolio mock data (relational integrity)', () => {
  it('uses unique ids and DB-valid unique slugs', () => {
    for (const rows of [MOCK_MEMBERS, MOCK_PROJECTS, MOCK_ACHIEVEMENTS]) {
      expect(hasDuplicates(rows.map((row) => row.id))).toBe(false);
    }
    for (const rows of [MOCK_PROJECTS, MOCK_ACHIEVEMENTS]) {
      expect(hasDuplicates(rows.map((row) => row.slug))).toBe(false);
      for (const row of rows) expect(row.slug).toMatch(SLUG_PATTERN);
    }
  });

  it('links Achievement ↔ Project only to existing projects', () => {
    for (const achievement of MOCK_ACHIEVEMENTS) {
      if (achievement.projectId !== null) expect(projectIds).toContain(achievement.projectId);
    }
    expect(MOCK_ACHIEVEMENTS.some((a) => a.projectId !== null)).toBe(true);
    expect(MOCK_ACHIEVEMENTS.some((a) => a.projectId === null)).toBe(true);
  });

  it('links Achievement ↔ Member and Project ↔ Member only to existing rows', () => {
    for (const row of MOCK_ACHIEVEMENT_MEMBERS) {
      expect(achievementIds).toContain(row.achievementId);
      if (row.memberId !== null) expect(memberIds).toContain(row.memberId);
    }
    for (const row of MOCK_PROJECT_MEMBERS) {
      expect(projectIds).toContain(row.projectId);
      if (row.memberId !== null) expect(memberIds).toContain(row.memberId);
    }
  });

  it('follows D18: each participation has a member or a name, one member once per parent', () => {
    const achievementPairs = MOCK_ACHIEVEMENT_MEMBERS.filter((r) => r.memberId).map(
      (r) => `${r.achievementId}:${r.memberId}`,
    );
    const projectPairs = MOCK_PROJECT_MEMBERS.filter((r) => r.memberId).map(
      (r) => `${r.projectId}:${r.memberId}`,
    );
    for (const row of [...MOCK_ACHIEVEMENT_MEMBERS, ...MOCK_PROJECT_MEMBERS]) {
      expect(row.memberId !== null || row.memberName !== null).toBe(true);
    }
    expect(hasDuplicates(achievementPairs)).toBe(false);
    expect(hasDuplicates(projectPairs)).toBe(false);
  });

  it('gives every achievement and project at least one participant', () => {
    for (const id of achievementIds) {
      expect(MOCK_ACHIEVEMENT_MEMBERS.some((row) => row.achievementId === id)).toBe(true);
    }
    for (const id of projectIds) {
      expect(MOCK_PROJECT_MEMBERS.some((row) => row.projectId === id)).toBe(true);
    }
  });

  it('keeps start_date <= end_date for projects', () => {
    for (const { startDate, endDate } of MOCK_PROJECTS) {
      if (startDate && endDate) expect(startDate <= endDate).toBe(true);
    }
  });
});
