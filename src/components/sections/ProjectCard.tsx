import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { ProjectPreview } from "@/components/sections/ProjectPreview";
import { Badge } from "@/components/ui/Badge";
import { fadeUp } from "@/lib/motion";
import type { Project } from "@/types/project";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article
      variants={fadeUp}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-border-strong"
    >
      <div className="p-3">
        {project.screenshot ? (
          <div className="overflow-hidden rounded-xl border border-border">
            <img
              src={project.screenshot}
              alt={`${project.name} screenshot`}
              className="h-55 w-full object-cover object-top"
            />
          </div>
        ) : (
          <ProjectPreview label={`${project.name.toLowerCase().replace(/\s+/g, "-")}.app`} />
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 pt-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{project.name}</h3>
          <div className="flex items-center gap-2 pt-0.5">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} GitHub repository`}
                className="text-muted transition-colors hover:text-foreground"
              >
                <GithubIcon className="size-4" />
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} live site`}
                className="text-muted transition-colors hover:text-foreground"
              >
                <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted">{project.tagline}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.slice(0, 4).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-6 font-mono text-xs text-subtle">
          <span>{project.year}</span>
          <span>{project.status}</span>
        </div>
      </div>
    </motion.article>
  );
}
