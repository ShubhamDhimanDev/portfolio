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
  screenshot?: string;
  featured?: boolean;
  status: "Live" | "In Development" | "Archived" | "In Progress";
  year: string;
}
