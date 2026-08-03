import { ArrowUp } from "lucide-react";
import { PROFILE, SOCIAL_LINKS } from "@/data/profile";
import { Container } from "@/components/ui/Container";
import { scrollToTarget } from "@/lib/lenis-instance";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border">
      <Container className="flex flex-col gap-10 py-16">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              {PROFILE.name}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {PROFILE.role} - {PROFILE.focus}
            </p>
          </div>

          <button
            type="button"
            onClick={() => scrollToTarget("#hero")}
            className="group flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm text-muted transition-colors hover:border-accent-soft/50 hover:text-foreground"
          >
            Back to top
            <ArrowUp className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-6 border-t border-border pt-8 md:flex-row md:items-center">
          <p className="font-mono text-xs text-subtle">
            © {year} {PROFILE.name}. Built with React, Three.js &amp; Framer Motion.
          </p>

          <div className="flex items-center gap-5">
            {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-muted transition-colors hover:text-foreground"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </footer>
  );
}
