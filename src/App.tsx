import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteSettingsProvider, useSiteSettings } from "@/contexts/SiteSettingsContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

// Lazy load admin pages to reduce initial bundle size
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProjectsAdmin = lazy(() => import("./pages/admin/ProjectsAdmin"));
const ExperienceAdmin = lazy(() => import("./pages/admin/ExperienceAdmin"));
const EducationAdmin = lazy(() => import("./pages/admin/EducationAdmin"));
const SkillsAdmin = lazy(() => import("./pages/admin/SkillsAdmin"));
const CertificationsAdmin = lazy(() => import("./pages/admin/CertificationsAdmin"));
const BlogAdmin = lazy(() => import("./pages/admin/BlogAdmin"));
const MessagesAdmin = lazy(() => import("./pages/admin/MessagesAdmin"));
const MediaAdmin = lazy(() => import("./pages/admin/MediaAdmin"));
const SettingsAdmin = lazy(() => import("./pages/admin/SettingsAdmin"));

const SiteThemeRuntime = () => {
  const { get } = useSiteSettings();

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--primary", get("theme_primary_hsl", "166 100% 70%"));
    root.style.setProperty("--background", get("theme_background_hsl", "222 47% 6%"));
    root.style.setProperty("--card", get("theme_card_hsl", "222 47% 9%"));
    root.style.setProperty("--radius", get("theme_radius", "0.5rem"));

    const cardStart = get("theme_card_gradient_start_hsl", "222 47% 10%");
    const cardEnd = get("theme_card_gradient_end_hsl", "222 47% 7%");
    root.style.setProperty("--gradient-card", `linear-gradient(145deg, hsl(${cardStart}), hsl(${cardEnd}))`);
  }, [get]);

  return null;
};

const App = () => (
  <TooltipProvider>
    <SiteSettingsProvider>
      <SiteThemeRuntime />
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin/projects" element={<ProtectedRoute><ProjectsAdmin /></ProtectedRoute>} />
              <Route path="/admin/experience" element={<ProtectedRoute><ExperienceAdmin /></ProtectedRoute>} />
              <Route path="/admin/education" element={<ProtectedRoute><EducationAdmin /></ProtectedRoute>} />
              <Route path="/admin/skills" element={<ProtectedRoute><SkillsAdmin /></ProtectedRoute>} />
              <Route path="/admin/certifications" element={<ProtectedRoute><CertificationsAdmin /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute><BlogAdmin /></ProtectedRoute>} />
              <Route path="/admin/messages" element={<ProtectedRoute><MessagesAdmin /></ProtectedRoute>} />
              <Route path="/admin/media" element={<ProtectedRoute><MediaAdmin /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><SettingsAdmin /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </SiteSettingsProvider>
  </TooltipProvider>
);

export default App;
