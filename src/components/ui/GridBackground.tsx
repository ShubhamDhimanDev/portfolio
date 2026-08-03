import { cn } from "@/lib/utils";

export function GridBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10 opacity-[0.35]", className)}
    />
  );
}

export function GlowOrb({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute -z-10 rounded-full blur-[110px]", className)}
    />
  );
}
