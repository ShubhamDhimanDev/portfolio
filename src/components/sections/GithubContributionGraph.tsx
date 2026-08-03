import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { ContributionDay } from "@/types/github";

const LEVEL_CLASSES: Record<ContributionDay["level"], string> = {
  0: "bg-surface-3",
  1: "bg-accent/25",
  2: "bg-accent/50",
  3: "bg-accent/75",
  4: "bg-accent",
};

export function GithubContributionGraph({ contributions }: { contributions: ContributionDay[] }) {
  const weeks = useMemo(() => {
    const result: ContributionDay[][] = [];
    for (let i = 0; i < contributions.length; i += 7) {
      result.push(contributions.slice(i, i + 7));
    }
    return result;
  }, [contributions]);

  const totalCount = contributions.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 md:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span> contributions in
          the last year
        </p>
        <div className="flex items-center gap-1.5 text-xs text-subtle">
          <span>Less</span>
          {([0, 1, 2, 3, 4] as const).map((level) => (
            <span key={level} className={cn("size-2.5 rounded-sm", LEVEL_CLASSES[level])} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.count} contributions on ${day.date}`}
                className={cn("size-[11px] rounded-[2px] transition-transform hover:scale-125", LEVEL_CLASSES[day.level])}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
