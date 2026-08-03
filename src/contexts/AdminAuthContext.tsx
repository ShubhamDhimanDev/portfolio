import { useCallback, useEffect, useState, type ReactNode } from "react";
import { adminLogin, adminLogout, adminMe } from "@/lib/admin-api";
import { setCsrfToken } from "@/lib/admin-session";
import { ApiError } from "@/lib/api-client";
import { AdminAuthContext, type LoginResult } from "@/contexts/admin-auth-context";
import type { AdminUser } from "@/types/admin.types";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    adminMe()
      .then((res) => {
        if (!active || !res.data) return;
        setAdmin(res.data.admin);
        setCsrfToken(res.data.csrf_token);
      })
      .catch(() => {
        // Not authenticated - expected on a fresh visit, admin stays null.
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await adminLogin(email, password);
      setAdmin(res.data.admin);
      setCsrfToken(res.data.csrf_token);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof ApiError ? err.message : "Could not log in." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } catch {
      // Clear local state regardless - the cookie may already be gone server-side.
    }
    setAdmin(null);
    setCsrfToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
