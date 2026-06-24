"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, X, ArrowLeft, Leaf } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  useEffect(() => {
    fetch("/api/auth").then(r => {
      if (r.ok) r.json().then(d => { if (d.authenticated) setUser(d.customer); });
    });
  }, []);

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const action = mode === "login" ? "login" : mode === "register" ? "register" : "forgot-password";
      const body = mode === "forgot-password"
        ? { action, email: form.email }
        : mode === "register"
        ? { action, name: form.name, email: form.email, phone: form.phone, password: form.password }
        : { action, email: form.email, password: form.password };

      const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();

      if (!res.ok) { toast.error(data.error || "Something went wrong"); return; }

      if (mode === "forgot-password") {
        toast.success(data.message || "Check your email for reset instructions");
        setMode("login");
      } else if (mode === "register") {
        toast.success("Account created! Please sign in.");
        setMode("login");
        setForm(p => ({ ...p, password: "", confirmPassword: "" }));
      } else {
        toast.success(`Welcome, ${data.customer?.name || "back"}!`);
        setUser(data.customer);
        onOpenChange(false);
      }
    } catch { toast.error("Network error"); }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setUser(null);
    toast.success("Logged out");
  };

  const reset = () => { setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" }); setShowPw(false); };

  return (
    <Dialog open={open} onOpenChange={o => { onOpenChange(o); if (!o) reset(); setMode("login"); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */
        <div className="bg-primary text-primary-foreground px-6 py-5 relative">
          {mode !== "login" && (
            <button onClick={() => setMode("login")} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground p-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-primary-foreground/60 hover:text-primary-foreground">
            <X className="w-4 h-4" />
          </button>
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-5 h-5" />
              <DialogTitle className="text-primary-foreground font-[family-name:var(--font-playfair)]">
                {mode === "login" && "Sign In"}{mode === "register" && "Create Account"}{mode === "forgot" && "Reset Password"}
              </DialogTitle>
            </div>
            <p className="text-xs text-primary-foreground/70">
              {mode === "login" && "Welcome back! Sign in to your account"}
              {mode === "register" && "Join GreenHaven for exclusive offers"}
              {mode === "forgot" && "Enter your email to receive a reset link"}
            </p>
          </DialogHeader>
        </div>

        {/* Body */
        <div className="px-6 py-5 space-y-4">
          {/* Logged in state */}
          {user && mode === "login" ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="w-full">Sign Out</Button>
            </div>
          ) : (
            <>
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={form.name} onChange={e => update("name", e.target.value)} className="pl-10 h-10" placeholder="John Doe" />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={form.email} onChange={e => update("email", e.target.value)} className="pl-10 h-10" placeholder="you@example.com" />
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={form.phone} onChange={e => update("phone", e.target.value)} className="pl-10 h-10" placeholder="+977 98XXXXXXXX" />
                  </div>
                </div>
              )}

              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type={showPw ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} className="pl-10 pr-10 h-10" placeholder="Min 6 characters" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} className="pl-10 h-10" placeholder="Re-enter password" />
                  </div>
                </div>
              )}

              <Button onClick={handleSubmit} disabled={loading} className="w-full h-10 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {mode === "login" && "Sign In"}
                {mode === "register" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
              </Button>

              {mode === "login" && (
                <button onClick={() => setMode("forgot")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                  Forgot your password?
                </button>
              )}

              {mode === "login" && (
                <div className="relative flex items-center justify-center">
                  <span className="absolute inset-x-0 h-px bg-border" />
                  <span className="relative bg-background px-3 text-xs text-muted-foreground">or continue with</span>
                </div>
              )}

              {(mode === "login" || mode === "register") && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="gap-2 h-9 text-xs" onClick={() => toast.info("Google sign-in requires Google Cloud setup in admin panel")}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12.94v5h7.74c-.26 1.46-.95 2.71-2 3.47h-6.13l3.76 3.76c2.29-2.11 3.75-5.14 3.75-8.48 0-1.16-.11-2.3-.32-3.41l-2.36 2.36z"/><path fill="#34A853" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-1.09.55-2.04 1.38-2.59l3.75 3.75c.71-1.21 1.12-2.64 1.12-4.15 0-2.97-1.94-5.47-4.6-6.35l2.84 2.84z"/><path fill="#FBBC05" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.59 0 1.17-.05 1.73-.15l3.76 3.76c-.47.36-1 .64-1.59.84H6.31c-.59-.2-1.12-.48-1.59-.84l3.76-3.76c.56.1 1.14.15 1.73.15 5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
                    Gmail
                  </Button>
                  <Button variant="outline" className="gap-2 h-9 text-xs" onClick={() => toast.info("WhatsApp sign-in requires phone verification setup")}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-1.396-.502-3.244-1.568-1.847-1.066-3.935-2.236-5.895-3.453l-.363-.215c-.754-.448-1.258-.742-1.392-.835-.133-.093-.344-.034-.518.058-.174.092-.288.234-.418.146-.134.488-.574 1.078-1.304.59-.73 1.332-1.737 2.224-2.915.892-1.178 1.93-2.398 3.114-3.812.546-.665.997-1.268 1.352-1.802.355-.534.6-1.052.735-1.55.135-.498.186-1.006.153-1.528-.066-.522-.312-1.01-.738-1.466C8.826 3.476 7.056 3.752 5.528 4.532c-1.528.78-3.252.6-4.582-.812-1.33-1.412-2.362-3.234-3.096-5.465-.734-2.231-.18-4.524 1.348-7.28C4.63 5.25 7.476 3.88 10.324 4.48c2.848.6 5.326 2.2 7.132 4.296 1.806 2.096 2.97 4.698 3.492 7.604.522 2.906.156 5.496-1.034 7.78z"/></svg>
                    WhatsApp
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
