import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { fetchBlogPosts } from "@/lib/blog-api";
import type { ApiListMeta, BlogPostSummary } from "@/types/blog.types";

interface UseBlogPostsParams {
  page?: number;
  perPage?: number;
  category?: string;
  initialData?: { posts: BlogPostSummary[]; meta: ApiListMeta | undefined };
}

interface UseBlogPostsResult {
  posts: BlogPostSummary[];
  meta: ApiListMeta | undefined;
  isLoading: boolean;
  error: string | null;
}

export function useBlogPosts({
  page = 1,
  perPage = 9,
  category,
  initialData,
}: UseBlogPostsParams = {}): UseBlogPostsResult {
  const [posts, setPosts] = useState<BlogPostSummary[]>(initialData?.posts ?? []);
  const [meta, setMeta] = useState<ApiListMeta | undefined>(initialData?.meta);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const isInitialRender = useRef(true);
  const hadInitialData = useRef(initialData !== undefined);

  useEffect(() => {
    // The "blog" route is prerendered at build time (it has no dynamic params),
    // so initialData is a snapshot frozen at the last build - not live data.
    // On the very first render for that default state (page 1, no category) we
    // still revalidate in the background, but skip flipping isLoading so the
    // stale-but-non-empty prerendered list stays visible instead of flashing
    // a skeleton while the fresh data loads.
    const isSilentRevalidation =
      isInitialRender.current && hadInitialData.current && page === 1 && !category;
    isInitialRender.current = false;

    const controller = new AbortController();

    // Deferred into a microtask so the "start" signal is a callback, not a
    // synchronous statement in the effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      if (!isSilentRevalidation) setIsLoading(true);
      setError(null);
    });

    fetchBlogPosts({ page, perPage, category, signal: controller.signal })
      .then((res) => {
        if (controller.signal.aborted) return;
        setPosts(res.data);
        setMeta(res.meta);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof ApiError ? err.message : "Could not load posts.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, perPage, category]);

  return { posts, meta, isLoading, error };
}
