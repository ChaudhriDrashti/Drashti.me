import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Education", href: "#education" },
  { label: "Skills", href: "#skills" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

const Navigation = () => {
  const { get } = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const resumeUrl = get("resume_url", "/Resume_Drashti.pdf");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : ""
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <a href="#" className="font-mono text-primary font-bold text-lg tracking-tight">
            DC<span className="text-muted-foreground">.</span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item, i) => (
              <li key={item.href}>
                <button onClick={() => handleClick(item.href)} className="nav-link">
                  <span className="text-primary font-mono text-xs mr-1">0{i + 1}.</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 border border-border text-muted-foreground text-sm font-mono rounded hover:border-primary hover:text-primary transition-colors"
            >
              Admin Login
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-primary text-primary text-sm font-mono rounded hover:bg-primary/10 transition-colors"
            >
              Resume
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.href}
                onClick={() => handleClick(item.href)}
                className="text-foreground text-xl font-light"
              >
                <span className="text-primary font-mono text-sm mr-2">0{i + 1}.</span>
                {item.label}
              </button>
            ))}
            <a
              href="/login"
              className="mt-2 px-6 py-3 border border-border text-muted-foreground font-mono rounded hover:border-primary hover:text-primary transition-colors"
            >
              Admin Login
            </a>
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-6 py-3 border border-primary text-primary font-mono rounded hover:bg-primary/10 transition-colors"
            >
              Resume
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
