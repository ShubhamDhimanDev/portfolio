import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProjectPreview } from "@/components/sections/ProjectPreview";
import { fadeUp } from "@/lib/motion";
import { formatBlogDate } from "@/lib/blog-api";
import type { BlogPostSummary } from "@/types/blog.types";

export function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        to={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-colors duration-300 hover:border-border-strong"
      >
        <div className="p-3">
          {post.cover_media?.url ? (
            <div className="aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface-2">
              <img
                src={post.cover_media.url}
                alt={post.cover_media.alt_text ?? post.title}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <ProjectPreview label={`/blog/${post.slug}`} accent="signal" className="aspect-[16/10] min-h-0" />
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 pt-2">
          {post.categories.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {post.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="accent">
                  {category.name}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="text-balance text-lg font-semibold tracking-tight text-foreground">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          )}

          <div className="mt-auto flex items-center justify-between pt-6 font-mono text-xs text-subtle">
            <span>{formatBlogDate(post.published_at ?? post.created_at)}</span>
            <span className="flex items-center gap-1 text-muted transition-colors group-hover:text-foreground">
              Read
              <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
