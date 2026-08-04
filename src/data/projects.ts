import type { Project } from "@/types/project";

export const PROJECTS: Project[] = [
  {
    slug: "sessionora",
    name: "Sessionora",
    tagline: "Multi-tenant booking platform for coaches and service businesses",
    description:
      "A booking and client-management platform built for coaches, consultants, and service businesses — handling scheduling, payments, automated reminders, and client history in one workspace.",
    problem:
      "Coaches and consultants were stitching together calendar links, payment processors, and spreadsheets to run their practice, losing bookings to double-booked slots and failing to follow up on no-shows consistently.",
    architectureHighlights: [
      "Multi-tenant architecture with isolated data boundaries per organization on a shared Postgres cluster",
      "Real-time availability engine with timezone-aware slot locking to prevent double bookings under concurrent writes",
      "WebSocket-driven live notifications for bookings, cancellations, and reschedules pushed to the practitioner dashboard",
      "Stripe-backed billing with usage-based plan tiers and automated invoicing",
      "Queue-driven reminder and email pipeline fully decoupled from the request lifecycle",
    ],
    technologies: ["Laravel", "Next.js", "PostgreSQL", "Redis", "WebSockets", "AWS", "Stripe"],
    liveUrl: "https://sessionora.com",
    githubUrl: "#",
    screenshot: "/screenshots/sessionora.png",
    featured: true,
    status: "Live",
    year: "2025",
  },
  {
    slug: "ecommify",
    name: "Ecommify",
    tagline: "Multi-tenant ecommerce SaaS platform",
    description:
      "A white-label ecommerce SaaS platform where each tenant gets their own storefront, inventory, and order management — built for businesses that want to launch and manage online stores without the infrastructure overhead.",
    problem:
      "Small and mid-sized businesses needed a way to run online stores with proper multi-tenant isolation, without building their own ecommerce infrastructure from scratch or paying enterprise-tier platform fees.",
    architectureHighlights: [
      "Multi-tenant storefront architecture with per-tenant domain routing and isolated product catalogs",
      "Inventory and order management engine supporting multiple fulfillment states and stock tracking",
      "Webhook-driven integrations for payment gateways, shipping providers, and notification services",
      "Tenant onboarding pipeline that spins up a fully configured storefront with minimal manual steps",
    ],
    technologies: ["Laravel", "Next.js", "MySQL", "PostgreSQL", "AWS", "Tailwind"],
    githubUrl: "#",
    status: "In Development",
    year: "2026",
  },
  {
    slug: "url-shortener",
    name: "URL Shortener",
    tagline: "High-throughput link shortener with real-time click analytics",
    description:
      "A link management platform with custom aliases, expiry rules, and a real-time analytics dashboard tracking clicks, referrers, and geography — running live at url.insanedev.in.",
    problem:
      "Marketing and development teams needed branded short links with reliable, real-time click analytics instead of depending on third-party tools with delayed reporting and no customization.",
    architectureHighlights: [
      "Redis-backed hot-path redirects for sub-50ms lookups at high request volume",
      "Async click-event pipeline that never blocks the redirect response",
      "Collision-resistant short-code generation with full custom alias support",
      "Geo and device analytics aggregated via scheduled jobs and displayed in a real-time dashboard",
    ],
    technologies: ["Laravel", "React", "MySQL", "Redis", "Docker"],
    liveUrl: "https://url.insanedev.in",
    githubUrl: "https://github.com/ShubhamDhimanDev/url-shortener",
    screenshot: "/screenshots/url-shortener.png",
    status: "Live",
    year: "2024",
  },
  {
    slug: "restaurant-ordering",
    name: "Restaurant Ordering & Booking",
    tagline: "QR-based ordering system with live kitchen display and table booking",
    description:
      "A dine-in ordering and table booking system where guests order from a table QR code and kitchens track order status on a live-updating display — no app download, no login required.",
    problem:
      "Front-of-house staff were bottlenecked manually taking and entering orders, while kitchens had no real-time visibility into queue status until a paper ticket physically arrived — creating delays and errors at peak hours.",
    architectureHighlights: [
      "WebSocket-powered kitchen display board reflecting order state changes instantly across all screens",
      "Table-scoped ordering sessions established via QR code with no guest authentication required",
      "Order state machine enforcing consistent transitions from placed through to served",
      "Menu and availability management with real-time item toggle propagating to all active guest sessions",
    ],
    technologies: ["Laravel", "React", "WebSockets", "MySQL", "Docker"],
    githubUrl: "#",
    status: "In Development",
    year: "2026",
  },
  {
    slug: "smart-move",
    name: "Smart Move",
    tagline: "Custom mini CMS built for a college institution",
    description:
      "A purpose-built content management system for a college, covering announcements, events, faculty pages, and admission information — designed for non-technical staff to manage without developer involvement.",
    problem:
      "The institution relied on a static website and manual updates from a developer for every content change, causing delays in publishing time-sensitive announcements, events, and admission notices.",
    architectureHighlights: [
      "Role-based admin panel allowing different staff members to manage their own content sections",
      "Structured content model covering announcements, events, faculty profiles, and admission data",
      "Media management system for uploading and attaching images and documents to content entries",
      "SEO-friendly public-facing pages generated from the CMS content with clean URL routing",
    ],
    technologies: ["Laravel", "MySQL", "JavaScript", "Bootstrap"],
    liveUrl: "https://smartmove-eg.com",
    githubUrl: "https://github.com/ShubhamDhimanDev/smart-move",
    screenshot: "/screenshots/smart-move.png",
    status: "Live",
    year: "2026",
  },
  {
    slug: "ai-chatbot",
    name: "AI Support Chatbot",
    tagline: "Context-aware RAG chatbot for product support and lead qualification",
    description:
      "An AI assistant built on a retrieval-augmented generation pipeline that answers product questions strictly from a company's own knowledge base — docs, FAQs, and past tickets — and routes qualified leads to sales in real time.",
    problem:
      "A generic LLM gave confident but incorrect product-specific answers, and the support team didn't trust it enough to deploy. It needed to answer only from real company documentation and cite where each answer came from.",
    architectureHighlights: [
      "RAG pipeline over a vector store built from company docs, FAQs, and support tickets",
      "Streaming responses over WebSockets for a natural, low-latency chat experience",
      "Conversation memory and lead-scoring logic to route high-intent leads to Slack instantly",
      "Rate-limited, cached embedding pipeline to keep inference cost predictable at scale",
    ],
    technologies: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Claude AI", "AWS"],
    githubUrl: "#",
    status: "In Progress",
    year: "2025",
  },
];

export const FEATURED_PROJECT = PROJECTS.find((p) => p.featured)!;
export const OTHER_PROJECTS = PROJECTS.filter((p) => !p.featured);
