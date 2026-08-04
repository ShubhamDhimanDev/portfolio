import { Mail, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/BrandIcons";
import type { SocialLink, StatItem } from "@/types/common";

export const PROFILE = {
  name: "Shubham Dhiman",
  role: "Full-Stack Developer",
  location: "Haridwar, Uttarakhand, India",
  experience: "4.5+ Years",
  focus: "I architect complex systems and ship them fast.",
  bio: "I'm a full-stack developer who turns complex business problems into well-architected, production-grade software — from schema design and infrastructure to the last pixel of the interface.",
  email: "shubham@insanedev.in",
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
  { label: "Email", href: "mailto:shubham@insanedev.in", icon: Mail },
  { label: "Portfolio", href: "https://insanedev.in", icon: Globe },
];
