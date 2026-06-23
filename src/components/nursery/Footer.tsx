"use client";

import { Leaf, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12 lg:py-16">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-[family-name:var(--font-playfair)] text-lg font-bold">GreenHaven</span>
                <p className="text-[10px] tracking-widest uppercase text-primary-foreground/60">Nursery</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Nepal&apos;s premium online nursery. Handpicked plants matched to your climate, delivered with care to your doorstep.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2.5">
              {["All Plants", "Flowering Plants", "Indoor Plants", "Herbs & Spices", "Fruit Plants", "Medicinal Plants"].map((link) => (
                <li key={link}>
                  <button className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2.5">
              {["Shipping Policy", "Return Policy", "Privacy Policy", "FAQs", "Plant Care Guide", "Contact Us"].map((link) => (
                <li key={link}>
                  <button className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-foreground/60" />
                <p className="text-sm text-primary-foreground/70">Balaju, Kathmandu, Nepal</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-foreground/60" />
                <p className="text-sm text-primary-foreground/70">+977 98XXXXXXXX</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-foreground/60" />
                <p className="text-sm text-primary-foreground/70">hello@greenhaven.com.np</p>
              </div>
            </div>

            {/* Payment Partners */}
            <div className="mt-6">
              <p className="text-xs text-primary-foreground/50 mb-2">Payment Partners</p>
              <div className="flex gap-2">
                {["eSewa", "Khalti", "COD"].map((p) => (
                  <span key={p} className="px-3 py-1.5 rounded-lg bg-primary-foreground/10 text-xs font-medium text-primary-foreground/80">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/10" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>© 2025 GreenHaven Nursery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = "/admin"}
              className="hover:text-primary-foreground/80 transition-colors"
              title="Admin Dashboard"
            >
              ⚙️ Admin
            </button>
            <p>Crafted with 🌱 for plant lovers across Nepal</p>
          </div>
        </div>
      </div>
    </footer>
  );
}