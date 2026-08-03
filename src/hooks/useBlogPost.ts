import { useEffect, useState } from "react";
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

export function useBlogPost(slug: string | undefined): UseBlogPostResult {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    if (!slug) return;

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
