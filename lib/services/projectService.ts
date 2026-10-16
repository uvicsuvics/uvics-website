import { UVICS_PROJECTS, type ProjectItem } from "@/data/mock/projects";
import { applyLimit, findBySlug, type ListOptions } from "@/lib/services/shared";

// Sumber data sementara: mock. Lihat competitionService.ts.

export async function getProjects(options: ListOptions = {}): Promise<ProjectItem[]> {
  return applyLimit(UVICS_PROJECTS, options.limit);
}

export async function getProjectBySlug(slug: string): Promise<ProjectItem | null> {
  return findBySlug(UVICS_PROJECTS, slug);
}
