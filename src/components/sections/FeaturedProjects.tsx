import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectCard } from "@/components/sections/FeaturedProjectCard";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { FEATURED_PROJECT, OTHER_PROJECTS } from "@/data/projects";

export function FeaturedProjects() {
  return (
    <section id="projects" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="Featured Work"
          title="Products built to hold up in production."
          description="A selection of SaaS platforms and business applications - each solving a specific operational problem, not just a demo."
          className="mb-16"
        />

        <div className="mb-8">
          <FeaturedProjectCard project={FEATURED_PROJECT} />
        </div>

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {OTHER_PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
