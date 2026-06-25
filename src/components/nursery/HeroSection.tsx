"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Truck, Shield, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onShopNow: () => void;
}

export default function HeroSection({ onShopNow }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-leaf-light/5 hero-pattern" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-leaf-light/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Premium Nursery — Nepal&apos;s Finest</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
              Bring Nature
              <br />
              <span className="gradient-text">Home</span> With
              <br />
              Every Plant
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Discover handpicked plants perfect for Nepal&apos;s diverse climate. 
              From vibrant flowers to healing herbs — grow with expert guidance.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={onShopNow}
                size="lg"
                className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-12 text-base border-primary/20 hover:bg-primary/5"
                onClick={() => {
                  document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Categories
              </Button>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:grid grid-cols-2 gap-4"
          >
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above Npr 2,000", color: "bg-primary/10 text-primary" },
              { icon: Shield, title: "Quality Assured", desc: "Healthy, pest-free plants", color: "bg-leaf-light/20 text-leaf" },
              { icon: Leaf, title: "Climate Matched", desc: "Curated for Nepali weather", color: "bg-gold/15 text-gold-foreground" },
              { icon: Sparkles, title: "Expert Guidance", desc: "Care tips with every plant", color: "bg-earth/10 text-earth" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-base mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}