import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ApiError } from "@/lib/api-client";
import { submitBlogComment } from "@/lib/blog-api";

interface CommentFormProps {
  slug: string;
  onSubmitted?: () => void;
}

export function CommentForm({ slug, onSubmitted }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await submitBlogComment(slug, {
        author_name: name,
        author_email: email,
        content,
      });
      setStatus({ type: "success", message: res.message });
      setName("");
      setEmail("");
      setContent("");
      onSubmitted?.();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof ApiError ? err.message : "Could not submit your comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          required
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClasses}
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClasses}
        />
      </div>
      <textarea
        required
        rows={4}
        placeholder="Add to the discussion..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className={inputClasses}
      />

      {status && (
        <p className={status.type === "success" ? "text-sm text-signal" : "text-sm text-red-400"}>
          {status.message}
        </p>
      )}

      <div>
        <Button type="submit" disabled={isSubmitting} icon={Send} className="w-full">
          {isSubmitting ? "Sending..." : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
