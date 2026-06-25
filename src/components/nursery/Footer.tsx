"use client";

import { useState, useEffect } from "react";
import { Leaf, MapPin, Phone, Mail, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SocialLink { platform: string; url: string; enabled: boolean }
interface FooterLink { label: string; url: string }

const platformIcons: Record<string, string> = {
  facebook: "f",
  instagram: "IG",
  twitter: "X",
  youtube: "YT",
  tiktok: "TT",
  whatsapp: "W",
};

export default function Footer({ onCategorySelect }: { onCategorySelect?: (slug: string | null) => void }) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [quickLinks, setQuickLinks] = useState<FooterLink[]>([]);
  const [customerLinks, setCustomerLinks] = useState<FooterLink[]>([]);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setSettings(data);
        try { setSocialLinks(JSON.parse(data.socialMedia || "[]")); } catch {}
        try { setQuickLinks(JSON.parse(data.footerQuickLinks || "[]")); } catch {}
        try { setCustomerLinks(JSON.parse(data.footerCustomerService || "[]")); } catch {}
      });
  }, []);

  const handleContactSubmit = async () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Message sent!");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        toast.error(data.error || "Failed to send");
      }
    } catch { toast.error("Network error"); }
    setSending(false);
  };

  const enabledSocials = socialLinks.filter(s => s.enabled && s.url);
  const desc = settings.footerDescription || "Nepal's premium online nursery. Handpicked plants delivered with care.";
  const address = settings.footerAddress || "Thamel, Kathmandu, Nepal";
  const phone = settings.footerPhone || "+977-9800000000";
  const email = settings.footerEmail || "hello@greenhaven.com.np";

  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 lg:py-16">
          {/* Brand + Social */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-lg font-bold">GreenHaven</span>
                <p className="text-[10px] tracking-widest uppercase text-primary-foreground/60">Nursery</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">{desc}</p>
            {enabledSocials.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {enabledSocials.map(s => (
                  <a key={s.platform} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors text-xs font-bold"
                    title={s.platform}>
                    {platformIcons[s.platform] || s.platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={() => onCategorySelect?.(null)} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2.5">
              {customerLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={() => onCategorySelect?.(null)} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors cursor-pointer">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary-foreground/60 shrink-0" />
                <p className="text-sm text-primary-foreground/70">{address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-foreground/60 shrink-0" />
                <a href={`tel:${phone}`} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{phone}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-foreground/60 shrink-0" />
                <a href={`mailto:${email}`} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{email}</a>
              </div>
            </div>
            <div className="space-y-2">
              <Input placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-8 text-xs" />
              <Input placeholder="Your email" value={contactForm.email} onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 h-8 text-xs" />
              <Textarea placeholder="Message..." value={contactForm.message} onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 text-xs min-h-[60px] resize-none" />
              <Button size="sm" onClick={handleContactSubmit} disabled={sending} className="w-full h-8 gap-1.5">
                {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Send Message
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-primary-foreground/50 mb-2">Payment Partners</p>
              <div className="flex gap-2">
                {["eSewa", "Khalti", "COD"].map(p => (
                  <span key={p} className="px-2.5 py-1 rounded-lg bg-primary-foreground/10 text-[10px] font-medium text-primary-foreground/80">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/10" />
        <div className="py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© {new Date().getFullYear()} GreenHaven Nursery. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = "/admin"} className="hover:text-primary-foreground/80 transition-colors">Admin</button>
            <p>🌿 Crafted for plant lovers across Nepal</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
