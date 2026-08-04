import type { CaseStudy } from "@/types/case-study";

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "ceulocker-legacy-database-migration",
    title: "CEU Locker - Zero-Loss Migration of a 1M-Row Legacy Database",
    role: "Senior Software Engineer",
    summary:
      "Migrating an aging ColdFusion continuing-education platform's production database — 1M+ records across ~85 interrelated tables — onto a rebuilt Laravel/MySQL V2 system without losing a single record or breaking a single professional's license history.",
    problem:
      "CEU Locker's original ColdFusion-era system had outgrown its own schema after years of feature additions — column purposes had drifted, naming was inconsistent, and there was no single source of truth for how V1 data actually mapped onto the redesigned V2 schema. Every row belonged to a real professional association, CEU provider, or licensed professional tracking credits against real compliance deadlines, so the migration had zero tolerance for silent data loss or corruption.",
    challenges: [
      "Reverse-engineering ~85 undocumented V1 tables with inconsistent naming and columns that no longer matched their original purpose",
      "Producing an authoritative column-by-column mapping between the V1 ColdFusion schema and the newly designed V2 Laravel schema, including renamed, split, and merged fields",
      "Preserving referential integrity across two structurally different schemas when foreign keys didn't line up 1:1",
      "Confirming that mapped fields were actually populated the same way in production on both systems, not just structurally compatible",
      "Migrating 1M+ live records without extended downtime or a rollback plan that could lose data",
    ],
    architecture:
      "Before writing a single migration script, both the V1 ColdFusion application and the new Laravel V2 codebase were audited table by table to see how each column was actually read and written in application logic — several V1 fields had been repurposed informally over the years and no longer matched their names. That research fed a full set of table and column mapping spreadsheets covering all ~85 tables: source table/column, destination table/column, required transformation, nullability differences, and dependent tables. Migration scripts were then written directly against those mapping sheets and run in foreign-key dependency order — parent tables before children — each wrapped in a transaction with row-count and checksum validation before the next table was allowed to proceed.",
    architectureSteps: [
      "Audit V1 (ColdFusion) and V2 (Laravel) codebases table-by-table to document real column usage, not just schema definitions",
      "Build column-level mapping spreadsheets across all ~85 tables — source, destination, transformation rules, nullability, dependents",
      "Write migration scripts driven directly by the mapping sheets, executed in FK-dependency order",
      "Run each table migration inside a transaction with row-count and checksum validation before advancing",
      "Full end-to-end functional testing on both V1 and V2 in parallel to confirm behavior parity before cutover",
    ],
    databaseDesign:
      "V2 restructured much of the V1 schema — normalizing tables that had accumulated redundant columns and splitting overloaded tables into cleanly related ones. An old-ID-to-new-ID lookup table was maintained for every migrated entity during the transform, so every foreign key in V2 could be rewritten to point at the correct new record instead of a stale V1 ID, leaving no orphaned relationships after cutover.",
    scalability:
      "Large tables were migrated in batches rather than single bulk inserts, keeping locks short enough that the production V1 database stayed usable throughout the migration window. The full migration was rehearsed against a staging copy of production data first, so the real cutover was a re-run of an already-validated process rather than a first attempt.",
    techStack: ["Laravel", "PHP", "MySQL", "ColdFusion (source)"],
    outcome:
      "All ~85 tables and 1M+ records were migrated to the V2 system with zero data loss and zero corrupted relationships, verified through row-count and checksum validation on every table plus full end-to-end testing of both systems before the old one was retired.",
    metrics: [
      { label: "Records migrated", value: "1M+" },
      { label: "Tables migrated", value: "~85" },
      { label: "Data loss", value: "0%" },
      { label: "Post-migration integrity issues", value: "0" },
    ],
  },
  {
    slug: "backpackerlist-candidate-search-api",
    title: "Backpackerlist - Rebuilding a Candidate Search API from 2,000 Lines to 100",
    role: "Senior Software Engineer",
    summary:
      "Rewriting a job portal's core candidate-listing API — a 2,000+ line tangle of nested if/else filter logic powering both a list view and a live map view — into a ~100-line Eloquent query builder that fixed an N+1 query problem and added real pagination.",
    problem:
      "Backpackerlist's candidate search endpoint had grown into a 2,000+ line procedural block of nested conditionals handling every filter combination (location, job category, interests, availability, and more) by hand, duplicated across two nearly identical endpoints — one for the standard list view, one for showing candidates on a Google Map. The API had no real pagination, loaded every matching candidate's related data in a loop, and was becoming harder to safely extend every time a new filter was added.",
    challenges: [
      "Untangling 2,000+ lines of nested if/else filter logic without changing the actual filtering behavior recruiters relied on",
      "Two separate endpoints (list view and map view) had drifted out of sync despite needing to return equivalent filtered results",
      "An N+1 query problem was firing on every request as related candidate data was fetched in a loop instead of eagerly",
      "The listing had no pagination — every filtered request returned the full result set in one response",
      "Replacing the filter logic without regressing edge-case filter combinations that had accumulated over time",
    ],
    architecture:
      "Replaced the hand-rolled conditional chains with a single Eloquent query builder pipeline: each filter (location, job category, interests, availability) maps to a scoped query clause that's conditionally applied only when that filter is present in the request, rather than branching through nested if/else blocks. The list view and map view now share the same underlying query builder and only diverge in the final response shape, eliminating the drift between them. Relations that were previously being lazy-loaded inside loops were converted to eager loads, collapsing what had been one query per candidate into a small, fixed number of queries per request.",
    architectureSteps: [
      "Filter request parameters mapped to a chain of conditional Eloquent query scopes instead of nested if/else branches",
      "List view and map view endpoints unified onto the same underlying query builder, diverging only at response formatting",
      "Related models switched from lazy-loaded, per-row queries to eager loading (with()) to eliminate the N+1 pattern",
      "Pagination added to the response, replacing the previous full-result-set behavior",
      "Infinite-scroll trigger on the frontend calls the next page automatically as the user reaches the end of the list",
    ],
    databaseDesign:
      "Candidate, location, job-category, and interest data were already relational but were being queried independently per candidate. Formalizing the Eloquent relationships (belongsTo/belongsToMany where appropriate) let the query builder eager-load everything a listing needed in a small, fixed number of queries regardless of result size, instead of query count scaling with the number of candidates returned.",
    scalability:
      "Because filters are now composable query scopes rather than branching logic, adding a new filter became a small, isolated addition instead of a risk to the existing conditional tree. Pagination plus eager loading meant response time and query count no longer scaled with the total number of matching candidates, which mattered as the candidate pool grew.",
    techStack: ["Laravel", "PHP", "Eloquent ORM", "MySQL", "JavaScript"],
    outcome:
      "Cut the core listing logic from 2,000+ lines to roughly 100 by replacing nested conditionals with composable query scopes, eliminated the N+1 query pattern via eager loading, and shipped pagination with auto-loading infinite scroll on both the list and map views.",
    metrics: [
      { label: "Filter logic LOC", value: "2,000+ → ~100" },
      { label: "Queries per listing request", value: "N+1 → fixed" },
      { label: "Pagination", value: "Added" },
      { label: "Views unified on one query", value: "2" },
    ],
  },
  {
    slug: "multi-site-cicd-docker-pipeline",
    title: "Parallel-Safe CI/CD for a Multi-Site Portfolio with Docker",
    role: "Senior Software Engineer",
    summary:
      "Introducing GitHub Actions and Docker-based CI/CD across a group of websites so multiple developers could work in parallel on staging, testers could validate every change on a dedicated dev branch, and verified changes reached production automatically instead of by hand.",
    problem:
      "Multiple developers were shipping changes to the same group of websites without a consistent path from local changes to production — deployments were manual, staging environments diverged between developers' machines, and there was no gate that guaranteed a change had actually been tested before it reached production.",
    challenges: [
      "Letting multiple developers work on the same group of sites in parallel without their staging environments stepping on each other",
      "Giving testers a stable, containerized environment on the dev branch that matched production closely enough to trust",
      "Automating the path from a tested dev-branch change to a production deploy without a manual release step",
      "Keeping each site's build, environment variables, and dependencies isolated and reproducible across staging, dev, and production",
      "Rolling this out across an existing group of live sites without breaking whichever one shipped next",
    ],
    architecture:
      "Each site was containerized with Docker so its build and runtime environment was identical across staging, dev, and production instead of depending on whichever machine it ran on. GitHub Actions pipelines were wired to the branch model: pushes to a developer's staging branch build and deploy an isolated Docker environment for that branch, so parallel work doesn't collide; merges into the dev branch trigger a build that testers validate against; and once a dev-branch build passes testing, promoting it to the production branch triggers an automated build-test-deploy pipeline with no manual deployment step.",
    architectureSteps: [
      "Developer pushes to a staging branch → GitHub Actions builds an isolated Docker environment for that branch",
      "Change merged into dev branch → pipeline builds a shared dev environment for testers to validate against",
      "Tester signs off on the dev-branch build",
      "Change promoted to the production branch → pipeline runs the automated build, test, and deploy steps",
      "Production deploy completes without a manual release step, with the previous image kept for fast rollback",
    ],
    databaseDesign:
      "Each environment (staging, dev, production) runs against its own isolated database instance defined per Docker environment, so a developer's in-progress schema change or seed data on staging can never leak into the dev testing environment or production.",
    scalability:
      "Because each site's environment is defined as Docker configuration rather than hand-set-up infrastructure, onboarding a new site onto the same pipeline is a matter of adding its configuration rather than repeating manual setup. Parallel branch-scoped environments mean adding more developers doesn't create more contention for a single shared staging box.",
    techStack: ["Docker", "GitHub Actions", "Laravel", "Nginx", "AWS"],
    outcome:
      "Multiple developers could work in parallel on staging without colliding, testers had a consistent dev-branch environment to validate against, and verified changes reached production automatically — removing manual deployment as a recurring source of risk and delay across the whole group of sites.",
    metrics: [
      { label: "Manual deploy steps", value: "0" },
      { label: "Environments per site", value: "3" },
      { label: "Dev environments", value: "Per branch" },
      { label: "Deployment path", value: "Automated" },
    ],
  },
  {
    slug: "sessionora-multi-tenant-scheduling",
    title: "Sessionora - Multi-Tenant Booking at Scale",
    role: "Lead Full Stack Developer",
    summary:
      "Designing a multi-tenant booking platform that guarantees zero double-bookings under concurrent write pressure, while keeping every tenant's data provably isolated on a shared database cluster.",
    problem:
      "Coaches and consultants needed a single workspace to manage bookings, payments, and client history — but no existing tool handled team accounts, timezone-spanning clients, and concurrent booking attempts on the same slot without creating conflicts.",
    challenges: [
      "Preventing race conditions when two clients attempt to book the same slot within milliseconds of each other",
      "Modeling recurring availability rules across timezones without corrupting daylight-saving-time edge cases",
      "Keeping tenant data strictly isolated while sharing a single database cluster for operational simplicity",
      "Delivering real-time booking updates to the practitioner's dashboard without polling",
    ],
    architecture:
      "Sessionora runs on a Laravel API with a Next.js frontend. Each organization is a tenant scoped by a tenant_id enforced at the query-builder layer via global model scopes, so no query can accidentally leak across tenants. Booking writes go through a dedicated availability service that acquires a short-lived Redis lock keyed by slot and resource before the write is committed to Postgres, eliminating the double-booking race entirely. A WebSocket layer pushes booking, cancellation, and reschedule events to connected dashboards in real time.",
    architectureSteps: [
      "Client requests a slot → API checks cached availability from Redis",
      "Redis lock acquired on {resource_id}:{slot_start} — concurrent attempts rejected immediately",
      "Booking persisted to Postgres inside a DB transaction with tenant scope enforced",
      "Event broadcast over WebSocket to the practitioner's live dashboard",
      "Async job queued for confirmation email, calendar sync, and reminder scheduling",
    ],
    databaseDesign:
      "Postgres schema uses a shared-database, shared-schema multi-tenancy model with a tenant_id foreign key on every tenant-scoped table, enforced by row-level Laravel global scopes and mirrored with Postgres row-level security as a defense-in-depth layer. Availability is stored as normalized recurrence rules, not expanded instances, and materialized into concrete slots on read — keeping storage compact while supporting arbitrarily far date-range queries.",
    scalability:
      "Read-heavy availability queries are cached in Redis with short TTLs and invalidated on write, keeping the hot path off Postgres entirely for typical traffic. The booking-lock pattern means write throughput scales horizontally across API nodes without a single point of contention beyond Redis itself. Background jobs for reminders, emails, and calendar sync run on a separate worker pool so a spike in notification volume never slows down the booking API.",
    techStack: ["Laravel", "Next.js", "PostgreSQL", "Redis", "WebSockets", "AWS", "Docker", "Stripe"],
    outcome:
      "Zero double-booking incidents recorded since the locking layer shipped, with slot-lookup latency under 50ms at the 95th percentile and real-time dashboard updates replacing what was previously a polling interval.",
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
      "Building a retrieval-augmented AI assistant that answers strictly from a company's real documentation instead of hallucinating, and streams responses fast enough to feel like a real conversation.",
    problem:
      "A generic LLM chatbot gave confident but incorrect answers about product-specific behavior, and the support team didn't trust it enough to deploy. It needed to answer only from the company's own docs, tickets, and FAQs — and cite where each answer came from.",
    challenges: [
      "Keeping answers grounded in real documentation instead of model hallucination",
      "Serving streamed responses with low first-token latency over a persistent connection",
      "Controlling inference and embedding cost as document volume and traffic grew",
      "Routing qualified leads to a human in real time without adding conversational latency",
    ],
    architecture:
      "Incoming documents are chunked, embedded, and stored in a vector index. On each user message, the backend retrieves the top-k relevant chunks, assembles a grounded prompt, and streams the model's response token-by-token to the client over a WebSocket connection rather than a REST round-trip, cutting perceived latency significantly. A lightweight classifier runs in parallel to score buying intent and pushes qualified conversations to Slack instantly.",
    architectureSteps: [
      "Document ingested → chunked and embedded → stored in vector index",
      "User message received over WebSocket connection",
      "Top-k relevant chunks retrieved and assembled into a grounded prompt",
      "Response streamed token-by-token back to the client via Claude AI",
      "Parallel lead-scoring pass flags high-intent conversations to Slack",
    ],
    databaseDesign:
      "Conversation history and document metadata live in Postgres, while vector embeddings are stored in a dedicated vector index optimized for approximate nearest-neighbor search. Embeddings are versioned so documentation updates can be re-indexed without downtime, with the previous version serving traffic until the new index is warm.",
    scalability:
      "Embedding generation is cached and deduplicated so re-ingesting an unchanged document costs nothing. Rate limiting and request batching keep inference spend predictable under bursty traffic, and the retrieval layer is decoupled from the generation layer so either can scale independently.",
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Redis", "Claude AI", "AWS"],
    outcome:
      "Deflected a significant portion of first-line support questions from the human queue while maintaining answer accuracy the support team was willing to trust in production — with qualified leads now reaching sales in seconds instead of hours.",
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
      "Replacing manual order-taking with a QR-based flow and a live kitchen display board that keeps front-of-house and kitchen staff in sync during peak-hour rushes — no app download, no guest login.",
    problem:
      "During peak hours, servers couldn't keep up with manual order entry and kitchens had no visibility into what was ordered until a paper ticket physically arrived — creating delays, missed items, and order mix-ups under pressure.",
    challenges: [
      "Keeping the kitchen display in sync across multiple screens with zero perceptible lag",
      "Handling order-state transitions safely when multiple staff members update the same order simultaneously",
      "Designing a table-session model that works without requiring guests to create an account",
      "Toggling menu-item availability instantly across all active guest sessions when the kitchen is out of an item",
    ],
    architecture:
      "Each table's QR code encodes a scoped session token, so guests order without authentication while orders stay correctly attributed. Orders move through an explicit state machine (placed → confirmed → preparing → ready → served), and every transition is broadcast over WebSockets to the kitchen display and the guest's order-status view simultaneously, so no screen ever shows stale state.",
    architectureSteps: [
      "Guest scans table QR → scoped session created, no login required",
      "Order placed → persisted and broadcast to kitchen display instantly via WebSocket",
      "Kitchen staff advances order state → state machine validates the transition",
      "Update pushed over WebSocket to guest view and all kitchen screens simultaneously",
      "Item availability toggle propagates to every active session in real time",
    ],
    databaseDesign:
      "Orders, order items, and their state transitions are modeled relationally in MySQL with an append-only status-history table, so every order's full timeline is auditable after the fact — useful for resolving disputes and analyzing kitchen throughput across service periods.",
    scalability:
      "The WebSocket layer is horizontally scaled behind a connection-aware load balancer, and kitchen-display state is rehydrated from the database on reconnect so a dropped connection never loses an order. Menu and availability data is cached and invalidated on write to keep read load off the primary database during rush hours.",
    techStack: ["Laravel", "React", "WebSockets", "MySQL", "Docker"],
    outcome:
      "Order-to-kitchen visibility dropped from a physical ticket delay to instant, and order entry errors fell sharply once servers were no longer manually transcribing orders under pressure during peak service.",
    metrics: [
      { label: "Order visibility delay", value: "Instant" },
      { label: "Order entry errors", value: "-60%" },
      { label: "Concurrent table sessions", value: "100+" },
    ],
  },
];
