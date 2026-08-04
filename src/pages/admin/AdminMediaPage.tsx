import { useRef, useState, type ChangeEvent } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useAdminMedia } from "@/hooks/useAdminMedia";
import { cn } from "@/lib/utils";
import type { AdminMedia } from "@/types/admin.types";

const TYPE_TABS: { label: string; value: AdminMedia["file_type"] | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Documents", value: "document" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminMediaPage() {
  const [type, setType] = useState<AdminMedia["file_type"] | undefined>(undefined);
  const { media, isLoading, isUploading, upload, remove, error } = useAdminMedia(type);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminMedia | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await upload(file);
    } catch {
      // error already surfaced via hook state
    } finally {
      event.target.value = "";
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    setPendingDelete(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Media</h1>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-soft disabled:opacity-50"
        >
          <Upload className="size-4" />
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="mt-6 flex w-full gap-1 overflow-x-auto rounded-full border border-border bg-surface p-1 sm:w-fit">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setType(tab.value)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              type === tab.value ? "bg-foreground text-background" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {isLoading && <p className="col-span-full py-10 text-center text-muted">Loading...</p>}
        {!isLoading && media.length === 0 && (
          <p className="col-span-full py-10 text-center text-muted">No media uploaded yet.</p>
        )}
        {media.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-xl border border-border bg-surface">
            <div className="flex aspect-square items-center justify-center bg-surface-2">
              {item.file_type === "image" ? (
                <img src={item.url} alt={item.alt_text ?? item.file_name} className="size-full object-cover" />
              ) : (
                <FileText className="size-8 text-subtle" />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-xs text-foreground">{item.file_name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-subtle">{formatBytes(item.size_bytes)}</p>
            </div>
            <button
              type="button"
              onClick={() => setPendingDelete(item)}
              className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-muted opacity-0 backdrop-blur transition-opacity hover:text-red-400 group-hover:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Delete "${pendingDelete?.file_name}"?`}
        description="This soft-deletes the file. Posts referencing it will keep the reference, but it won't resolve to an image anymore."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

export default AdminMediaPage;
