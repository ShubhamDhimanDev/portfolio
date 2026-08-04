import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FileText, FolderOpen, Image, Inbox, LogOut, Menu, MessageSquare, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const NAV_ITEMS = [
  { to: "/admin/posts", label: "Posts", icon: FileText },
  { to: "/admin/categories", label: "Categories", icon: FolderOpen },
  { to: "/admin/comments", label: "Comments", icon: MessageSquare },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
  { to: "/admin/media", label: "Media", icon: Image },
];

export function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    setIsNavOpen(false);
  }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate("/admin/login", { replace: true });
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-xs font-semibold text-background">
          SD
        </span>
        <span className="text-sm font-medium text-foreground">Admin</span>
        <button
          type="button"
          onClick={() => setIsNavOpen(false)}
          className="ml-auto flex size-8 items-center justify-center rounded-lg text-muted hover:text-foreground lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border lg:flex">{sidebarContent}</aside>

      <AnimatePresence>
        {isNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsNavOpen(false)}
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-72 max-w-[85vw] flex-col border-r border-border bg-background"
            >
              {sidebarContent}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsNavOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-muted hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="flex size-7 items-center justify-center rounded-lg bg-foreground font-mono text-[11px] font-semibold text-background">
            SD
          </span>
          <span className="text-sm font-medium text-foreground">Admin</span>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
