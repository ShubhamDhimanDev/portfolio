import type { TechItem } from "@/types/tech";

export const TECH_STACK: TechItem[] = [
  // Frontend
  { name: "React", category: "Frontend", level: "Advanced" },
  { name: "Next.js", category: "Frontend", level: "Advanced" },
  { name: "TypeScript", category: "Frontend", level: "Advanced" },
  { name: "Tailwind CSS", category: "Frontend", level: "Advanced" },
  { name: "JavaScript", category: "Frontend", level: "Advanced" },

  // Backend
  { name: "Laravel", category: "Backend", level: "Advanced" },
  { name: "PHP", category: "Backend", level: "Advanced" },
  { name: "Node.js", category: "Backend", level: "Proficient" },
  { name: "REST APIs", category: "Backend", level: "Advanced" },
  { name: "WebSockets", category: "Backend", level: "Proficient" },
  { name: "AI Integrations", category: "Backend", level: "Proficient" },

  // Database
  { name: "PostgreSQL", category: "Database", level: "Advanced" },
  { name: "MySQL", category: "Database", level: "Advanced" },
  { name: "Redis", category: "Database", level: "Proficient" },

  // Cloud
  { name: "AWS", category: "Cloud", level: "Proficient" },
  { name: "Docker", category: "Cloud", level: "Proficient" },
  { name: "Nginx", category: "Cloud", level: "Familiar" },
  { name: "CI/CD", category: "Cloud", level: "Proficient" },

  // Tools
  { name: "Git", category: "Tools", level: "Advanced" },
  { name: "Linux", category: "Tools", level: "Proficient" },
  { name: "Postman", category: "Tools", level: "Advanced" },
  { name: "Figma", category: "Tools", level: "Familiar" },
];

export const TECH_CATEGORIES = ["Frontend", "Backend", "Database", "Cloud", "Tools"] as const;
