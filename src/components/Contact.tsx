import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Send } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
      status: "unread",
    });
    setSending(false);
    if (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message sent!", description: "Thank you for reaching out. I'll get back to you soon." });
      setForm({ name: "", email: "", message: "" });
    }
  };

  return (
    <section id="contact" className="section-padding max-w-3xl mx-auto text-center">
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <SectionHeading number="07" title="Get In Touch" />

        <p className="text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
          I'm currently looking for internship and collaboration opportunities in the aerospace
          industry. Whether you have a question, a project idea, or just want to say hello —
          my inbox is always open.
        </p>

        <form onSubmit={handleSubmit} className="card-gradient border border-border rounded-lg p-6 md:p-8 text-left space-y-5 mb-10">
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block text-foreground text-sm font-medium mb-1.5">Name</label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-foreground text-sm font-medium mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="message" className="block text-foreground text-sm font-medium mb-1.5">Message</label>
            <textarea
              id="message"
              required
              maxLength={1000}
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-secondary border border-border rounded px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary/10 border border-primary text-primary font-mono text-sm rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-muted-foreground">
          <a href="mailto:drashti10125@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors text-sm break-all text-center" aria-label="Email">
            <Mail size={18} /> drashti10125@gmail.com
          </a>
          <a href="https://www.linkedin.com/in/drashti-chaudhari-a27570351" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" aria-label="LinkedIn">
            <Linkedin size={20} />
          </a>
        </div>
      </motion.div>
    </section>
  );
};

export default Contact;
