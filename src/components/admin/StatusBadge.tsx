import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  draft: "border-border-strong bg-surface-2 text-muted",
  published: "border-signal/40 bg-signal/10 text-signal",
  archived: "border-border-strong bg-surface-2 text-subtle",
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  approved: "border-signal/40 bg-signal/10 text-signal",
  rejected: "border-red-500/40 bg-red-500/10 text-red-400",
  spam: "border-red-500/40 bg-red-500/10 text-red-400",
  new: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  contacted: "border-signal/40 bg-signal/10 text-signal",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-xs capitalize",
        COLORS[status] ?? "border-border-strong bg-surface-2 text-muted",
      )}
    >
      {status}
    </span>
  );
}
