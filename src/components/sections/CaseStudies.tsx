import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CaseStudyCard } from "@/components/sections/CaseStudyCard";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { CASE_STUDIES } from "@/data/case-studies";

export function CaseStudies() {
  return (
    <section id="case-studies" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="Engineering Case Studies"
          title="How the hard problems actually got solved."
          description="Deeper write-ups on architecture, database design, and the trade-offs behind a few of the harder engineering problems I've shipped."
          className="mb-16"
        />

        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {CASE_STUDIES.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
