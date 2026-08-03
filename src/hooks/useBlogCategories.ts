import { useEffect, useState } from "react";
import { fetchBlogCategories } from "@/lib/blog-api";
import type { BlogCategory } from "@/types/blog.types";

export function useBlogCategories() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
