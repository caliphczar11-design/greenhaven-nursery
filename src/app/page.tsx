"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "@/store/cart-store";
import Navbar from "@/components/nursery/Navbar";
import HeroSection from "@/components/nursery/HeroSection";
import CategorySection from "@/components/nursery/CategorySection";
import PlantGrid from "@/components/nursery/PlantGrid";
import PlantDetail from "@/components/nursery/PlantDetail";
import AuthModal from "@/components/nursery/AuthModal";
import CartDrawer from "@/components/nursery/CartDrawer";
import CheckoutDialog from "@/components/nursery/CheckoutDialog";
import Footer from "@/components/nursery/Footer";

interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  shortDesc?: string;
  description: string;
  price: number;
  originalPrice?: number;
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
  stockCount: number;
  unit?: string;
  rating: number;
  reviewCount: number;
  tags?: string;
}

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const { setCartOpen, setCheckoutOpen: setStoreCheckoutOpen } = useCartStore();

  // Fetch plants
  const { data: plants = [], isLoading, refetch } = useQuery<Plant[]>({
    queryKey: ["plants", activeCategory, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);
      if (sortBy) params.set("sort", sortBy);
      const res = await fetch(`/api/plants?${params}`);
      const data = await res.json();
      return data.plants || [];
    },
  });

  // Fetch selected plant detail
  const { data: selectedPlant } = useQuery<Plant>({
    queryKey: ["plant", selectedPlantId],
    queryFn: async () => {
      const res = await fetch(`/api/plants/${selectedPlantId}`);
      const data = await res.json();
      return data.plant || null;
    },
    enabled: !!selectedPlantId,
  });

  // Fetch featured plants for hero count
  const { data: featuredCount = 0 } = useQuery({
    queryKey: ["featured-count"],
    queryFn: async () => {
      const res = await fetch("/api/plants?featured=true");
      const data = await res.json();
      return (data.plants || []).length;
    },
  });

  const handleCategorySelect = useCallback((slug: string | null) => {
    setActiveCategory(slug);
    setSearchQuery("");
    window.scrollTo({ top: slug ? document.getElementById('plant-grid-section')?.offsetTop || 600 : 0, behavior: 'smooth' });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setActiveCategory(null);
  }, []);

  const handlePlantSelect = useCallback((id: string) => {
    if (id === "") {
      setActiveCategory(null);
      return;
    }
    setSelectedPlantId(id);
  }, []);

  const handleShopNow = () => {
    window.scrollTo({ top: document.getElementById('plant-grid-section')?.offsetTop || 600, behavior: 'smooth' });
  };

  const handleOpenCheckout = () => {
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onCategorySelect={handleCategorySelect}
        activeCategory={activeCategory}
        onSignIn={() => setAuthModalOpen(true)}
      />

      <main className="flex-1">
        <HeroSection onShopNow={handleShopNow} />
        <CategorySection
          onCategorySelect={handleCategorySelect}
          activeCategory={activeCategory}
        />
        <div id="plant-grid-section">
          <PlantGrid
            plants={plants}
            loading={isLoading}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onPlantSelect={handlePlantSelect}
            activeCategory={activeCategory}
            searchQuery={searchQuery}
          />
        </div>

        {/* Trust Section */}
        <section className="py-16 bg-card border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">
                Why Choose GreenHaven?
              </h2>
              <p className="text-muted-foreground mt-2">We go beyond selling plants — we help them thrive.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  emoji: "🏔️",
                  title: "Climate Matched",
                  desc: "Every plant tagged with the right elevation, climate zone, and season for Nepal's diverse geography.",
                },
                {
                  emoji: "🧪",
                  title: "Nutrition Guidance",
                  desc: "Detailed nutrient requirements, fertilizer schedules, and soil pH recommendations for each plant.",
                },
                {
                  emoji: "📦",
                  title: "Safe Delivery",
                  desc: "Carefully packaged with moisture-retaining materials. Free delivery on orders above Npr 2,000.",
                },
                {
                  emoji: "💳",
                  title: "Easy Payments",
                  desc: "Pay with eSewa, Khalti, or cash on delivery. 100% secure and hassle-free checkout.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="text-center p-6 rounded-2xl bg-secondary/20 border border-border/30 hover:shadow-md transition-all"
                >
                  <span className="text-4xl block mb-3">{item.emoji}</span>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer onCategorySelect={setActiveCategory} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Drawers & Dialogs */}
      <CartDrawer onCheckout={handleOpenCheckout} />
      <CheckoutDialog open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
      <PlantDetail
        plant={selectedPlant || null}
        open={!!selectedPlantId}
        onClose={() => setSelectedPlantId(null)}
      />
    </div>
  );
}