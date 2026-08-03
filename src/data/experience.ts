import type { ExperienceItem } from "@/types/experience";

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: "product-development",
    organization: "Independent Product Development",
    role: "Founding Engineer",
    period: "2025 - Present",
    location: "Remote",
    description:
      "Designing and building Sessionora and a small portfolio of SaaS products end-to-end - product decisions, architecture, and shipping, without a hand-off to someone else's roadmap.",
    highlights: [
      "Architected Sessionora's multi-tenant booking engine from a blank repository to a live product",
      "Owns the full lifecycle: infrastructure, API design, billing integration, and customer-facing UI",
      "Applies lessons from agency work to ship with production-grade discipline from day one",
    ],
    tech: ["Laravel", "Next.js", "PostgreSQL", "AWS", "Docker"],
    current: true,
  },
  {
    id: "dastek-softwares",
    organization: "Dastek Softwares",
    role: "Full Stack Developer",
    period: "2024 - 2025",
    location: "On-site / Hybrid",
    description:
      "Built and maintained business applications for clients across retail, hospitality, and education - from multi-tenant SaaS foundations to real-time ordering systems.",
    highlights: [
      "Delivered a school ERP and a restaurant ordering platform used daily by non-technical staff",
      "Introduced WebSocket-based real-time features that replaced polling across two client products",
      "Built a reusable multi-tenant SaaS starter that cut new-client onboarding time significantly",
    ],
    tech: ["Laravel", "PHP", "MySQL", "React", "WebSockets"],
  },
  {
    id: "pearl-organization",
    organization: "Pearl Organization",
    role: "Software Engineer",
    period: "2023 - 2024",
    location: "On-site",
    description:
      "Started full-time as a software engineer building internal tools and client-facing web applications, learning to take ownership of features from requirement to deployment.",
    highlights: [
      "Shipped internal admin dashboards and REST APIs powering core business workflows",
      "Worked directly with stakeholders to translate business requirements into data models",
      "Built foundational skills in database design and production debugging under real deadlines",
    ],
    tech: ["PHP", "Laravel", "MySQL", "JavaScript"],
  },
];
