import type { Project } from "@/types/project";

export const PROJECTS: Project[] = [
  {
    slug: "sessionora",
    name: "Sessionora",
    tagline: "Multi-tenant SaaS for scheduling & client session management",
    description:
      "A booking and client-management platform built for coaches, consultants, and service businesses - handling scheduling, payments, automated reminders, and client history in one workspace.",
    problem:
      "Independent practitioners were stitching together calendar links, spreadsheets, and payment tools to run their practice, losing bookings to double-booked slots and manual no-show follow-ups.",
    architectureHighlights: [
      "Multi-tenant architecture with isolated data boundaries per organization on a shared Postgres cluster",
      "Real-time availability engine handling timezone-aware slot locking to prevent double bookings",
      "WebSocket-driven live notifications for bookings, cancellations, and reschedules",
      "Stripe-backed billing with usage-based plan tiers and automated invoicing",
      "Queue-driven reminder and email pipeline decoupled from the request lifecycle",
    ],
    technologies: ["Laravel", "Next.js", "PostgreSQL", "Redis", "WebSockets", "AWS", "Stripe"],
    liveUrl: "#",
    githubUrl: "#",
    featured: true,
    status: "Live",
    year: "2025",
  },
  {
    slug: "ai-chatbot",
    name: "AI Support Chatbot",
    tagline: "Context-aware chatbot for product support and lead qualification",
    description:
      "An embeddable AI assistant that answers product questions from a company's own knowledge base and hands qualified leads to sales in real time.",
    problem:
      "Support teams were fielding the same repetitive questions around the clock, and slow first-response times were costing qualified leads.",
    architectureHighlights: [
      "Retrieval-augmented generation pipeline over a vector store built from docs, FAQs, and past tickets",
      "Streaming responses over WebSockets for a natural, low-latency chat experience",
      "Conversation memory and lead-scoring logic to route hot leads to a Slack channel instantly",
      "Rate-limited, cached embedding pipeline to control inference cost at scale",
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "AI Integrations", "Redis", "AWS"],
    liveUrl: "#",
    githubUrl: "#",
    status: "Live",
    year: "2024",
  },
  {
    slug: "url-shortener",
    name: "Snapl - URL Shortener",
    tagline: "High-throughput link shortener with real-time click analytics",
    description:
      "A link management platform with custom aliases, expiry rules, and a real-time analytics dashboard tracking clicks, referrers, and geography.",
    problem:
      "Marketing teams needed branded short links with trustworthy, real-time click analytics instead of relying on third-party tools with delayed reporting.",
    architectureHighlights: [
      "Redis-backed hot-path redirects for sub-50ms lookups at high request volume",
      "Async click-event pipeline that never blocks the redirect response",
      "Collision-resistant short-code generation with custom alias support",
      "Geo and device analytics aggregated hourly via scheduled jobs",
    ],
    technologies: ["Laravel", "React", "MySQL", "Redis", "Docker"],
    liveUrl: "#",
    githubUrl: "#",
    status: "Live",
    year: "2024",
  },
  {
    slug: "school-erp",
    name: "School ERP",
    tagline: "End-to-end administration system for K-12 institutions",
    description:
      "A role-based ERP covering admissions, attendance, fee management, gradebooks, and parent communication for multi-branch schools.",
    problem:
      "The institution managed admissions, fees, and academics across disconnected spreadsheets and paper records, making reporting slow and error-prone.",
    architectureHighlights: [
      "Role-based access control across admin, teacher, student, and parent portals",
      "Modular fee-management engine supporting installments, discounts, and receipts",
      "Bulk import/export pipelines for student and academic records",
      "Audit-logged data model for compliance-sensitive academic records",
    ],
    technologies: ["Laravel", "PHP", "MySQL", "React"],
    liveUrl: "#",
    githubUrl: "#",
    status: "Live",
    year: "2023",
  },
  {
    slug: "restaurant-ordering",
    name: "Restaurant Ordering System",
    tagline: "QR-based ordering with live kitchen display and order tracking",
    description:
      "A dine-in ordering system where guests order from a table QR code and kitchens track order status on a live-updating display.",
    problem:
      "Front-of-house staff were bottlenecked taking orders manually, and kitchens had no real-time visibility into order queues during peak hours.",
    architectureHighlights: [
      "WebSocket-powered kitchen display board reflecting order status changes instantly",
      "Table-scoped ordering sessions with QR-based table identification",
      "Menu and inventory management with real-time item availability toggles",
      "Order-state machine ensuring consistent transitions from placed to served",
    ],
    technologies: ["Laravel", "React", "WebSockets", "MySQL", "Docker"],
    liveUrl: "#",
    githubUrl: "#",
    status: "Live",
    year: "2023",
  },
  {
    slug: "multi-tenant-saas",
    name: "Multi-Tenant SaaS Starter",
    tagline: "Production-grade foundation for B2B SaaS products",
    description:
      "A reusable multi-tenant application foundation with organization-scoped data, subscription billing, and role-based teams - used to bootstrap several client SaaS products.",
    problem:
      "Every new SaaS engagement was rebuilding the same tenancy, billing, and auth scaffolding from scratch, slowing down time-to-first-feature.",
    architectureHighlights: [
      "Row-level tenant isolation with a shared-database, shared-schema strategy",
      "Pluggable subscription billing layer supporting seat-based and usage-based plans",
      "Invite-based team management with granular role permissions",
      "CI/CD pipeline templated for rapid client-specific deployment on AWS",
    ],
    technologies: ["Laravel", "Next.js", "PostgreSQL", "AWS", "Docker"],
    githubUrl: "#",
    status: "In Development",
    year: "2025",
  },
];

export const FEATURED_PROJECT = PROJECTS.find((p) => p.featured)!;
export const OTHER_PROJECTS = PROJECTS.filter((p) => !p.featured);
