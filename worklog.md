# Worklog

## Task 6 — Backend API Routes

**Date:** 2025-06-23

### Files Created
- `src/app/api/categories/route.ts` — GET all categories (ordered by `order`, includes plant count)
- `src/app/api/plants/route.ts` — GET plants with filters (`category`, `search`, `featured`, `inStock`, `climate`, `indoor`) and sorting (`price_asc`, `price_desc`, `name`, `newest`)
- `src/app/api/plants/[id]/route.ts` — GET single plant by ID with category relation
- `src/app/api/cart/route.ts` — Full CRUD: GET (by sessionId), POST (add/upsert item), PUT (update quantity), DELETE (remove by id or clear all by sessionId)
- `src/app/api/orders/route.ts` — GET (by email), POST (create order from cart with transaction — calculates delivery fee, generates order number, clears cart)

### Key Design Decisions
- All routes use `db` from `@/lib/db` (Prisma SQLite)
- Input validation on required fields with proper 400/404/500 status codes
- Cart POST uses upsert logic: if the same plant+session exists, quantity is incremented
- Cart PUT with `quantity: 0` removes the item
- Order creation uses `db.$transaction` to atomically create the order + order items and clear the cart
- Delivery fee: 150 (subtotal ≤ 2000) or 0 (subtotal > 2000)
- Order number format: `GH-{timestamp}`
- No existing files were modified

## Task 7 — Database Seeding

**Date:** 2025-06-23

### File Created
- `prisma/seed.ts` — Comprehensive seed script for GreenHaven Nursery

### What Was Seeded
- **8 Categories:** Flowering Plants, Indoor Plants, Herbs & Spices, Vegetables, Fruit Plants, Succulents & Cacti, Trees & Shrubs, Medicinal Plants (each with Lucide icon, slug, description, and sort order)
- **24 Plants** with full rich detail across all schema fields:
  - **Flowering (7):** Rose, Jasmine, Orchid (national flower), Hibiscus, Bougainvillea, Lavender, Amaryllis
  - **Indoor (5):** Peace Lily, Snake Plant, Money Plant, Rubber Plant, Areca Palm
  - **Herbs & Spices (5):** Tulsi, Mint, Lemongrass, Turmeric, Coriander
  - **Vegetables (2):** Tomato, Chili
  - **Fruit Plants (2):** Mango, Lemon
  - **Succulents (2):** Aloe Vera, Jade Plant
  - **Trees & Shrubs (1):** Neem
- **8 featured plants** (Rose, Jasmine, Orchid, Peace Lily, Snake Plant, Money Plant, Tulsi, Aloe Vera)
- **Price range:** NPR 100 (Coriander) – NPR 2,500 (Mango)
- **9 plants with originalPrice** (discounts shown)
- All plants include: growing info (climate, elevation, season, sunlight, water, soil, temp, humidity), care details (nutrients, fertilizer, pruning, propagation, companions), uses/medicinal info, and metadata (stock, ratings, tags, boolean flags)
- Images use `picsum.photos/seed/{name}/600/400`

### Key Details
- Script clears all existing data in correct dependency order before seeding
- Run command: `bunx tsx prisma/seed.ts`
- Seed completed successfully with 0 errors
---
Task ID: 9
Agent: Main Agent
Task: Browser verification, bug fixes, and final polish

Work Log:
- Fixed API response format mismatch: /api/plants, /api/categories, /api/plants/[id] now return wrapped objects ({plants:[]}, {categories:[]}, {plant:{}}) matching frontend expectations
- Fixed lint error: Added missing `motion` import in CheckoutDialog.tsx
- Fixed lint error: Replaced `useEffect(() => setMounted(true))` with `useSyncExternalStore` in Navbar.tsx
- Fixed plant card click: Moved onClick from inner Card to outer motion.div wrapper for reliable event handling
- Removed unused `List` import from PlantGrid.tsx
- Fixed Card component default padding conflict (py-0 gap-0 override)
- All lint checks pass clean
- Browser verification confirmed:
  - Page loads with premium green/gold theme, Playfair Display + Lora fonts
  - Navbar: GreenHaven logo, 9 nav links, search, dark mode toggle, cart with badge
  - Hero: "Bring Nature Home With Every Plant" with CTA buttons and 4 feature cards
  - Categories: 8 categories with correct plant counts (7,5,5,2,2,2,1,0)
  - Plant Grid: 24 plants with images, discounts, difficulty badges, climate/sunlight/water info, prices
  - Trust Section: Climate Matched, Nutrition Guidance, Safe Delivery, Easy Payments
  - Footer: Brand info, Quick Links, Customer Service, Contact, Payment Partners (eSewa/Khalti/COD)
- API verified: /api/categories (8), /api/plants (24), /api/plants/[id] all returning correct data

Stage Summary:
- Full nursery website complete with premium design, 24 plants, 8 categories
- All features working: category filtering, search, sort, cart, checkout with eSewa/Khalti/COD
- Plant detail dialog with 3 tabs: Growing Guide, Nutrition & Care, All Details
- Zero lint errors
---
Task ID: a2
Agent: fullstack-dev
Task: Build admin API routes

Work Log:
- Created 6 admin API route files under `src/app/api/admin/`
- **`admin/plants/route.ts`** — POST creates plant with auto-slug from name, displayOrder from count; PUT bulk-reorders via `{ orders: [{id, displayOrder}] }` with `Promise.all`
- **`admin/plants/[id]/route.ts`** — PUT partial-update (any subset of Plant fields); DELETE removes plant by ID
- **`admin/categories/route.ts`** — POST creates category with auto-slug; PUT bulk-reorders via `{ orders: [{id, order}] }`
- **`admin/categories/[id]/route.ts`** — PUT partial-update; DELETE with guard — returns 400 if category has linked plants
- **`admin/settings/route.ts`** — GET returns all SiteSettings as flat object, auto-seeds 13 default settings on first call; PUT upserts each key-value pair with `Promise.all`, returns updated flat object
- **`admin/stats/route.ts`** — GET returns `{ plants, categories, orders, revenue }` using parallel `count`/`aggregate` queries
- All routes use Next.js Route Handlers, `db` from `@/lib/db`, JSON responses with proper status codes (201/400/404/409/500)
- No existing files were modified
- TypeScript compiles clean (zero errors in admin routes)
