import { type RouteConfig, route, index, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/RootLayout.tsx", [
    index("pages/HomePage.tsx"),
    route("case-studies/:slug", "pages/CaseStudyDetailPage.tsx"),
    route("blog", "pages/blog/BlogListPage.tsx"),
    route("blog/:slug", "pages/blog/BlogPostPage.tsx"),
    route("*", "pages/NotFoundPage.tsx"),
  ]),

  layout("routes/AdminProviderLayout.tsx", [
    route("admin/login", "pages/admin/AdminLoginPage.tsx"),
    layout("components/admin/AdminAuthGuard.tsx", [
      route("admin", "layouts/AdminLayout.tsx", [
        index("routes/AdminIndexRedirect.tsx"),
        route("posts", "pages/admin/AdminPostsListPage.tsx"),
        route("posts/new", "pages/admin/AdminPostEditorPage.tsx", { id: "admin-post-new" }),
        route("posts/:id/edit", "pages/admin/AdminPostEditorPage.tsx", { id: "admin-post-edit" }),
        route("categories", "pages/admin/AdminCategoriesPage.tsx"),
        route("comments", "pages/admin/AdminCommentsPage.tsx"),
        route("leads", "pages/admin/AdminLeadsPage.tsx"),
        route("media", "pages/admin/AdminMediaPage.tsx"),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
