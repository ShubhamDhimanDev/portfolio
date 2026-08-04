import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export function AdminLoginPage() {
  const { admin, isLoading, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && admin) {
    const redirectTo = (location.state as { from?: string } | null)?.from ?? "/admin/posts";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/admin/posts", { replace: true });
  }

  const inputClasses =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none transition-colors";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-foreground text-background">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Admin sign in</h1>
          <p className="mt-2 text-sm text-muted">Manage posts, categories, comments, and media.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Email</label>
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Password</label>
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClasses}
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="mt-2 w-full justify-center">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
