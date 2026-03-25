import { Linkedin, Mail, Github } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-8 px-6 text-center">
    <div className="flex items-center justify-center gap-5 mb-4">
      <a href="mailto:drashti10125@gmail.com" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Email">
        <Mail size={18} />
      </a>
      <a href="https://www.linkedin.com/in/drashti-chaudhari-a27570351" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
        <Linkedin size={18} />
      </a>
    </div>
    <p className="text-muted-foreground text-xs font-mono">
      Designed & Built by Drashti Chaudhari
    </p>
    <p className="text-muted-foreground/50 text-xs mt-1">© {new Date().getFullYear()}</p>
  </footer>
);

export default Footer;
