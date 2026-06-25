"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, X, ArrowLeft, Leaf, Info } from "lucide-react";
import { toast } from "sonner";

function isGoogleScriptLoaded(): boolean {
  if (typeof document === "undefined") return false;
  return !!document.querySelector('script[src*="accounts.google.com/gsi/client"]');
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

declare global {
  interface Window { google: any; }
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [googleConfigured, setGoogleConfigured] = useState<boolean | null>(null);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(() => isGoogleScriptLoaded());
  const googleInitialized = useRef(false);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });

  const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  useEffect(() => {
    fetch("/api/auth").then(r => {
      if (r.ok) r.json().then(d => { if (d.authenticated) setUser(d.customer); });
    });
  }, []);

  useEffect(() => {
    fetch("/api/auth/google/status")
      .then(r => r.json())
      .then(d => setGoogleConfigured(d.configured))
      .catch(() => setGoogleConfigured(false));
  }, []);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;
    if (isGoogleScriptLoaded()) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => { setGoogleScriptLoaded(true); };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleScriptLoaded || googleInitialized.current || !googleConfigured) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !window.google?.accounts) return;

    window.google.accounts.id.initialize({ client_id: clientId, callback: () => {} });
    googleInitialized.current = true;
  }, [googleScriptLoaded, googleConfigured]);

  const handleGoogleSignIn = useCallback(() => {
    if (!window.google?.accounts?.id) {
      toast.error("Google Sign-In is not available. Please use email sign-in.");
      return;
    }
    setGoogleLoading(true);
    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
        }
      });
    } catch {
      setGoogleLoading(false);
      toast.error("Could not open Google Sign-In. Please try email sign-in.");
    }
  }, []);

  useEffect(() => {
    if (!window.google?.accounts?.id) return;

    const callback = async (response: any) => {
      if (!response.credential) { setGoogleLoading(false); return; }
      try {
        const res = await fetch("/api/auth/google/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error || "Google sign-in failed"); setGoogleLoading(false); return; }
        toast.success(`Welcome, ${data.customer?.name || "back"}!`);
        setUser(data.customer);
        onOpenChange(false);
      } catch { toast.error("Network error during Google sign-in"); }
      setGoogleLoading(false);
    };

    window.google.accounts.id.configure({ callback });
  }, [onOpenChange]);

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
        toast.success(data.message || "If an account exists, a reset link has been sent");
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

  const handleDialogChange = (o: boolean) => {
    onOpenChange(o);
    if (!o) { reset(); setMode("login"); }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="bg-primary text-primary-foreground px-6 py-5 relative">
          {mode !== "login" && (
            <button type="button" onClick={() => setMode("login")} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/80 hover:text-primary-foreground p-1">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={() => onOpenChange(false)} className="absolute right-4 top-4 text-primary-foreground/60 hover:text-primary-foreground">
            <X className="w-4 h-4" />
          </button>
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="w-5 h-5" />
              <DialogTitle className="text-primary-foreground">
                {mode === "login" && "Sign In"}
                {mode === "register" && "Create Account"}
                {mode === "forgot" && "Reset Password"}
              </DialogTitle>
            </div>
            <p className="text-xs text-primary-foreground/70">
              {mode === "login" && "Welcome back! Sign in to your account"}
              {mode === "register" && "Join GreenHaven for exclusive offers"}
              {mode === "forgot" && "Enter your email to receive a reset link"}
            </p>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-4">
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
              {(mode === "login" || mode === "register") && (
                <div className="space-y-2">
                  {googleConfigured === false ? (
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full h-11 gap-3 text-sm font-medium opacity-50 cursor-not-allowed" disabled>
                        <GoogleIcon />
                        Continue with Google
                      </Button>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2.5">
                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                        <span>Google sign-in is currently unavailable. Please use email sign-in below.</span>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full h-11 gap-3 text-sm font-medium" onClick={handleGoogleSignIn} disabled={googleLoading}>
                      {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
                      Continue with Google
                    </Button>
                  )}
                </div>
              )}

              {(mode === "login" || mode === "register") && (
                <div className="relative flex items-center justify-center">
                  <span className="absolute inset-x-0 h-px bg-border" />
                  <span className="relative bg-background px-3 text-xs text-muted-foreground">or continue with email</span>
                </div>
              )}

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
                {mode === "login" && "Sign In with Email"}
                {mode === "register" && "Create Account"}
                {mode === "forgot" && "Send Reset Link"}
              </Button>

              {mode === "login" && (
                <button type="button" onClick={() => setMode("forgot")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center">
                  Forgot your password?
                </button>
              )}

              {mode === "login" && (
                <p className="text-center text-xs text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button type="button" onClick={() => { setMode("register"); reset(); }} className="text-primary hover:underline font-medium">
                    Sign up
                  </button>
                </p>
              )}
              {mode === "register" && (
                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button type="button" onClick={() => { setMode("login"); reset(); }} className="text-primary hover:underline font-medium">
                    Sign in
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}