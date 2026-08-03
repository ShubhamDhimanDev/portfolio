/**
 * Mirrors the JSON contract served by api/endpoints/blog-posts.php,
 * categories.php, and comments.php. Keep in sync with the PHP source -
 * there's no shared schema between the two layers.
 */

export interface MediaBrief {
  id: number;
  file_name: string;
  file_path: string;
  file_type: "image" | "video" | "document";
  mime_type: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  url: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlogPostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  author_name: string;
  created_at: string;
  published_at: string | null;
  cover_media: MediaBrief | null;
  categories: BlogCategory[];
}

export interface HeadingBlockData {
  level: number;
  text: string;
}

export interface ParagraphBlockData {
  html: string;
}

export interface DivBlockData {
  style: "default" | "muted" | "accent" | "bordered";
  html: string;
}

export interface QuoteBlockData {
  text: string;
  citation?: string;
}

export interface ImageBlockData {
  source: "media" | "url";
  alt: string;
  media_id?: number;
  url?: string;
  caption?: string;
  link?: string;
}

export interface VideoBlockData {
  source: "media" | "embed";
  media_id?: number;
  embed_url?: string;
  media_url?: string;
  caption?: string;
}

export interface ListBlockData {
  style: "ordered" | "unordered";
  items: string[];
}

export type DividerBlockData = Record<string, never>;

export interface LinkBlockData {
  href: string;
  label: string;
  style: "primary" | "secondary" | "text";
  open_in_new_tab: boolean;
}

export interface HtmlBlockData {
  html: string;
}

export type BlogBlock =
  | { id?: number; block_type: "heading"; block_data: HeadingBlockData; sort_order?: number }
  | { id?: number; block_type: "paragraph"; block_data: ParagraphBlockData; sort_order?: number }
  | { id?: number; block_type: "div"; block_data: DivBlockData; sort_order?: number }
  | { id?: number; block_type: "quote"; block_data: QuoteBlockData; sort_order?: number }
  | { id?: number; block_type: "image"; block_data: ImageBlockData; sort_order?: number }
  | { id?: number; block_type: "video"; block_data: VideoBlockData; sort_order?: number }
  | { id?: number; block_type: "list"; block_data: ListBlockData; sort_order?: number }
  | { id?: number; block_type: "divider"; block_data: DividerBlockData; sort_order?: number }
  | { id?: number; block_type: "link"; block_data: LinkBlockData; sort_order?: number }
  | { id?: number; block_type: "html"; block_data: HtmlBlockData; sort_order?: number };

export interface BlogFaq {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
}

export interface BlogComment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

export interface BlogSeo {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: MediaBrief | null;
  og_type: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: MediaBrief | null;
  ai_summary: string | null;
}

export interface BlogPost extends BlogPostSummary {
  status: "draft" | "published" | "archived";
  allow_comments: number;
  require_comment_approval: number;
  author_linkedin_url: string | null;
  updated_at: string;
  blocks: BlogBlock[];
  faqs: BlogFaq[];
  seo: BlogSeo | null;
  comments: BlogComment[];
}

export interface ApiListMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface ApiListResponse<T> {
  ok: true;
  message: string;
  data: T[];
  meta?: ApiListMeta;
}

export interface ApiDetailResponse<T> {
  ok: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  message: string;
}

export interface CommentSubmitPayload {
  author_name: string;
  author_email: string;
  content: string;
}
