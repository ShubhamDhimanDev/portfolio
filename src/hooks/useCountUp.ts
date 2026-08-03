import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function useCountUp<T extends HTMLElement = HTMLDivElement>(target: number, duration = 1.6) {
  const ref = useRef<T>(null);
  const isInView = useInView(ref, { once: true, amount: "some" });
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    if (prefersReducedMotion) {
      const frameId = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(frameId);
    }

    let frameId: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Number((eased * target).toFixed(target % 1 !== 0 ? 1 : 0)));

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, target, duration, prefersReducedMotion]);

  return { ref, value };
}
