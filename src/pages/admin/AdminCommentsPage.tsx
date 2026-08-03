import { useEffect, useState } from "react";
import { Check, ExternalLink, Trash2, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminApproveComment, adminDeleteComment, adminFetchComments, adminRejectComment } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { formatBlogDate } from "@/lib/blog-api";
import { cn } from "@/lib/utils";
import type { AdminComment, CommentStatus } from "@/types/admin.types";

const STATUS_TABS: { label: string; value: CommentStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Spam", value: "spam" },
];

export function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [status, setStatus] = useState<CommentStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminComment | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    adminFetchComments({ status: status === "all" ? undefined : status })
      .then((res) => setComments(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load comments."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleApprove(comment: AdminComment) {
    setBusyId(comment.id);
    try {
      await adminApproveComment(comment.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not approve comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(comment: AdminComment) {
    setBusyId(comment.id);
    try {
      await adminRejectComment(comment.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reject comment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await adminDeleteComment(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete comment.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Comments</h1>

      <div className="mt-6 flex w-fit gap-1 rounded-full border border-border bg-surface p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              status === tab.value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="py-10 text-center text-muted">Loading...</p>}
        {!isLoading && comments.length === 0 && <p className="py-10 text-center text-muted">No comments found.</p>}

        {!isLoading &&
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{comment.author_name}</span>
                    <span className="text-xs text-subtle">{comment.author_email}</span>
                  </div>
                  <a
                    href={`/blog/${comment.post_slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center gap-1 text-xs text-accent-soft hover:underline"
                  >
                    {comment.post_title}
                    <ExternalLink className="size-3" />
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={comment.status} />
                  <span className="font-mono text-xs text-subtle">{formatBlogDate(comment.created_at)}</span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{comment.content}</p>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={busyId === comment.id || comment.status === "approved"}
                  onClick={() => handleApprove(comment)}
                  className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-40"
                >
                  <Check className="size-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busyId === comment.id || comment.status === "rejected"}
                  onClick={() => handleReject(comment)}
                  className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-40"
                >
                  <X className="size-3.5" />
                  Reject
                </button>
                <button
                  type="button"
                  disabled={busyId === comment.id}
                  onClick={() => setPendingDelete(comment)}
                  className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this comment?"
        description="This permanently removes the comment. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
