/** Mutable, module-level trackers read inside R3F's useFrame - avoids React re-renders on every scroll/pointer tick. */

export const pointerState = { x: 0, y: 0 };
export const scrollState = { progress: 0 };

export function initSceneTracking() {
  function onPointerMove(event: PointerEvent) {
    pointerState.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointerState.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollState.progress = max > 0 ? window.scrollY / max : 0;
  }

  onScroll();
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
