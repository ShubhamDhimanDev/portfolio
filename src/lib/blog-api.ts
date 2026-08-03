import { api } from "@/lib/api-client";
import type {
  ApiDetailResponse,
  ApiListResponse,
  BlogBlock,
  BlogCategory,
  BlogPost,
  BlogPostSummary,
  CommentSubmitPayload,
} from "@/types/blog.types";

export interface FetchBlogPostsParams {
  page?: number;
  perPage?: number;
  category?: string;
  signal?: AbortSignal;
}

export function fetchBlogPosts({
  page = 1,
  perPage = 9,
  category,
  signal,
}: FetchBlogPostsParams = {}) {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (category) params.set("category", category);

  return api.get<ApiListResponse<BlogPostSummary>>(`/blog-posts?${params.toString()}`, { signal });
}

export function fetchBlogPost(slug: string, signal?: AbortSignal) {
  return api.get<ApiDetailResponse<BlogPost>>(`/blog-posts/${encodeURIComponent(slug)}`, { signal });
}

export function fetchBlogCategories(signal?: AbortSignal) {
  return api.get<ApiListResponse<BlogCategory>>("/categories", { signal });
}

export function submitBlogComment(slug: string, payload: CommentSubmitPayload) {
  return api.post<{ ok: true; message: string }>(
    `/blog-posts/${encodeURIComponent(slug)}/comments`,
    payload,
  );
}

/** MySQL DATETIME ("YYYY-MM-DD HH:MM:SS") isn't ISO 8601 - normalize before parsing. */
export function parseApiDate(value: string): Date {
  return new Date(value.includes("T") ? value : value.replace(" ", "T"));
}

export function formatBlogDate(value: string): string {
  return parseApiDate(value).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ");
}

function extractBlockText(block: BlogBlock): string {
  switch (block.block_type) {
    case "heading":
      return block.block_data.text;
    case "paragraph":
    case "div":
    case "html":
      return stripHtml(block.block_data.html);
    case "quote":
      return block.block_data.text;
    case "list":
      return block.block_data.items.map(stripHtml).join(" ");
    default:
      return "";
  }
}

export function estimateReadingMinutes(blocks: BlogBlock[]): number {
  const wordCount = blocks.reduce((count, block) => {
    const text = extractBlockText(block).trim();
    return count + (text === "" ? 0 : text.split(/\s+/).length);
  }, 0);
  return Math.max(1, Math.round(wordCount / 200));
}
