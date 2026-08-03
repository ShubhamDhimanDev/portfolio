import { useRef } from "react";
import { Bold, Italic, Link as LinkIcon } from "lucide-react";

interface InlineHtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
  mono?: boolean;
}

export function InlineHtmlEditor({ value, onChange, rows = 3, placeholder, mono }: InlineHtmlEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function wrapSelection(before: string, after: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selectionStart + before.length, selectionEnd + before.length);
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1">
        <button
          type="button"
          onClick={() => wrapSelection("<strong>", "</strong>")}
          className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection("<em>", "</em>")}
          className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => wrapSelection('<a href="https://">', "</a>")}
          className="flex size-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <LinkIcon className="size-3.5" />
        </button>
      </div>
      <textarea
        ref={ref}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
