import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { Stat } from "@/components/ui/Stat";
import { baseTransition, fadeUp, staggerContainer } from "@/lib/motion";
import { HERO_STATS, PROFILE } from "@/data/profile";
import { scrollToTarget } from "@/lib/lenis-instance";

export function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen items-center overflow-clip pt-24 pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-background/70 to-transparent"
      />

      <Container className="relative z-10">
        <motion.div
          variants={staggerContainer(0.14, 0.1)}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* <motion.div
            variants={fadeUp}
            transition={baseTransition}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/60 px-4 py-1.5 backdrop-blur-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-signal" />
            </span>
            <span className="font-mono text-xs tracking-wide text-muted">
              Available for select engagements
            </span>
          </motion.div> */}

          <motion.h1
            variants={fadeUp}
            transition={baseTransition}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl md:text-6xl"
          >
            Building scalable{" "}
            <span className="text-muted">SaaS products,</span>
            <br />
            AI-powered applications,
            <br />
            <span className="text-muted">and modern web experiences.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={baseTransition}
            className="mt-5 max-w-xl text-balance text-lg leading-relaxed text-muted"
          >
            I'm {PROFILE.name}, a {PROFILE.role.toLowerCase()} with {PROFILE.experience} of experience
            turning ambitious product ideas into dependable, well-architected software.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={baseTransition}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Magnetic>
              <Button
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#projects");
                }}
                variant="primary"
                size="lg"
                icon={ArrowRight}
              >
                View Projects
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTarget("#contact");
                }}
                variant="secondary"
                size="lg"
                icon={ArrowUpRight}
              >
                Contact Me
              </Button>
            </Magnetic>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={baseTransition}
            className="mt-10 grid max-w-lg grid-cols-3 gap-8 border-t border-border pt-6"
          >
            {HERO_STATS.map((stat) => (
              <Stat key={stat.label} stat={stat} />
            ))}
          </motion.div>
        </motion.div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute inset-x-0 bottom-8 z-10 hidden justify-center sm:flex"
      >
        <div className="flex flex-col items-center gap-2 text-subtle">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="h-10 w-px animate-pulse-soft bg-gradient-to-b from-subtle to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
