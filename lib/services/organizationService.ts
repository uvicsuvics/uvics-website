import {
  UVICS_MEMBERSHIPS,
  UVICS_ORGANIZATION_PAGE,
  UVICS_ORGANIZATION_PERIODS,
  type OrganizationPageContent,
  type OrganizationPeriodItem,
} from "@/data/mock/organization";
import { toPublicMember, type PublicMember } from "@/lib/backend/dto";

export type { OrganizationPageContent, OrganizationPeriodItem };

// Sumber data sementara: mock. Lihat competitionService.ts.

export async function getOrganizationPeriods(): Promise<OrganizationPeriodItem[]> {
  return [...UVICS_ORGANIZATION_PERIODS];
}

/** Periode berstatus ACTIVE (D07: paling banyak satu), atau null bila belum ada. */
export async function getActivePeriod(): Promise<OrganizationPeriodItem | null> {
  return UVICS_ORGANIZATION_PERIODS.find((period) => period.status === "ACTIVE") ?? null;
}

/** Pengurus satu periode lewat proyeksi D02; kosong bila periode belum punya data. */
export async function getPeriodMembers(periodId: string): Promise<PublicMember[]> {
  return UVICS_MEMBERSHIPS.filter((row) => row.periodId === periodId).map((row) => toPublicMember(row));
}

/** shortcut: pengurus inti dikenali dari departemen "Pengurus Inti"; ganti setelah U01 diputuskan. */
export async function getCoreTeam(periodId: string): Promise<PublicMember[]> {
  return (await getPeriodMembers(periodId)).filter((member) => member.department === "Pengurus Inti");
}

export async function getOrganizationPage(): Promise<OrganizationPageContent> {
  return UVICS_ORGANIZATION_PAGE;
}
