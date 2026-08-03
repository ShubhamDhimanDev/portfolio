import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { InlineHtmlEditor } from "@/components/admin/InlineHtmlEditor";
import { MediaPickerField } from "@/components/admin/MediaPickerField";
import { cn } from "@/lib/utils";
import { BLOCK_TYPE_OPTIONS, createBlock, type EditableBlock } from "@/lib/block-editor";
import type { BlogBlock } from "@/types/blog.types";

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none";
const selectClasses = inputClasses + " appearance-none";
const pillClass = "rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors";
const activePillClass = "bg-foreground text-background";

interface BlockEditorProps {
  blocks: EditableBlock[];
  onChange: (blocks: EditableBlock[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  function addBlock(type: BlogBlock["block_type"]) {
    onChange([...blocks, createBlock(type)]);
    setAddMenuOpen(false);
  }

  function updateBlock(key: string, data: Record<string, unknown>) {
    onChange(blocks.map((b) => (b.key === key ? { ...b, block_data: data } : b)));
  }

  function removeBlock(key: string) {
    onChange(blocks.filter((b) => b.key !== key));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-strong py-8 text-center text-sm text-subtle">
          No content blocks yet.
        </p>
      )}

      {blocks.map((block, index) => (
        <div key={block.key} className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wide text-accent-soft">
              {block.block_type}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveBlock(index, -1)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === blocks.length - 1}
                onClick={() => moveBlock(index, 1)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.key)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                aria-label="Remove block"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <BlockFields block={block} onChange={(data) => updateBlock(block.key, data)} />
        </div>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setAddMenuOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong py-4 text-sm text-muted transition-colors hover:border-accent-soft/50 hover:text-foreground"
        >
          <Plus className="size-4" />
          Add block
        </button>
        {addMenuOpen && (
          <div className="absolute inset-x-0 top-full z-10 mt-2 grid grid-cols-2 gap-1 rounded-2xl border border-border-strong bg-surface p-2 shadow-xl sm:grid-cols-5">
            {BLOCK_TYPE_OPTIONS.map((bt) => (
              <button
                key={bt.type}
                type="button"
                onClick={() => addBlock(bt.type)}
                className="rounded-xl px-3 py-2 text-left text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
              >
                {bt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BlockFieldsProps {
  block: EditableBlock;
  onChange: (data: Record<string, unknown>) => void;
}

function BlockFields({ block, onChange }: BlockFieldsProps) {
  const d = block.block_data;
  const set = (patch: Record<string, unknown>) => onChange({ ...d, ...patch });

  switch (block.block_type) {
    case "heading":
      return (
        <div className="flex gap-3">
          <select
            value={(d.level as number) ?? 2}
            onChange={(e) => set({ level: Number(e.target.value) })}
            className={cn(selectClasses, "w-20")}
          >
            {[1, 2, 3, 4, 5, 6].map((l) => (
              <option key={l} value={l}>
                H{l}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={(d.text as string) ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Heading text"
            className={cn(inputClasses, "flex-1")}
          />
        </div>
      );

    case "paragraph":
      return (
        <InlineHtmlEditor
          value={(d.html as string) ?? ""}
          onChange={(html) => set({ html })}
          placeholder="Paragraph text..."
        />
      );

    case "div":
      return (
        <div className="flex flex-col gap-3">
          <select
            value={(d.style as string) ?? "default"}
            onChange={(e) => set({ style: e.target.value })}
            className={cn(selectClasses, "w-fit")}
          >
            <option value="default">Default</option>
            <option value="muted">Muted</option>
            <option value="accent">Accent</option>
            <option value="bordered">Bordered</option>
          </select>
          <InlineHtmlEditor value={(d.html as string) ?? ""} onChange={(html) => set({ html })} />
        </div>
      );

    case "quote":
      return (
        <div className="flex flex-col gap-3">
          <textarea
            rows={2}
            value={(d.text as string) ?? ""}
            onChange={(e) => set({ text: e.target.value })}
            placeholder="Quote text"
            className={inputClasses}
          />
          <input
            type="text"
            value={(d.citation as string) ?? ""}
            onChange={(e) => set({ citation: e.target.value })}
            placeholder="Citation (optional)"
            className={inputClasses}
          />
        </div>
      );

    case "image":
      return <ImageBlockFields data={d} onChange={set} />;

    case "video":
      return <VideoBlockFields data={d} onChange={set} />;

    case "list":
      return <ListBlockFields data={d} onChange={set} />;

    case "divider":
      return <p className="text-sm text-subtle">A horizontal rule - no settings.</p>;

    case "link":
      return (
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            value={(d.label as string) ?? ""}
            onChange={(e) => set({ label: e.target.value })}
            placeholder="Label"
            className={inputClasses}
          />
          <input
            type="url"
            value={(d.href as string) ?? ""}
            onChange={(e) => set({ href: e.target.value })}
            placeholder="https://..."
            className={inputClasses}
          />
          <select
            value={(d.style as string) ?? "primary"}
            onChange={(e) => set({ style: e.target.value })}
            className={selectClasses}
          >
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="text">Text</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={Boolean(d.open_in_new_tab)}
              onChange={(e) => set({ open_in_new_tab: e.target.checked })}
            />
            Open in new tab
          </label>
        </div>
      );

    case "html":
      return (
        <InlineHtmlEditor
          value={(d.html as string) ?? ""}
          onChange={(html) => set({ html })}
          rows={6}
          mono
          placeholder="<div>...</div>"
        />
      );

    default:
      return null;
  }
}

function ImageBlockFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const source = (data.source as string) ?? "media";
  const mediaPreview = data.media_id
    ? {
        id: data.media_id as number,
        url: (data.url as string) ?? "",
        file_type: "image" as const,
        file_name: "Selected image",
      }
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit gap-1 rounded-full border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => onChange({ source: "media" })}
          className={cn(pillClass, source === "media" && activePillClass)}
        >
          From library
        </button>
        <button
          type="button"
          onClick={() => onChange({ source: "url" })}
          className={cn(pillClass, source === "url" && activePillClass)}
        >
          External URL
        </button>
      </div>

      {source === "media" ? (
        <MediaPickerField
          label="Image"
          type="image"
          value={mediaPreview}
          onChange={(media) => onChange({ media_id: media?.id, url: media?.url })}
        />
      ) : (
        <input
          type="url"
          value={(data.url as string) ?? ""}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://..."
          className={inputClasses}
        />
      )}

      <input
        type="text"
        value={(data.alt as string) ?? ""}
        onChange={(e) => onChange({ alt: e.target.value })}
        placeholder="Alt text"
        className={inputClasses}
      />
      <input
        type="text"
        value={(data.caption as string) ?? ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Caption (optional)"
        className={inputClasses}
      />
      <input
        type="url"
        value={(data.link as string) ?? ""}
        onChange={(e) => onChange({ link: e.target.value })}
        placeholder="Link when clicked (optional)"
        className={inputClasses}
      />
    </div>
  );
}

function VideoBlockFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const source = (data.source as string) ?? "embed";
  const mediaPreview = data.media_id
    ? {
        id: data.media_id as number,
        url: (data.media_url as string) ?? "",
        file_type: "video" as const,
        file_name: "Selected video",
      }
    : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex w-fit gap-1 rounded-full border border-border bg-surface-2 p-1">
        <button
          type="button"
          onClick={() => onChange({ source: "embed" })}
          className={cn(pillClass, source === "embed" && activePillClass)}
        >
          Embed URL
        </button>
        <button
          type="button"
          onClick={() => onChange({ source: "media" })}
          className={cn(pillClass, source === "media" && activePillClass)}
        >
          From library
        </button>
      </div>

      {source === "embed" ? (
        <input
          type="url"
          value={(data.embed_url as string) ?? ""}
          onChange={(e) => onChange({ embed_url: e.target.value })}
          placeholder="https://www.youtube.com/embed/..."
          className={inputClasses}
        />
      ) : (
        <MediaPickerField
          label="Video"
          type="video"
          value={mediaPreview}
          onChange={(media) => onChange({ media_id: media?.id, media_url: media?.url })}
        />
      )}

      <input
        type="text"
        value={(data.caption as string) ?? ""}
        onChange={(e) => onChange({ caption: e.target.value })}
        placeholder="Caption (optional)"
        className={inputClasses}
      />
    </div>
  );
}

function ListBlockFields({
  data,
  onChange,
}: {
  data: Record<string, unknown>;
  onChange: (patch: Record<string, unknown>) => void;
}) {
  const style = (data.style as string) ?? "unordered";
  const items = (data.items as string[] | undefined) ?? [""];

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange({ items: next });
  }

  function addItem() {
    onChange({ items: [...items, ""] });
  }

  function removeItem(index: number) {
    onChange({ items: items.filter((_, i) => i !== index) });
  }

  return (
    <div className="flex flex-col gap-3">
      <select value={style} onChange={(e) => onChange({ style: e.target.value })} className={cn(selectClasses, "w-fit")}>
        <option value="unordered">Bulleted</option>
        <option value="ordered">Numbered</option>
      </select>
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder={`Item ${index + 1}`}
              className={cn(inputClasses, "flex-1")}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={items.length <= 1}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-red-400 disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem} className="w-fit text-sm text-accent-soft hover:underline">
        + Add item
      </button>
    </div>
  );
}
