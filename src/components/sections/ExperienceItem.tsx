import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { baseTransition, fadeUp, viewportOnce } from "@/lib/motion";
import type { ExperienceItem as ExperienceItemType } from "@/types/experience";

export function ExperienceItem({ item }: { item: ExperienceItemType }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={fadeUp}
      transition={baseTransition}
      className="relative flex gap-6 md:gap-8"
    >
      <div className="relative flex w-8 shrink-0 justify-center md:w-10">
        <span className="relative mt-1 flex size-8 items-center justify-center rounded-full border border-border-strong bg-background md:size-10">
          {item.current && (
            <span className="absolute inline-flex size-3 animate-ping rounded-full bg-signal/60 md:size-3.5" />
          )}
          <span
            className={cn(
              "relative size-2.5 rounded-full",
              item.current ? "bg-signal" : "bg-accent-soft",
            )}
          />
        </span>
      </div>

      <div className="flex-1 pb-2">
        <div className="rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground">{item.role}</h3>
              <p className="mt-1 text-muted">
                {item.organization} · {item.location}
              </p>
            </div>
            <Badge variant={item.current ? "accent" : "default"}>{item.period}</Badge>
          </div>

          <p className="mt-4 leading-relaxed text-muted">{item.description}</p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {item.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                {highlight}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {item.tech.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
