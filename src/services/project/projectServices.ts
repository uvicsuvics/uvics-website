import { UVICS_PROJECTS as projects } from "@/src/data/mock/projects";
import {
  applyLimit,
  findById,
  type ListOptions,
} from "@/src/services/utils/utils";

export type Project = (typeof projects)[number];

// SUMBER DATA: saat ini mock. Saat backend siap, ganti isi fungsi di bawah
// dengan fetch() dan biarkan signature-nya tetap.

export async function getProjects(
  options: ListOptions = {},
): Promise<Project[]> {
  return applyLimit(projects, options.limit);
}

export async function getProjectById(
  id: string | number,
): Promise<Project | null> {
  return findById(projects, id);
}
