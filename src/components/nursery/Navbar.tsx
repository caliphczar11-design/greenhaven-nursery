"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Leaf,
  Menu,
  X,
  Sun,
  Moon,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { useCartStore } from "@/store/cart-store";

interface NavbarProps {
  onCategorySelect: (slug: string | null) => void;
  activeCategory: string | null;
  onSignIn?: () => void;
}

const navLinks = [
  { label: "Home", slug: null },
  { label: "Flowering", slug: "flowering-plants" },
  { label: "Indoor", slug: "indoor-plants" },
  { label: "Herbs", slug: "herbs-spices" },
  { label: "Vegetables", slug: "vegetables" },
  { label: "Fruit", slug: "fruit-plants" },
  { label: "Succulents", slug: "succulents-cacti" },
  { label: "Trees", slug: "trees-shrubs" },
  { label: "Medicinal", slug: "medicinal-plants" },
  { label: "Fertilizers", slug: "fertilizers-nutrients" },
  { label: "Pots & Tools", slug: "pots-equipment" },
];

export default function Navbar({ onCategorySelect, activeCategory, onSignIn }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { toggleCart, totalItems } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const itemCount = totalItems();

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-lg shadow-primary/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <button
              onClick={() => onCategorySelect(null)}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-[family-name:var(--font-playfair)] text-lg font-bold leading-tight tracking-tight">
                  GreenHaven
                </span>
                <span className="text-[10px] text-muted-foreground tracking-widest uppercase leading-none">
                  Nursery
                </span>
              </div>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.slug ?? "home"}
                  onClick={() => onCategorySelect(link.slug)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === link.slug
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full"
                >
                  {theme === "dark" ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </Button>
              )}

              {/* Sign In */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSignIn?.()}
                className="rounded-full hidden sm:flex"
                title="Sign In / Sign Up"
              >
                <User className="w-5 h-5" />
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="rounded-full relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-gold text-gold-foreground text-xs border-2 border-background">
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.slug ?? "home"}
                    onClick={() => {
                      onCategorySelect(link.slug);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === link.slug
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
