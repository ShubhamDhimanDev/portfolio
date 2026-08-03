import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLenis } from "@/hooks/useLenis";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackgroundCanvas } from "@/components/layout/BackgroundCanvas";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { scrollToTarget } from "@/lib/lenis-instance";

export function RootLayout() {
  useLenis();
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const timeout = setTimeout(() => scrollToTarget(location.hash), 150);
      return () => clearTimeout(timeout);
    }
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  return (
    <div className="relative min-h-screen overflow-clip bg-background">
      <BackgroundCanvas />
      <CursorGlow />
      <Header />
      <main className="relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
