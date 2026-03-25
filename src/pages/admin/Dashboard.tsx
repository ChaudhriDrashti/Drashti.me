import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { FolderOpen, Briefcase, MessageSquare, FileText, GraduationCap, Award } from "lucide-react";

const StatCard = ({ label, count, icon: Icon }: { label: string; count: number; icon: React.ElementType }) => (
  <div className="card-gradient border border-border rounded-xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-1">{count}</p>
      </div>
      <Icon className="h-8 w-8 text-primary/50" />
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ projects: 0, experience: 0, education: 0, certifications: 0, messages: 0, blog: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [p, e, ed, c, m, b] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("experience").select("id", { count: "exact", head: true }),
        supabase.from("education").select("id", { count: "exact", head: true }),
        supabase.from("certifications").select("id", { count: "exact", head: true }),
        supabase.from("contact_messages").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        projects: p.count ?? 0,
        experience: e.count ?? 0,
        education: ed.count ?? 0,
        certifications: c.count ?? 0,
        messages: m.count ?? 0,
        blog: b.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Projects" count={stats.projects} icon={FolderOpen} />
        <StatCard label="Experience" count={stats.experience} icon={Briefcase} />
        <StatCard label="Education" count={stats.education} icon={GraduationCap} />
        <StatCard label="Certifications" count={stats.certifications} icon={Award} />
        <StatCard label="Messages" count={stats.messages} icon={MessageSquare} />
        <StatCard label="Blog Posts" count={stats.blog} icon={FileText} />
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
