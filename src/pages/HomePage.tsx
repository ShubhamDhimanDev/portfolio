import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { FeaturedProjects } from "@/components/sections/FeaturedProjects";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Experience } from "@/components/sections/Experience";
import { Process } from "@/components/sections/Process";
import { Contact } from "@/components/sections/Contact";

export function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <TechStack />
      <FeaturedProjects />
      <CaseStudies />
      <Experience />
      <Process />
      <Contact />
    </>
  );
}

export default HomePage;
