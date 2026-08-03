import { formatBlogDate } from "@/lib/blog-api";
import type { BlogComment } from "@/types/blog.types";

export function CommentList({ comments }: { comments: BlogComment[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-muted">No comments yet - be the first to say something.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">{comment.author_name}</span>
            <span className="font-mono text-xs text-subtle">{formatBlogDate(comment.created_at)}</span>
          </div>
          <p className="mt-2 whitespace-pre-line leading-relaxed text-muted">{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
