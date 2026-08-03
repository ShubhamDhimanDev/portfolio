import { useEffect, useRef } from "react";

export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = ref.current;
    if (!el) return;

    let frameId = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    function onPointerMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
    }

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      if (el) el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      frameId = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onPointerMove);
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-0 hidden h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.06] blur-[110px] md:block"
    />
  );
}
