import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceItem } from "@/components/sections/ExperienceItem";
import { EXPERIENCE } from "@/data/experience";

export function Experience() {
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 0.85", "end 0.6"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });

  return (
    <section id="experience" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="Experience"
          title="Where the work happened."
          description="From first production bug to building my own product - a straight line of learning to ship things that matter."
          className="mb-20"
        />

        <div ref={trackRef} className="relative">
          <div className="absolute left-4 top-2 bottom-2 w-px bg-border md:left-5" aria-hidden />
          <motion.div
            style={{ scaleY: progress, transformOrigin: "top" }}
            className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-accent-soft via-accent-soft to-signal md:left-5"
            aria-hidden
          />

          <div className="flex flex-col gap-10">
            {EXPERIENCE.map((item) => (
              <ExperienceItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
