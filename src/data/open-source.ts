import type { OpenSourceRepo } from "@/types/open-source";

export const OPEN_SOURCE_REPOS: OpenSourceRepo[] = [
  {
    name: "laravel-tenant-kit",
    description:
      "A lightweight multi-tenancy toolkit for Laravel - tenant-scoped models, middleware, and Postgres row-level security helpers.",
    url: "https://github.com/shubhamdhiman/laravel-tenant-kit",
    stars: 214,
    forks: 28,
    language: "PHP",
    languageColor: "#4F5D95",
    topics: ["laravel", "multi-tenancy", "postgresql"],
  },
  {
    name: "reverb-presence",
    description:
      "React hooks for Laravel Reverb presence channels - typed, reconnect-safe, and built for real-time dashboards.",
    url: "https://github.com/shubhamdhiman/reverb-presence",
    stars: 96,
    forks: 11,
    language: "TypeScript",
    languageColor: "#3178c6",
    topics: ["websockets", "react", "realtime"],
  },
  {
    name: "pg-slot-lock",
    description:
      "A tiny Redis-backed slot-locking library for building race-condition-free booking and scheduling systems.",
    url: "https://github.com/shubhamdhiman/pg-slot-lock",
    stars: 152,
    forks: 19,
    language: "TypeScript",
    languageColor: "#3178c6",
    topics: ["redis", "scheduling", "concurrency"],
  },
  {
    name: "rag-starter",
    description:
      "A minimal, production-shaped starter for retrieval-augmented chat applications with streaming responses.",
    url: "https://github.com/shubhamdhiman/rag-starter",
    stars: 341,
    forks: 47,
    language: "TypeScript",
    languageColor: "#3178c6",
    topics: ["ai", "rag", "nextjs"],
  },
  {
    name: "shortcode-gen",
    description:
      "Collision-resistant short-code generation strategies benchmarked for high-throughput URL shorteners.",
    url: "https://github.com/shubhamdhiman/shortcode-gen",
    stars: 58,
    forks: 6,
    language: "PHP",
    languageColor: "#4F5D95",
    topics: ["php", "algorithms"],
  },
  {
    name: "dotfiles",
    description:
      "Personal development environment - shell config, editor setup, and Docker-based local dev tooling.",
    url: "https://github.com/shubhamdhiman/dotfiles",
    stars: 37,
    forks: 9,
    language: "Shell",
    languageColor: "#89e051",
    topics: ["dotfiles", "dx"],
  },
];
