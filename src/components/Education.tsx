import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type EducationItem = {
  degree: string;
  institution: string;
  period: string;
  gpa: string;
  details: string;
};

const FALLBACK_EDUCATION: EducationItem[] = [
  {
    degree: "B.Tech in Aeronautical Engineering",
    institution: "Parul University, Vadodara",
    period: "2023 – 2027",
    gpa: "CGPA: 7.2",
    details: "Aeronautics/Aviation/Aerospace Science and Technology",
  },
  {
    degree: "SSC & HSC (GSEB)",
    institution: "Vidyamangal Residential School",
    period: "2021 – 2023",
    gpa: "",
    details: "Foundation in Science & Mathematics",
  },
];

const Education = () => {
  const [education, setEducation] = useState<EducationItem[]>(FALLBACK_EDUCATION);

  useEffect(() => {
    const loadEducation = async () => {
      const { data } = await supabase
        .from("education")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      const rows = (data as Array<Record<string, unknown>> | null) ?? [];
      if (!rows.length) return;

      setEducation(
        rows.map((row) => {
          const start = row.start_year ? String(row.start_year) : "";
          const end = row.end_year ? String(row.end_year) : "";
          return {
            degree: String(row.degree ?? ""),
            institution: String(row.institution ?? ""),
            period: start && end ? `${start} - ${end}` : start || end || "",
            gpa: String(row.gpa ?? ""),
            details: String(row.details ?? ""),
          };
        }),
      );
    };

    loadEducation();
  }, []);

  return (
    <section id="education" className="section-padding max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="04" title="Education" />

        <div className="grid md:grid-cols-2 gap-6">
          {education.map((edu, i) => (
          <motion.div
            key={edu.degree}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="card-gradient border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
          >
            <GraduationCap className="text-primary mb-4" size={24} />
            <h3 className="text-foreground font-semibold text-lg mb-1">{edu.degree}</h3>
            <p className="text-primary font-mono text-sm mb-1">{edu.institution}</p>
            <p className="text-muted-foreground text-sm mb-2">{edu.period}</p>
            {edu.gpa && <p className="text-primary/80 font-mono text-xs mb-2">{edu.gpa}</p>}
            <p className="text-muted-foreground text-sm">{edu.details}</p>
          </motion.div>
        ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Education;
