import {
  UVICS_PROJECT_MEMBERS,
  UVICS_PROJECTS,
  UVICS_PROJECTS_PAGE,
  type ProjectsPageContent,
} from "@/data/mock/projects";
import { getAchievements } from "@/lib/services/achievementService";
import { applyLimit, findBySlug, toTeamMembers, type ListOptions } from "@/lib/services/shared";
import type { Project, ProjectWithRelations } from "@/types/portfolio";

// Sumber data sementara: mock relasional. Lihat achievementService.ts.

async function toWithRelations(project: Project): Promise<ProjectWithRelations> {
  const achievements = (await getAchievements()).filter(({ achievement }) => achievement.projectId === project.id);
  return {
    project,
    members: toTeamMembers(UVICS_PROJECT_MEMBERS.filter((row) => row.projectId === project.id)),
    achievements,
  };
}

/** Project, terbaru (startDate) lebih dulu; tanpa startDate di urutan akhir. */
export async function getProjects(options: ListOptions = {}): Promise<ProjectWithRelations[]> {
  const sorted = [...UVICS_PROJECTS].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  return Promise.all(applyLimit(sorted, options.limit).map(toWithRelations));
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithRelations | null> {
  const project = findBySlug(UVICS_PROJECTS, slug);
  return project ? toWithRelations(project) : null;
}

/** Project lain dengan status yang sama lebih dulu, lalu sisanya; terbaru lebih dulu di tiap kelompok. */
export async function getRelatedProjects(slug: string, limit = 3): Promise<ProjectWithRelations[]> {
  const current = findBySlug(UVICS_PROJECTS, slug);
  if (!current) return [];

  const others = (await getProjects()).filter(({ project }) => project.id !== current.id);
  const sameStatus = others.filter(({ project }) => project.status === current.status);
  const rest = others.filter(({ project }) => project.status !== current.status);
  return [...sameStatus, ...rest].slice(0, limit);
}

export async function getProjectsPage(): Promise<ProjectsPageContent> {
  return UVICS_PROJECTS_PAGE;
}
