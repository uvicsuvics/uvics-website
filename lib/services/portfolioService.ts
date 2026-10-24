import {
  MOCK_ACHIEVEMENT_MEMBERS,
  MOCK_ACHIEVEMENTS,
  MOCK_MEMBERS,
  MOCK_PROJECT_MEMBERS,
  MOCK_PROJECTS,
} from '@/data/mock/portfolio';
import { findBySlug } from '@/lib/services/shared';
import type { Achievement, Project } from '@/types/portfolio';

// Sumber data sementara: mock relasional (data/mock/portfolio.ts). Join dilakukan di sini,
// supaya halaman tidak berubah saat diganti query Supabase.

export interface PortfolioTeamMember {
  id: string;
  name: string;
  role: string | null;
}

export interface AchievementWithRelations {
  achievement: Achievement;
  members: PortfolioTeamMember[];
  project: Project | null;
}

const MEMBER_NAMES = new Map(MOCK_MEMBERS.map((member) => [member.id, member.name]));
const PROJECTS_BY_ID = new Map(MOCK_PROJECTS.map((project) => [project.id, project]));

interface ParticipationRow {
  id: string;
  memberId: string | null;
  memberName: string | null;
  role: string | null;
}

function toTeamMembers(rows: ParticipationRow[]): PortfolioTeamMember[] {
  return rows.flatMap((row) => {
    // D18: member terdaftar lewat memberId, peserta non-member lewat memberName.
    const name = (row.memberId ? MEMBER_NAMES.get(row.memberId) : null) ?? row.memberName;
    return name ? [{ id: row.id, name, role: row.role }] : [];
  });
}

function toWithRelations(achievement: Achievement): AchievementWithRelations {
  return {
    achievement,
    members: toTeamMembers(MOCK_ACHIEVEMENT_MEMBERS.filter((row) => row.achievementId === achievement.id)),
    project: achievement.projectId ? (PROJECTS_BY_ID.get(achievement.projectId) ?? null) : null,
  };
}

export interface ProjectWithRelations {
  project: Project;
  members: PortfolioTeamMember[];
  /** Prestasi yang `projectId`-nya menunjuk project ini, terbaru lebih dulu. */
  achievements: AchievementWithRelations[];
}

/** Semua prestasi, terbaru lebih dulu. */
export async function listAchievements(): Promise<AchievementWithRelations[]> {
  return [...MOCK_ACHIEVEMENTS]
    .sort((a, b) => b.achievementDate.localeCompare(a.achievementDate))
    .map(toWithRelations);
}

/** Null bila tidak ketemu, supaya halaman detail bisa memanggil notFound(). */
export async function getAchievementDetail(slug: string): Promise<AchievementWithRelations | null> {
  const achievement = findBySlug(MOCK_ACHIEVEMENTS, slug);
  return achievement ? toWithRelations(achievement) : null;
}

/** Prestasi lain dengan level atau tahun yang sama, terbaru lebih dulu. */
export async function getRelatedAchievements(
  slug: string,
  limit = 3,
): Promise<AchievementWithRelations[]> {
  const current = findBySlug(MOCK_ACHIEVEMENTS, slug);
  if (!current) return [];

  const currentYear = current.achievementDate.slice(0, 4);
  const all = await listAchievements();
  return all
    .filter(
      ({ achievement }) =>
        achievement.id !== current.id &&
        ((current.level !== null && achievement.level === current.level) ||
          achievement.achievementDate.startsWith(currentYear)),
    )
    .slice(0, limit);
}

async function toProjectWithRelations(project: Project): Promise<ProjectWithRelations> {
  const achievements = (await listAchievements()).filter(({ achievement }) => achievement.projectId === project.id);
  return {
    project,
    members: toTeamMembers(MOCK_PROJECT_MEMBERS.filter((row) => row.projectId === project.id)),
    achievements,
  };
}

/** Semua project, terbaru (startDate) lebih dulu; tanpa startDate di urutan akhir. */
export async function listProjects(): Promise<ProjectWithRelations[]> {
  const sorted = [...MOCK_PROJECTS].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? ''));
  return Promise.all(sorted.map(toProjectWithRelations));
}

/** Null bila tidak ketemu, supaya halaman detail bisa memanggil notFound(). */
export async function getProjectDetail(slug: string): Promise<ProjectWithRelations | null> {
  const project = findBySlug(MOCK_PROJECTS, slug);
  return project ? toProjectWithRelations(project) : null;
}

/** Project lain dengan status yang sama lebih dulu, lalu sisanya; terbaru lebih dulu di tiap kelompok. */
export async function getRelatedProjects(slug: string, limit = 3): Promise<ProjectWithRelations[]> {
  const current = findBySlug(MOCK_PROJECTS, slug);
  if (!current) return [];

  const others = (await listProjects()).filter(({ project }) => project.id !== current.id);
  const sameStatus = others.filter(({ project }) => project.status === current.status);
  const rest = others.filter(({ project }) => project.status !== current.status);
  return [...sameStatus, ...rest].slice(0, limit);
}
