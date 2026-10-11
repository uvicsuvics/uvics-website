export type PeriodStatus = 'ACTIVE' | 'UPCOMING' | 'ENDED';

export interface PublicPeriodDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: PeriodStatus;
}

/**
 * Public representation of an organization officer/member.
 * PRIVACY GUARD: Strictly excludes NIM, phone number, personal email, and admin notes.
 */
export interface PublicOfficerDTO {
  id: string;
  name: string;
  role: string;
  roleTitle: string;
  major?: string;
  batch?: string;
  image: string;
  period: string;
  quote?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface PublicDepartmentGroupDTO {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconName: string;
  coordinator?: PublicOfficerDTO;
  members: PublicOfficerDTO[];
}

export interface OrganizationStructureData {
  period: PublicPeriodDTO;
  cabinetName: string;
  tagline: string;
  description: string;
  bph: PublicOfficerDTO[];
  departments: PublicDepartmentGroupDTO[];
}
