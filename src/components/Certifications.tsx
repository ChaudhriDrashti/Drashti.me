import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { supabase } from "@/integrations/supabase/client";

type CertificationItem = { title: string; issuer: string; type: string };

const FALLBACK_CERTIFICATIONS: CertificationItem[] = [
  { title: "IoT – NPTEL (Elite)", issuer: "NPTEL", type: "technical" },
  { title: "Rocket Propulsion", issuer: "ISRO", type: "technical" },
  { title: "CATIA V5 Certification", issuer: "Professional", type: "technical" },
  { title: "Python Programming", issuer: "Online Certification", type: "software" },
  { title: "Robotics Internship", issuer: "Industry Program", type: "software" },
  { title: "Certified Industrial Internship", issuer: "BAIL, Bangalore", type: "technical" },
];

const ACHIEVEMENTS = [
  { title: "2nd Place – Aviation Fest Poster Presentation", description: "Recognized for outstanding technical poster presentation at aviation festival." },
];

const Certifications = () => {
  const [certifications, setCertifications] = useState<CertificationItem[]>(FALLBACK_CERTIFICATIONS);

  useEffect(() => {
    const loadCerts = async () => {
      const { data } = await supabase
        .from("certifications")
        .select("*")
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      const rows = (data as Array<Record<string, unknown>> | null) ?? [];
      if (!rows.length) return;

      setCertifications(
        rows.map((row) => ({
          title: String(row.title ?? ""),
          issuer: String(row.issuer ?? ""),
          type: "technical",
        })),
      );
    };

    loadCerts();
  }, []);

  return (
    <section id="certifications" className="section-padding max-w-4xl mx-auto certifications-compact">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="06" title="Certifications & Achievements" />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-7 certifications-grid">
          {certifications.map((cert, i) => (
          <motion.div
            key={cert.title}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-2.5 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
          >
            <BookOpen className="text-primary shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-foreground text-xs md:text-sm font-medium certifications-title">{cert.title}</h4>
              <p className="text-muted-foreground text-xs font-mono">{cert.issuer}</p>
            </div>
          </motion.div>
        ))}
        </div>

        <h3 className="text-foreground font-semibold text-base md:text-lg mb-4 flex items-center gap-2">
          <Award className="text-primary" size={20} />
          Achievements
        </h3>
        <div className="space-y-4">
          {ACHIEVEMENTS.map((a) => (
            <div key={a.title} className="card-gradient border border-border rounded-lg p-4">
              <h4 className="text-primary font-medium mb-1">{a.title}</h4>
              <p className="text-muted-foreground text-sm certifications-achievement">{a.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Certifications;
