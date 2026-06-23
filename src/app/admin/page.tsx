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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeTab, setActiveTab] = useState("plants");
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="plants" className="gap-2"><Package className="w-4 h-4" /> Plants</TabsTrigger>
            <TabsTrigger value="categories" className="gap-2"><Tag className="w-4 h-4" /> Categories</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" /> Site Settings</TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2"><Eye className="w-4 h-4" /> Appearance</TabsTrigger>
          </TabsList>

          {/* ========== PLANTS TAB ========== */}
          <TabsContent value="plants">
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
              <Button onClick={() => setShowAddPlant(!showAddPlant)} className="gap-2">
                <Plus className="w-4 h-4" /> Add Plant
              </Button>
            </div>

            {/* Add Plant Form */}
            {showAddPlant && (
              <div className="bg-card border-2 border-dashed border-primary/40 rounded-xl p-6 mb-6 space-y-4">
                <h3 className="font-semibold">New Plant</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Field label="Name *" value={editData.name} onChange={(v) => setEditData((p) => ({ ...p, name: v }))} />
                  <Field label="Price (NPR) *" value={editData.price?.toString()} onChange={(v) => setEditData((p) => ({ ...p, price: parseFloat(v) || 0 }))} />
                  <div>
                    <Label className="text-xs">Category *</Label>
                    <Select value={editData.categoryId} onValueChange={(v) => setEditData((p) => ({ ...p, categoryId: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <Field label="Image URL *" value={editData.imageUrl} onChange={(v) => setEditData((p) => ({ ...p, imageUrl: v }))} placeholder="https://picsum.photos/seed/myplant/600/400" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Short Description" value={editData.shortDesc} onChange={(v) => setEditData((p) => ({ ...p, shortDesc: v }))} />
                  <Field label="Climate" value={editData.climate} onChange={(v) => setEditData((p) => ({ ...p, climate: v }))} />
                  <Field label="Difficulty" value={editData.difficulty} onChange={(v) => setEditData((p) => ({ ...p, difficulty: v }))} />
                </div>
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
          </TabsContent>

          {/* ========== CATEGORIES TAB ========== */}
          <TabsContent value="categories">
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
          </TabsContent>

          {/* ========== SETTINGS TAB ========== */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <p className="text-sm text-muted-foreground">Edit site text content, delivery settings, and contact information.</p>
              <SettingsField label="Site Name" value={settingsDraft.siteName} onChange={(v) => setSettingsDraft((p) => ({ ...p, siteName: v }))} />
              <SettingsField label="Hero Badge" value={settingsDraft.heroBadge} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroBadge: v }))} />
              <SettingsArea label="Hero Title (use \\n for line breaks)" value={settingsDraft.heroTitle} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroTitle: v }))} rows={3} />
              <SettingsArea label="Hero Subtitle" value={settingsDraft.heroSubtitle} onChange={(v) => setSettingsDraft((p) => ({ ...p, heroSubtitle: v }))} rows={3} />
              <Separator />
              <SettingsField label="Footer Description" value={settingsDraft.footerDescription} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerDescription: v }))} />
              <SettingsField label="Footer Address" value={settingsDraft.footerAddress} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerAddress: v }))} />
              <SettingsField label="Footer Phone" value={settingsDraft.footerPhone} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerPhone: v }))} />
              <SettingsField label="Footer Email" value={settingsDraft.footerEmail} onChange={(v) => setSettingsDraft((p) => ({ ...p, footerEmail: v }))} />
              <Separator />
              <SettingsField label="Free Delivery Threshold (NPR)" value={settingsDraft.freeDeliveryThreshold} onChange={(v) => setSettingsDraft((p) => ({ ...p, freeDeliveryThreshold: v }))} type="number" />
              <SettingsField label="Delivery Fee (NPR)" value={settingsDraft.deliveryFee} onChange={(v) => setSettingsDraft((p) => ({ ...p, deliveryFee: v }))} type="number" />
              <Button onClick={() => updateSettingsMutation.mutate(settingsDraft)} className="gap-2">
                <Save className="w-4 h-4" /> Save All Settings
              </Button>
            </div>
          </TabsContent>

          {/* ========== APPEARANCE TAB ========== */}
          <TabsContent value="appearance">
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
          </TabsContent>
        </Tabs>
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