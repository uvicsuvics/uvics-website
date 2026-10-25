import {
  UVICS_PROGRAMS,
  UVICS_PROGRAMS_PAGE,
  type ProgramItem,
  type ProgramsPageContent,
} from "@/data/mock/programs";
import { applyLimit, type ListOptions } from "@/lib/services/shared";

// Sumber data sementara: mock. Lihat competitionService.ts.

/** Hanya field yang ada di tabel `programs`; kategori, frekuensi, dll. menunggu U05. */
export type PublicProgram = Pick<ProgramItem, "id" | "slug" | "title" | "description" | "image">;

export async function getPrograms(options: ListOptions = {}): Promise<PublicProgram[]> {
  return applyLimit(UVICS_PROGRAMS, options.limit).map(({ id, slug, title, description, image }) => ({
    id,
    slug,
    title,
    description,
    image,
  }));
}

export async function getProgramsPage(): Promise<ProgramsPageContent> {
  return UVICS_PROGRAMS_PAGE;
}
