import { motion } from "framer-motion";
import { Star, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fadeUp } from "@/lib/motion";
import type { OpenSourceRepo } from "@/types/open-source";

export function OpenSourceCard({ repo }: { repo: OpenSourceRepo }) {
  return (
    <motion.a
      variants={fadeUp}
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-sm font-medium text-foreground group-hover:text-accent-soft">
          {repo.name}
        </p>
        <div className="flex items-center gap-3 font-mono text-xs text-subtle">
          <span className="flex items-center gap-1">
            <Star className="size-3.5" />
            {repo.stars}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="size-3.5" />
            {repo.forks}
          </span>
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{repo.description}</p>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 2).map((topic) => (
            <Badge key={topic}>{topic}</Badge>
          ))}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-subtle">
          <span className="size-2 rounded-full" style={{ backgroundColor: repo.languageColor }} />
          {repo.language}
        </span>
      </div>
    </motion.a>
  );
}
