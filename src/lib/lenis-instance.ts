import type Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenisInstance(lenis: Lenis | null) {
  instance = lenis;
}

export function scrollToTarget(target: string | number | HTMLElement, offset = -20) {
  if (instance) {
    // Document height may have changed since Lenis last measured it (e.g. a
    // route change swapped in a taller page) — resize before scrolling so
    // the target offset isn't clamped to a stale, shorter scroll range.
    instance.resize();
    instance.scrollTo(target, { offset, duration: 1.1 });
    return;
  }

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
    return;
  }

  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
}
