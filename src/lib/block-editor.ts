import type { BlogBlock } from "@/types/blog.types";

export interface EditableBlock {
  key: string;
  block_type: BlogBlock["block_type"];
  block_data: Record<string, unknown>;
}

export const BLOCK_TYPE_OPTIONS: { type: BlogBlock["block_type"]; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "div", label: "Div / Callout" },
  { type: "quote", label: "Quote" },
  { type: "image", label: "Image" },
  { type: "video", label: "Video" },
  { type: "list", label: "List" },
  { type: "divider", label: "Divider" },
  { type: "link", label: "Link button" },
  { type: "html", label: "Raw HTML" },
];

function defaultBlockData(type: BlogBlock["block_type"]): Record<string, unknown> {
  switch (type) {
    case "heading":
      return { level: 2, text: "" };
    case "paragraph":
      return { html: "" };
    case "div":
      return { style: "default", html: "" };
    case "quote":
      return { text: "", citation: "" };
    case "image":
      return { source: "media", alt: "", caption: "", link: "" };
    case "video":
      return { source: "embed", embed_url: "", caption: "" };
    case "list":
      return { style: "unordered", items: [""] };
    case "divider":
      return {};
    case "link":
      return { href: "", label: "", style: "primary", open_in_new_tab: false };
    case "html":
      return { html: "" };
    default:
      return {};
  }
}

export function createBlock(type: BlogBlock["block_type"]): EditableBlock {
  return { key: crypto.randomUUID(), block_type: type, block_data: defaultBlockData(type) };
}
