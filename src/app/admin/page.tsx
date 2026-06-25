"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  X,
  Edit3,
  Eye,
  Package,
  Tag,
  Settings,
  BarChart3,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Search,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  RefreshCw,
  Check,
  AlertCircle,
  Lock,
  LogOut,
  User,
  KeyRound,
  LayoutDashboard,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BoxesIcon,
  Clock,
  ExternalLink,
  MessageCircle,
  Send,
  ChevronRight,
  Copy,
  PieChart,
  TrendingUp as TrendingUpIcon,
  Wallet,
  ShieldAlert,
  Activity,
  Hash,
  Loader2,
  ImagePlus,
  Upload,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Types
interface Plant {
  id: string;
  name: string;
  slug: string;
  scientificName?: string;
  description: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
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
  damagedCount: number;
  unit: string;
  featured: boolean;
  rating: number;
  reviewCount: number;
  tags?: string;
  displayOrder: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  plantCount: number;
}

interface SiteSettings {
  [key: string]: string;
}

// ===== SORTABLE PLANT ROW =====
function SortablePlantRow({
  plant,
  categories,
  isEditing,
  editData,
  onStartEdit,
  onCancelEdit,
  onEditChange,
  onSave,
  onDelete,
  onToggleField,
}: {
  plant: Plant;
  categories: Category[];
  isEditing: boolean;
  editData: Partial<Plant>;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onEditChange: (field: string, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
  onToggleField: (field: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: plant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card border-2 border-primary/30 rounded-xl p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Editing: {plant.name}</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="w-3 h-3 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={onSave}>
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Plant Name *</Label>
            <Input value={editData.name || ""} onChange={(e) => onEditChange("name", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Scientific Name</Label>
            <Input value={editData.scientificName || ""} onChange={(e) => onEditChange("scientificName", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Category *</Label>
            <Select value={editData.categoryId} onValueChange={(v) => onEditChange("categoryId", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Price (NPR) *</Label>
            <Input type="number" value={editData.price || ""} onChange={(e) => onEditChange("price", parseFloat(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Original Price (for discount)</Label>
            <Input type="number" value={editData.originalPrice || ""} onChange={(e) => onEditChange("originalPrice", e.target.value ? parseFloat(e.target.value) : undefined)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Image URL *</Label>
            <Input value={editData.imageUrl || ""} onChange={(e) => onEditChange("imageUrl", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Difficulty</Label>
            <Select value={editData.difficulty} onValueChange={(v) => onEditChange("difficulty", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Easy", "Moderate", "Hard"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Climate</Label>
            <Select value={editData.climate} onValueChange={(v) => onEditChange("climate", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Tropical", "Subtropical", "Temperate", "Alpine"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Elevation</Label>
            <Input value={editData.elevation || ""} onChange={(e) => onEditChange("elevation", e.target.value)} className="mt-1" placeholder="e.g. 100-1500m" />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs">Season</Label>
            <Input value={editData.season || ""} onChange={(e) => onEditChange("season", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Sunlight</Label>
            <Select value={editData.sunlight} onValueChange={(v) => onEditChange("sunlight", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Full Sun", "Partial Shade", "Full Shade"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Water Need</Label>
            <Select value={editData.waterNeed} onValueChange={(v) => onEditChange("waterNeed", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Low", "Moderate", "High"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Stock Count</Label>
            <Input type="number" value={editData.stockCount || 0} onChange={(e) => onEditChange("stockCount", parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Damaged Count</Label>
            <Input type="number" min="0" value={editData.damagedCount || 0} onChange={(e) => onEditChange("damagedCount", parseInt(e.target.value) || 0)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Unit</Label>
            <Select value={editData.unit || "pc"} onValueChange={(v) => onEditChange("unit", v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select unit" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pc">Per Piece (pc)</SelectItem>
                <SelectItem value="kg">Per Kg (kg)</SelectItem>
                <SelectItem value="gm">Per Gram (gm)</SelectItem>
                <SelectItem value="ltrs">Per Litre (ltrs)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          {([
            ["featured", "Featured"],
            ["inStock", "In Stock"],
            ["edible", "Edible"],
            ["indoor", "Indoor"],
            ["outdoor", "Outdoor"],
            ["fragrance", "Fragrant"],
            ["airPurifying", "Air Purifying"],
            ["petSafe", "Pet Safe"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
              <Switch
                checked={!!(editData as any)[key]}
                onCheckedChange={() => onToggleField(key)}
              />
              {label}
            </label>
          ))}
        </div>

        {/* Text fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Short Description</Label>
            <Textarea value={editData.shortDesc || ""} onChange={(e) => onEditChange("shortDesc", e.target.value)} className="mt-1" rows={2} />
          </div>
          <div>
            <Label className="text-xs">Full Description</Label>
            <Textarea value={editData.description || ""} onChange={(e) => onEditChange("description", e.target.value)} className="mt-1" rows={2} />
          </div>
        </div>

        {/* Advanced fields (collapsible) */}
        <DetailsSection title="Advanced: Soil & Dimensions">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Field label="Soil Type" value={editData.soilType} onChange={(v) => onEditChange("soilType", v)} />
            <Field label="Soil pH" value={editData.soilPH} onChange={(v) => onEditChange("soilPH", v)} placeholder="6.0-7.0" />
            <Field label="Temperature" value={editData.temperature} onChange={(v) => onEditChange("temperature", v)} placeholder="15-30°C" />
            <Field label="Humidity" value={editData.humidity} onChange={(v) => onEditChange("humidity", v)} placeholder="60-80%" />
            <Field label="Mature Height" value={editData.matureHeight} onChange={(v) => onEditChange("matureHeight", v)} placeholder="30-60cm" />
            <Field label="Spread" value={editData.spread} onChange={(v) => onEditChange("spread", v)} />
            <Field label="Bloom Time" value={editData.bloomTime} onChange={(v) => onEditChange("bloomTime", v)} placeholder="March-June" />
            <Field label="Tags" value={editData.tags} onChange={(v) => onEditChange("tags", v)} placeholder="tag1, tag2" />
          </div>
        </DetailsSection>

        <DetailsSection title="Nutrition & Care">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Required Nutrients (comma-separated)</Label>
              <Textarea value={editData.nutrients || ""} onChange={(e) => onEditChange("nutrients", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Fertilizer Schedule</Label>
              <Textarea value={editData.fertilizer || ""} onChange={(e) => onEditChange("fertilizer", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Pruning</Label>
              <Textarea value={editData.pruning || ""} onChange={(e) => onEditChange("pruning", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Propagation</Label>
              <Textarea value={editData.propagation || ""} onChange={(e) => onEditChange("propagation", e.target.value)} className="mt-1" rows={2} />
            </div>
          </div>
        </DetailsSection>

        <DetailsSection title="Uses & Companions">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Uses (comma-separated)</Label>
              <Textarea value={editData.uses || ""} onChange={(e) => onEditChange("uses", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs">Medicinal Uses</Label>
              <Textarea value={editData.medicinalUses || ""} onChange={(e) => onEditChange("medicinalUses", e.target.value)} className="mt-1" rows={2} />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Companion Plants</Label>
              <Textarea value={editData.companionPlants || ""} onChange={(e) => onEditChange("companionPlants", e.target.value)} className="mt-1" rows={2} />
            </div>
          </div>
        </DetailsSection>
      </div>
    );
  }

  const discount = plant.originalPrice
    ? Math.round(((plant.originalPrice - plant.price) / plant.originalPrice) * 100)
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-colors group"
    >
      {/* Drag Handle */}
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Image */}
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        <img src={plant.imageUrl} alt={plant.name} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-5 gap-2 items-center text-sm">
        <div className="col-span-1">
          <p className="font-medium truncate">{plant.name}</p>
          <p className="text-xs text-muted-foreground truncate">{plant.category.name}</p>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">Price</p>
          <p className="font-semibold text-primary">NPR {plant.price.toLocaleString()}</p>
        </div>
        <div className="hidden md:block">
          <p className="text-xs text-muted-foreground">Climate</p>
          <p>{plant.climate}</p>
        </div>
        <div className="hidden md:flex gap-1 flex-wrap">
          {plant.featured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Featured</Badge>}
          {plant.edible && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Edible</Badge>}
          {plant.indoor && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Indoor</Badge>}
          {discount > 0 && <Badge className="bg-gold text-gold-foreground text-[10px] px-1.5 py-0 border-0">-{discount}%</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Switch checked={plant.inStock} onCheckedChange={() => onToggleField("inStock")} className="scale-75" />
          <span className="text-xs">{plant.inStock ? "In Stock" : "Out"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onStartEdit}>
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ===== HELPER COMPONENTS =====
function Field({ label, value, onChange, placeholder }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1" placeholder={placeholder} />
    </div>
  );
}

function DetailsSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 bg-secondary/30 hover:bg-secondary/50 text-sm font-medium transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ===== LOGIN FORM =====
function AdminLoginForm({ onLogin }: { onLogin: (user: { username: string; role: string }) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      onLogin(data.user);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-muted-foreground text-sm">
            GreenHaven Nursery — Management Panel
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg shadow-black/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2 mb-2">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                placeholder="Enter your username"
                autoComplete="username"
                className="h-11"
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 mb-2">
                <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="h-11 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Verifying credentials...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Authorized personnel only. All access is logged.
        </p>

        <div className="text-center mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => (window.location.href = "/")}
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Store
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN ADMIN PAGE =====
export default function AdminPage() {
  const [authUser, setAuthUser] = useState<{ username: string; role: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not authenticated");
      })
      .then((data) => {
        if (data.authenticated && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {
        // Not authenticated, show login
      })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogin = useCallback((user: { username: string; role: string }) => {
    setAuthUser(user);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
    } catch {
      // ignore
    }
    setAuthUser(null);
  }, []);

  // Show loading while checking session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-muted-foreground">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!authUser) {
    return <AdminLoginForm onLogin={handleLogin} />;
  }

  // Authenticated — render the admin dashboard
  return <AdminDashboard username={authUser.username} onLogout={handleLogout} />;
}

// ===== ADMIN DASHBOARD (requires auth) =====
function AdminDashboard({ username, onLogout }: { username: string; onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Plant>>({});
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "Leaf" });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwData, setPwData] = useState({ current: "", newPw: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // Queries
  const { data: plants = [], isLoading: plantsLoading } = useQuery<Plant[]>({
    queryKey: ["admin-plants"],
    queryFn: async () => {
      const res = await fetch("/api/plants?sort=newest");
      const data = await res.json();
      return data.plants || [];
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const data = await res.json();
      return data.categories || [];
    },
  });

  const { data: settings = {}, isLoading: settingsLoading } = useQuery<SiteSettings>({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      return res.json();
    },
  });

  // Dashboard data
  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      return res.json();
    },
  });

  // Orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      return data.orders || [];
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, orderStatus }: { id: string; orderStatus: string }) => {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderStatus }) });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      toast.success("Order status updated!");
    },
    onError: () => toast.error("Failed to update order"),
  });

  // Mutations
  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Plant> }) => {
      const res = await fetch(`/api/admin/plants/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      setEditingId(null);
      toast.success("Plant updated!");
    },
    onError: () => toast.error("Failed to update plant"),
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/plants/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      toast.success("Plant deleted!");
    },
    onError: () => toast.error("Failed to delete plant"),
  });

  const createPlantMutation = useMutation({
    mutationFn: async (data: Partial<Plant>) => {
      const res = await fetch("/api/admin/plants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-plants"] });
      setShowAddPlant(false);
      toast.success("Plant created!");
    },
    onError: () => toast.error("Failed to create plant"),
  });

  const reorderPlantsMutation = useMutation({
    mutationFn: async (orders: { id: string; displayOrder: number }[]) => {
      const res = await fetch("/api/admin/plants", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orders }) });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-plants"] }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SiteSettings) => {
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved!");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; icon: string }) => {
      const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setNewCategory({ name: "", description: "", icon: "Leaf" });
      setShowAddCategory(false);
      toast.success("Category created!");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Delete failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted!");
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  // Drag & Drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = plants.findIndex((p) => p.id === active.id);
      const newIndex = plants.findIndex((p) => p.id === over.id);
      const reordered = arrayMove(plants, oldIndex, newIndex);
      const orders = reordered.map((p, i) => ({ id: p.id, displayOrder: i }));
      reorderPlantsMutation.mutate(orders);
    }
  }, [plants, reorderPlantsMutation]);

  const filteredPlants = plants.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (plant: Plant) => {
    setEditingId(plant.id);
    setEditData({ ...plant });
  };

  const handleToggleField = (field: string) => {
    if (editingId) {
      setEditData((prev) => ({ ...prev, [field]: !(prev as any)[field] }));
    } else {
      // Quick toggle without full edit
    }
  };

  const handleQuickToggle = (plant: Plant, field: string) => {
    updatePlantMutation.mutate({ id: plant.id, data: { [field]: !(plant as any)[field] } as any });
  };

  const [settingsDraft, setSettingsDraft] = useState<SiteSettings>(settings || {});

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5" />
            <h1 className="font-[family-name:var(--font-playfair)] text-lg font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {stats && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <span><Package className="w-4 h-4 inline mr-1" />{stats.plants} Plants</span>
                <span><Tag className="w-4 h-4 inline mr-1" />{stats.categories} Categories</span>
                <span><BarChart3 className="w-4 h-4 inline mr-1" />{stats.orders} Orders</span>
              </div>
            )}
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" onClick={() => window.location.href = "/"}>
              <ArrowLeft className="w-4 h-4 mr-1" /> View Site
            </Button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-primary-foreground/80">
              <User className="w-3.5 h-3.5" />
              <button onClick={() => setShowChangePassword(true)} className="hover:text-primary-foreground transition-colors">{username}</button>
            </div>
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-destructive/20 hover:text-red-300" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tab Navigation - simple buttons, no Radix dependency */}
        <div className="sticky top-14 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-background border-b border-border mb-6">
          <div className="inline-flex items-center bg-muted rounded-lg p-[3px] gap-0.5 overflow-x-auto">
            {([
              { value: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { value: "plants", icon: Package, label: "Plants" },
              { value: "categories", icon: Tag, label: "Categories" },
              { value: "orders", icon: ShoppingCart, label: "Orders" },
              { value: "settings", icon: Settings, label: "Settings" },
              { value: "appearance", icon: Eye, label: "Appearance" },
              { value: "analytics", icon: PieChart, label: "Analytics" },
            ] as const).map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all cursor-pointer select-none ${
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

          {/* ========== DASHBOARD TAB ========== */}
          {activeTab === "dashboard" && <>
            {dashLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-secondary rounded-xl animate-pulse" />)}</div>
            ) : dashboard && (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                  {[
                    { label: "Total Products", value: dashboard.quickStats?.totalProducts, icon: Package, color: "text-primary" },
                    { label: "Total Stock", value: dashboard.quickStats?.totalStock, icon: BoxesIcon, color: "text-blue-600 dark:text-blue-400" },
                    { label: "Revenue", value: `NPR ${(dashboard.quickStats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-green-600 dark:text-green-400" },
                    { label: "Pending Orders", value: dashboard.quickStats?.pendingOrders, icon: Clock, color: "text-yellow-600 dark:text-yellow-400" },
                    { label: "Low Stock", value: dashboard.quickStats?.lowStockCount, icon: AlertTriangle, color: dashboard.quickStats?.lowStockCount > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground" },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                        {s.label === "Low Stock" && dashboard.quickStats?.lowStockCount > 0 && (
                          <Badge variant="destructive" className="text-[10px]">Alert</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Low Stock Alerts */}
                {dashboard.lowStockPlants?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Low Stock Alerts
                      <Badge variant="destructive">{dashboard.lowStockPlants.length} items below 10 units</Badge>
                    </h3>
                    <div className="space-y-3">
                      {dashboard.lowStockPlants.map((p: { id: string; name: string; price: number; stockCount: number; category: string }) => {
                        const alertMsg = encodeURIComponent(`🚨 Low Stock Alert - ${p.name} (${p.category})\nCurrent Stock: ${p.stockCount} units\nPrice: NPR ${p.price}\nReorder needed!\n— GreenHaven Nursery Admin`);
                        const whatsappUrl = `https://wa.me/?text=${alertMsg}`;
                        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${alertMsg}`;
                        return (
                          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{p.name} <span className="text-muted-foreground font-normal">({p.category})</span></p>
                                <p className="text-xs text-red-600 dark:text-red-400 font-semibold">Only {p.stockCount} left — NPR {p.price}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="gap-1.5 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-800" asChild>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-3.5 h-3.5" /> WhatsApp</a>
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800" asChild>
                                <a href={telegramUrl} target="_blank" rel="noopener noreferrer"><Send className="w-3.5 h-3.5" /> Telegram</a>
                              </Button>
                              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(decodeURIComponent(alertMsg)); toast.success("Alert message copied!"); }}>
                                <Copy className="w-3.5 h-3.5" /> Copy
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Stock & Sales by Category */}
                <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Stock & Sales by Category
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {dashboard.categories?.map((cat: { id: string; name: string; plantCount: number; totalStock: number; totalSold: number; revenue: number }) => (
                    <div key={cat.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{cat.name}</h4>
                        <Badge variant="secondary" className="text-[10px]">{cat.plantCount} plants</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <p className="text-muted-foreground">In Stock</p>
                          <p className="text-lg font-bold">{cat.totalStock}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2">
                          <p className="text-muted-foreground">Sold</p>
                          <p className="text-lg font-bold">{cat.totalSold}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenue</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">NPR {(cat.revenue || 0).toLocaleString()}</span>
                      </div>
                      {cat.totalStock < 20 && (
                        <p className="text-[10px] text-red-500 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Low stock in this category</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                {dashboard.recentOrders?.length > 0 && (
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5" /> Recent Orders
                    </h3>
                    <div className="space-y-2">
                      {dashboard.recentOrders.map((o: { id: string; orderNumber: string; customerName: string; total: number; paymentMethod: string; orderStatus: string; itemCount: number; createdAt: string }) => (
                        <div key={o.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-muted-foreground">{o.orderNumber}</span>
                            <span className="font-medium">{o.customerName}</span>
                            <Badge variant="outline" className="text-[10px]">{o.itemCount} items</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold">NPR {o.total.toLocaleString()}</span>
                            <StatusBadge status={o.orderStatus} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
</>}

          {/* ========== PLANTS TAB ========== */}
          {activeTab === "plants" && <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plants..."
                  className="pl-10"
                />
              </div>
              <Button onClick={() => { if (!showAddPlant) setEditData({ inStock: true, unit: "pc", stockCount: 50, damagedCount: 0 }); setShowAddPlant(!showAddPlant); }} className="gap-2">
                <Plus className="w-4 h-4" /> Add Plant
              </Button>
            </div>

            {/* Add Plant Form - Full comprehensive form */}
            {showAddPlant && (
              <div className="bg-card border-2 border-dashed border-primary/40 rounded-xl p-6 mb-6 space-y-4">
                <h3 className="font-semibold">New Plant <span className="text-xs text-muted-foreground font-normal ml-2">v3-full-form</span></h3>

                {/* Row 1: Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Plant Name *</Label>
                    <Input value={editData.name || ""} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Scientific Name</Label>
                    <Input value={editData.scientificName || ""} onChange={(e) => setEditData((p) => ({ ...p, scientificName: e.target.value }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Category *</Label>
                    <Select value={editData.categoryId} onValueChange={(v) => setEditData((p) => ({ ...p, categoryId: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Price *</Label>
                    <Input type="number" value={editData.price || ""} onChange={(e) => setEditData((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Original Price (for discount)</Label>
                    <Input type="number" value={editData.originalPrice || ""} onChange={(e) => setEditData((p) => ({ ...p, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Unit</Label>
                    <Select value={editData.unit || "pc"} onValueChange={(v) => setEditData((p) => ({ ...p, unit: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select unit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pc">Per Piece (pc)</SelectItem>
                        <SelectItem value="kg">Per Kg (kg)</SelectItem>
                        <SelectItem value="gm">Per Gram (gm)</SelectItem>
                        <SelectItem value="ltrs">Per Litre (ltrs)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2: Environment & Stock */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs">Difficulty</Label>
                    <Select value={editData.difficulty} onValueChange={(v) => setEditData((p) => ({ ...p, difficulty: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {["Easy", "Moderate", "Hard"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Climate</Label>
                    <Select value={editData.climate} onValueChange={(v) => setEditData((p) => ({ ...p, climate: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {["Tropical", "Subtropical", "Temperate", "Alpine"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Elevation" value={editData.elevation} onChange={(v) => setEditData((p) => ({ ...p, elevation: v }))} placeholder="e.g. 100-1500m" />
                  <Field label="Season" value={editData.season} onChange={(v) => setEditData((p) => ({ ...p, season: v }))} />
                  <div>
                    <Label className="text-xs">Sunlight</Label>
                    <Select value={editData.sunlight} onValueChange={(v) => setEditData((p) => ({ ...p, sunlight: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {["Full Sun", "Partial Shade", "Full Shade"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Water Need</Label>
                    <Select value={editData.waterNeed} onValueChange={(v) => setEditData((p) => ({ ...p, waterNeed: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>
                        {["Low", "Moderate", "High"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Stock Count</Label>
                    <Input type="number" value={editData.stockCount ?? 50} onChange={(e) => setEditData((p) => ({ ...p, stockCount: parseInt(e.target.value) || 0 }))} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs">Damaged Count</Label>
                    <Input type="number" min="0" value={editData.damagedCount ?? 0} onChange={(e) => setEditData((p) => ({ ...p, damagedCount: parseInt(e.target.value) || 0 }))} className="mt-1" />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-4">
                  {([
                    ["featured", "Featured"],
                    ["inStock", "In Stock"],
                    ["edible", "Edible"],
                    ["indoor", "Indoor"],
                    ["outdoor", "Outdoor"],
                    ["fragrance", "Fragrant"],
                    ["airPurifying", "Air Purifying"],
                    ["petSafe", "Pet Safe"],
                  ] as const).map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
                      <Switch
                        checked={!!(editData as any)[key]}
                        onCheckedChange={() => setEditData((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>

                {/* Image URL */}
                <Field label="Image URL *" value={editData.imageUrl} onChange={(v) => setEditData((p) => ({ ...p, imageUrl: v }))} placeholder="https://picsum.photos/seed/myplant/600/400" />

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Short Description</Label>
                    <Textarea value={editData.shortDesc || ""} onChange={(e) => setEditData((p) => ({ ...p, shortDesc: e.target.value }))} className="mt-1" rows={2} />
                  </div>
                  <div>
                    <Label className="text-xs">Full Description</Label>
                    <Textarea value={editData.description || ""} onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))} className="mt-1" rows={2} />
                  </div>
                </div>

                {/* Advanced: Soil & Dimensions */}
                <DetailsSection title="Advanced: Soil & Dimensions">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Soil Type" value={editData.soilType} onChange={(v) => setEditData((p) => ({ ...p, soilType: v }))} />
                    <Field label="Soil pH" value={editData.soilPH} onChange={(v) => setEditData((p) => ({ ...p, soilPH: v }))} placeholder="6.0-7.0" />
                    <Field label="Temperature" value={editData.temperature} onChange={(v) => setEditData((p) => ({ ...p, temperature: v }))} placeholder="15-30°C" />
                    <Field label="Humidity" value={editData.humidity} onChange={(v) => setEditData((p) => ({ ...p, humidity: v }))} placeholder="60-80%" />
                    <Field label="Mature Height" value={editData.matureHeight} onChange={(v) => setEditData((p) => ({ ...p, matureHeight: v }))} placeholder="30-60cm" />
                    <Field label="Spread" value={editData.spread} onChange={(v) => setEditData((p) => ({ ...p, spread: v }))} />
                    <Field label="Bloom Time" value={editData.bloomTime} onChange={(v) => setEditData((p) => ({ ...p, bloomTime: v }))} placeholder="March-June" />
                    <Field label="Tags" value={editData.tags} onChange={(v) => setEditData((p) => ({ ...p, tags: v }))} placeholder="tag1, tag2" />
                  </div>
                </DetailsSection>

                {/* Nutrition & Care */}
                <DetailsSection title="Nutrition & Care">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Required Nutrients (comma-separated)</Label>
                      <Textarea value={editData.nutrients || ""} onChange={(e) => setEditData((p) => ({ ...p, nutrients: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Fertilizer Schedule</Label>
                      <Textarea value={editData.fertilizer || ""} onChange={(e) => setEditData((p) => ({ ...p, fertilizer: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Pruning</Label>
                      <Textarea value={editData.pruning || ""} onChange={(e) => setEditData((p) => ({ ...p, pruning: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Propagation</Label>
                      <Textarea value={editData.propagation || ""} onChange={(e) => setEditData((p) => ({ ...p, propagation: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                  </div>
                </DetailsSection>

                {/* Uses & Companions */}
                <DetailsSection title="Uses & Companions">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Uses (comma-separated)</Label>
                      <Textarea value={editData.uses || ""} onChange={(e) => setEditData((p) => ({ ...p, uses: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Medicinal Uses</Label>
                      <Textarea value={editData.medicinalUses || ""} onChange={(e) => setEditData((p) => ({ ...p, medicinalUses: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Companion Plants</Label>
                      <Textarea value={editData.companionPlants || ""} onChange={(e) => setEditData((p) => ({ ...p, companionPlants: e.target.value }))} className="mt-1" rows={2} />
                    </div>
                  </div>
                </DetailsSection>

                <div className="flex gap-2">
                  <Button onClick={() => createPlantMutation.mutate(editData)} disabled={!editData.name || !editData.price || !editData.categoryId || !editData.imageUrl}>
                    <Plus className="w-4 h-4 mr-1" /> Create Plant
                  </Button>
                  <Button variant="outline" onClick={() => { setShowAddPlant(false); setEditData({}); }}>Cancel</Button>
                </div>
              </div>
            )}

            {/* Draggable Plant List */}
            {plantsLoading ? (
              <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />)}</div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredPlants.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {filteredPlants.map((plant) => (
                      <SortablePlantRow
                        key={plant.id}
                        plant={plant}
                        categories={categories}
                        isEditing={editingId === plant.id}
                        editData={editData}
                        onStartEdit={() => handleStartEdit(plant)}
                        onCancelEdit={() => setEditingId(null)}
                        onEditChange={(field, value) => setEditData((prev) => ({ ...prev, [field]: value }))}
                        onSave={() => {
                          if (!editData.name || !editData.price || !editData.categoryId) {
                            toast.error("Name, price, and category are required");
                            return;
                          }
                          updatePlantMutation.mutate({ id: editingId!, data: editData });
                        }}
                        onDelete={() => {
                          if (confirm(`Delete "${plant.name}"?`)) deletePlantMutation.mutate(plant.id);
                        }}
                        onToggleField={handleToggleField}
                      />
                    ))}
                    {filteredPlants.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>No plants found</p>
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
</>}

          {/* ========== CATEGORIES TAB ========== */}
          {activeTab === "categories" && <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">{categories.length} categories</p>
              <Button onClick={() => setShowAddCategory(!showAddCategory)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            </div>

            {showAddCategory && (
              <div className="bg-card border-2 border-dashed border-primary/40 rounded-xl p-6 mb-6 space-y-4">
                <h3 className="font-semibold">New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Name *" value={newCategory.name} onChange={(v) => setNewCategory((p) => ({ ...p, name: v }))} />
                  <Field label="Icon (Lucide name)" value={newCategory.icon} onChange={(v) => setNewCategory((p) => ({ ...p, icon: v }))} />
                  <Field label="Description" value={newCategory.description} onChange={(v) => setNewCategory((p) => ({ ...p, description: v }))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => createCategoryMutation.mutate(newCategory)} disabled={!newCategory.name}>
                    <Plus className="w-4 h-4 mr-1" /> Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between group">
                  <div>
                    <h4 className="font-medium">{cat.name}</h4>
                    <p className="text-xs text-muted-foreground">{cat.slug} · {cat.plantCount} plants · Icon: {cat.icon}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      if (confirm(`Delete "${cat.name}"? ${cat.plantCount > 0 ? "It has " + cat.plantCount + " plants!" : ""}`))
                        deleteCategoryMutation.mutate(cat.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
</>}

          {/* ========== ORDERS TAB ========== */}
          {activeTab === "orders" && <>
            {ordersLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />)}</div>
            ) : !ordersData?.length ? (
              <div className="text-center py-16 text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm">Orders will appear here when customers check out.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersData.map((order: any) => (
                  <div key={order.id} className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-bold bg-secondary px-2 py-1 rounded">{order.orderNumber}</span>
                          <span className="font-medium">{order.customerName}</span>
                          <span className="text-sm text-muted-foreground">{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={order.orderStatus} />
                          <PayBadge method={order.paymentMethod} />
                          <PayStatusBadge status={order.paymentStatus} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <span>{order.orderItems?.length || 0} items</span>
                          <span>·</span>
                          <span>{order.city}</span>
                          <span>·</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold">NPR {order.total.toLocaleString()}</span>
                          <Select value={order.orderStatus} onValueChange={(v) => updateOrderMutation.mutate({ id: order.id, orderStatus: v })}>
                            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending"><span className="text-yellow-600">⏳ Pending</span></SelectItem>
                              <SelectItem value="confirmed"><span className="text-blue-600">✅ Confirmed</span></SelectItem>
                              <SelectItem value="shipped"><span className="text-purple-600">📦 Shipped</span></SelectItem>
                              <SelectItem value="delivered"><span className="text-green-600">✔️ Delivered</span></SelectItem>
                              <SelectItem value="cancelled"><span className="text-red-600">✖️ Cancelled</span></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {/* Order Items */}
                      {order.orderItems?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="space-y-1.5">
                            {order.orderItems.map((item: any) => (
                              <div key={item.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  {item.plant?.imageUrl && <img src={item.plant.imageUrl} alt={item.plantName || ""} className="w-6 h-6 rounded object-cover" />}
                                  <span>{item.plantName || item.plant?.name}</span>
                                  <span>×{item.quantity}</span>
                                </div>
                                <span>NPR {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
</>}

          {/* ========== SETTINGS TAB ========== */}
          {activeTab === "settings" && <>
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-muted-foreground">Edit site text content, delivery settings, and contact information.</p>
              <SettingsField label="Site Name" value={settingsDraft.siteName} onChange={(v) => setSettingsDraft((p) => ({ ...p, siteName: v }))} />
              <SettingsField label="Hero Badge" value={settingsDraft.heroBadge} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroBadge: v }))} />
              <SettingsArea label="Hero Title (use \\n for line breaks)" value={settingsDraft.heroTitle} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroTitle: v }))} rows={3} />
              <SettingsArea label="Hero Subtitle" value={settingsDraft.heroSubtitle} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroSubtitle: v }))} rows={3} />
              <Separator />
              <Separator />
              <SettingsField label="Footer Description" value={settingsDraft.footerDescription} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerDescription: v }))} />
              <SettingsField label="Footer Address" value={settingsDraft.footerAddress} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerAddress: v }))} />
              <SettingsField label="Footer Phone" value={settingsDraft.footerPhone} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerPhone: v }))} />
              <SettingsField label="Footer Email" value={settingsDraft.footerEmail} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerEmail: v }))} />
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Social Media Links (JSON)</Label>
                <p className="text-xs text-muted-foreground">Add/remove social media platforms. Set enabled=false to hide.</p>
                <Textarea
                  value={settingsDraft.socialMedia || "[]"}
                  onChange={(v) => setSettingsDraft((p) => ({ ...p, socialMedia: v }))}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder='[{"platform":"facebook","url":"https://...","enabled":true}]'
                />
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Footer Quick Links (JSON)</Label>
                <Textarea
                  value={settingsDraft.footerQuickLinks || "[]"}
                  onChange={(v) => setSettingsDraft((p) => ({ ...p, footerQuickLinks: v }))}
                  rows={5}
                  className="font-mono text-xs"
                  placeholder='[{"label":"All Plants","url":"/#plants"}]'
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Footer Customer Service Links (JSON)</Label>
                <Textarea
                  value={settingsDraft.footerCustomerService || "[]"}
                  onChange={(v) => setSettingsDraft((p) => ({ ...p, footerCustomerService: v }))}
                  rows={5}
                  className="font-mono text-xs"
                  placeholder='[{"label":"Shipping Policy","url":"/shipping"}]'
                />
              </div>
              <Separator />
              <SettingsField label="Free Delivery Threshold (NPR)" value={settingsDraft.freeDeliveryThreshold} onChange={(v) => setSettingsDraft((p) => ({ ...p, freeDeliveryThreshold: v }))} type="number" />
              <SettingsField label="Delivery Fee (NPR)" value={settingsDraft.deliveryFee} onChange={(v) => setSettingsDraft((p) => ({ ...p, deliveryFee: v }))} type="number" />
              <Button onClick={() => updateSettingsMutation.mutate(settingsDraft)} className="gap-2">
                <Save className="w-4 h-4" /> Save All Settings
              </Button>
            </div>
</>}

          {/* ========== ANALYTICS TAB ========== */}
          {activeTab === "analytics" && <AnalyticsTab />}

          {/* ========== APPEARANCE TAB ========== */}
          {activeTab === "appearance" && <>
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-muted-foreground">Edit theme colors. Use oklch() format or standard CSS colors.</p>
              <SettingsField label="Primary Color (Green)" value={settingsDraft.primaryColor} onChange={(v) => setSettingsDraft((p) => ({ ...p, primaryColor: v }))} />
              <SettingsField label="Gold Accent Color" value={settingsDraft.goldColor} onChange={(v) => setSettingsDraft((p) => ({ ...p, goldColor: v }))} />
              <div className="p-4 rounded-xl border border-border bg-secondary/20">
                <p className="text-xs text-muted-foreground mb-2">Color Preview</p>
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: settingsDraft.primaryColor || "oklch(0.32 0.12 155)" }} />
                  <div className="w-16 h-16 rounded-lg border" style={{ backgroundColor: settingsDraft.goldColor || "oklch(0.72 0.13 80)" }} />
                </div>
              </div>
              <Button onClick={() => updateSettingsMutation.mutate(settingsDraft)} className="gap-2">
                <Save className="w-4 h-4" /> Save Appearance
              </Button>
            </div>
</>}
      </div>

      {/* Change Password Dialog */}
      {showChangePassword && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowChangePassword(false); setPwError(""); }} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-[family-name:var(--font-playfair)] font-semibold text-lg mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Current Password</Label>
                <Input
                  type="password"
                  value={pwData.current}
                  onChange={(e) => { setPwData((p) => ({ ...p, current: e.target.value })); setPwError(""); }}
                  className="mt-1"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label className="text-xs">New Password (min 6 chars)</Label>
                <Input
                  type="password"
                  value={pwData.newPw}
                  onChange={(e) => { setPwData((p) => ({ ...p, newPw: e.target.value })); setPwError(""); }}
                  className="mt-1"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label className="text-xs">Confirm New Password</Label>
                <Input
                  type="password"
                  value={pwData.confirm}
                  onChange={(e) => { setPwData((p) => ({ ...p, confirm: e.target.value })); setPwError(""); }}
                  className="mt-1"
                  autoComplete="new-password"
                />
              </div>
              {pwError && (
                <p className="text-sm text-destructive flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />{pwError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => { setShowChangePassword(false); setPwError(""); }}>Cancel</Button>
                <Button
                  className="flex-1"
                  disabled={pwLoading}
                  onClick={async () => {
                    setPwError("");
                    if (!pwData.current || !pwData.newPw || !pwData.confirm) {
                      setPwError("All fields are required.");
                      return;
                    }
                    if (pwData.newPw.length < 6) {
                      setPwError("New password must be at least 6 characters.");
                      return;
                    }
                    if (pwData.newPw !== pwData.confirm) {
                      setPwError("New passwords do not match.");
                      return;
                    }
                    setPwLoading(true);
                    try {
                      const res = await fetch("/api/admin/auth", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ currentPassword: pwData.current, newPassword: pwData.newPw }),
                      });
                      const data = await res.json();
                      if (!res.ok) {
                        setPwError(data.error || "Failed to change password.");
                        return;
                      }
                      toast.success("Password changed successfully!");
                      setShowChangePassword(false);
                      setPwData({ current: "", newPw: "", confirm: "" });
                    } catch {
                      setPwError("Network error.");
                    } finally {
                      setPwLoading(false);
                    }
                  }}
                >
                  {pwLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Update</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== ANALYTICS TAB =====
function AnalyticsTab() {
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-secondary rounded-xl animate-pulse" />)}</div>
        <div className="h-64 bg-secondary rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!analytics) return <p className="text-muted-foreground">Failed to load analytics.</p>;

  const fmt = (n: number) => `NPR ${Math.round(n).toLocaleString()}`;
  const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  const maxRevenue = Math.max(...(analytics.revenueByCategory?.map((c: any) => c.paidRevenue) || [1]));

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    shipped: "bg-purple-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const paymentColors: Record<string, string> = {
    esewa: "bg-green-500",
    khalti: "bg-purple-500",
    cod: "bg-orange-500",
  };

  return (
    <div className="space-y-8">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-bold flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" /> Inventory & Revenue Analytics
        </h2>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* ===== INVENTORY OVERVIEW CARDS ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" /> Inventory Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Plants", value: analytics.inventory?.totalPlants, icon: Package, color: "text-primary" },
            { label: "Total Stock Units", value: analytics.inventory?.totalStock, icon: BoxesIcon, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Damaged Items", value: analytics.inventory?.totalDamaged, icon: ShieldAlert, color: analytics.inventory?.totalDamaged > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground" },
            { label: "Out of Stock", value: analytics.inventory?.outOfStockCount, icon: AlertCircle, color: analytics.inventory?.outOfStockCount > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground" },
            { label: "Low Stock (<10)", value: analytics.inventory?.lowStockCount, icon: AlertTriangle, color: analytics.inventory?.lowStockCount > 0 ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                {s.label === "Damaged Items" && analytics.inventory?.totalDamaged > 0 && (
                  <Badge variant="destructive" className="text-[10px]">Action</Badge>
                )}
                {s.label === "Out of Stock" && analytics.inventory?.outOfStockCount > 0 && (
                  <Badge variant="destructive" className="text-[10px]">Critical</Badge>
                )}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== STOCK HEALTH DISTRIBUTION ===== */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-primary" /> Stock Health Distribution
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Healthy (50+)", count: analytics.stockHealth?.healthy, color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
            { label: "Moderate (10-49)", count: analytics.stockHealth?.moderate, color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
            { label: "Low (1-9)", count: analytics.stockHealth?.low, color: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
            { label: "Out of Stock", count: analytics.stockHealth?.outOfStock, color: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
          ].map((s) => {
            const total = analytics.stockHealth?.total || 1;
            const percentage = pct(s.count || 0, total);
            return (
              <div key={s.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={s.textColor}>{s.label}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground text-right">{percentage}% of inventory</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== REVENUE OVERVIEW CARDS ===== */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5" /> Revenue Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Revenue", value: fmt(analytics.revenue?.total || 0), icon: DollarSign, color: "text-primary" },
            { label: "Paid Revenue", value: fmt(analytics.revenue?.paid || 0), icon: TrendingUp, color: "text-green-600 dark:text-green-400" },
            { label: "Pending Revenue", value: fmt(analytics.revenue?.pending || 0), icon: Clock, color: "text-yellow-600 dark:text-yellow-400" },
            { label: "Avg Order Value", value: fmt(analytics.revenue?.avgOrderValue || 0), icon: BarChart3, color: "text-blue-600 dark:text-blue-400" },
            { label: "Total Orders", value: analytics.revenue?.totalOrders || 0, icon: ShoppingCart, color: "text-purple-600 dark:text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ORDER STATUS & PAYMENT BREAKDOWN ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
            <Hash className="w-4 h-4 text-primary" /> Orders by Status
          </h3>
          <div className="space-y-3">
            {(analytics.statusBreakdown || []).map((s: any) => {
              const total = analytics.revenue?.totalOrders || 1;
              const percentage = pct(s.count, total);
              return (
                <div key={s.status} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${statusColors[s.status] || "bg-gray-400"}`} />
                  <span className="text-sm capitalize w-24 truncate">{s.status}</span>
                  <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statusColors[s.status] || "bg-gray-400"} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{s.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
                </div>
              );
            })}
            {(!analytics.statusBreakdown || analytics.statusBreakdown.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-primary" /> Payment Methods
          </h3>
          <div className="space-y-3">
            {(analytics.paymentBreakdown || []).map((pm: any) => {
              const total = analytics.revenue?.totalOrders || 1;
              const percentage = pct(pm.count, total);
              return (
                <div key={pm.method} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${paymentColors[pm.method] || "bg-gray-400"}`} />
                  <span className="text-sm uppercase w-24 truncate">{pm.method}</span>
                  <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${paymentColors[pm.method] || "bg-gray-400"} transition-all duration-500`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{pm.count}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{percentage}%</span>
                </div>
              );
            })}
            {(!analytics.paymentBreakdown || analytics.paymentBreakdown.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ===== REVENUE BY CATEGORY BARS ===== */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
          <TrendingUpIcon className="w-4 h-4 text-primary" /> Revenue by Category
        </h3>
        {(analytics.revenueByCategory || []).length > 0 ? (
          <div className="space-y-3">
            {analytics.revenueByCategory.map((cat: any) => (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted-foreground w-28 truncate" title={cat.name}>{cat.name}</span>
                <div className="flex-1 h-7 bg-secondary rounded-lg overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((cat.paidRevenue / maxRevenue) * 100, 2)}%` }}
                  >
                    {cat.paidRevenue > 0 && (
                      <span className="text-[10px] font-semibold text-primary-foreground">{fmt(cat.paidRevenue)}</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground w-20 text-right shrink-0">{cat.totalSold} sold</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No sales data yet</p>
        )}
      </div>

      {/* ===== DETAILED CATEGORY TABLE ===== */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-primary" /> Category Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Category</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Plants</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">In Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Out</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Stock</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Damaged</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Sold</th>
                <th className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(analytics.categories || []).map((cat: any) => (
                <tr key={cat.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-right">{cat.plantCount}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cat.inStockCount < cat.plantCount ? "text-orange-600 dark:text-orange-400" : ""}>{cat.inStockCount}</span>
                    {cat.inStockCount < cat.plantCount && <span className="text-muted-foreground">/{cat.plantCount}</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cat.outOfStockCount > 0 ? "text-red-600 dark:text-red-400 font-semibold" : ""}>{cat.outOfStockCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{cat.totalStock}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={cat.totalDamaged > 0 ? "text-red-600 dark:text-red-400 font-semibold" : ""}>{cat.totalDamaged}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{cat.totalSold}</td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600 dark:text-green-400">{fmt(cat.paidRevenue)}</td>
                </tr>
              ))}
              {(!analytics.categories || analytics.categories.length === 0) && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No categories yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== TOP SELLING PLANTS ===== */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" /> Top Selling Plants
          </h3>
        </div>
        <div className="divide-y divide-border/50">
          {(analytics.topSellingPlants || []).filter((p: any) => p.totalSold > 0).length > 0 ? (
            analytics.topSellingPlants.filter((p: any) => p.totalSold > 0).map((plant: any, idx: number) => (
              <div key={plant.id} className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/10 transition-colors">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  idx === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" :
                  idx === 1 ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" :
                  idx === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300" :
                  "bg-secondary text-muted-foreground"
                }`}>{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{plant.name}</p>
                  <p className="text-xs text-muted-foreground">{plant.category} · NPR {plant.price}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{plant.totalSold} sold</p>
                  <p className="text-xs text-green-600 dark:text-green-400">{fmt(plant.revenue)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-muted-foreground">No sales data yet. Orders will appear here once customers make purchases.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-300",
  };
  return <Badge variant="outline" className={`text-[10px] border ${colors[status] || ""}`}>{status}</Badge>;
}

function PayBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    esewa: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
    khalti: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
    cod: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colors[method] || "bg-secondary"}`}>{method.toUpperCase()}</span>;
}

function PayStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "text-yellow-600",
    paid: "text-green-600",
    failed: "text-red-600",
  };
  return <span className={`text-[10px] font-medium ${colors[status] || ""}`}>{status}</span>;
}

// ===== IMAGE UPLOADER COMPONENT =====
function ImageUploader({
  currentImageUrl,
  currentGalleryImages,
  onMainImageChange,
  onGalleryChange,
}: {
  currentImageUrl: string;
  currentGalleryImages?: string;
  onMainImageChange: (url: string) => void;
  onGalleryChange: (urls: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const parseGallery = (val?: string): string[] => {
    if (!val) return [];
    try { return JSON.parse(val); } catch { return val.split(',').map(s => s.trim()).filter(Boolean); }
  };

  const preview = currentImageUrl;
  const galleryPreviews = parseGallery(currentGalleryImages);

  const allImages = preview ? [preview, ...galleryPreviews.filter(g => g !== preview)] : [...galleryPreviews];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = 10 - allImages.length;
    if (remaining <= 0) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    const fileArr = Array.from(files).slice(0, remaining);
    const formData = new FormData();
    fileArr.forEach(f => formData.append('files', f));

    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Upload failed'); return; }

      const newUrls = data.urls as string[];
      if (!preview && newUrls.length > 0) {
        onMainImageChange(newUrls[0]);
        const rest = newUrls.slice(1);
        const updatedGallery = [...galleryPreviews, ...rest];
        onGalleryChange(JSON.stringify(updatedGallery));
      } else {
        const updatedGallery = [...galleryPreviews, ...newUrls];
        onGalleryChange(JSON.stringify(updatedGallery));
      }
      toast.success(`${newUrls.length} image(s) uploaded`);
    } catch {
      toast.error('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeImage = async (url: string) => {
    try { await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) }); } catch {}

    if (url === preview) {
      if (galleryPreviews.length > 0) {
        const newMain = galleryPreviews[0];
        const remaining = galleryPreviews.slice(1);
        onMainImageChange(newMain);
        onGalleryChange(JSON.stringify(remaining));
      } else {
        onMainImageChange('');
      }
    } else {
      const updated = galleryPreviews.filter(g => g !== url);
      onGalleryChange(JSON.stringify(updated));
    }
  };

  const setAsMain = (url: string) => {
    const others = galleryPreviews.filter(g => g !== url);
    onMainImageChange(url);
    onGalleryChange(JSON.stringify(others));
  };

  const handleUrlInput = () => {
    const url = prompt('Enter image URL:');
    if (!url) return;
    if (!preview) {
      onMainImageChange(url);
    } else {
      const updated = [...galleryPreviews, url];
      onGalleryChange(JSON.stringify(updated));
    }
  };

  return (
    <div className="mt-1.5 space-y-3">
      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-secondary/30">
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded">MAIN</span>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {i !== 0 && (
                  <button
                    onClick={() => setAsMain(url)}
                    className="w-7 h-7 rounded-full bg-white/90 hover:bg-white flex items-center justify-center"
                    title="Set as main image"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-800" />
                  </button>
                )}
                <button
                  onClick={() => removeImage(url)}
                  className="w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex items-center gap-2">
        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          {uploading ? 'Uploading...' : `Upload Images (${10 - allImages.length} left)`}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={handleUrlInput}>
          <ExternalLink className="w-3 h-3 mr-1" /> Add URL
        </Button>
      </div>
    </div>
  );
}

function SettingsField({ label, value, onChange, type = "text" }: { label: string; value?: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5" />
    </div>
  );
}

function SettingsArea({ label, value, onChange, rows = 3 }: { label: string; value?: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <Textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="mt-1.5" rows={rows} />
    </div>
  );
}