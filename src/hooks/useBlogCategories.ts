import { useEffect, useRef, useState } from "react";
import { fetchBlogCategories } from "@/lib/blog-api";
import type { BlogCategory } from "@/types/blog.types";

export function useBlogCategories(initialData?: BlogCategory[]) {
  const [categories, setCategories] = useState<BlogCategory[]>(initialData ?? []);
  const [isLoading, setIsLoading] = useState(!initialData);
  const hadInitialData = useRef(initialData !== undefined);

  useEffect(() => {
    if (hadInitialData.current) return;

    const controller = new AbortController();

    fetchBlogCategories(controller.signal)
      .then((res) => setCategories(res.data))
      .catch(() => {
        if (!controller.signal.aborted) setCategories([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { categories, isLoading };
}
