import type { CaseStudy } from "@/types/case-study";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "sessionora-multi-tenant-scheduling",
    title: "Sessionora - Multi-Tenant Scheduling at Scale",
    role: "Lead Full Stack Developer",
    summary:
      "Designing a multi-tenant booking platform that guarantees zero double-bookings under concurrent write pressure, while keeping every tenant's data provably isolated.",
    problem:
      "Coaches and consultants needed a single workspace to manage bookings, payments, and client history - but existing tools were single-user calendar links that couldn't handle team accounts, timezone-spanning clients, or concurrent booking attempts on the same slot.",
    challenges: [
      "Preventing race conditions when two clients attempt to book the same slot within milliseconds of each other",
      "Modeling recurring availability rules across timezones without corrupting daylight-saving-time edge cases",
      "Keeping tenant data strictly isolated while still sharing a single database cluster for operational simplicity",
      "Delivering real-time booking updates to a practitioner's dashboard without polling",
    ],
    architecture:
      "Sessionora runs on a Laravel API with a Next.js frontend. Each organization is a tenant scoped by a tenant_id enforced at the query-builder layer via global model scopes, so no query can accidentally leak across tenants. Booking writes go through a dedicated availability service that acquires a short-lived Redis lock keyed by slot + resource before the write is committed to Postgres, eliminating the double-booking race entirely. A WebSocket layer (Laravel Reverb) pushes booking, cancellation, and reschedule events to connected dashboards in real time.",
    architectureSteps: [
      "Client requests a slot → API checks cached availability from Redis",
      "Redis lock acquired on {resource_id}:{slot_start} - rejects concurrent attempts immediately",
      "Booking persisted to Postgres inside a DB transaction with tenant scope applied",
      "Event broadcast over WebSocket to the practitioner's live dashboard",
      "Async job queued for confirmation email, calendar sync, and reminder scheduling",
    ],
    databaseDesign:
      "Postgres schema uses a shared-database, shared-schema multi-tenancy model with a tenant_id foreign key on every tenant-scoped table, enforced by row-level Laravel global scopes and mirrored with Postgres row-level security as a defense-in-depth layer. Availability is stored as normalized recurrence rules (not expanded instances) and materialized into concrete slots on read, keeping storage compact while supporting arbitrarily far date-range queries.",
    scalability:
      "Read-heavy availability queries are cached in Redis with short TTLs and invalidated on write, keeping the hot path off Postgres entirely for typical traffic. The booking-lock pattern means write throughput scales horizontally across API nodes without a single point of contention beyond Redis itself. Background jobs (reminders, emails, calendar sync) run on a separate queue worker pool so a spike in notification volume never slows down the booking API.",
    techStack: ["Laravel", "Next.js", "PostgreSQL", "Redis", "WebSockets (Reverb)", "AWS", "Docker"],
    outcome:
      "Zero double-booking incidents recorded since the locking layer shipped, with slot-lookup latency under 50ms at the 95th percentile and real-time dashboard updates replacing what was previously a 30-second polling interval.",
    metrics: [
      { label: "Booking conflict rate", value: "0%" },
      { label: "P95 availability lookup", value: "< 50ms" },
      { label: "Dashboard update latency", value: "Real-time" },
      { label: "Tenants supported per cluster", value: "500+" },
    ],
  },
  {
    slug: "ai-chatbot-rag-pipeline",
    title: "Context-Aware Support Chatbot with RAG",
    role: "Full Stack Developer",
    summary:
      "Building a retrieval-augmented AI assistant that answers from a company's real documentation instead of hallucinating - and streams responses fast enough to feel like a real conversation.",
    problem:
      "A generic LLM chatbot gave confident but incorrect answers about product-specific behavior, and support teams didn't trust it enough to deploy. It needed to answer strictly from the company's own docs, tickets, and FAQs, and cite where an answer came from.",
    challenges: [
      "Keeping answers grounded in real documentation instead of model hallucination",
      "Serving streamed responses with low first-token latency over a persistent connection",
      "Controlling inference and embedding cost as document volume and traffic grew",
      "Routing qualified leads to a human in real time without adding conversational latency",
    ],
    architecture:
      "Incoming documents are chunked, embedded, and stored in a vector index. On each user message, the backend retrieves the top-k relevant chunks, assembles a grounded prompt, and streams the model's response token-by-token to the client over a WebSocket connection rather than a REST round-trip, cutting perceived latency significantly. A lightweight classifier runs alongside the main response to score buying intent and pushes qualified conversations to a Slack channel instantly.",
    architectureSteps: [
      "Document ingested → chunked and embedded → stored in vector index",
      "User message received over WebSocket connection",
      "Top-k relevant chunks retrieved and assembled into a grounded prompt",
      "Response streamed token-by-token back to the client",
      "Parallel lead-scoring pass flags high-intent conversations to Slack",
    ],
    databaseDesign:
      "Conversation history and document metadata live in Postgres, while vector embeddings are stored in a dedicated vector index optimized for approximate nearest-neighbor search. Embeddings are versioned so documentation updates can be re-indexed without downtime, with the previous version serving traffic until the new one is warm.",
    scalability:
      "Embedding generation is cached and deduplicated so re-ingesting an unchanged document costs nothing. Rate limiting and request batching keep inference spend predictable under bursty traffic, and the retrieval layer is decoupled from the generation layer so either can scale independently.",
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Redis", "AI Integrations", "AWS"],
    outcome:
      "Deflected a majority of first-line support questions away from the human queue while maintaining answer accuracy the support team was willing to trust in production, with qualified leads now reaching sales within seconds instead of hours.",
    metrics: [
      { label: "First-token latency", value: "< 800ms" },
      { label: "Support tickets deflected", value: "~40%" },
      { label: "Lead routing time", value: "Seconds" },
      { label: "Answer grounding", value: "Source-cited" },
    ],
  },
  {
    slug: "restaurant-live-kitchen-display",
    title: "Real-Time Kitchen Display for QR Ordering",
    role: "Full Stack Developer",
    summary:
      "Replacing manual order-taking with a QR-based flow and a live kitchen display board that keeps front-of-house and kitchen staff in sync during peak-hour rushes.",
    problem:
      "During peak hours, servers couldn't keep up with manual order entry, and kitchens had no visibility into what had been ordered until a paper ticket physically arrived - creating delays and order mix-ups.",
    challenges: [
      "Keeping the kitchen display in sync across multiple screens with zero perceptible lag",
      "Handling order-state transitions safely with multiple staff members updating the same order",
      "Designing a table-session model that works without requiring guests to create an account",
      "Toggling menu-item availability instantly across all active guest sessions when the kitchen 86's an item",
    ],
    architecture:
      "Each table's QR code encodes a scoped session token, so guests order without authentication while orders stay correctly attributed. Orders move through an explicit state machine (placed → confirmed → preparing → ready → served), and every transition is broadcast over WebSockets to the kitchen display and the guest's order-status view simultaneously, so no screen ever shows stale state.",
    architectureSteps: [
      "Guest scans table QR → scoped session created, no login required",
      "Order placed → persisted and broadcast to kitchen display instantly",
      "Kitchen staff advances order state → state machine validates the transition",
      "Update pushed over WebSocket to guest view and all kitchen screens",
      "Item availability toggle propagates to every active session in real time",
    ],
    databaseDesign:
      "Orders, order items, and their state transitions are modeled relationally in MySQL with an append-only status-history table, so every order's full timeline is auditable after the fact - useful for resolving disputes and analyzing kitchen throughput.",
    scalability:
      "The WebSocket layer is horizontally scaled behind a connection-aware load balancer, and kitchen-display state is rehydrated from the database on reconnect so a dropped connection never loses an order. Menu and availability data is cached and invalidated on write to keep read load off the primary database during rush hours.",
    techStack: ["Laravel", "React", "WebSockets", "MySQL", "Docker"],
    outcome:
      "Order-to-kitchen visibility dropped from a physical ticket delay to instant, and mis-entered orders fell sharply once servers were no longer manually transcribing orders under pressure.",
    metrics: [
      { label: "Order visibility delay", value: "Instant" },
      { label: "Order entry errors", value: "-60%" },
      { label: "Concurrent table sessions", value: "100+" },
    ],
  },
];
