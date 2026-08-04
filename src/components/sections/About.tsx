import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridBackground } from "@/components/ui/GridBackground";
import { fadeUp } from "@/lib/motion";

const STORY = [
  {
    label: "How I started",
    body: "A PC arrived home in 2004 and I've barely looked away since. Not for the games — though Counter-Strike stuck around — but for the realization that typed instructions make a machine do exactly what you ask. I taught myself to code through a mechanical engineering degree, and that original feeling of giving a system precise commands and watching it respond is still what gets me into the chair every morning.",
  },
  {
    label: "What I enjoy building",
    body: "Real-time systems, complex infrastructure, anything where state has to stay correct under concurrent load — that's where my attention naturally goes. Not because it looks impressive, but because the problems are genuinely hard and the margins for error are real. I like building things with operational weight: systems that have to keep working even when conditions get messy.",
  },
  {
    label: "Why architecture matters",
    body: "Most bugs I've traced in production turned out to be architecture decisions wearing the disguise of a code problem. Good structure gives a project the ability to scale, to be read by someone who wasn't there on day one, and to survive changes in requirements without collapsing. I treat architecture as the part of the work that outlasts any individual feature.",
  },
  {
    label: "Why I enjoy solving business problems",
    body: "Technically correct software that nobody needed is still a failure. I want to understand the problem well enough to push back — to know when a simpler solution fits better, or when the real issue sits upstream of anything code can touch. That clarity is what makes the engineering decisions actually matter, and it's the part of the work I find most interesting.",
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
