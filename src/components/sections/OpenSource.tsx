import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { OpenSourceCard } from "@/components/sections/OpenSourceCard";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { useOpenSourceRepos } from "@/hooks/useOpenSourceRepos";
import { SOCIAL_LINKS } from "@/data/profile";
import { ArrowUpRight } from "lucide-react";

export function OpenSource() {
  const { repos } = useOpenSourceRepos();
  const githubUrl = SOCIAL_LINKS.find((link) => link.label === "GitHub")?.href ?? "#";

  return (
    <section id="open-source" className="relative py-28 md:py-36">
      <Container>
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Open Source"
            title="A few things I've published."
            description="Small, focused libraries pulled out of production problems - built to be reused, not just archived."
          />
          <Button href={githubUrl} target="_blank" rel="noreferrer" variant="secondary" icon={ArrowUpRight}>
            View GitHub
          </Button>
        </div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {repos.map((repo) => (
            <OpenSourceCard key={repo.name} repo={repo} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
