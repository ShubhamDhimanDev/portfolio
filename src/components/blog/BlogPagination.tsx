import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApiListMeta } from "@/types/blog.types";

interface BlogPaginationProps {
  meta: ApiListMeta;
  onPageChange: (page: number) => void;
}

export function BlogPagination({ meta, onPageChange }: BlogPaginationProps) {
  if (meta.total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        type="button"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        className="flex size-9 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted"
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      <span className="px-3 font-mono text-sm text-muted">
        Page {meta.page} of {meta.total_pages}
      </span>

      {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
        .filter((p) => Math.abs(p - meta.page) <= 1 || p === 1 || p === meta.total_pages)
        .reduce<number[]>((acc, p) => {
          if (acc.length > 0 && p - acc[acc.length - 1] > 1) acc.push(-1);
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === -1 ? (
            <span key={`gap-${i}`} className="px-1 text-subtle">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full font-mono text-sm transition-colors",
                p === meta.page
                  ? "bg-foreground text-background"
                  : "text-muted hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

      <button
        type="button"
        disabled={meta.page >= meta.total_pages}
        onClick={() => onPageChange(meta.page + 1)}
        className="flex size-9 items-center justify-center rounded-full border border-border-strong text-muted transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted"
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
