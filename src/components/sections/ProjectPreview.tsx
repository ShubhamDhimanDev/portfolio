import { cn } from "@/lib/utils";

interface ProjectPreviewProps {
  label: string;
  accent?: "accent" | "signal";
  className?: string;
}

export function ProjectPreview({ label, accent = "accent", className }: ProjectPreviewProps) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-border bg-surface-2",
        className,
      )}
    >
      <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="size-2 rounded-full bg-border-strong" />
        <span className="ml-3 truncate font-mono text-[11px] text-subtle">{label}</span>
      </div>

      <div className="relative flex-1 p-5">
        <div
          aria-hidden
          className={cn(
            "absolute -right-8 -top-8 h-36 w-36 rounded-full blur-3xl",
            accent === "accent" ? "bg-accent/25" : "bg-signal/20",
          )}
        />
        <div className="relative grid h-full grid-cols-3 gap-2.5">
          <div className="col-span-1 flex flex-col gap-2.5">
            <div className="h-7 rounded-lg bg-surface-3" />
            <div className="h-full rounded-lg border border-border bg-background/40" />
          </div>
          <div className="col-span-2 flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              <div className="h-16 flex-1 rounded-lg border border-border bg-background/40" />
              <div className="h-16 flex-1 rounded-lg border border-border bg-background/40" />
              <div className="h-16 flex-1 rounded-lg border border-border bg-background/40" />
            </div>
            <div className="h-full rounded-lg border border-border bg-background/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
