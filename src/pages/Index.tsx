import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Skills from "@/components/Skills";
import Certifications from "@/components/Certifications";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => (
  <>
    <Navigation />
    <main className="portfolio-stage">
      <Hero />

      <div className="portfolio-grid">
        <div className="stage-card stage-about">
          <About />
        </div>
        <div className="stage-card stage-projects">
          <Projects />
        </div>
        <div className="stage-card stage-experience">
          <Experience />
        </div>
        <div className="stage-card stage-education">
          <Education />
        </div>
        <div className="stage-card stage-skills">
          <Skills />
        </div>
        <div className="stage-card stage-certifications">
          <Certifications />
        </div>
        <div className="stage-card stage-contact">
          <Contact />
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default Index;
