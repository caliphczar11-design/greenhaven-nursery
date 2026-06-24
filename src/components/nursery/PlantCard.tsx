"use client";

import { Star, ShoppingCart, Eye, Leaf, Droplets, Sun, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/store/cart-store";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  category: { name: string; slug: string };
  climate: string;
  season: string;
  sunlight: string;
  difficulty: string;
  inStock: boolean;
  featured: boolean;
  unit?: string;
  rating: number;
  reviewCount: number;
  indoor: boolean;
  airPurifying: boolean;
  fragrance: boolean;
  edible: boolean;
}

interface PlantCardProps {
  plant: Plant;
  index: number;
  onSelect: (id: string) => void;
}

export default function PlantCard({ plant, index, onSelect }: PlantCardProps) {
  const { addItem, sessionId } = useCartStore();
  const discount = plant.originalPrice
    ? Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      plantId: plant.id,
      plantName: plant.name,
      plantPrice: plant.price,
      plantImage: plant.imageUrl,
      quantity: 1,
    });
  };

  const difficultyColor = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    Moderate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }[plant.difficulty] || "bg-secondary text-secondary-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.05, 0.3) }}
      className="cursor-pointer"
      onClick={() => onSelect(plant.id)}
    >
      <Card
        className="plant-card group overflow-hidden border-border/50 bg-card h-full flex flex-col py-0 gap-0"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-secondary/30">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {discount > 0 && (
              <Badge className="bg-gold text-gold-foreground text-xs font-semibold border-0">
                -{discount}%
              </Badge>
            )}
            {plant.featured && (
              <Badge className="bg-primary text-primary-foreground text-xs border-0">
                Featured
              </Badge>
            )}
            {!plant.inStock && (
              <Badge variant="destructive" className="text-xs border-0">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all pointer-events-none">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full shadow-lg bg-white/90 hover:bg-white dark:bg-black/70 dark:hover:bg-black/80 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(plant.id);
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground pointer-events-auto"
              onClick={handleAddToCart}
              disabled={!plant.inStock}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>

          {/* Feature Tags */}
          <div className="absolute bottom-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {plant.airPurifying && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-black/70 rounded-full text-[10px] font-medium">
                <Leaf className="w-3 h-3" /> Air Purify
              </span>
            )}
            {plant.edible && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-white/90 dark:bg-black/70 rounded-full text-[10px] font-medium">
                🌿 Edible
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{plant.category.name}</p>
              <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-base truncate mt-0.5">
                {plant.name}
              </h3>
              {plant.scientificName && (
                <p className="text-xs text-muted-foreground italic truncate">{plant.scientificName}</p>
              )}
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${difficultyColor}`}>
              {plant.difficulty}
            </span>
          </div>

          {plant.shortDesc && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {plant.shortDesc}
            </p>
          )}

          {/* Quick Info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3" /> {plant.climate}</span>
            <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> {plant.sunlight.split(' ')[0]}</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> {plant.waterNeed}</span>
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
            <div className="flex items-baseline gap-2">
              <span className="font-[family-name:var(--font-playfair)] text-xl font-bold text-primary">
                NPR {plant.price.toLocaleString()}/{plant.unit || 'pc'}
              </span>
              {plant.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  NPR {plant.originalPrice.toLocaleString()}/{plant.unit || 'pc'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-gold text-gold" />
              <span className="text-sm font-medium">{plant.rating}</span>
              <span className="text-xs text-muted-foreground">({plant.reviewCount})</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}