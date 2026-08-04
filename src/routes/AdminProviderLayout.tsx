import { Outlet } from "react-router";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export default function AdminProviderLayout() {
  return (
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  );
}
