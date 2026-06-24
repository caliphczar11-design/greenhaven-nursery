"use client";

import {
  Star,
  ShoppingCart,
  ThumbsUp,
  Thermometer,
  Mountain,
  Calendar,
  Sun,
  Droplets,
  FlaskConical,
  Ruler,
  Scissors,
  Sprout,
  Heart,
  Home,
  TreePine,
  Wind,
  Bug,
  ShieldCheck,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCartStore } from "@/store/cart-store";
import { motion } from "framer-motion";

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  imageUrl: string;
  category: { name: string; slug: string };
  climate: string;
  elevation: string;
  season: string;
  sunlight: string;
  waterNeed: string;
  soilType: string;
  soilPH?: string;
  temperature: string;
  humidity?: string;
  matureHeight?: string;
  spread?: string;
  bloomTime?: string;
  difficulty: string;
  nutrients: string;
  fertilizer?: string;
  pruning?: string;
  propagation?: string;
  companionPlants?: string;
  uses: string;
  medicinalUses?: string;
  edible: boolean;
  indoor: boolean;
  outdoor: boolean;
  fragrance: boolean;
  airPurifying: boolean;
  petSafe: boolean;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  tags?: string;
}

interface PlantDetailProps {
  plant: Plant | null;
  open: boolean;
  onClose: () => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function PlantDetail({ plant, open, onClose }: PlantDetailProps) {
  const { addItem } = useCartStore();

  if (!plant) return null;

  const discount = plant.originalPrice
    ? Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      plantId: plant.id,
      plantName: plant.name,
      plantPrice: plant.price,
      plantImage: plant.imageUrl,
      quantity: 1,
    });
  };

  const features = [
    plant.indoor && { icon: Home, label: "Indoor", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    plant.outdoor && { icon: TreePine, label: "Outdoor", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    plant.airPurifying && { icon: Wind, label: "Air Purifying", color: "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" },
    plant.fragrance && { icon: Wind, label: "Fragrant", color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    plant.edible && { icon: Sprout, label: "Edible", color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
    plant.petSafe ? { icon: ShieldCheck, label: "Pet Safe", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" } : { icon: AlertTriangle, label: "Not Pet Safe", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  ].filter(Boolean);

  const usesList = plant.uses.split(",").map(u => u.trim());
  const nutrientsList = plant.nutrients.split(",").map(n => n.trim());

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="relative">
            <img
              src={plant.imageUrl}
              alt={plant.name}
              className="w-full h-64 md:h-full object-cover"
            />
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 bg-gold text-gold-foreground text-sm font-bold border-0 px-3 py-1">
                -{discount}% OFF
              </Badge>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Content Side */}
          <div className="p-6 md:p-8 space-y-5">
            <DialogHeader className="space-y-2">
              <Badge variant="secondary" className="w-fit text-xs">
                {plant.category.name}
              </Badge>
              <DialogTitle className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl font-bold leading-tight">
                {plant.name}
              </DialogTitle>
              {plant.scientificName && (
                <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
              )}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-gold text-gold" />
                  <span className="font-semibold">{plant.rating}</span>
                  <span className="text-sm text-muted-foreground">({plant.reviewCount} reviews)</span>
                </div>
                <Badge variant="outline" className={`text-xs ${
                  plant.difficulty === "Easy" ? "border-green-300 text-green-700 dark:text-green-400" :
                  plant.difficulty === "Moderate" ? "border-yellow-300 text-yellow-700 dark:text-yellow-400" :
                  "border-red-300 text-red-700 dark:text-red-400"
                }`}>
                  {plant.difficulty}
                </Badge>
              </div>
            </DialogHeader>

            {/* Features */}
            <div className="flex flex-wrap gap-2">
              {features.map((f: any) => (
                <span key={f.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${f.color}`}>
                  <f.icon className="w-3 h-3" />
                  {f.label}
                </span>
              ))}
            </div>

            <Separator />

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{plant.description}</p>

            {/* Uses */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-primary" /> Uses
              </h4>
              <div className="flex flex-wrap gap-2">
                {usesList.map((use) => (
                  <Badge key={use} variant="secondary" className="rounded-full text-xs">{use}</Badge>
                ))}
              </div>
            </div>

            {/* Price & Cart */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-primary">
                    NPR {plant.price.toLocaleString()}/{plant.unit || 'pc'}
                  </span>
                  {plant.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      NPR {plant.originalPrice.toLocaleString()}/{plant.unit || 'pc'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {plant.inStock ? `In stock (${plant.stockCount || 'Available'})` : "Out of stock"}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!plant.inStock}
                className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Detailed Info Tabs */}
        <div className="border-t border-border">
          <Tabs defaultValue="growing" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto">
              <TabsTrigger
                value="growing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6 py-3 text-sm"
              >
                Growing Guide
              </TabsTrigger>
              <TabsTrigger
                value="nutrition"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6 py-3 text-sm"
              >
                Nutrition & Care
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6 py-3 text-sm"
              >
                All Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="growing" className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div>
                  <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-base mb-3">Environmental Requirements</h4>
                  <InfoRow icon={Thermometer} label="Climate" value={plant.climate} />
                  <InfoRow icon={Mountain} label="Elevation" value={plant.elevation} />
                  <InfoRow icon={Calendar} label="Season" value={plant.season} />
                  <InfoRow icon={Sun} label="Sunlight" value={plant.sunlight} />
                  <InfoRow icon={Droplets} label="Water Need" value={plant.waterNeed} />
                </div>
                <div className="sm:pl-8">
                  <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-base mb-3">Soil & Dimensions</h4>
                  <InfoRow icon={FlaskConical} label="Soil Type" value={plant.soilType} />
                  <InfoRow icon={FlaskConical} label="Soil pH" value={plant.soilPH} />
                  <InfoRow icon={Thermometer} label="Temperature Range" value={plant.temperature} />
                  <InfoRow icon={Droplets} label="Humidity" value={plant.humidity} />
                  <InfoRow icon={Ruler} label="Mature Height" value={plant.matureHeight} />
                  <InfoRow icon={Ruler} label="Spread" value={plant.spread} />
                  <InfoRow icon={Calendar} label="Bloom Time" value={plant.bloomTime} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-base mb-3 flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-primary" /> Required Nutrients
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {nutrientsList.map((n) => (
                      <Badge key={n} variant="outline" className="rounded-full text-sm py-1 px-3">{n}</Badge>
                    ))}
                  </div>
                </div>
                <InfoRow icon={FlaskConical} label="Fertilizer Schedule" value={plant.fertilizer} />
                <InfoRow icon={Scissors} label="Pruning" value={plant.pruning} />
                <InfoRow icon={Sprout} label="Propagation" value={plant.propagation} />
                {plant.companionPlants && (
                  <InfoRow icon={Bug} label="Companion Plants" value={plant.companionPlants} />
                )}
                {plant.medicinalUses && (
                  <div className="pt-2">
                    <InfoRow icon={Heart} label="Medicinal Uses" value={plant.medicinalUses} />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="p-6 md:p-8">
              <div className="grid sm:grid-cols-2 gap-x-8 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div>
                  <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-base mb-3">Plant Info</h4>
                  <InfoRow icon={Info} label="Name" value={`${plant.name} (${plant.scientificName || 'N/A'})`} />
                  <InfoRow icon={Info} label="Category" value={plant.category.name} />
                  <InfoRow icon={Thermometer} label="Climate" value={plant.climate} />
                  <InfoRow icon={Mountain} label="Elevation" value={plant.elevation} />
                  <InfoRow icon={Calendar} label="Season" value={plant.season} />
                  <InfoRow icon={Sun} label="Sunlight" value={plant.sunlight} />
                  <InfoRow icon={Droplets} label="Water Need" value={plant.waterNeed} />
                </div>
                <div className="sm:pl-8">
                  <h4 className="font-[family-name:var(--font-playfair)] font-semibold text-base mb-3">Growth Details</h4>
                  <InfoRow icon={Ruler} label="Mature Height" value={plant.matureHeight} />
                  <InfoRow icon={Ruler} label="Spread" value={plant.spread} />
                  <InfoRow icon={Calendar} label="Bloom Time" value={plant.bloomTime} />
                  <InfoRow icon={Thermometer} label="Temperature" value={plant.temperature} />
                  <InfoRow icon={Droplets} label="Humidity" value={plant.humidity} />
                  <InfoRow icon={FlaskConical} label="Soil" value={`${plant.soilType} (pH ${plant.soilPH || 'N/A'})`} />
                </div>
              </div>
              {plant.tags && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-sm font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {plant.tags.split(",").map(t => (
                      <Badge key={t.trim()} variant="secondary" className="rounded-full text-xs">{t.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}