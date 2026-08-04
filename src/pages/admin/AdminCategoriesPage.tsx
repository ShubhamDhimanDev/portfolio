import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { AdminCategory } from "@/types/admin.types";

const inputClasses =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none";

interface FormState {
  id: number | null;
  name: string;
  slug: string;
  description: string;
}

const EMPTY_FORM: FormState = { id: null, name: "", slug: "", description: "" };

export function AdminCategoriesPage() {
  const { categories, isLoading, error, reload } = useAdminCategories();
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AdminCategory | null>(null);

  function startCreate() {
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  function startEdit(category: AdminCategory) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
    });
    setFormError(null);
  }

  async function handleSubmit() {
    if (!form) return;
    setIsSaving(true);
    setFormError(null);

    try {
      const payload = { name: form.name, slug: form.slug || undefined, description: form.description || undefined };
      if (form.id === null) {
        await adminCreateCategory(payload);
      } else {
        await adminUpdateCategory(form.id, payload);
      }
      setForm(null);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save category.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    try {
      await adminDeleteCategory(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not delete category.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Categories</h1>
        {!form && (
          <Button onClick={startCreate} icon={Plus} iconPosition="left">
            New category
          </Button>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {form && (
        <div className="mt-6 rounded-2xl border border-border-strong bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {form.id === null ? "New category" : "Edit category"}
            </p>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="flex size-7 items-center justify-center rounded-lg text-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClasses}
            />
            <input
              type="text"
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className={inputClasses}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={inputClasses}
            />
          </div>
          {formError && <p className="mt-3 text-sm text-red-400">{formError}</p>}
          <div className="mt-4">
            <Button onClick={handleSubmit} disabled={isSaving || !form.name} className="!h-9 !px-4 text-sm">
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile card list */}
      <div className="mt-6 flex flex-col gap-3 sm:hidden">
        {isLoading && <p className="py-10 text-center text-muted">Loading...</p>}
        {!isLoading && categories.length === 0 && <p className="py-10 text-center text-muted">No categories yet.</p>}
        {!isLoading &&
          categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{category.name}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted">{category.slug}</p>
                </div>
                <span className="shrink-0 text-xs text-subtle">{category.post_count} posts</span>
              </div>
              <div className="mt-3 flex items-center gap-1 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => startEdit(category)}
                  className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                  aria-label="Edit"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(category)}
                  className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
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
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Slug</th>
              <th className="px-5 py-3 font-medium">Posts</th>
              <th className="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  Loading...
                </td>
              </tr>
            )}
            {!isLoading && categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  No categories yet.
                </td>
              </tr>
            )}
            {!isLoading &&
              categories.map((category) => (
                <tr key={category.id} className="bg-surface/40">
                  <td className="px-5 py-4 font-medium text-foreground">{category.name}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted">{category.slug}</td>
                  <td className="px-5 py-4 text-muted">{category.post_count}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDelete(category)}
                        className="flex size-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                        aria-label="Delete"
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
        title={`Delete "${pendingDelete?.name}"?`}
        description="Posts in this category will no longer be tagged with it. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
