import { api } from "@/lib/api-client";
import type { ApiDetailResponse, ApiListResponse, BlogCategory } from "@/types/blog.types";
import type {
  AdminBlogPostDetail,
  AdminBlogPostListItem,
  AdminCategory,
  AdminComment,
  AdminMedia,
  AdminUser,
  BlogPostFormPayload,
  BlogPostStatus,
  CommentStatus,
} from "@/types/admin.types";

interface AdminSessionData {
  admin: AdminUser;
  csrf_token: string;
}

// --- Auth --------------------------------------------------------------

export function adminLogin(email: string, password: string) {
  return api.post<ApiDetailResponse<AdminSessionData>>("/admin/login", { email, password });
}

export function adminLogout() {
  return api.post<{ ok: true; message: string }>("/admin/logout");
}

export function adminMe() {
  return api.get<{ ok: boolean; message: string; data: AdminSessionData | null }>("/admin/me");
}

// --- Posts ---------------------------------------------------------------

export interface AdminPostsListParams {
  status?: BlogPostStatus;
  category?: string;
  search?: string;
}

export function adminFetchPosts(params: AdminPostsListParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.category) query.set("category", params.category);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return api.get<ApiListResponse<AdminBlogPostListItem>>(`/admin/blog-posts${qs ? `?${qs}` : ""}`);
}

export function adminFetchPost(id: number) {
  return api.get<ApiDetailResponse<AdminBlogPostDetail>>(`/admin/blog-posts/${id}`);
}

export function adminCreatePost(payload: BlogPostFormPayload) {
  return api.post<ApiDetailResponse<AdminBlogPostDetail>>("/admin/blog-posts", payload);
}

export function adminUpdatePost(id: number, payload: BlogPostFormPayload) {
  return api.put<ApiDetailResponse<AdminBlogPostDetail>>(`/admin/blog-posts/${id}`, payload);
}

export function adminTogglePost(id: number) {
  return api.post<ApiDetailResponse<AdminBlogPostDetail>>(`/admin/blog-posts/${id}/toggle`);
}

export function adminArchivePost(id: number) {
  return api.post<ApiDetailResponse<AdminBlogPostDetail>>(`/admin/blog-posts/${id}/archive`);
}

export function adminDeletePost(id: number) {
  return api.delete<{ ok: true; message: string }>(`/admin/blog-posts/${id}`);
}

// --- Categories ------------------------------------------------------------

export function adminFetchCategories() {
  return api.get<ApiListResponse<AdminCategory>>("/admin/categories");
}

export interface CategoryFormPayload {
  name: string;
  slug?: string;
  description?: string;
}

export function adminCreateCategory(payload: CategoryFormPayload) {
  return api.post<ApiDetailResponse<BlogCategory>>("/admin/categories", payload);
}

export function adminUpdateCategory(id: number, payload: CategoryFormPayload) {
  return api.put<ApiDetailResponse<BlogCategory>>(`/admin/categories/${id}`, payload);
}

export function adminDeleteCategory(id: number) {
  return api.delete<{ ok: true; message: string }>(`/admin/categories/${id}`);
}

// --- Comments ------------------------------------------------------------

export interface AdminCommentsParams {
  status?: CommentStatus;
  postId?: number;
}

export function adminFetchComments(params: AdminCommentsParams = {}) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.postId) query.set("post_id", String(params.postId));
  const qs = query.toString();
  return api.get<ApiListResponse<AdminComment>>(`/admin/comments${qs ? `?${qs}` : ""}`);
}

export function adminApproveComment(id: number) {
  return api.post<{ ok: true; message: string }>(`/admin/comments/${id}/approve`);
}

export function adminRejectComment(id: number) {
  return api.post<{ ok: true; message: string }>(`/admin/comments/${id}/reject`);
}

export function adminDeleteComment(id: number) {
  return api.delete<{ ok: true; message: string }>(`/admin/comments/${id}`);
}

// --- Media ---------------------------------------------------------------

export function adminFetchMedia(type?: AdminMedia["file_type"]) {
  const qs = type ? `?type=${type}` : "";
  return api.get<ApiListResponse<AdminMedia>>(`/admin/media${qs}`);
}

export function adminUploadMedia(file: File, altText?: string) {
  const form = new FormData();
  form.append("file", file);
  if (altText) form.append("alt_text", altText);
  return api.post<ApiDetailResponse<AdminMedia>>("/admin/media/upload", form);
}

export function adminDeleteMedia(id: number) {
  return api.delete<{ ok: true; message: string }>(`/admin/media/${id}`);
}
