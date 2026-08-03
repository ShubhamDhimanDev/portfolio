import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridBackground } from "@/components/ui/GridBackground";
import { fadeUp } from "@/lib/motion";

const STORY = [
  {
    label: "How I started",
    body: "I got into development by taking apart small business problems - a shop owner's spreadsheet, a clinic's paper appointment book - and asking what a proper system would look like. That instinct to formalize messy, real-world processes into clean software is still what pulls me into a project.",
  },
  {
    label: "What I enjoy building",
    body: "I gravitate toward products with real operational weight behind them: booking systems, multi-tenant platforms, anything with state that has to stay correct under concurrent use. Sessionora exists because I wanted to build that kind of system properly, not just ship a demo.",
  },
  {
    label: "Why architecture matters",
    body: "Most bugs I've had to fix in production were architecture decisions wearing a disguise. I care about schema design, clear service boundaries, and choosing boring, provable solutions over clever ones - because the code that's easy to reason about in year one is the code that survives year three.",
  },
  {
    label: "Why I enjoy solving business problems",
    body: "The best technical decisions are downstream of understanding what a business actually needs. I like sitting close to that problem - talking through edge cases with a founder or an ops team - before a single line of code gets written.",
  },
];

export function About() {
  return (
    <section id="about" className="relative py-28 md:py-36">
      <GridBackground className="opacity-[0.15]" />
      <Container className="grid grid-cols-1 gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="md:sticky md:top-32 md:self-start">
          <SectionHeading
            eyebrow="About"
            title="Not just writing code - building things that hold up."
            description="A short version of how I think about the work, told the way I'd tell it over coffee, not the way it reads on a résumé."
          />
        </div>

        <div className="flex flex-col divide-y divide-border">
          {STORY.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.05} variants={fadeUp} className="py-8 first:pt-0">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">
                {String(index + 1).padStart(2, "0")} - {item.label}
              </span>
              <p className="mt-4 text-balance text-xl leading-relaxed text-foreground/90 md:text-2xl">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
