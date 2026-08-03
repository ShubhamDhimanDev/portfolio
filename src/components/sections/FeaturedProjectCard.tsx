import { motion } from "framer-motion";
import { ArrowUpRight, Check } from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { TiltCard } from "@/components/ui/TiltCard";
import { ProjectPreview } from "@/components/sections/ProjectPreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/motion";
import type { Project } from "@/types/project";

export function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />

      <div className="relative grid grid-cols-1 gap-10 p-6 md:grid-cols-2 md:gap-12 md:p-10">
        <motion.div variants={fadeUp}>
          <TiltCard tiltStrength={5}>
            <ProjectPreview label="sessionora.app" className="min-h-[320px] md:min-h-[420px]" />
          </TiltCard>
        </motion.div>

        <div className="flex flex-col justify-center">
          <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3">
            <Badge variant="accent">Featured Product</Badge>
            <Badge>{project.status}</Badge>
          </motion.div>

          <motion.h3
            variants={fadeUp}
            className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            {project.name}
          </motion.h3>

          <motion.p variants={fadeUp} className="mt-3 text-balance text-lg text-muted">
            {project.tagline}
          </motion.p>

          <motion.p variants={fadeUp} className="mt-5 max-w-lg text-balance leading-relaxed text-muted">
            {project.description}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-6 rounded-xl border border-border bg-surface-2 p-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">Problem</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{project.problem}</p>
          </motion.div>

          <motion.ul variants={fadeUp} className="mt-6 flex flex-col gap-2.5">
            {project.architectureHighlights.slice(0, 4).map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                {highlight}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
            {project.liveUrl && (
              <Button href={project.liveUrl} target="_blank" rel="noreferrer" icon={ArrowUpRight}>
                View Live
              </Button>
            )}
            {project.githubUrl && (
              <Button href={project.githubUrl} target="_blank" rel="noreferrer" variant="secondary" icon={GithubIcon}>
                Source
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
