import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Hero = () => {
  const { get } = useSiteSettings();
  const background = get("hero_bg_url", heroBg);
  const intro = get("hero_intro", "Hello, my name is");
  const name = get("hero_name", "Drashti Chaudhari.");
  const subtitle = get("hero_subtitle", "I engineer the future of flight.");
  const description = get(
    "hero_description",
    "Aeronautical Engineering student passionate about simulation-driven aircraft structures, propulsion systems, and advancing aerospace technologies through hands-on analysis and design.",
  );

  return (
  <section className="relative min-h-screen flex items-center overflow-hidden">
    {/* Background image */}
    <div className="absolute inset-0">
      <motion.img
        src={background}
        alt=""
        width={1920}
        height={1080}
        className="w-full h-full object-cover opacity-60"
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/45 to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,hsl(166_100%_70%/.18),transparent_55%)]" />
    </div>

    <div className="relative z-10 section-padding max-w-4xl mx-auto w-full">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-mono text-primary text-sm mb-5"
      >
        {intro}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-3xl sm:text-5xl md:text-7xl font-bold text-foreground mb-3"
      >
        {name}
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl sm:text-4xl md:text-6xl font-bold text-muted-foreground mb-8"
      >
        {subtitle}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="text-muted-foreground max-w-xl text-base sm:text-lg leading-relaxed mb-10"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-wrap gap-4"
      >
        <a
          href="#projects"
          onClick={(e) => { e.preventDefault(); document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" }); }}
          className="px-8 py-3 bg-primary/10 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/20 transition-colors"
        >
          View My Work
        </a>
        <a
          href="#contact"
          onClick={(e) => { e.preventDefault(); document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" }); }}
          className="px-8 py-3 border border-border text-muted-foreground font-mono text-sm rounded hover:border-primary hover:text-primary transition-colors"
        >
          Get In Touch
        </a>
      </motion.div>
    </div>
  </section>
);
};

export default Hero;
