import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { fadeUp } from "@/lib/motion";
import { PROCESS_STEPS } from "@/data/process";

export function Process() {
  return (
    <section id="process" className="relative py-28 md:py-36">
      <Container>
        <SectionHeading
          eyebrow="How we'll work together"
          title="A straightforward process, start to finish."
          description="No black box between the first call and launch day - here's exactly what working together looks like."
          className="mb-16"
        />

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {PROCESS_STEPS.map((step, index) => (
            <Reveal key={step.id} delay={index * 0.06} variants={fadeUp} className="bg-surface p-8 md:p-10">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">
                {step.id} - {step.label}
              </span>
              <h3 className="mt-4 text-balance text-xl font-semibold text-foreground md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
