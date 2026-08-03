import { useCallback, useEffect, useState } from "react";
import { adminFetchCategories } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { AdminCategory } from "@/types/admin.types";

export function useAdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminFetchCategories()
      .then((res) => setCategories(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load categories."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  return { categories, isLoading, error, reload: load };
}
