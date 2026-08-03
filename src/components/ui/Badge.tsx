import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "accent";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs tracking-tight",
        variant === "default" && "border-border-strong bg-surface-2 text-muted",
        variant === "accent" && "border-accent-dim bg-accent/10 text-accent-soft",
        className,
      )}
    >
      {children}
    </span>
  );
}
