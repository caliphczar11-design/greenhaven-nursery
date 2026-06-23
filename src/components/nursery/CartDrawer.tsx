"use client";

import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCartStore, CartItemStore } from "@/store/cart-store";
import { motion, AnimatePresence } from "framer-motion";

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const {
    items,
    isOpen,
    setCartOpen,
    removeItem,
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems,
  } = useCartStore();

  const deliveryFee = totalPrice() > 2000 ? 0 : 150;
  const grandTotal = totalPrice() + deliveryFee;

  return (
    <Sheet open={isOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 font-[family-name:var(--font-playfair)] text-xl">
              <ShoppingBag className="w-5 h-5" />
              Your Cart
              {totalItems() > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({totalItems()} item{totalItems() !== 1 ? "s" : ""})
                </span>
              )}
            </SheetTitle>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-xs text-destructive hover:text-destructive h-8"
              >
                Clear All
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Cart Items */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-2">
              Your cart is empty
            </h3>
            <p className="text-sm text-muted-foreground">
              Add some beautiful plants to get started!
            </p>
            <Button
              variant="outline"
              className="mt-4 rounded-full"
              onClick={() => setCartOpen(false)}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      className="flex gap-4 p-3 rounded-xl bg-secondary/30 border border-border/30"
                    >
                      {/* Image */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                        <img
                          src={item.plantImage}
                          alt={item.plantName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.plantName}</h4>
                        <p className="text-primary font-semibold text-sm mt-1">
                          NPR {item.plantPrice.toLocaleString()}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-background rounded-full border border-border/50 p-0.5">
                            <button
                              onClick={() => updateQuantity(item.plantId, item.quantity - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.plantId, item.quantity + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Remove */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.plantId)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer / Summary */}
            <div className="border-t border-border p-6 space-y-4 flex-shrink-0 bg-background">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">NPR {totalPrice().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className={`font-medium ${deliveryFee === 0 ? "text-green-600" : ""}`}>
                    {deliveryFee === 0 ? "FREE" : `NPR ${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add NPR {(2000 - totalPrice()).toLocaleString()} more for free delivery
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="text-primary">NPR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full rounded-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 text-base font-semibold"
                onClick={() => {
                  setCartOpen(false);
                  onCheckout();
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}