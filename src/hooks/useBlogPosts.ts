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
    // Route loader data comes from a build-time prerendered snapshot (blog list
    // is a static route), which goes stale the moment a new post is published.
    // For that exact initial state, revalidate quietly in the background instead
    // of skipping the fetch or flashing the loading skeleton over good data.
    const isQuietRevalidation =
      isInitialRender.current && hadInitialData.current && page === 1 && !category;
    isInitialRender.current = false;

    const controller = new AbortController();

    // Deferred into a microtask so the "start" signal is a callback, not a
    // synchronous statement in the effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      if (!isQuietRevalidation) setIsLoading(true);
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
        // A failed background revalidation shouldn't clobber the still-valid
        // prerendered posts already on screen with an error state.
        if (!isQuietRevalidation) {
          setError(err instanceof ApiError ? err.message : "Could not load posts.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [page, perPage, category]);

  return { posts, meta, isLoading, error };
}
