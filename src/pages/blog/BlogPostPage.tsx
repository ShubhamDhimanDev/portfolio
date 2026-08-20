import { useEffect } from "react";
import { useNavigate, useParams, useLoaderData } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/BrandIcons";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { GridBackground } from "@/components/ui/GridBackground";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { FaqAccordion } from "@/components/blog/FaqAccordion";
import { CommentList } from "@/components/blog/CommentList";
import { CommentForm } from "@/components/blog/CommentForm";
import { useBlogPost } from "@/hooks/useBlogPost";
import { baseTransition, fadeUp, staggerContainer } from "@/lib/motion";
import { estimateReadingMinutes, formatBlogDate, fetchBlogPost } from "@/lib/blog-api";
import { NotFoundPage } from "@/pages/NotFoundPage";
import type { Route } from "./+types/BlogPostPage";

const SITE_URL = "https://insanedev.in";

// clientLoader (not loader) because this route has a dynamic slug and is
// never in the prerendered path list - ssr:false forbids `loader` on routes
// that aren't statically prerendered. Runs client-side on both the hard load
// and the SPA transition into this route, so real browsers - not just the
// bot-only PHP renderer in api/render/blog-post.php - get the post's own SEO
// fields via meta() below.
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!params.slug) return { post: null };
  try {
    const res = await fetchBlogPost(params.slug);
    return { post: res.data };
  } catch {
    // Not-found or a transient failure both fall through to the component,
    // which already knows how to show a 404 / retry state.
    return { post: null };
  }
}

export function meta({ data }: Route.MetaArgs) {
  const post = data?.post;
  if (!post) {
    return [{ title: "Post not found - Shubham Dhiman" }, { name: "robots", content: "noindex, follow" }];
  }

  const seo = post.seo;
  const canonicalUrl = seo?.canonical_url || `${SITE_URL}/blog/${post.slug}`;
  const title = seo?.meta_title || `${post.title} - Shubham Dhiman`;
  const description = seo?.meta_description || seo?.ai_summary || post.excerpt || "";
  const ogDescription = seo?.og_description || description;
  const twitterDescription = seo?.twitter_description || description;
  const ogImageUrl = seo?.og_image?.url || post.cover_media?.url || null;
  const twitterImageUrl = seo?.twitter_image?.url || ogImageUrl;

  return [
    { title },
    description ? { name: "description", content: description } : null,
    { name: "robots", content: seo?.robots || "index, follow" },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:type", content: seo?.og_type || "article" },
    { property: "og:title", content: seo?.og_title || post.title },
    ogDescription ? { property: "og:description", content: ogDescription } : null,
    { property: "og:url", content: canonicalUrl },
    ogImageUrl ? { property: "og:image", content: SITE_URL + ogImageUrl } : null,
    { name: "twitter:card", content: seo?.twitter_card || "summary_large_image" },
    { name: "twitter:title", content: seo?.twitter_title || post.title },
    twitterDescription ? { name: "twitter:description", content: twitterDescription } : null,
    twitterImageUrl ? { name: "twitter:image", content: SITE_URL + twitterImageUrl } : null,
  ].filter((tag) => tag !== null);
}

function PostSkeleton() {
  return (
    <section className="py-28 pt-40 md:pt-48">
      <Container className="max-w-3xl">
        <div className="h-6 w-32 animate-pulse rounded-full bg-surface" />
        <div className="mt-8 h-12 w-full animate-pulse rounded-xl bg-surface" />
        <div className="mt-4 h-12 w-2/3 animate-pulse rounded-xl bg-surface" />
        <div className="mt-10 aspect-video w-full animate-pulse rounded-2xl bg-surface" />
      </Container>
    </section>
  );
}

// Shown on the initial hard load while the loader above is still in flight -
// this route isn't prerendered (dynamic slug), so without this the first
// paint would otherwise be blank until the fetch resolves.
export function HydrateFallback() {
  return <PostSkeleton />;
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post: preloadedPost } = useLoaderData<typeof clientLoader>();
  const { post, isLoading, error, notFound, refetch } = useBlogPost(slug, preloadedPost);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (notFound) return <NotFoundPage />;

  if (isLoading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <section className="flex min-h-[60vh] items-center py-28">
        <Container className="max-w-lg text-center">
          <p className="text-muted">{error ?? "Could not load this post."}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-6 rounded-full border border-border-strong px-5 py-2 text-sm text-foreground transition-colors hover:border-accent-soft/50"
          >
            Try again
          </button>
        </Container>
      </section>
    );
  }

  const readingMinutes = estimateReadingMinutes(post.blocks);
  const showComments = post.allow_comments === 1;

  return (
    <article>
      <section className="relative overflow-clip pb-12 pt-40 md:pt-48">
        <GridBackground className="opacity-[0.15]" />
        <Container className="max-w-3xl">
          <motion.div variants={staggerContainer(0.1)} initial="hidden" animate="visible">
            <motion.button
              variants={fadeUp}
              transition={baseTransition}
              onClick={() => navigate("/blog")}
              className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              All posts
            </motion.button>

            {post.categories.length > 0 && (
              <motion.div variants={fadeUp} transition={baseTransition} className="flex flex-wrap gap-2">
                {post.categories.map((category) => (
                  <Badge key={category.id} variant="accent">
                    {category.name}
                  </Badge>
                ))}
              </motion.div>
            )}

            <motion.h1
              variants={fadeUp}
              transition={baseTransition}
              className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              {post.title}
            </motion.h1>

            {post.excerpt && (
              <motion.p
                variants={fadeUp}
                transition={baseTransition}
                className="mt-5 text-balance text-lg leading-relaxed text-muted"
              >
                {post.excerpt}
              </motion.p>
            )}

            <motion.div
              variants={fadeUp}
              transition={baseTransition}
              className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-6 text-sm text-muted"
            >
              <span className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-surface-2 font-mono text-xs text-foreground">
                  {post.author_name.charAt(0).toUpperCase()}
                </span>
                {post.author_linkedin_url ? (
                  <a
                    href={post.author_linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-foreground hover:text-accent-soft"
                  >
                    {post.author_name}
                    <LinkedinIcon className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-foreground">{post.author_name}</span>
                )}
              </span>
              <span className="text-subtle">·</span>
              <span>{formatBlogDate(post.published_at ?? post.created_at)}</span>
              <span className="text-subtle">·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {readingMinutes} min read
              </span>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {post.cover_media?.url && (
        <Reveal immediate className="mb-4">
          <Container className="max-w-3xl">
            <img
              src={post.cover_media.url}
              alt={post.cover_media.alt_text ?? post.title}
              className="aspect-video w-full rounded-2xl border border-border object-cover"
            />
          </Container>
        </Reveal>
      )}

      <section className="py-12">
        <Container className="max-w-3xl">
          <Reveal immediate>
            <BlogContentRenderer blocks={post.blocks} />
          </Reveal>

          {post.faqs.length > 0 && (
            <Reveal className="mt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Frequently asked questions
              </h2>
              <FaqAccordion faqs={post.faqs} />
            </Reveal>
          )}

          {showComments && (
            <Reveal className="mt-16 border-t border-border pt-12">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                Comments {post.comments.length > 0 && `(${post.comments.length})`}
              </h2>
              <div className="mt-6">
                <CommentList comments={post.comments} />
              </div>
              <div className="mt-8">
                <CommentForm slug={post.slug} onSubmitted={refetch} />
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </article>
  );
}

export default BlogPostPage;
