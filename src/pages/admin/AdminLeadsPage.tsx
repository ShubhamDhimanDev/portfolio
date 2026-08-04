import { useEffect, useState } from "react";
import { Archive, Mail, Phone, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminDeleteLead, adminFetchLeads, adminUpdateLeadStatus } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import { formatBlogDate } from "@/lib/blog-api";
import { cn } from "@/lib/utils";
import type { AdminLead, LeadStatus } from "@/types/admin.types";

const STATUS_TABS: { label: string; value: LeadStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Archived", value: "archived" },
];

export function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminLead | null>(null);

  function load() {
    setIsLoading(true);
    setError(null);
    adminFetchLeads(status === "all" ? undefined : status)
      .then((res) => setLeads(res.data))
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Could not load leads."))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function handleSetStatus(lead: AdminLead, next: LeadStatus) {
    setBusyId(lead.id);
    try {
      await adminUpdateLeadStatus(lead.id, next);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update lead.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await adminDeleteLead(pendingDelete.id);
      setPendingDelete(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete lead.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Leads</h1>

      <div className="mt-6 flex w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 sm:w-fit">
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

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="py-10 text-center text-muted">Loading...</p>}
        {!isLoading && leads.length === 0 && <p className="py-10 text-center text-muted">No leads found.</p>}

        {!isLoading &&
          leads.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{lead.name}</span>
                    <span className="text-xs text-subtle">{lead.source}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-accent-soft">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 hover:underline">
                      <Mail className="size-3" />
                      {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 hover:underline">
                        <Phone className="size-3" />
                        {lead.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={lead.status} />
                  <span className="font-mono text-xs text-subtle">{formatBlogDate(lead.created_at)}</span>
                </div>
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{lead.message}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  disabled={busyId === lead.id || lead.status === "contacted"}
                  onClick={() => handleSetStatus(lead, "contacted")}
                  className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-signal/40 hover:text-signal disabled:opacity-40"
                >
                  <Mail className="size-3.5" />
                  Mark contacted
                </button>
                <button
                  type="button"
                  disabled={busyId === lead.id || lead.status === "archived"}
                  onClick={() => handleSetStatus(lead, "archived")}
                  className="flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted transition-colors hover:border-amber-500/40 hover:text-amber-400 disabled:opacity-40"
                >
                  <Archive className="size-3.5" />
                  Archive
                </button>
                <button
                  type="button"
                  disabled={busyId === lead.id}
                  onClick={() => setPendingDelete(lead)}
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
        title="Delete this lead?"
        description="This permanently removes the lead. This can't be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default AdminLeadsPage;
