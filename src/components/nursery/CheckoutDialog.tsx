"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  Phone,
  Mail,
  User,
  MapPin,
  Building2,
  MessageSquare,
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/cart-store";
import { useToast } from "@/hooks/use-toast";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckoutDialog({ open, onClose }: CheckoutDialogProps) {
  const { items, totalPrice, clearCart, sessionId } = useCartStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    city: "",
    notes: "",
  });

  const deliveryFee = totalPrice() > 2000 ? 0 : 150;
  const grandTotal = totalPrice() + deliveryFee;

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.customerName || !form.customerPhone || !form.address || !form.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          ...form,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setOrderNumber(data.order?.orderNumber || "");
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (orderSuccess) {
      setOrderSuccess(false);
      setForm({ customerName: "", customerEmail: "", customerPhone: "", address: "", city: "", notes: "" });
    }
    onClose();
  };

  const paymentMethods = [
    {
      id: "esewa",
      name: "eSewa",
      desc: "Pay via eSewa wallet",
      color: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
      activeColor: "bg-green-100 border-green-500 dark:bg-green-900/40",
      badge: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/ESewa_logo.svg/1200px-ESewa_logo.svg.png",
    },
    {
      id: "khalti",
      name: "Khalti",
      desc: "Pay via Khalti wallet",
      color: "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800",
      activeColor: "bg-purple-100 border-purple-500 dark:bg-purple-900/40",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      desc: "Pay when you receive",
      color: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800",
      activeColor: "bg-orange-100 border-orange-500 dark:bg-orange-900/40",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {!orderSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Checkout
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Complete your order with {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </DialogHeader>

            <div className="grid md:grid-cols-5 gap-6 mt-4">
              {/* Form */}
              <div className="md:col-span-3 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Delivery Details
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="name" className="text-xs">Full Name *</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="name"
                            value={form.customerName}
                            onChange={(e) => updateField("customerName", e.target.value)}
                            placeholder="Ram Bahadur"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-xs">Phone *</Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={form.customerPhone}
                            onChange={(e) => updateField("customerPhone", e.target.value)}
                            placeholder="98XXXXXXXX"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs">Email (optional)</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={form.customerEmail}
                          onChange={(e) => updateField("customerEmail", e.target.value)}
                          placeholder="you@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address" className="text-xs">Full Address *</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="address"
                          value={form.address}
                          onChange={(e) => updateField("address", e.target.value)}
                          placeholder="Street address, ward, tole..."
                          className="pl-10 min-h-[60px]"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-xs">City/District *</Label>
                      <div className="relative mt-1">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="city"
                          value={form.city}
                          onChange={(e) => updateField("city", e.target.value)}
                          placeholder="Kathmandu"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
                      <div className="relative mt-1">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="notes"
                          value={form.notes}
                          onChange={(e) => updateField("notes", e.target.value)}
                          placeholder="Any special delivery instructions..."
                          className="pl-10 min-h-[50px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Payment Method
                  </h3>
                  <div className="space-y-2">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 text-left transition-all ${
                          paymentMethod === pm.id ? pm.activeColor : pm.color
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center font-bold text-sm">
                          {pm.name === "eSewa" ? "e" : pm.name === "Khalti" ? "K" : "₹"}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{pm.name}</p>
                          <p className="text-xs text-muted-foreground">{pm.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === pm.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                        }`}>
                          {paymentMethod === pm.id && (
                            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="md:col-span-2">
                <div className="sticky top-0 p-4 rounded-2xl bg-secondary/30 border border-border/50 space-y-3">
                  <h3 className="font-semibold text-sm">Order Summary</h3>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 text-sm">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          <img src={item.plantImage} alt={item.plantName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium">{item.plantName}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-medium">
                          Npr {(item.plantPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>Npr {totalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                        {deliveryFee === 0 ? "FREE" : `Npr ${deliveryFee}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">Npr {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    className="w-full rounded-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order — Npr {grandTotal.toLocaleString()}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={handleClose}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to shopping
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Order Success */
          <div className="text-center py-12 space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Order Placed Successfully! 🎉
              </h2>
              <p className="text-muted-foreground">
                Thank you for your order. We&apos;ll prepare your plants with care.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 inline-block">
              <p className="text-xs text-muted-foreground">Order Number</p>
              <p className="font-mono text-lg font-bold text-primary">{orderNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {paymentMethod === "cod"
                ? "Pay with cash when your plants arrive."
                : `You will be redirected to ${paymentMethod === "esewa" ? "eSewa" : "Khalti"} to complete payment.`}
            </p>
            <Button
              className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              onClick={handleClose}
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}