import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SectionHeading from "./SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  details: string[];
};

const FALLBACK_EXPERIENCES: ExperienceItem[] = [
  {
    company: "Bangalore Aircraft Industries Pvt. Ltd. (BAIL)",
    role: "Stress Engineer Intern",
    period: "April 2025 – May 2025",
    location: "Bengaluru, Karnataka, India",
    details: [
      "Executed comprehensive structural evaluations of aerospace components utilizing NASTRAN and PATRAN.",
      "Modeled and interpreted complex stress, strain, and deformation responses in aircraft structural elements.",
      "Performed multi-method stress analyses encompassing experimental techniques, classical Strength of Materials (SOM) formulations, and advanced Finite Element Analysis (FEA).",
      "Collaborated with senior engineers to validate analysis results against industry standards.",
    ],
  },
];

const Experience = () => {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(FALLBACK_EXPERIENCES);

  useEffect(() => {
    const loadExperience = async () => {
      const { data } = await supabase
        .from("experience")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      const rows = (data as Array<Record<string, unknown>> | null) ?? [];
      if (!rows.length) return;

      setExperiences(
        rows.map((row) => {
          const start = row.start_date ? String(row.start_date) : "";
          const end = row.end_date ? String(row.end_date) : "Present";
          const detailsRaw = String(row.details ?? "").trim();

          return {
            company: String(row.company ?? ""),
            role: String(row.role ?? ""),
            period: start ? `${start} - ${end}` : end,
            location: String(row.location ?? ""),
            details: detailsRaw ? detailsRaw.split("\n").map((d) => d.trim()).filter(Boolean) : [],
          };
        }),
      );
    };

    loadExperience();
  }, []);

  return (
    <section id="experience" className="section-padding max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="03" title="Experience" />

        <div className="relative border-l border-border pl-8 space-y-12">
          {experiences.map((exp, i) => (
          <motion.div
            key={exp.company}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative"
          >
            {/* Timeline dot */}
            <div className="absolute -left-[2.55rem] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary" />

            <p className="font-mono text-primary text-xs mb-1">{exp.period}</p>
            <h3 className="text-foreground text-lg font-semibold">
              {exp.role}{" "}
              <span className="text-primary">@ {exp.company}</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-3">{exp.location}</p>

            <ul className="space-y-2">
              {exp.details.map((d, j) => (
                <li key={j} className="flex gap-3 text-muted-foreground text-sm leading-relaxed">
                  <span className="text-primary mt-1.5 shrink-0">▹</span>
                  {d}
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

export default Experience;
