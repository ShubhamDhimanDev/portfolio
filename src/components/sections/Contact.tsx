import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Magnetic } from "@/components/ui/Magnetic";
import { Reveal } from "@/components/ui/Reveal";
import { GlowOrb } from "@/components/ui/GridBackground";
import { staggerContainer, fadeUp, viewportOnce } from "@/lib/motion";
import { PROFILE, SOCIAL_LINKS } from "@/data/profile";

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="contact" className="relative py-28 md:py-40">
      <GlowOrb className="left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 bg-accent/10" />

      <Container className="relative flex flex-col items-center text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-soft">Contact</p>
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="mt-5 max-w-2xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Have a product to build? Let's talk.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-lg text-balance leading-relaxed text-muted">
            Open to full-time roles, freelance engagements, and interesting technical problems.
            The fastest way to reach me is email.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <Magnetic strength={0.2}>
            <button
              type="button"
              onClick={handleCopy}
              className="group flex items-center gap-3 rounded-full border border-border-strong bg-surface px-6 py-3.5 font-mono text-base text-foreground transition-colors duration-300 hover:border-accent-soft/50 sm:text-lg"
            >
              {PROFILE.email}
              <span className="flex size-7 items-center justify-center rounded-full bg-surface-2 text-muted transition-colors group-hover:text-foreground">
                {copied ? <Check className="size-3.5 text-signal" /> : <Copy className="size-3.5" />}
              </span>
            </button>
          </Magnetic>
        </Reveal>

        <motion.div
          variants={staggerContainer(0.06, 0.2)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid w-full max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <motion.a
              key={label}
              variants={fadeUp}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-6 transition-colors duration-300 hover:border-border-strong hover:bg-surface-2"
            >
              <Icon className="size-5 text-muted transition-colors group-hover:text-foreground" />
              <span className="flex items-center gap-1 text-sm text-muted transition-colors group-hover:text-foreground">
                {label}
                <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
            </motion.a>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
