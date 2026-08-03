import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MediaPickerField } from "@/components/admin/MediaPickerField";
import { CategoryMultiSelect } from "@/components/admin/CategoryMultiSelect";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { FaqEditor } from "@/components/admin/FaqEditor";
import { SeoFieldsEditor } from "@/components/admin/SeoFieldsEditor";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { adminCreatePost, adminFetchPost, adminUpdatePost } from "@/lib/admin-api";
import { ApiError } from "@/lib/api-client";
import type { EditableBlock } from "@/lib/block-editor";
import type {
  AdminMedia,
  BlogPostFormFaq,
  BlogPostFormPayload,
  BlogPostStatus,
  SeoFormFields,
} from "@/types/admin.types";

interface MediaPreview {
  id: number;
  url: string;
  file_type: AdminMedia["file_type"];
  file_name: string;
}

const EMPTY_SEO: SeoFormFields = {
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  robots: "",
  og_title: "",
  og_description: "",
  og_image_media_id: null,
  og_type: "",
  twitter_card: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image_media_id: null,
  ai_summary: "",
};

export function AdminPostEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== undefined;
  const navigate = useNavigate();
  const { categories } = useAdminCategories();

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverMedia, setCoverMedia] = useState<MediaPreview | null>(null);
  const [status, setStatus] = useState<BlogPostStatus>("draft");
  const [allowComments, setAllowComments] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorLinkedinUrl, setAuthorLinkedinUrl] = useState("");
  const [blocks, setBlocks] = useState<EditableBlock[]>([]);
  const [faqs, setFaqs] = useState<BlogPostFormFaq[]>([]);
  const [categoryIds, setCategoryIds] = useState<number[]>([]);
  const [seo, setSeo] = useState<SeoFormFields>(EMPTY_SEO);
  const [ogImage, setOgImage] = useState<MediaPreview | null>(null);
  const [twitterImage, setTwitterImage] = useState<MediaPreview | null>(null);

  useEffect(() => {
    if (!isEditing) return;
    const postId = Number(id);
    let active = true;

    const timeout = setTimeout(() => {
      setIsLoading(true);
      adminFetchPost(postId)
        .then((res) => {
          if (!active) return;
          const post = res.data;
          setTitle(post.title);
          setSlug(post.slug);
          setExcerpt(post.excerpt ?? "");
          setCoverMedia(post.cover_media ? { ...post.cover_media, file_name: post.cover_media.file_name } : null);
          setStatus(post.status);
          setAllowComments(post.allow_comments === 1);
          setRequireApproval(post.require_comment_approval === 1);
          setAuthorName(post.author_name);
          setAuthorLinkedinUrl(post.author_linkedin_url ?? "");
          setBlocks(
            post.blocks.map((b) => ({
              key: crypto.randomUUID(),
              block_type: b.block_type,
              block_data: b.block_data as Record<string, unknown>,
            })),
          );
          setFaqs(post.faqs.map((f) => ({ question: f.question, answer: f.answer, sort_order: f.sort_order })));
          setCategoryIds(post.categories.map((c) => c.id));
          if (post.seo) {
            setSeo({
              meta_title: post.seo.meta_title ?? "",
              meta_description: post.seo.meta_description ?? "",
              canonical_url: post.seo.canonical_url ?? "",
              robots: post.seo.robots ?? "",
              og_title: post.seo.og_title ?? "",
              og_description: post.seo.og_description ?? "",
              og_image_media_id: post.seo.og_image_media_id,
              og_type: post.seo.og_type ?? "",
              twitter_card: post.seo.twitter_card ?? "",
              twitter_title: post.seo.twitter_title ?? "",
              twitter_description: post.seo.twitter_description ?? "",
              twitter_image_media_id: post.seo.twitter_image_media_id,
              ai_summary: post.seo.ai_summary ?? "",
            });
            if (post.seo.og_image) {
              setOgImage({ ...post.seo.og_image, file_name: post.seo.og_image.file_name });
            }
            if (post.seo.twitter_image) {
              setTwitterImage({ ...post.seo.twitter_image, file_name: post.seo.twitter_image.file_name });
            }
          }
        })
        .catch((err: unknown) => {
          if (active) setError(err instanceof ApiError ? err.message : "Could not load post.");
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [id, isEditing]);

  function buildPayload(): BlogPostFormPayload {
    return {
      title,
      slug: slug || undefined,
      excerpt: excerpt || undefined,
      cover_media_id: coverMedia?.id ?? null,
      status,
      allow_comments: allowComments,
      require_comment_approval: requireApproval,
      author_name: authorName,
      author_linkedin_url: authorLinkedinUrl || undefined,
      blocks: blocks.map((b, index) => ({ block_type: b.block_type, block_data: b.block_data, sort_order: index })),
      faqs: faqs.map((f, index) => ({ ...f, sort_order: index })),
      categories: categoryIds,
      seo,
    };
  }

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = buildPayload();
      if (isEditing) {
        await adminUpdatePost(Number(id), payload);
        setSuccessMessage("Post updated.");
      } else {
        const res = await adminCreatePost(payload);
        navigate(`/admin/posts/${res.data.id}/edit`, { replace: true });
        setSuccessMessage("Post created.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save post.");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClasses =
    "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-subtle focus:border-accent-soft/60 focus:outline-none";
  const labelClasses = "mb-1.5 block text-xs font-medium text-muted";

  if (isLoading) {
    return <p className="text-muted">Loading...</p>;
  }

  return (
    <div className="pb-20">
      <button
        type="button"
        onClick={() => navigate("/admin/posts")}
        className="mb-6 flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All posts
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {isEditing ? "Edit post" : "New post"}
        </h1>
        <div className="flex items-center gap-3">
          {successMessage && <span className="text-sm text-signal">{successMessage}</span>}
          <Button onClick={handleSave} disabled={isSaving} icon={Save} iconPosition="left">
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-8">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated from title if left blank"
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>Excerpt</label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-medium text-foreground">Content</h2>
            <BlockEditor blocks={blocks} onChange={setBlocks} />
          </div>

          <div>
            <h2 className="mb-4 text-sm font-medium text-foreground">FAQs</h2>
            <FaqEditor faqs={faqs} onChange={setFaqs} />
          </div>

          <SeoFieldsEditor
            seo={seo}
            ogImage={ogImage}
            twitterImage={twitterImage}
            onChangeField={(patch) => setSeo((prev) => ({ ...prev, ...patch }))}
            onChangeOgImage={(media) => {
              setOgImage(media);
              setSeo((prev) => ({ ...prev, og_image_media_id: media?.id ?? null }));
            }}
            onChangeTwitterImage={(media) => {
              setTwitterImage(media);
              setSeo((prev) => ({ ...prev, twitter_image_media_id: media?.id ?? null }));
            }}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <label className={labelClasses}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as BlogPostStatus)}
              className={inputClasses}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <div className="mt-4 flex flex-col gap-2.5 border-t border-border pt-4">
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                />
                Allow comments
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={requireApproval}
                  onChange={(e) => setRequireApproval(e.target.checked)}
                  disabled={!allowComments}
                />
                Require approval before comments show
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <MediaPickerField label="Cover image" type="image" value={coverMedia} onChange={setCoverMedia} />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-medium text-foreground">Author</p>
            <div className="flex flex-col gap-3">
              <input
                required
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Author name"
                className={inputClasses}
              />
              <input
                type="url"
                value={authorLinkedinUrl}
                onChange={(e) => setAuthorLinkedinUrl(e.target.value)}
                placeholder="LinkedIn URL (optional)"
                className={inputClasses}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="mb-3 text-sm font-medium text-foreground">Categories</p>
            <CategoryMultiSelect categories={categories} selected={categoryIds} onChange={setCategoryIds} />
          </div>
        </div>
      </div>
    </div>
  );
}
