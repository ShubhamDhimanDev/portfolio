import { createContext } from "react";
import type { AdminUser } from "@/types/admin.types";

export type LoginResult = { ok: true } | { ok: false; message: string };

export interface AdminAuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);
