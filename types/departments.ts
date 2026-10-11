export type DepartmentIconName =
  | 'Code2'
  | 'BrainCircuit'
  | 'Palette'
  | 'Trophy'
  | 'ShieldCheck'
  | 'Megaphone';

export interface PublicDepartmentDTO {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  iconName: DepartmentIconName;
  coordinator?: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  memberCount: number;
  projectsCount: number;
  focusAreas: string[];
  featured?: boolean;
}
