import { useCountUp } from "@/hooks/useCountUp";
import type { StatItem } from "@/types/common";

export function Stat({ stat }: { stat: StatItem }) {
  const { ref, value } = useCountUp<HTMLDivElement>(stat.value);

  return (
    <div ref={ref} className="flex flex-col gap-1.5">
      <span className="font-mono text-3xl font-semibold text-foreground sm:text-4xl">
        {stat.prefix}
        {value}
        {stat.suffix}
      </span>
      <span className="text-sm text-muted">{stat.label}</span>
    </div>
  );
}
