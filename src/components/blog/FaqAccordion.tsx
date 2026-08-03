import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogFaq } from "@/types/blog.types";

export function FaqAccordion({ faqs }: { faqs: BlogFaq[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col divide-y divide-border rounded-2xl border border-border">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="px-6">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-balance font-medium text-foreground">{faq.question}</span>
              <Plus
                className={cn(
                  "size-4 shrink-0 text-muted transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 leading-relaxed text-muted">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
