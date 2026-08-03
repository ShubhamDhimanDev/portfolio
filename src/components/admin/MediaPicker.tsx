import { useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileText, Upload, X } from "lucide-react";
import { useAdminMedia } from "@/hooks/useAdminMedia";
import { cn } from "@/lib/utils";
import type { AdminMedia } from "@/types/admin.types";

interface MediaPickerProps {
  open: boolean;
  type?: AdminMedia["file_type"];
  selectedId?: number | null;
  onSelect: (media: AdminMedia) => void;
  onClose: () => void;
}

export function MediaPicker({ open, type, selectedId, onSelect, onClose }: MediaPickerProps) {
  const { media, isLoading, isUploading, upload, error } = useAdminMedia(type);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLocalError(null);
    try {
      const uploaded = await upload(file);
      onSelect(uploaded);
    } catch {
      setLocalError("Upload failed.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl border border-border-strong bg-surface"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Select media</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 rounded-full border border-border-strong px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-accent-soft/50 disabled:opacity-50"
                >
                  <Upload className="size-3.5" />
                  {isUploading ? "Uploading..." : "Upload"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept={type === "image" ? "image/*" : type === "video" ? "video/*" : undefined}
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {(error || localError) && (
              <p className="px-6 pt-3 text-sm text-red-400">{error ?? localError}</p>
            )}

            <div className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-6 sm:grid-cols-4">
              {isLoading && <p className="col-span-full py-10 text-center text-muted">Loading...</p>}
              {!isLoading && media.length === 0 && (
                <p className="col-span-full py-10 text-center text-muted">No media yet - upload something.</p>
              )}
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-xl border bg-surface-2",
                    selectedId === item.id ? "border-accent-soft" : "border-border hover:border-border-strong",
                  )}
                >
                  {item.file_type === "image" ? (
                    <img src={item.url} alt={item.alt_text ?? item.file_name} className="size-full object-cover" />
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-2 text-subtle">
                      <FileText className="size-6" />
                      <span className="px-2 text-center text-[11px] leading-tight">{item.file_name}</span>
                    </div>
                  )}
                  {selectedId === item.id && (
                    <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-accent-soft text-background">
                      <Check className="size-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
