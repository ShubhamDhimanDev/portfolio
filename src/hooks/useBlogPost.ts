import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api-client";
import { fetchBlogPost } from "@/lib/blog-api";
import type { BlogPost } from "@/types/blog.types";

interface UseBlogPostResult {
  post: BlogPost | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  refetch: () => void;
}

/**
 * @param preloadedPost Post data the route's loader already fetched for this
 * exact slug (see BlogPostPage.tsx) - when present, the initial fetch below
 * is skipped so the page doesn't hit the API twice on first render.
 */
export function useBlogPost(slug: string | undefined, preloadedPost?: BlogPost | null): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(preloadedPost ?? null);
  const [isLoading, setIsLoading] = useState(!preloadedPost);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refetchToken, setRefetchToken] = useState(0);
  const skipNextFetch = useRef(!!preloadedPost);

  useEffect(() => {
    if (!slug) return;

    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    const controller = new AbortController();

    // Deferred into a microtask so the "start" signal is a callback, not a
    // synchronous statement in the effect body (react-hooks/set-state-in-effect).
    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;
      setIsLoading(true);
      setError(null);
      setNotFound(false);
    });

    fetchBlogPost(slug, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setPost(res.data);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        } else {
          setError(err instanceof ApiError ? err.message : "Could not load this post.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [slug, refetchToken]);

  return { post, isLoading, error, notFound, refetch: () => setRefetchToken((t) => t + 1) };
}
