"use client";

import { motion } from "framer-motion";
import { Flower2, Home, Leaf, Carrot, Apple, Sun, TreePine, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  plantCount: number;
}

const iconMap: Record<string, React.ElementType> = {
  Flower2, Home, Leaf, Carrot, Apple, Sun, TreePine, Heart,
};

interface CategorySectionProps {
  onCategorySelect: (slug: string | null) => void;
  activeCategory: string | null;
}

export default function CategorySection({ onCategorySelect, activeCategory }: CategorySectionProps) {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      return data.categories || [];
    },
  });

  if (categories.length === 0) return null;

  return (
    <section id="categories-section" className="py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-widest">Explore</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-2 mb-4">
            Shop by Category
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From fragrant flowers to air-purifying indoor plants — find the perfect green companion for every space.
          </p>
        </motion.div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Leaf;
            const isActive = activeCategory === cat.slug;
            return (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onCategorySelect(isActive ? null : cat.slug)}
                className={`group relative p-6 rounded-2xl border text-left transition-all duration-300 hover:-translate-y-1 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-card border-border/50 hover:border-primary/30 hover:shadow-md"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                  isActive
                    ? "bg-primary-foreground/20"
                    : "bg-primary/10 text-primary group-hover:bg-primary/20"
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? "text-primary-foreground" : ""}`} />
                </div>
                <h3 className={`font-semibold text-sm sm:text-base mb-1 ${isActive ? "text-primary-foreground" : ""}`}>
                  {cat.name}
                </h3>
                <p className={`text-xs ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {cat.plantCount} plants
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}