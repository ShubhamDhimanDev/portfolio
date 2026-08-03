import { Suspense, lazy, useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { initSceneTracking } from "@/lib/scene-tracking";

const BackgroundScene = lazy(() =>
  import("@/components/three/BackgroundScene").then((mod) => ({ default: mod.BackgroundScene })),
);

export function BackgroundCanvas() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;
    return initSceneTracking();
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Suspense fallback={null}>
        <BackgroundScene />
      </Suspense>
    </div>
  );
}
