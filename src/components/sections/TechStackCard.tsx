import { motion } from "framer-motion";
import { TiltCard } from "@/components/ui/TiltCard";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";
import type { TechItem } from "@/types/tech";

const LEVEL_DOTS: Record<TechItem["level"], number> = {
  Advanced: 3,
  Proficient: 2,
  Familiar: 1,
};

export function TechStackCard({ tech }: { tech: TechItem }) {
  return (
    <motion.div variants={fadeUp}>
      <TiltCard tiltStrength={6} className="h-full">
        <div className="group h-full rounded-2xl border border-border bg-surface p-5 transition-colors duration-300 hover:border-border-strong hover:bg-surface-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-base font-medium tracking-tight text-foreground">{tech.name}</p>
            <div className="flex gap-1 pt-1.5" aria-label={tech.level}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "size-1.5 rounded-full transition-colors duration-300",
                    i < LEVEL_DOTS[tech.level] ? "bg-accent-soft" : "bg-border-strong",
                  )}
                />
              ))}
            </div>
          </div>
          <p className="mt-6 font-mono text-xs text-subtle">{tech.level}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}
