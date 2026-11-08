import { cache } from "react";
import {
  UVICS_PROJECT_MEMBERS,
  UVICS_PROJECTS,
  UVICS_PROJECTS_PAGE,
  type ProjectsPageContent,
} from "@/data/mock/projects";
import { getAchievements } from "@/lib/services/achievementService";
import { applyLimit, findBySlug, groupBy, toTeamMembers, type ListOptions } from "@/lib/services/shared";
import type { Project, ProjectWithRelations } from "@/types/portfolio";

// Sumber data sementara: mock relasional. Lihat achievementService.ts.

/** Relasi dibangun sekali per pemanggilan (satu join prestasi, satu pengelompokan anggota), lalu dipakai tiap project. */
async function createRelationBuilder(): Promise<(project: Project) => ProjectWithRelations> {
  const achievementsByProject = groupBy(await getAchievements(), ({ achievement }) => achievement.projectId);
  const membersByProject = groupBy(UVICS_PROJECT_MEMBERS, (row) => row.projectId);
  return (project) => ({
    project,
    members: toTeamMembers(membersByProject.get(project.id) ?? []),
    achievements: achievementsByProject.get(project.id) ?? [],
  });
}

/** Project, terbaru (startDate) lebih dulu; tanpa startDate di urutan akhir. */
export async function getProjects(options: ListOptions = {}): Promise<ProjectWithRelations[]> {
  const sorted = [...UVICS_PROJECTS].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  return applyLimit(sorted, options.limit).map(await createRelationBuilder());
}

/** Dibungkus `cache` supaya `generateMetadata` dan page berbagi satu hasil per request. */
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectWithRelations | null> => {
  const project = findBySlug(UVICS_PROJECTS, slug);
  return project ? (await createRelationBuilder())(project) : null;
});

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
