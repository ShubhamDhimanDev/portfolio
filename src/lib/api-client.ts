import { getCsrfToken } from "@/lib/admin-session";

const API_BASE = "/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const isFormData = init.body instanceof FormData;

  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, method, headers });
  } catch {
    throw new ApiError("Could not reach the server. Check your connection and try again.", 0);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    // Non-JSON response (e.g. a raw 500 HTML page) - fall through with payload = null.
  }

  const body = payload as { ok?: boolean; message?: string } | null;

  if (!response.ok || body?.ok === false) {
    throw new ApiError(body?.message ?? "Something went wrong. Please try again.", response.status);
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, {
      ...init,
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    apiFetch<T>(path, {
      ...init,
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, init?: RequestInit) => apiFetch<T>(path, { ...init, method: "DELETE" }),
};
