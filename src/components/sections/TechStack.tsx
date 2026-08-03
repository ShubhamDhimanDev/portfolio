import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechStackCard } from "@/components/sections/TechStackCard";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { TECH_CATEGORIES, TECH_STACK } from "@/data/tech-stack";

export function TechStack() {
  return (
    <section id="stack" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="Tech Stack"
          title="Tools I reach for by default."
          description="A practical stack chosen for reliability and speed of iteration - not for novelty."
          className="mb-16"
        />

        <div className="flex flex-col gap-14">
          {TECH_CATEGORIES.map((category) => {
            const items = TECH_STACK.filter((tech) => tech.category === category);
            return (
              <div key={category}>
                <p className="mb-5 font-mono text-xs uppercase tracking-[0.2em] text-subtle">
                  {category}
                </p>
                <motion.div
                  variants={staggerContainer(0.06)}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                >
                  {items.map((tech) => (
                    <TechStackCard key={tech.name} tech={tech} />
                  ))}
                </motion.div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
