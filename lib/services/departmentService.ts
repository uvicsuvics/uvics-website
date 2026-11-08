import {
  UVICS_DEPARTMENTS,
  UVICS_DEPARTMENTS_PAGE,
  type DepartmentItem,
  type DepartmentsPageContent,
} from "@/data/mock/departments";
import { findBySlug } from "@/lib/services/shared";

// Sumber data sementara: mock. Lihat competitionService.ts.

/** Hanya field yang ada di tabel `departments`; koordinator dan anggota dibaca dari organizationService. */
export type PublicDepartment = Pick<DepartmentItem, "id" | "slug" | "name" | "description">;

function toPublicDepartment({ id, slug, name, description }: DepartmentItem): PublicDepartment {
  return { id, slug, name, description };
}

export async function getDepartments(): Promise<PublicDepartment[]> {
  return UVICS_DEPARTMENTS.map(toPublicDepartment);
}

export async function getDepartmentBySlug(slug: string): Promise<PublicDepartment | null> {
  const department = findBySlug(UVICS_DEPARTMENTS, slug);
  return department ? toPublicDepartment(department) : null;
}

export async function getDepartmentsPage(): Promise<DepartmentsPageContent> {
  return UVICS_DEPARTMENTS_PAGE;
}
