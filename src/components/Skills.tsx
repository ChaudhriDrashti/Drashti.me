import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type SkillCategory = {
  category: string;
  skills: string[];
};

const FALLBACK_SKILL_CATEGORIES: SkillCategory[] = [
  {
    category: "Aerodynamics",
    skills: ["Airflow Analysis", "Lift & Drag", "Thrust Dynamics", "Wind Tunnel Testing"],
  },
  {
    category: "Propulsion Systems",
    skills: ["Jet Engines", "Turbines", "Rocket Propulsion", "Thermodynamics"],
  },
  {
    category: "Structural Analysis",
    skills: ["FEA", "Stress Analysis", "Strength of Materials", "Deformation Modeling"],
  },
  {
    category: "Software & CAD",
    skills: ["ANSYS", "CATIA V5", "AutoCAD", "SolidWorks", "NASTRAN", "PATRAN", "MATLAB"],
  },
  {
    category: "Materials Science",
    skills: ["Composites", "Alloys", "Ceramics", "Material Selection"],
  },
  {
    category: "Programming & IoT",
    skills: ["Python", "IoT Architecture", "Sensor Systems", "Data Analysis", "Robotics"],
  },
];

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(FALLBACK_SKILL_CATEGORIES);

  useEffect(() => {
    const loadSkills = async () => {
      const { data } = await supabase
        .from("skills")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      const rows = (data as Array<Record<string, unknown>> | null) ?? [];
      if (!rows.length) return;

      const grouped = new Map<string, string[]>();
      for (const row of rows) {
        const category = String(row.category ?? "General");
        const name = String(row.name ?? "").trim();
        if (!name) continue;
        if (!grouped.has(category)) grouped.set(category, []);
        grouped.get(category)?.push(name);
      }

      setSkillCategories(
        Array.from(grouped.entries()).map(([category, skills]) => ({
          category,
          skills,
        })),
      );
    };

    loadSkills();
  }, []);

  return (
    <section id="skills" className="section-padding max-w-6xl mx-auto skills-compact">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="05" title="Skills & Tools" />

        <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed skills-intro">
          Core engineering and software capabilities used for aerospace analysis, design workflows, and technical problem solving.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 skills-grid">
          {skillCategories.map((cat, i) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-gradient border border-border rounded-xl p-4 md:p-4 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 gap-3">
              <span className="font-mono text-[11px] tracking-wider text-primary">Category {String(i + 1).padStart(2, "0")}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{cat.skills.length} Skills</span>
            </div>

            <h3 className="text-foreground font-semibold text-base md:text-lg mb-3 leading-snug">{cat.category}</h3>

            <div className="h-px w-full bg-border mb-3" />

            <ul className="flex flex-wrap gap-2">
              {cat.skills.map((s) => (
                <li
                  key={s}
                  className="text-xs md:text-sm text-muted-foreground border border-border rounded-md px-2.5 py-1.5 bg-background/40"
                >
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Skills;
