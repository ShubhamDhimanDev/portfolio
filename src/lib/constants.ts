export const ROUTES = {
  home: "/",
  caseStudy: (slug: string) => `/case-studies/${slug}`,
  blog: "/blog",
  blogPost: (slug: string) => `/blog/${slug}`,
} as const;

export const NAV_LINKS = [
  { label: "About", href: "#about", type: "hash" },
  { label: "Stack", href: "#stack", type: "hash" },
  { label: "Work", href: "#projects", type: "hash" },
  { label: "Case Studies", href: "#case-studies", type: "hash" },
  { label: "Blog", href: "/blog", type: "route" },
  { label: "Experience", href: "#experience", type: "hash" },
  { label: "Contact", href: "#contact", type: "hash" },
] as const;

export const SECTION_IDS = [
  "hero",
  "about",
  "stack",
  "projects",
  "case-studies",
  "open-source",
  "experience",
  "github",
  "contact",
] as const;
