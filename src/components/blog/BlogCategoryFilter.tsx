import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/blog.types";

interface BlogCategoryFilterProps {
  categories: BlogCategory[];
  active: string | null;
  onChange: (slug: string | null) => void;
}

export function BlogCategoryFilter({ categories, active, onChange }: BlogCategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200",
          active === null
            ? "border-foreground bg-foreground text-background"
            : "border-border-strong text-muted hover:text-foreground",
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.slug)}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200",
            active === category.slug
              ? "border-foreground bg-foreground text-background"
              : "border-border-strong text-muted hover:text-foreground",
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
