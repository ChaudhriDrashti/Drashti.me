import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const About = () => {
  const { get } = useSiteSettings();
  const p1 = get(
    "about_paragraph_1",
    "Detail-oriented Aeronautical Engineering student at Parul University with hands-on experience in structural analysis, ANSYS, and CAD modelling. Strong analytical mindset with exposure to IoT systems, sensors, and modern engineering tools.",
  );
  const p2 = get(
    "about_paragraph_2",
    "Passionate about aircraft structures, propulsion systems, and simulation-driven engineering. Proficient in applying engineering principles to solve complex problems related to flight mechanics, structural analysis, and material selection.",
  );
  const p3 = get(
    "about_paragraph_3",
    "Experienced with CAD tools like CATIA, SolidWorks, and simulation software such as MATLAB and ANSYS. Seeking opportunities to contribute technical knowledge and enthusiasm for aviation to challenging projects in the aerospace industry.",
  );
  const resumeUrl = get("resume_url", "/Resume_Drashti.pdf");
  const profileImage = get("profile_image_url", "");

  return (
  <section id="about" className="section-padding max-w-5xl mx-auto">
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      <SectionHeading number="01" title="About Me" />

      <div className="grid md:grid-cols-3 gap-8 md:gap-10 items-start">
        <div className="md:col-span-2 space-y-4 text-muted-foreground leading-relaxed">
          <p>{p1}</p>
          <p>{p2}</p>
          <p>{p3}</p>

          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/10 transition-colors"
          >
            Download Resume ↓
          </a>
        </div>

        <div className="flex items-start justify-center md:justify-end">
          <div className="relative group w-full max-w-[220px] sm:max-w-[260px] md:max-w-[280px]">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full aspect-square rounded-lg object-cover border-2 border-primary/30"
              />
            ) : (
              <div className="w-full aspect-square rounded-lg bg-secondary border-2 border-primary/30 flex items-center justify-center text-5xl sm:text-6xl font-bold text-primary/40 font-mono">
                DC
              </div>
            )}
            <div className="absolute -inset-1 rounded-lg border border-primary/20 -z-10 translate-x-2 translate-y-2 sm:translate-x-3 sm:translate-y-3 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);
};

export default About;
