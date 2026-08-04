import { motion } from "framer-motion";
import { useLoaderData, useSearchParams } from "react-router";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GridBackground } from "@/components/ui/GridBackground";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogCategoryFilter } from "@/components/blog/BlogCategoryFilter";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { useBlogCategories } from "@/hooks/useBlogCategories";
import { staggerContainer, viewportOnce } from "@/lib/motion";
import { fetchBlogCategories, fetchBlogPosts } from "@/lib/blog-api";

export async function loader() {
  const [postsRes, categoriesRes] = await Promise.all([
    fetchBlogPosts({ page: 1, perPage: 9 }).catch(() => null),
    fetchBlogCategories().catch(() => null),
  ]);
  return {
    posts: postsRes?.data ?? [],
    meta: postsRes?.meta,
    categories: categoriesRes?.data ?? [],
  };
}

export function meta() {
  return [
    { title: "Blog - Shubham Dhiman" },
    {
      name: "description",
      content:
        "Architecture decisions, engineering trade-offs, and the occasional war story from building SaaS products in production.",
    },
  ];
}

export function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const category = searchParams.get("category");
  const preloaded = useLoaderData<typeof loader>();

  const { categories } = useBlogCategories(preloaded?.categories);
  const { posts, meta, isLoading, error } = useBlogPosts({
    page,
    perPage: 9,
    category: category ?? undefined,
    initialData: preloaded ? { posts: preloaded.posts, meta: preloaded.meta } : undefined,
  });

  function updateParams(next: { page?: number; category?: string | null }) {
    const params = new URLSearchParams(searchParams);
    if (next.category !== undefined) {
      if (next.category) params.set("category", next.category);
      else params.delete("category");
      params.delete("page");
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set("page", String(next.page));
      else params.delete("page");
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  return (
    <section className="relative overflow-clip py-28 pt-40 md:pt-48">
      <GridBackground className="opacity-[0.15]" />
      <Container>
        <SectionHeading
          eyebrow="Blog"
          title="Notes on building software that ships."
          description="Architecture decisions, engineering trade-offs, and the occasional war story from building SaaS products in production."
          className="mb-12"
        />

        <div className="mb-10">
          <BlogCategoryFilter
            categories={categories}
            active={category}
            onChange={(slug) => updateParams({ category: slug })}
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border border-border bg-surface" />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-muted">{error}</p>
          </div>
        )}

        {!isLoading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <p className="text-lg text-muted">No posts yet - check back soon.</p>
          </div>
        )}

        {!isLoading && !error && posts.length > 0 && (
          <>
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </motion.div>

            {meta && (
              <div className="mt-12">
                <BlogPagination meta={meta} onPageChange={(p) => updateParams({ page: p })} />
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

export default BlogListPage;
