import type { ExperienceItem } from "@/types/experience";

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "ecomm-lab",
    organization: "Ecomm Lab",
    role: "Senior Software Engineer",
    period: "Apr 2026 - Present",
    location: "On-site",
    description:
      "Leading engineering at a product studio building SaaS platforms and custom client systems — owning architecture, infrastructure, and delivery across multiple concurrent products.",
    highlights: [
      "Built a multi-tenant booking SaaS platform from scratch, covering scheduling, payments, and client management",
      "Built a multi-tenant ecommerce SaaS platform handling storefronts, inventory, and order workflows",
      "Delivered a custom college mini CMS for institution content management with role-based access",
    ],
    tech: ["Laravel", "PHP", "React", "Next.js", "MySQL", "PostgreSQL", "AWS", "Tailwind", "Claude AI"],
    current: true,
  },
  {
    id: "dastek-softwares",
    organization: "DAStek Softwares",
    role: "Senior Software Engineer",
    period: "Feb 2023 - Mar 2026",
    location: "Remote",
    description:
      "Maintained and scaled business applications for multiple clients — handling large-scale data migrations, API performance under heavy load, and multi-server infrastructure across a 3-year engagement.",
    highlights: [
      "Optimized APIs to reliably handle ~200K records, reducing response times significantly under production load",
      "Executed a complex database migration from project v1 to v2, correctly mapping 1M records with zero data loss",
      "Managed and maintained multiple production servers, ensuring uptime and stability across client environments",
    ],
    tech: ["Laravel", "ColdFusion", "AWS", "MSSQL", "Docker", "Bootstrap"],
  },
  {
    id: "pearl-organization",
    organization: "Pearl Organization",
    role: "Technical Executive",
    period: "Dec 2021 - Jan 2023",
    location: "On-site",
    description:
      "Started full-time in a hands-on technical role, shipping ecommerce platforms, a property listing system, and API integrations — learning to own features from requirements through to production deployment.",
    highlights: [
      "Built and shipped multiple ecommerce projects from the ground up, handling product, cart, and checkout flows",
      "Developed a property listing platform with search, filtering, and inquiry management",
      "Implemented REST APIs and WebSocket-based real-time features across client-facing products",
    ],
    tech: ["Laravel", "MySQL", "JavaScript", "Bootstrap"],
  },
];
