import { Mail, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import type { SocialLink, StatItem } from "@/types/common";

export const PROFILE = {
  name: "Shubham Dhiman",
  role: "Full Stack Developer",
  location: "India",
  experience: "4.5+ Years",
  focus: "Building scalable SaaS products and business applications.",
  bio: "I'm a full-stack developer who enjoys turning ambiguous business problems into dependable, well-architected software - from schema design to the last pixel of the interface.",
  email: "hello@shubhamdhiman.dev",
  resumeUrl: "#",
};

export const HERO_STATS: StatItem[] = [
  { label: "Years Experience", value: 4.5, suffix: "+" },
  { label: "Projects Delivered", value: 20, suffix: "+" },
  { label: "Technologies", value: 15, suffix: "+" },
];

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/ShubhamDhimanDev", icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shubham-dhiman-dev", icon: LinkedinIcon },
  { label: "Email", href: "mailto:dhiman007shubham@gmail.com", icon: Mail },
  { label: "Portfolio", href: "https://insanedev.in", icon: Globe },
];
