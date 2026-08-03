export interface ExperienceItem {
  id: string;
  organization: string;
  role: string;
  period: string;
  location: string;
  description: string;
  highlights: string[];
  tech: string[];
  current?: boolean;
}
