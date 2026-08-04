import { Suspense, lazy, useEffect, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { initSceneTracking } from "@/lib/scene-tracking";

const BackgroundScene = lazy(() =>
  import("@/components/three/BackgroundScene").then((mod) => ({ default: mod.BackgroundScene })),
);

function noopSubscribe() {
  return () => {};
}
function getHasMountedSnapshot() {
  return true;
}
function getHasMountedServerSnapshot() {
  return false;
}

export function BackgroundCanvas() {
  const prefersReducedMotion = usePrefersReducedMotion();
  // WebGL has no Node equivalent - never let the Canvas tree render during the
  // build-time prerender pass. Mounting only after hydration keeps server and
  // first-client-render markup identical (both render null here).
  const hasMounted = useSyncExternalStore(noopSubscribe, getHasMountedSnapshot, getHasMountedServerSnapshot);

  useEffect(() => {
    if (prefersReducedMotion) return;
    return initSceneTracking();
  }, [prefersReducedMotion]);

  if (!hasMounted || prefersReducedMotion) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <Suspense fallback={null}>
        <BackgroundScene />
      </Suspense>
    </div>
  );
}
