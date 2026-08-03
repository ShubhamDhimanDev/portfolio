import { useCallback, useEffect, useState } from "react";
import { adminDeleteMedia, adminFetchMedia, adminUploadMedia } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { AdminMedia } from "@/types/admin.types";

export function useAdminMedia(type?: AdminMedia["file_type"]) {
  const [media, setMedia] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    adminFetchMedia(type)
      .then((res) => setMedia(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load media."))
      .finally(() => setIsLoading(false));
  }, [type]);

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function upload(file: File, altText?: string) {
    setIsUploading(true);
    setError(null);
    try {
      const res = await adminUploadMedia(file, altText);
      setMedia((prev) => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
      throw err;
    } finally {
      setIsUploading(false);
    }
  }

  async function remove(id: number) {
    await adminDeleteMedia(id);
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return { media, isLoading, error, isUploading, upload, remove, reload: load };
}
