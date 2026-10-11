export type ProgramCategory =
  | 'Kompetisi'
  | 'Pelatihan'
  | 'Inovasi'
  | 'Showcase'
  | 'Komunitas';

export interface PublicProgramDTO {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: ProgramCategory;
  frequency: string;
  iconName: 'Trophy' | 'Laptop' | 'Rocket' | 'Presentation' | 'Compass' | 'Users';
  keyOutput: string;
  targetAudience: string;
  badgeText?: string;
  stepNumber: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
}
