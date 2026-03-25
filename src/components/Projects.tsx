import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type Project = {
  title: string;
  description: string;
  tools: string[];
  featured: boolean;
};

const FALLBACK_PROJECTS: Project[] = [
  {
    title: "Model Aircraft Project",
    description:
      "Designed an RC aircraft emphasizing aerodynamic stability, weight optimization, and material selection. Tested and simulated lift, drag, thrust, and performance characteristics using analytical and computational methods.",
    tools: ["CATIA V5", "ANSYS", "Aerodynamic Analysis", "Material Selection", "Wind Tunnel Testing"],
    featured: true,
  },
  {
    title: "Structural Analysis of Aerospace Components",
    description:
      "Performed comprehensive structural evaluations utilizing NASTRAN and PATRAN to model and interpret complex stress, strain, and deformation responses. Applied multi-method stress analyses encompassing experimental techniques, SOM formulations, and FEA.",
    tools: ["NASTRAN", "PATRAN", "FEA", "Stress Analysis", "SOM"],
    featured: true,
  },
  {
    title: "IoT Sensor Integration System",
    description:
      "Explored IoT architectures and sensor systems for aerospace monitoring applications. Applied Python programming for data acquisition and analysis from various sensor inputs.",
    tools: ["Python", "IoT", "Sensors", "Data Analysis"],
    featured: false,
  },
];

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  useEffect(() => {
    const loadProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      const rows = (data as Array<Record<string, unknown>> | null) ?? [];
      if (!rows.length) return;

      setProjects(
        rows.map((row) => ({
          title: String(row.title ?? "Untitled Project"),
          description: String(row.description ?? row.summary ?? ""),
          tools: Array.isArray(row.tools) ? (row.tools as string[]) : [],
          featured: Boolean(row.featured),
        })),
      );
    };

    loadProjects();
  }, []);

  return (
    <section id="projects" className="section-padding max-w-5xl mx-auto projects-compact">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="02" title="Projects" />

        <div className="lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start">
          <div className="space-y-8 md:space-y-6 lg:col-span-2">
            {featuredProjects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <article className="card-gradient rounded-xl border border-primary/20 p-5 md:p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4 gap-4">
                  <p className="font-mono text-primary text-xs">Featured Project</p>
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">{project.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4 projects-description">{project.description}</p>
                <ul className="flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
                  {project.tools.map((t) => (
                    <li key={t} className="rounded-md border border-border bg-background/30 px-2 py-1">
                      {t}
                    </li>
                  ))}
                </ul>
              </article>
            </motion.div>
          ))}
          </div>

          {otherProjects.length > 0 && (
            <aside className="mt-10 md:mt-8 lg:mt-0 lg:col-span-1">
              <div className="card-gradient rounded-xl border border-primary/20 p-4 md:p-5 shadow-lg">
                <h3 className="text-foreground font-semibold text-base md:text-lg mb-4">Other Noteworthy Projects</h3>
                <div className="space-y-3">
                  {otherProjects.map((project, i) => (
                    <article key={project.title} className="rounded-lg border border-border bg-background/20 p-3">
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <h4 className="text-foreground text-sm font-semibold leading-snug">{project.title}</h4>
                        <span className="font-mono text-[11px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed projects-other-description">{project.description}</p>
                      {!!project.tools.length && (
                        <p className="font-mono text-[11px] text-muted-foreground/90 mt-2 projects-other-tools">
                          {project.tools.slice(0, 3).join(" • ")}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default Projects;
