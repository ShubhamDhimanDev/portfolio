import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { baseTransition, fadeUp, viewportOnce } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  variants?: Variants;
  delay?: number;
  className?: string;
}

export function Reveal({ children, variants = fadeUp, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={variants}
      transition={{ ...baseTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
