import { useContext } from "react";
import { AdminAuthContext, type AdminAuthContextValue } from "@/contexts/admin-auth-context";

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
