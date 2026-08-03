import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MediaPickerField } from "@/components/admin/MediaPickerField";
import { cn } from "@/lib/utils";
import type { AdminMedia, SeoFormFields } from "@/types/admin.types";

interface MediaPreview {
  id: number;
  url: string;
  file_type: AdminMedia["file_type"];
  file_name: string;
}

interface SeoFieldsEditorProps {
  seo: SeoFormFields;
  ogImage: MediaPreview | null;
  twitterImage: MediaPreview | null;
  onChangeField: (patch: Partial<SeoFormFields>) => void;
  onChangeOgImage: (media: AdminMedia | null) => void;
  onChangeTwitterImage: (media: AdminMedia | null) => void;
}

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none";
const labelClasses = "mb-1.5 block text-xs font-medium text-muted";

export function SeoFieldsEditor({
  seo,
  ogImage,
  twitterImage,
  onChangeField,
  onChangeOgImage,
  onChangeTwitterImage,
}: SeoFieldsEditorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <span className="text-sm font-medium text-foreground">SEO &amp; social preview</span>
        <ChevronDown className={cn("size-4 text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="flex flex-col gap-5 border-t border-border p-5">
          <div>
            <label className={labelClasses}>Meta title</label>
            <input
              type="text"
              value={seo.meta_title ?? ""}
              onChange={(e) => onChangeField({ meta_title: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>Meta description</label>
            <textarea
              rows={2}
              value={seo.meta_description ?? ""}
              onChange={(e) => onChangeField({ meta_description: e.target.value })}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>Canonical URL</label>
              <input
                type="url"
                value={seo.canonical_url ?? ""}
                onChange={(e) => onChangeField({ canonical_url: e.target.value })}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>Robots</label>
              <input
                type="text"
                placeholder="index, follow"
                value={seo.robots ?? ""}
                onChange={(e) => onChangeField({ robots: e.target.value })}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-subtle">Open Graph</p>
            <div className="flex flex-col gap-4">
              <MediaPickerField label="OG image" type="image" value={ogImage} onChange={onChangeOgImage} />
              <div>
                <label className={labelClasses}>OG title</label>
                <input
                  type="text"
                  value={seo.og_title ?? ""}
                  onChange={(e) => onChangeField({ og_title: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>OG description</label>
                <textarea
                  rows={2}
                  value={seo.og_description ?? ""}
                  onChange={(e) => onChangeField({ og_description: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-subtle">Twitter</p>
            <div className="flex flex-col gap-4">
              <MediaPickerField
                label="Twitter image"
                type="image"
                value={twitterImage}
                onChange={onChangeTwitterImage}
              />
              <div>
                <label className={labelClasses}>Twitter title</label>
                <input
                  type="text"
                  value={seo.twitter_title ?? ""}
                  onChange={(e) => onChangeField({ twitter_title: e.target.value })}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Twitter description</label>
                <textarea
                  rows={2}
                  value={seo.twitter_description ?? ""}
                  onChange={(e) => onChangeField({ twitter_description: e.target.value })}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <label className={labelClasses}>AI summary</label>
            <p className="mb-2 text-xs text-subtle">
              Used as the description for AI answer engines when no meta description is set.
            </p>
            <textarea
              rows={2}
              value={seo.ai_summary ?? ""}
              onChange={(e) => onChangeField({ ai_summary: e.target.value })}
              className={inputClasses}
            />
          </div>
        </div>
      )}
    </div>
  );
}
