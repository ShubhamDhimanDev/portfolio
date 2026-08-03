import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { BlogPostFormFaq } from "@/types/admin.types";

const inputClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none";

interface FaqEditorProps {
  faqs: BlogPostFormFaq[];
  onChange: (faqs: BlogPostFormFaq[]) => void;
}

export function FaqEditor({ faqs, onChange }: FaqEditorProps) {
  function update(index: number, patch: Partial<BlogPostFormFaq>) {
    onChange(faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)));
  }

  function add() {
    onChange([...faqs, { question: "", answer: "" }]);
  }

  function remove(index: number) {
    onChange(faqs.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      {faqs.length === 0 && (
        <p className="rounded-xl border border-dashed border-border-strong py-8 text-center text-sm text-subtle">
          No FAQs yet.
        </p>
      )}

      {faqs.map((faq, index) => (
        <div key={index} className="rounded-2xl border border-border bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-xs text-subtle">FAQ {index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => move(index, -1)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
              >
                <ChevronUp className="size-4" />
              </button>
              <button
                type="button"
                disabled={index === faqs.length - 1}
                onClick={() => move(index, 1)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={faq.question}
              onChange={(e) => update(index, { question: e.target.value })}
              placeholder="Question"
              className={inputClasses}
            />
            <textarea
              rows={3}
              value={faq.answer}
              onChange={(e) => update(index, { answer: e.target.value })}
              placeholder="Answer"
              className={inputClasses}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong py-4 text-sm text-muted transition-colors hover:border-accent-soft/50 hover:text-foreground"
      >
        <Plus className="size-4" />
        Add FAQ
      </button>
    </div>
  );
}
