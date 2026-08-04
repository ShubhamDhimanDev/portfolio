import { Navigate, Outlet } from "react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminAuthGuard() {
  const { admin, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-subtle">Loading…</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export default AdminAuthGuard;
