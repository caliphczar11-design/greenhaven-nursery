"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Grid3X3, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PlantCard from "./PlantCard";

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

interface PlantGridProps {
  plants: Plant[];
  loading: boolean;
  sortBy: string;
  onSortChange: (sort: string) => void;
  onPlantSelect: (id: string) => void;
  activeCategory: string | null;
  searchQuery: string;
}

const climates = ["All", "Tropical", "Subtropical", "Temperate", "Alpine"];
const difficulties = ["All", "Easy", "Moderate", "Hard"];
const sunlights = ["All", "Full Sun", "Partial Shade", "Full Shade"];

export default function PlantGrid({
  plants,
  loading,
  sortBy,
  onSortChange,
  onPlantSelect,
  activeCategory,
  searchQuery,
}: PlantGridProps) {
  const [filterClimate, setFilterClimate] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterSunlight, setFilterSunlight] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredPlants = plants.filter((p) => {
    if (filterClimate !== "All" && p.climate !== filterClimate) return false;
    if (filterDifficulty !== "All" && p.difficulty !== filterDifficulty) return false;
    if (filterSunlight !== "All" && !p.sunlight.startsWith(filterSunlight)) return false;
    return true;
  });

  const activeFilters = [
    filterClimate !== "All" ? filterClimate : null,
    filterDifficulty !== "All" ? filterDifficulty : null,
    filterSunlight !== "All" ? filterSunlight : null,
  ].filter(Boolean);

  const clearFilters = () => {
    setFilterClimate("All");
    setFilterDifficulty("All");
    setFilterSunlight("All");
  };

  const hasActiveFilters = activeFilters.length > 0 || activeCategory || searchQuery;

  return (
    <section className="py-16 sm:py-24 bg-secondary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
        >
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-widest">Collection</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">
              {searchQuery ? `Results for "${searchQuery}"` : activeCategory ? `${activeCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` : "All Plants"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredPlants.length} plant{filteredPlants.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-full gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-[10px]">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-40 rounded-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_asc">Price: Low-High</SelectItem>
                <SelectItem value="price_desc">Price: High-Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex flex-wrap items-center gap-2 mb-6"
          >
            {activeCategory && (
              <Badge variant="secondary" className="rounded-full gap-1">
                {activeCategory.replace(/-/g, ' ')}
                <button onClick={() => onPlantSelect("")} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="rounded-full gap-1">
                Search: {searchQuery}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            )}
            {activeFilters.map((f) => (
              <Badge key={f} variant="secondary" className="rounded-full gap-1">
                {f}
                <button onClick={clearFilters} className="ml-1 hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
              Clear all
            </Button>
          </motion.div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 p-4 rounded-2xl bg-card border border-border/50"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Climate</label>
                <div className="flex flex-wrap gap-2">
                  {climates.map((c) => (
                    <button
                      key={c}
                      onClick={() => setFilterClimate(c)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filterClimate === c
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilterDifficulty(d)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filterDifficulty === d
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Sunlight</label>
                <div className="flex flex-wrap gap-2">
                  {sunlights.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterSunlight(s)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        filterSunlight === s
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
                <div className="aspect-[4/3] bg-secondary animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-full" />
                  <div className="h-3 bg-secondary rounded animate-pulse w-1/2" />
                  <div className="h-6 bg-secondary rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Plant Grid */}
        {!loading && filteredPlants.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.map((plant, i) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                index={i}
                onSelect={onPlantSelect}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPlants.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No plants found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Try adjusting your filters or search query to discover more plants.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}