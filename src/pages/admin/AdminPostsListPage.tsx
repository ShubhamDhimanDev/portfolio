import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Archive, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ApiError } from "@/lib/api-client";
import {
  adminArchivePost,
  adminDeletePost,
  adminFetchPosts,
  adminTogglePost,
} from "@/lib/admin-api";
import { formatBlogDate } from "@/lib/blog-api";
import { cn } from "@/lib/utils";
import type { AdminBlogPostListItem, BlogPostStatus } from "@/types/admin.types";

const STATUS_TABS: { label: string; value: BlogPostStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export function AdminPostsListPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<AdminBlogPostListItem[]>([]);
  const [status, setStatus] = useState<BlogPostStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminBlogPostListItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    adminFetchPosts({ status: status === "all" ? undefined : status, search: search || undefined })
      .then((res) => setPosts(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load posts."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  async function handleToggle(post: AdminBlogPostListItem) {
    setBusyId(post.id);
    try {
      await adminTogglePost(post.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update post.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(post: AdminBlogPostListItem) {
    setBusyId(post.id);
    try {
      await adminArchivePost(post.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not archive post.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await adminDeletePost(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete post.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Posts</h1>
        <Button onClick={() => navigate("/admin/posts/new")} icon={Plus} iconPosition="left">
          New post
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatus(tab.value)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                status === tab.value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-surface py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none sm:w-64"
          />
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {/* Mobile card list */}
      <div className="mt-6 flex flex-col gap-3 sm:hidden">
        {isLoading && <p className="py-10 text-center text-muted">Loading...</p>}
        {!isLoading && posts.length === 0 && <p className="py-10 text-center text-muted">No posts found.</p>}
        {!isLoading &&
          posts.map((post) => (
            <div key={post.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-foreground">{post.title}</p>
                <StatusBadge status={post.status} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
                <span>{post.categories.map((c) => c.name).join(", ") || "-"}</span>
                <span className="font-mono">{formatBlogDate(post.updated_at)}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                <Link
                  to={`/admin/posts/${post.id}/edit`}
                  className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </Link>
                <button
                  type="button"
                  disabled={busyId === post.id}
                  onClick={() => handleToggle(post)}
                  className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
                  aria-label={post.status === "published" ? "Unpublish" : "Publish"}
                >
                  {post.status === "published" ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
                <button
                  type="button"
                  disabled={busyId === post.id || post.status === "archived"}
                  onClick={() => handleArchive(post)}
                  className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
                  aria-label="Archive"
                >
                  <Archive className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={busyId === post.id}
                  onClick={() => setPendingDelete(post)}
                  className="ml-auto flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  aria-label="Delete"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-border sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-xs uppercase tracking-wide text-subtle">
              <th className="px-5 py-3 font-medium">Title</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Categories</th>
              <th className="px-5 py-3 font-medium">Updated</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && posts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No posts found.
                </td>
              </tr>
            )}
            {!isLoading &&
              posts.map((post) => (
                <tr key={post.id} className="bg-surface/40">
                  <td className="max-w-xs truncate px-5 py-4 font-medium text-foreground">{post.title}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {post.categories.map((c) => c.name).join(", ") || "-"}
                  </td>
                  <td className="px-5 py-4 text-muted">{formatBlogDate(post.updated_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/posts/${post.id}/edit`}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <button
                        type="button"
                        disabled={busyId === post.id}
                        onClick={() => handleToggle(post)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
                        aria-label={post.status === "published" ? "Unpublish" : "Publish"}
                        title={post.status === "published" ? "Set to draft" : "Publish"}
                      >
                        {post.status === "published" ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === post.id || post.status === "archived"}
                        onClick={() => handleArchive(post)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
                        aria-label="Archive"
                        title="Archive"
                      >
                        <Archive className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busyId === post.id}
                        onClick={() => setPendingDelete(post)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.title}"?`}
        description="This soft-deletes the post - it will no longer appear anywhere, but the record is kept."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default AdminPostsListPage;
