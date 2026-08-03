import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { fadeUp } from "@/lib/motion";
import { ROUTES } from "@/lib/constants";
import type { CaseStudy } from "@/types/case-study";

export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudy }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={ROUTES.caseStudy(caseStudy.slug)}
        className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-colors duration-300 hover:border-border-strong hover:bg-surface-2 md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">
            {caseStudy.role}
          </p>
          <ArrowUpRight className="size-5 shrink-0 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-foreground" />
        </div>

        <h3 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-foreground">
          {caseStudy.title}
        </h3>

        <p className="mt-4 flex-1 text-balance leading-relaxed text-muted">{caseStudy.summary}</p>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6 sm:grid-cols-4">
          {caseStudy.metrics.slice(0, 4).map((metric) => (
            <div key={metric.label}>
              <p className="font-mono text-lg font-semibold text-foreground">{metric.value}</p>
              <p className="mt-1 text-xs leading-snug text-subtle">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {caseStudy.techStack.slice(0, 5).map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      </Link>
    </motion.div>
  );
}
