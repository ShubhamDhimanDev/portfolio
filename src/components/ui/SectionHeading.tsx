import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { baseTransition, fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <motion.div
      variants={staggerContainer(0.12)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}
    >
      {eyebrow && (
        <motion.p
          variants={fadeUp}
          transition={baseTransition}
          className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent-soft"
        >
          <span className="h-px w-6 bg-accent-soft/60" aria-hidden />
          {eyebrow}
        </motion.p>
      )}
      <motion.h2
        variants={fadeUp}
        transition={baseTransition}
        className="text-balance text-3xl font-semibold text-foreground sm:text-4xl md:text-5xl"
      >
        {title}
      </motion.h2>
      {description && (
        <motion.p
          variants={fadeUp}
          transition={baseTransition}
          className="mt-5 text-balance text-lg leading-relaxed text-muted"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
