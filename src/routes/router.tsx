import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { HomePage } from "@/pages/HomePage";
import { CaseStudyDetailPage } from "@/pages/CaseStudyDetailPage";
import { BlogListPage } from "@/pages/blog/BlogListPage";
import { BlogPostPage } from "@/pages/blog/BlogPostPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminPostsListPage } from "@/pages/admin/AdminPostsListPage";
import { AdminPostEditorPage } from "@/pages/admin/AdminPostEditorPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminCommentsPage } from "@/pages/admin/AdminCommentsPage";
import { AdminMediaPage } from "@/pages/admin/AdminMediaPage";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/case-studies/:slug", element: <CaseStudyDetailPage /> },
      { path: "/blog", element: <BlogListPage /> },
      { path: "/blog/:slug", element: <BlogPostPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    element: (
      <AdminAuthProvider>
        <Outlet />
      </AdminAuthProvider>
    ),
    children: [
      { path: "/admin/login", element: <AdminLoginPage /> },
      {
        element: <AdminAuthGuard />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/posts" replace /> },
              { path: "posts", element: <AdminPostsListPage /> },
              { path: "posts/new", element: <AdminPostEditorPage /> },
              { path: "posts/:id/edit", element: <AdminPostEditorPage /> },
              { path: "categories", element: <AdminCategoriesPage /> },
              { path: "comments", element: <AdminCommentsPage /> },
              { path: "media", element: <AdminMediaPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
