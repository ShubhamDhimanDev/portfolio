export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  problem: string;
  architectureHighlights: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  status: "Live" | "In Development" | "Archived";
  year: string;
}
