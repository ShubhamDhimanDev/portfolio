import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./index.css";

const DEFAULT_TITLE = "Shubham Dhiman - Full Stack Developer";
const DEFAULT_DESCRIPTION =
  "Shubham Dhiman - Full Stack Developer building scalable SaaS products, AI-powered applications, and modern web experiences with Laravel, Next.js, and React.";

export function meta() {
  return [
    { title: DEFAULT_TITLE },
    { name: "description", content: DEFAULT_DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Shubham Dhiman" },
    { property: "og:title", content: DEFAULT_TITLE },
    { property: "og:description", content: DEFAULT_DESCRIPTION },
    { property: "og:url", content: "https://insanedev.in/" },
    { property: "og:image", content: "https://insanedev.in/og-image.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: DEFAULT_TITLE },
    { name: "twitter:description", content: DEFAULT_DESCRIPTION },
    { name: "twitter:image", content: "https://insanedev.in/og-image.png" },
  ];
}

export function links() {
  return [
    { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    { rel: "canonical", href: "https://insanedev.in/" },
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#08080a" />
        <Meta />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Shubham Dhiman",
              url: "https://insanedev.in",
              jobTitle: "Full-Stack Developer",
              email: "mailto:shubham@insanedev.in",
              sameAs: [
                "https://github.com/ShubhamDhimanDev",
                "https://www.linkedin.com/in/shubham-dhiman-dev",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Shubham Dhiman",
              url: "https://insanedev.in",
            }),
          }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
