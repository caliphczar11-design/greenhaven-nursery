"use client";

import { useState, useEffect } from "react";
import { Leaf, MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface SocialLink { platform: string; url: string; enabled: boolean }
interface FooterLink { label: string; url: string }

const allowedPlatforms = ["facebook", "instagram", "tiktok", "whatsapp"];

function SocialIcon({ platform }: { platform: string }) {
  const size = 18;
  switch (platform) {
    case "facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    default:
      return null;
  }
}

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

  const enabledSocials = socialLinks.filter(s => s.enabled && s.url && allowedPlatforms.includes(s.platform));
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
                    className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/25 flex items-center justify-center transition-colors"
                    title={s.platform}>
                    <SocialIcon platform={s.platform} />
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
