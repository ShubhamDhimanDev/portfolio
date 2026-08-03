import { motion } from "framer-motion";
import { GitCommitHorizontal, GitPullRequest, CircleDot, Tag } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { GithubContributionGraph } from "@/components/sections/GithubContributionGraph";
import { useGithubActivity } from "@/hooks/useGithubActivity";
import { staggerContainer, fadeUp, viewportOnce } from "@/lib/motion";
import type { ActivityType } from "@/types/github";

const ACTIVITY_ICONS: Record<ActivityType, typeof GitCommitHorizontal> = {
  commit: GitCommitHorizontal,
  pr: GitPullRequest,
  issue: CircleDot,
  release: Tag,
};

export function GithubActivity() {
  const { stats, languages, activity, contributions } = useGithubActivity();

  const statItems = [
    { label: "Public Repositories", value: stats.totalRepos },
    { label: "Total Contributions", value: stats.totalContributions },
    { label: "Followers", value: stats.followers },
    { label: "Current Streak", value: stats.currentStreak, suffix: " days" },
  ];

  return (
    <section id="github" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="GitHub Activity"
          title="What I've been shipping."
          description="A live pulse of commits, pull requests, and releases across my repositories."
          className="mb-16"
        />

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {statItems.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-surface p-6"
            >
              <p className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
                {stat.value.toLocaleString()}
                {stat.suffix}
              </p>
              <p className="mt-1.5 text-sm text-muted">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <Reveal className="mb-6">
          <GithubContributionGraph contributions={contributions} />
        </Reveal>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 md:p-7">
              <p className="mb-5 text-sm font-medium text-foreground">Most used languages</p>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-3">
                {languages.map((lang) => (
                  <div
                    key={lang.name}
                    style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    title={`${lang.name} - ${lang.percentage}%`}
                  />
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-2 text-sm text-muted">
                    <span className="size-2 rounded-full" style={{ backgroundColor: lang.color }} />
                    {lang.name}
                    <span className="ml-auto font-mono text-xs text-subtle">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="h-full rounded-2xl border border-border bg-surface p-6 md:p-7">
              <p className="mb-5 text-sm font-medium text-foreground">Recent activity</p>
              <ul className="flex flex-col gap-4">
                {activity.map((item) => {
                  const Icon = ACTIVITY_ICONS[item.type];
                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted">
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          <span className="font-mono text-accent-soft">{item.repo}</span>
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted">{item.message}</p>
                        <p className="mt-1 font-mono text-xs text-subtle">
                          {new Date(item.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
