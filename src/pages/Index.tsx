import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import SectionSkeleton from "@/components/SectionSkeleton";

// Lazy load portfolio sections for better performance
const About = lazy(() => import("@/components/About"));
const Projects = lazy(() => import("@/components/Projects"));
const Experience = lazy(() => import("@/components/Experience"));
const Education = lazy(() => import("@/components/Education"));
const Skills = lazy(() => import("@/components/Skills"));
const Certifications = lazy(() => import("@/components/Certifications"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <>
    <Navigation />
    <main className="portfolio-stage">
      <Hero />

      <div className="portfolio-grid">
        <div className="stage-card stage-about">
          <Suspense fallback={<SectionSkeleton />}>
            <About />
          </Suspense>
        </div>
        <div className="stage-card stage-projects">
          <Suspense fallback={<SectionSkeleton />}>
            <Projects />
          </Suspense>
        </div>
        <div className="stage-card stage-experience">
          <Suspense fallback={<SectionSkeleton />}>
            <Experience />
          </Suspense>
        </div>
        <div className="stage-card stage-education">
          <Suspense fallback={<SectionSkeleton />}>
            <Education />
          </Suspense>
        </div>
        <div className="stage-card stage-skills">
          <Suspense fallback={<SectionSkeleton />}>
            <Skills />
          </Suspense>
        </div>
        <div className="stage-card stage-certifications">
          <Suspense fallback={<SectionSkeleton />}>
            <Certifications />
          </Suspense>
        </div>
        <div className="stage-card stage-contact">
          <Suspense fallback={<SectionSkeleton />}>
            <Contact />
          </Suspense>
        </div>
      </div>
    </main>
    <Suspense fallback={null}>
      <Footer />
    </Suspense>
  </>
);

export default Index;
