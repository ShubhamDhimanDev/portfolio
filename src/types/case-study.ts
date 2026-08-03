export interface CaseStudyMetric {
  label: string;
  value: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  role: string;
  summary: string;
  problem: string;
  challenges: string[];
  architecture: string;
  architectureSteps: string[];
  databaseDesign: string;
  scalability: string;
  techStack: string[];
  outcome: string;
  metrics: CaseStudyMetric[];
}
