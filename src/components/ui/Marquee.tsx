import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

export function Marquee({ children, className, reverse }: MarqueeProps) {
  return (
    <div className={cn("mask-fade-x relative flex w-full overflow-hidden", className)}>
      <div
        className={cn(
          "animate-marquee flex w-max shrink-0 items-center gap-10",
          reverse && "[animation-direction:reverse]",
        )}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
