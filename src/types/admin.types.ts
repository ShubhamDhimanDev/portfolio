import type { BlogBlock, BlogCategory, BlogFaq, MediaBrief } from "@/types/blog.types";

export interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  last_login_at: string | null;
}

export type BlogPostStatus = "draft" | "published" | "archived";

export interface AdminBlogPostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: BlogPostStatus;
  allow_comments: number;
  require_comment_approval: number;
  author_name: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  cover_media: MediaBrief | null;
  categories: BlogCategory[];
}

export interface SeoFields {
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  robots: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_media_id: number | null;
  og_image?: MediaBrief | null;
  og_type: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_media_id: number | null;
  twitter_image?: MediaBrief | null;
  ai_summary: string | null;
}

export interface AdminBlogPostDetail {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: BlogPostStatus;
  allow_comments: number;
  require_comment_approval: number;
  author_name: string;
  author_linkedin_url: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  cover_media: MediaBrief | null;
  blocks: BlogBlock[];
  faqs: BlogFaq[];
  categories: BlogCategory[];
  seo: SeoFields | null;
}

export interface BlogPostFormBlock {
  block_type: BlogBlock["block_type"];
  block_data: unknown;
  sort_order?: number;
}

export interface BlogPostFormFaq {
  question: string;
  answer: string;
  sort_order?: number;
}

export interface SeoFormFields {
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  robots?: string;
  og_title?: string;
  og_description?: string;
  og_image_media_id?: number | null;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_media_id?: number | null;
  ai_summary?: string;
}

export interface BlogPostFormPayload {
  title: string;
  slug?: string;
  excerpt?: string;
  cover_media_id?: number | null;
  status: BlogPostStatus;
  allow_comments: boolean;
  require_comment_approval: boolean;
  author_name: string;
  author_linkedin_url?: string;
  blocks: BlogPostFormBlock[];
  faqs: BlogPostFormFaq[];
  categories: number[];
  seo: SeoFormFields;
}

export interface AdminCategory extends BlogCategory {
  post_count: number;
}

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface AdminComment {
  id: number;
  blog_post_id: number;
  parent_comment_id: number | null;
  author_name: string;
  author_email: string;
  content: string;
  status: CommentStatus;
  ip_address: string | null;
  created_at: string;
  approved_at: string | null;
  post_title: string;
  post_slug: string;
}

export type LeadStatus = "new" | "contacted" | "archived";

export interface AdminLead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  source: string;
  status: LeadStatus;
  ip_address: string | null;
  created_at: string;
}

export interface AdminMedia {
  id: number;
  file_name: string;
  file_path: string;
  file_type: "image" | "video" | "document";
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  uploaded_by: number | null;
  created_at: string;
  url: string;
}
