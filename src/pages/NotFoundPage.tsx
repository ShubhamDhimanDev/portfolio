import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="flex min-h-[70vh] items-center py-32">
      <Container>
        <Reveal className="max-w-lg">
          <p className="font-mono text-sm text-accent-soft">404</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            This page wandered off.
          </h1>
          <p className="mt-4 text-balance leading-relaxed text-muted">
            The page you're looking for doesn't exist or may have moved.
          </p>
          <div className="mt-8">
            <Button
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
              }}
              icon={ArrowLeft}
              iconPosition="left"
            >
              Back home
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
