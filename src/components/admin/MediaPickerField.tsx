import { useState } from "react";
import { FileText, ImagePlus, X } from "lucide-react";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { AdminMedia } from "@/types/admin.types";

interface MediaPreview {
  id: number;
  url: string;
  file_type: AdminMedia["file_type"];
  file_name: string;
}

interface MediaPickerFieldProps {
  label: string;
  value: MediaPreview | null;
  type?: AdminMedia["file_type"];
  onChange: (media: AdminMedia | null) => void;
}

export function MediaPickerField({ label, value, type, onChange }: MediaPickerFieldProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border-strong bg-surface-2 text-subtle transition-colors hover:border-accent-soft/50"
        >
          {value ? (
            value.file_type === "image" ? (
              <img src={value.url} alt="" className="size-full object-cover" />
            ) : (
              <FileText className="size-6" />
            )
          ) : (
            <ImagePlus className="size-5" />
          )}
        </button>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="text-left text-sm text-foreground hover:text-accent-soft"
          >
            {value ? value.file_name : "Choose media"}
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="flex w-fit items-center gap-1 text-xs text-subtle hover:text-red-400"
            >
              <X className="size-3" />
              Remove
            </button>
          )}
        </div>
      </div>

      <MediaPicker
        open={pickerOpen}
        type={type}
        selectedId={value?.id}
        onSelect={(media) => {
          onChange(media);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
