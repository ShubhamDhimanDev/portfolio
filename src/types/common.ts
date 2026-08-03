import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface SocialLink {
  label: string;
  href: string;
  icon: IconComponent;
}

export interface StatItem {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}
