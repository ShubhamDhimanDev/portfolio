import { cn } from "@/lib/utils";
import type { BlogCategory } from "@/types/blog.types";

interface CategoryMultiSelectProps {
  categories: BlogCategory[];
  selected: number[];
  onChange: (ids: number[]) => void;
}

export function CategoryMultiSelect({ categories, selected, onChange }: CategoryMultiSelectProps) {
  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  if (categories.length === 0) {
    return <p className="text-sm text-subtle">No categories yet - create one on the Categories page.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selected.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => toggle(category.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isSelected
                ? "border-foreground bg-foreground text-background"
                : "border-border-strong text-muted hover:text-foreground",
            )}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
