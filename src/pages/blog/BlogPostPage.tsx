import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
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
import { estimateReadingMinutes, formatBlogDate } from "@/lib/blog-api";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { post, isLoading, error, notFound, refetch } = useBlogPost(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (notFound) return <NotFoundPage />;

  if (isLoading) {
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
