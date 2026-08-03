import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Layers, Database, TrendingUp, CircleCheckBig } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { GridBackground } from "@/components/ui/GridBackground";
import { baseTransition, fadeUp, staggerContainer } from "@/lib/motion";
import { CASE_STUDIES } from "@/data/case-studies";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function CaseStudyDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const caseStudy = CASE_STUDIES.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!caseStudy) {
    return <NotFoundPage />;
  }

  return (
    <article>
      <section className="relative overflow-clip pb-16 pt-40 md:pt-48">
        <GridBackground className="opacity-[0.15]" />
        <Container>
          <motion.div
            variants={staggerContainer(0.1)}
            initial="hidden"
            animate="visible"
            className="max-w-3xl"
          >
            <motion.button
              variants={fadeUp}
              transition={baseTransition}
              onClick={() => navigate("/#case-studies")}
              className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All case studies
            </motion.button>

            <motion.div variants={fadeUp} transition={baseTransition} className="flex flex-wrap gap-2">
              <Badge variant="accent">{caseStudy.role}</Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              transition={baseTransition}
              className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              {caseStudy.title}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={baseTransition}
              className="mt-6 text-balance text-xl leading-relaxed text-muted"
            >
              {caseStudy.summary}
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer(0.06, 0.3)}
            initial="hidden"
            animate="visible"
            className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-10 sm:grid-cols-4"
          >
            {caseStudy.metrics.map((metric) => (
              <motion.div key={metric.label} variants={fadeUp} transition={baseTransition}>
                <p className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
                  {metric.value}
                </p>
                <p className="mt-1.5 text-sm leading-snug text-muted">{metric.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container className="grid grid-cols-1 gap-16 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-16">
            <Reveal>
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">Problem</h2>
              <p className="mt-4 text-balance text-xl leading-relaxed text-foreground/90">
                {caseStudy.problem}
              </p>
            </Reveal>

            <Reveal>
              <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">
                <CircleCheckBig className="size-4" />
                Challenges
              </h2>
              <ul className="mt-5 flex flex-col gap-4">
                {caseStudy.challenges.map((challenge) => (
                  <li
                    key={challenge}
                    className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 leading-relaxed text-muted"
                  >
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent-soft" />
                    {challenge}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal>
              <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">
                <Layers className="size-4" />
                Architecture
              </h2>
              <p className="mt-4 leading-relaxed text-muted">{caseStudy.architecture}</p>

              <div className="mt-6 flex flex-col gap-3">
                {caseStudy.architectureSteps.map((step, index) => (
                  <div key={step} className="flex items-start gap-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong font-mono text-xs text-muted">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-relaxed text-muted">{step}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal>
              <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">
                <Database className="size-4" />
                Database Design
              </h2>
              <p className="mt-4 leading-relaxed text-muted">{caseStudy.databaseDesign}</p>
            </Reveal>

            <Reveal>
              <h2 className="flex items-center gap-2 text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">
                <TrendingUp className="size-4" />
                Scalability
              </h2>
              <p className="mt-4 leading-relaxed text-muted">{caseStudy.scalability}</p>
            </Reveal>

            <Reveal>
              <div className="rounded-2xl border border-accent-dim/60 bg-accent/[0.06] p-6 md:p-8">
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-accent-soft">Outcome</h2>
                <p className="mt-4 text-balance text-lg leading-relaxed text-foreground/90">
                  {caseStudy.outcome}
                </p>
              </div>
            </Reveal>
          </div>

          <div className="md:sticky md:top-32 md:self-start">
            <Reveal>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">Tech Stack</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {caseStudy.techStack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-border-strong bg-surface p-6">
                <p className="text-balance text-sm leading-relaxed text-muted">
                  Have a similar problem you're trying to architect your way through?
                </p>
                <div className="mt-5">
                  <Button
                    href="/#contact"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate("/#contact");
                    }}
                    className="w-full"
                  >
                    Let's talk
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </article>
  );
}
