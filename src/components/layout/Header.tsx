import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS, SECTION_IDS } from "@/lib/constants";
import { useActiveSection } from "@/hooks/useActiveSection";
import { scrollToTarget } from "@/lib/lenis-instance";
import { Button } from "@/components/ui/Button";

const PILL_TRANSITION = { type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.25 } as const;

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();
  const activeId = useActiveSection(SECTION_IDS, location.pathname);
  const isHome = location.pathname === "/";
  const pendingScrollRef = useRef<string | null>(null);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 32);
  });

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  // After navigating back to home, fire the stored scroll target.
  useEffect(() => {
    if (isHome && pendingScrollRef.current) {
      const target = pendingScrollRef.current;
      pendingScrollRef.current = null;
      const timer = setTimeout(() => {
        scrollToTarget(target);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isHome]);

  function handleNavClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    setMobileOpen(false);
    if (isHome) {
      event.preventDefault();
      scrollToTarget(href);
    } else {
      event.preventDefault();
      pendingScrollRef.current = href;
      navigate("/");
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-border bg-background/75 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <Link
            to="/"
            className="group flex items-center gap-2.5"
            onClick={() => setMobileOpen(false)}
          >
            <span className="flex h-9 w-20 items-center justify-center rounded-lg bg-foreground font-mono text-sm font-semibold text-background transition-transform duration-300 group-hover:scale-95">
              InsaneDev
            </span>
            <span className="hidden text-sm font-medium tracking-tight text-foreground sm:block">
              Shubham Dhiman
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-surface/60 px-1.5 py-1.5 backdrop-blur-sm md:flex">
            {NAV_LINKS.map((link) => {
              if (link.type === "route") {
                const isActive = location.pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                      isActive ? "text-background" : "text-muted hover:text-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-foreground"
                        transition={PILL_TRANSITION}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                );
              }

              const id = link.href.replace("#", "");
              const isActive = isHome && activeId === id;
              return (
                <a
                  key={link.href}
                  href={isHome ? link.href : `/${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={cn(
                    "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200",
                    isActive ? "text-background" : "text-muted hover:text-foreground",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full bg-foreground"
                      transition={PILL_TRANSITION}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <Button
              href={isHome ? "#contact" : "/#contact"}
              onClick={(e: MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "#contact")}
              variant="secondary"
              size="md"
              className="!h-10 !px-4 text-sm"
            >
              Let's talk
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex size-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex h-full flex-col justify-center px-8">
              <nav className="flex flex-col gap-2">
                {NAV_LINKS.map((link, index) =>
                  link.type === "route" ? (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="block border-b border-border py-4 text-3xl font-medium tracking-tight text-foreground"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.href}
                      href={isHome ? link.href : `/${link.href}`}
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="border-b border-border py-4 text-3xl font-medium tracking-tight text-foreground"
                    >
                      {link.label}
                    </motion.a>
                  ),
                )}
              </nav>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * NAV_LINKS.length, duration: 0.4 }}
                className="mt-10"
              >
                <Button
                  href={isHome ? "#contact" : "/#contact"}
                  onClick={(e: MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "#contact")}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  Let's talk
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
