import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Image, LogOut, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV_ITEMS = [
  { to: "/admin/posts", label: "Posts", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/media", label: "Media", icon: Image },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border">
        <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
          <span className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-xs font-semibold text-background">
            SD
          </span>
          <span className="text-sm font-medium text-foreground">Admin</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-surface-2 text-foreground" : "text-muted hover:bg-surface hover:text-foreground",
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <p className="truncate px-1 text-xs text-subtle">{admin?.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <LogOut className="size-4" />
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
