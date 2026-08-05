import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { baseTransition, fadeUp, viewportOnce } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
  /** Fade in on mount instead of waiting for scroll-into-view. Use for content
   * that starts near/below the fold but should be visible immediately (e.g.
   * directly under a tall hero), as opposed to sections meant to reveal as
   * the user scrolls down to them. */
  immediate?: boolean;
}

export function Reveal({ children, variants = fadeUp, delay = 0, className, immediate = false }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      {...(immediate ? { animate: "visible" } : { whileInView: "visible", viewport: viewportOnce })}
      variants={variants}
      transition={{ ...baseTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
