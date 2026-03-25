import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, FolderOpen, Briefcase, GraduationCap,
  Wrench, Award, FileText, MessageSquare, Upload, Settings, LogOut, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Education", href: "/admin/education", icon: GraduationCap },
  { label: "Skills", href: "/admin/skills", icon: Wrench },
  { label: "Certifications", href: "/admin/certifications", icon: Award },
  { label: "Blog Posts", href: "/admin/blog", icon: FileText },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Media", href: "/admin/media", icon: Upload },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar-background flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link to="/" className="font-mono text-primary font-bold text-lg">DC<span className="text-muted-foreground">.</span> Admin</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Home className="h-4 w-4" />
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <p className="px-3 text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
