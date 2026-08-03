import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type {
  BlogBlock,
  DivBlockData,
  ImageBlockData,
  LinkBlockData,
  ListBlockData,
  QuoteBlockData,
  VideoBlockData,
} from "@/types/blog.types";

/**
 * Renders the post's block array to React. Mirrors render_blocks_html() in
 * api/render/blog-post.php block-for-block - that PHP renderer serves crawlers,
 * this one serves real browsers, and both read the same sanitized block_data.
 */
export function BlogContentRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="max-w-none">
      {blocks.map((block, index) => {
        const key = block.id ?? index;
        switch (block.block_type) {
          case "heading":
            return <HeadingBlock key={key} level={block.block_data.level} text={block.block_data.text} />;
          case "paragraph":
            return (
              <p
                key={key}
                className="mt-5 leading-relaxed text-muted [&_a]:text-accent-soft [&_a]:underline [&_a]:underline-offset-4 [&_strong]:font-semibold [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: block.block_data.html }}
              />
            );
          case "div":
            return <DivBlock key={key} {...block.block_data} />;
          case "quote":
            return <QuoteBlock key={key} {...block.block_data} />;
          case "image":
            return <ImageBlock key={key} {...block.block_data} />;
          case "video":
            return <VideoBlock key={key} {...block.block_data} />;
          case "list":
            return <ListBlock key={key} {...block.block_data} />;
          case "divider":
            return <hr key={key} className="my-10 border-border" />;
          case "link":
            return <LinkBlock key={key} {...block.block_data} />;
          case "html":
            return <div key={key} className="mt-6" dangerouslySetInnerHTML={{ __html: block.block_data.html }} />;
          default:
            return null;
        }
      })}
    </div>
  );
}

function HeadingBlock({ level, text }: { level: number; text: string }) {
  const clamped = Math.min(6, Math.max(1, level));
  const Tag = `h${clamped}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const sizeClasses: Record<number, string> = {
    1: "mt-12 mb-6 text-4xl sm:text-5xl",
    2: "mt-12 mb-5 text-3xl sm:text-4xl",
    3: "mt-10 mb-4 text-2xl",
    4: "mt-8 mb-3 text-xl",
    5: "mt-6 mb-3 text-lg",
    6: "mt-6 mb-2 text-base",
  };
  return (
    <Tag className={cn("text-balance font-semibold tracking-tight text-foreground", sizeClasses[clamped])}>
      {text}
    </Tag>
  );
}

function DivBlock({ style, html }: DivBlockData) {
  const styleClasses: Record<DivBlockData["style"], string> = {
    default: "",
    muted: "rounded-xl bg-surface p-5 text-muted",
    accent: "rounded-xl border border-accent-dim/60 bg-accent/[0.06] p-5",
    bordered: "rounded-xl border border-border p-5",
  };
  return (
    <div
      className={cn("mt-5 leading-relaxed text-muted", styleClasses[style])}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function QuoteBlock({ text, citation }: QuoteBlockData) {
  return (
    <blockquote className="mt-6 border-l-2 border-accent-soft/60 pl-5">
      <p className="text-balance text-xl leading-relaxed text-foreground/90">{text}</p>
      {citation && <cite className="mt-2 block font-mono text-sm not-italic text-subtle">- {citation}</cite>}
    </blockquote>
  );
}

function ImageBlock({ url, alt, caption, link }: ImageBlockData) {
  if (!url) return null;
  const img = <img src={url} alt={alt} loading="lazy" className="w-full rounded-xl border border-border" />;
  return (
    <figure className="mt-6">
      {link ? (
        <a href={link} target="_blank" rel="noreferrer">
          {img}
        </a>
      ) : (
        img
      )}
      {caption && <figcaption className="mt-2.5 text-center text-sm text-subtle">{caption}</figcaption>}
    </figure>
  );
}

function VideoBlock({ source, embed_url, media_url, caption }: VideoBlockData) {
  return (
    <figure className="mt-6">
      <div className="aspect-video overflow-hidden rounded-xl border border-border bg-surface">
        {source === "embed" && embed_url ? (
          <iframe
            src={embed_url}
            title={caption ?? "Embedded video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        ) : media_url ? (
          <video src={media_url} controls className="size-full" />
        ) : null}
      </div>
      {caption && <figcaption className="mt-2.5 text-center text-sm text-subtle">{caption}</figcaption>}
    </figure>
  );
}

function ListBlock({ style, items }: ListBlockData) {
  const Tag = style === "ordered" ? "ol" : "ul";
  return (
    <Tag
      className={cn(
        "mt-5 flex flex-col gap-2 pl-6 leading-relaxed text-muted",
        style === "ordered" ? "list-decimal" : "list-disc",
      )}
    >
      {items.map((item, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
      ))}
    </Tag>
  );
}

function LinkBlock({ href, label, style, open_in_new_tab }: LinkBlockData) {
  return (
    <div className="mt-6">
      <Button
        href={href}
        target={open_in_new_tab ? "_blank" : undefined}
        rel={open_in_new_tab ? "noreferrer" : undefined}
        variant={style === "text" ? "ghost" : style}
        icon={ArrowUpRight}
      >
        {label}
      </Button>
    </div>
  );
}
