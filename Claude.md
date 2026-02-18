# Flight Sim Setups — Project Documentation

> Complete reference for architecture, data flow, and implementation.

---

## Project Overview

**Goal:** Affiliate site for flight sim pilots to discover desk setups and components (HOTAS, throttles, joysticks, pedals, panels, mounts) for MSFS 2020/2024 and X-Plane 11/12.

**Monetization:** Affiliate links (Amazon, Winwing, Thrustmaster, 2Performant, Impact)

**Legal Entity:** Pilot Setups | contact@pilotsetup.com | Romania

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS + CSS variables |
| Database | Supabase (PostgreSQL) |
| Icons | lucide-react |
| Animations | lottie-react |
| Build | Create React App (webpack) |
| Fonts | Inter (sans) + JetBrains Mono (mono) via Google Fonts |

**Key Dependencies** (from `package.json`):
- `@supabase/supabase-js` ^2.96.0
- `react` ^19.2.0 / `react-dom` ^19.2.0
- `react-router-dom` ^6.28.0
- `lucide-react` ^0.545.0
- `lottie-react` ^2.4.1
- `typescript` ^4.9.5

---

## Commands

```bash
npm start      # Dev server (localhost:3000)
npm test       # Run unit tests
npm run build  # Production build
```

**Environment Variables** (`.env`):
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

---

## File Structure

```
src/
├── App.tsx                          # Router + DataProvider wrapper + routes
├── App.css                          # Legacy CRA styles (mostly unused)
├── index.tsx                        # Entry point
├── index.css                        # Global styles, CSS variables, light mode overrides
├── react-app-env.d.ts
├── reportWebVitals.ts
├── setupTests.ts
│
├── components/
│   ├── AffiliateDisclosure.tsx      # Amber affiliate banner (dismissible, localStorage)
│   ├── AffiliateDropdown.tsx        # Per-program dropdown with region flags
│   ├── AirplaneAnimation.tsx        # Lottie airplane animation (Setups page)
│   ├── CategoryIcon.tsx             # SVG icons for categories/tiers/roles
│   ├── CookieBanner.tsx             # GDPR 3-category consent banner
│   ├── CustomDropdown.tsx           # Reusable dropdown (single/multi, groups, keyboard nav)
│   ├── Footer.tsx                   # 3-column footer with legal links + cookie settings
│   ├── HeaderNav.tsx                # Global nav, search system, theme toggle, hamburger
│   ├── HeroDesk.tsx                 # Desktop hero section with plane animation
│   ├── HeroImageCarousel.tsx        # Hero image carousel component
│   ├── HeroPlanes.tsx               # CSS motion-path plane animation (6 planes)
│   ├── LegalPageLayout.tsx          # Shared layout for legal pages (TOC + content)
│   ├── Lightbox.tsx                 # Image viewer (zoom 1-5x, pan, click-drag)
│   ├── Modal.tsx                    # Product detail modal (URL state, focus trap, portal)
│   ├── PageBackground.tsx           # Theme-aware background image (used by all pages)
│   ├── ProductAvatar.tsx            # Product thumbnail/avatar component
│   ├── ProductCard.tsx              # Product card (badges, hover overlay, affiliate buttons)
│   └── carousel/
│       └── InfiniteCarousel.tsx     # Infinite scrolling carousel (rAF, drag, responsive)
│
├── config/
│   └── compliance.ts                # Legal config (site info, cookie categories, disclosures)
│
├── hooks/
│   ├── useClickOutside.ts           # Detect clicks outside element refs
│   ├── useFocusTrap.ts              # Tab/Shift+Tab focus trap for modals
│   ├── useRafMarquee.ts             # rAF-based carousel animation engine
│   ├── useReducedMotion.ts          # Detect prefers-reduced-motion
│   ├── useThemeMode.ts              # Track dark/light mode via MutationObserver
│   └── __tests__/
│       └── useRafMarquee.test.ts
│
├── lib/
│   ├── DataProvider.tsx             # Supabase data fetching + React Context provider
│   ├── aircraft.ts                  # AircraftPreset type, cache, getters
│   ├── category-config.ts           # Category badge colors (static Tailwind map)
│   ├── consent.ts                   # Consent manager (GDPR, analytics, affiliate)
│   ├── products.ts                  # Product type, cache, search, getters
│   ├── setup-filters.ts             # Setup wizard helpers (auto-select, tier options)
│   ├── setups.ts                    # SetupData type, cache, getters
│   ├── suggestions.ts               # PRNG suggestion engine + category equivalences
│   ├── supabaseClient.ts            # Supabase client initialization
│   ├── tier-config.ts               # Tier visual styling (static Tailwind map)
│   └── __tests__/
│       ├── products.test.ts
│       └── suggestions.test.ts
│
├── pages/
│   ├── AboutUs.tsx                  # About page with TOC, JSON-LD structured data
│   ├── CompleteSetup.tsx            # 4-step setup wizard with suggestion engine
│   ├── Home.tsx                     # Hero + featured products carousel
│   ├── Products.tsx                 # Product grid with category + role filters
│   ├── Setups.tsx                   # Pre-configured aircraft bundles (tiered)
│   ├── __tests__/
│   │   └── CompleteSetup.test.tsx
│   └── legal/
│       ├── CookiePolicy.tsx
│       ├── PrivacyPolicy.tsx
│       └── Terms.tsx
│
└── sections/
    └── home/
        └── FeaturedProductsCarousel.tsx  # Home page carousel section
```

---

## Routing

Defined in `App.tsx`. All routes wrapped in `<DataProvider>`:

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Hero + featured carousel |
| `/products` | `Products` | Product grid with filters |
| `/setups` | `Setups` | Pre-built aircraft bundles |
| `/complete-setup` | `CompleteSetup` | 4-step setup wizard |
| `/about` | `AboutUs` | About page with TOC |
| `/legal/terms` | `Terms` | Terms of service |
| `/legal/privacy` | `PrivacyPolicy` | Privacy policy |
| `/legal/cookies` | `CookiePolicy` | Cookie policy |

**Global Layout:** AffiliateDisclosure → CookieBanner → HeaderNav → Routes → Footer

---

## Data Architecture

### Flow: Supabase → DataProvider → Module Caches → Components

```
Supabase PostgreSQL
        ↓  (13 parallel queries on mount)
DataProvider.tsx
        ↓  (maps snake_case → camelCase, reconstructs nested structures)
   ┌────┼────────────────┬──────────────────┐
   ↓    ↓                ↓                  ↓
Module Caches        React Context       Reference Tables
(products.ts)        (useData() hook)    (tiers, categories,
(aircraft.ts)                             brands, families,
(setups.ts)                               affiliatePrograms,
(suggestions.ts)                          roleTypes)
```

### DataProvider (`src/lib/DataProvider.tsx`)

Fetches all 13 tables via `Promise.all` on mount. No per-page API calls — data refreshes only on page reload.

**Context shape** (via `useData()` hook):
```typescript
interface DataContextType {
  products: Product[];
  aircraftPresets: AircraftPreset[];
  setups: SetupData[];
  tiers: TierRef[];           // { name, label, sort_order }
  categories: CategoryRef[];   // { name, sort_order }
  brands: BrandRef[];          // { name, sort_order }
  aircraftFamilies: AircraftFamilyRef[];  // { name, label, sort_order }
  affiliatePrograms: AffiliateProgramRef[];  // { name, label, sort_order, regions }
  roleTypes: RoleTypeRef[];    // { name, sort_order }
  isLoading: boolean;
}
```

**Module-level caches** are populated before children render:
- `setProductsCache(products)` → `products.ts`
- `setAircraftCache(aircraftPresets)` → `aircraft.ts`
- `setSetupsCache(setups)` → `setups.ts`
- `setCategoryEquivalenceCache(equivalences)` → `suggestions.ts`

---

## Database Tables

### Lookup Tables (Primary Keys)

| Table | PK | Columns | Notes |
|-------|----|---------|-------|
| `brands` | `name` | name, sort_order | Thrustmaster, Logitech, WingFlex, etc. |
| `categories` | `name` | name, sort_order | HOTAS, Throttle, Joystick, Pedals, Panel, Bundle, MCDU, Rudder, Base, Accessories |
| `tiers` | `name` | name, label, sort_order | First/Business/Economy with display labels |
| `aircraft_families` | `name` | name, label, sort_order | airbus-a32f, boeing-737, f16-viper, fa18-hornet, general |
| `role_types` | `name` | name, sort_order | Pilot (0), Copilot (1), Universal (2) |
| `affiliate_programs` | `name` | name, label, sort_order, regions (jsonb) | amazon, thrustmaster, winwing, etc. |

### Core Tables

**`products`** — Main product catalog
| Column | Type | FK |
|--------|------|-----|
| id | uuid (PK) | |
| brand | text | → brands.name |
| name | text | |
| slug | text (unique) | |
| category | text | → categories.name |
| role_type | text | → role_types.name |
| tier | text | → tiers.name |
| aircraft_family | text | → aircraft_families.name |
| sim_support | text[] | enum: MSFS2020, MSFS2024, XPL11, XPL12 |
| price_label | text | |
| images | text[] | |
| affiliate_urls | jsonb | `{program: {region: url}}` |
| description | text | |
| key_specs | jsonb | |
| source_url | text | |

**`aircraft_presets`** — Aircraft configurations for CompleteSetup wizard
| Column | Type |
|--------|------|
| id | text (PK) | e.g., "airbus-a32f", "f16-viper" |
| name | text |
| slug | text |
| notes | text |

**`setups`** — Pre-built aircraft bundles for Setups page
| Column | Type | FK |
|--------|------|-----|
| id | uuid (PK) | |
| aircraft | text (unique) | Display name |
| description | text | |
| family | text | → aircraft_families.name |
| sort_order | integer | |

### Bridge Tables

**`setup_products`** — Links products to setups per tier
| Column | FK |
|--------|-----|
| setup_id | → setups.id |
| tier | → tiers.name |
| product_id | → products.id |
| sort_order | |

**`aircraft_tier_needs`** — Hardware needs per aircraft/tier
| Column | FK |
|--------|-----|
| aircraft_id | → aircraft_presets.id |
| tier | → tiers.name |
| category | → categories.name |
| count | integer |

**`aircraft_preferred_products`** — Curated suggestions per aircraft/tier
| Column | FK |
|--------|-----|
| aircraft_id | → aircraft_presets.id |
| tier | → tiers.name |
| product_slug | text |
| sort_order | |

**`category_equivalences`** — Category substitution rules
| Column | FK |
|--------|-----|
| source_category | → categories.name |
| satisfies_category | → categories.name |

Current rules:
- HOTAS → satisfies Joystick, Throttle, HOTAS
- Pedals ↔ Rudder (bidirectional)

---

## Data Model

### Product (from `src/lib/products.ts`)

```typescript
type Product = {
  id: string;
  brand: string;
  name: string;
  slug: string;
  category: string;
  roleType: string;          // 'Pilot' | 'Copilot' | 'Universal'
  sim_support: string[];     // ['MSFS2020', 'MSFS2024', 'XPL11', 'XPL12']
  tier?: string;             // 'First' | 'Business' | 'Economy'
  aircraftFamily?: string;   // 'airbus-a32f' | 'general' | etc.
  price_label?: string;
  images: string[];
  affiliate_urls: Record<string, Record<string, string>>;  // {program: {region: url}}
  description: string;
  key_specs?: Record<string, string | number>;
  source_url?: string;
};
```

### Other Types

```typescript
// aircraft.ts
interface AircraftPreset {
  id: string; name: string; slug: string; notes?: string;
  tiers: Record<string, TierPreset>;
}
interface TierPreset { needs: CategoryNeed[]; preferredProducts?: string[]; }
interface CategoryNeed { category: string; count: number; }

// setups.ts
interface SetupData {
  aircraft: string; description: string; family: string;
  sort_order: number; tiers: Record<string, string[]>;  // tier → product IDs
}
```

---

## Pages

### Home (`src/pages/Home.tsx`)
- `PageBackground` (theme-aware background image)
- `HeroDesk` (hero section with `HeroPlanes` animation — 6 planes on CSS motion path)
- `FeaturedProductsCarousel` (infinite carousel of featured products)

### Products (`src/pages/Products.tsx`)

**Layout:**
```
┌──────────────────────┬──────────────────────┐
│  Select Flight Gear  │     Your Role        │
│  [multi-select]      │  [single-select]     │
└──────────────────────┴──────────────────────┘
        (2-column grid: md:grid-cols-2)

┌──────────────────────┬──────────────────────┐
│   Product Card       │   Product Card       │  (2-col grid)
│   Product Card       │   Product Card       │
└──────────────────────┴──────────────────────┘
```

**Filters:**
- **Category** (multi-select): Built from DB `categories` table. OR logic. Shows product counts per category.
- **Role** (single-select): "All Roles", "Pilot", "Copilot". Counts update based on category selection.

**Filtering logic:**
```typescript
const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);
const matchesRole = selectedRole === 'All' || p.roleType === selectedRole || p.roleType === 'Universal';
```

**URL Integration:**
- `?q=searchterm` — finds product by name, scrolls to it
- `?highlight=slug` — highlights product by slug
- 5-second pulse animation on matched product

**State:** No localStorage persistence.

### Setups (`src/pages/Setups.tsx`)

**Layout (Dark Mode):**
```
┌──────────────────────┬──────────────────────┐
│ Choose Aircraft Model│   Equipment Tier     │  (row 1: 2-col grid)
├──────────────────────┼──────────────────────┤
│     Your Role        │  AirplaneAnimation   │  (row 2: 2-col grid)
└──────────────────────┴──────────────────────┘
```

**Layout (Light Mode):**
```
┌──────────────────────┬──────────────────────┐
│ Choose Aircraft Model│   Equipment Tier     │  (row 1: 2-col grid)
├──────────────────────┴──────────────────────┤
│      Your Role (centered, half-width)       │  (row 2: centered)
└─────────────────────────────────────────────┘
```

**Dropdowns:**
1. **Aircraft** — grouped by `aircraft_families` labels
2. **Equipment Tier** — "All Tiers" + First/Business/Economy
3. **Your Role** — "All Roles" + Pilot/Copilot

**Product Display:**
- "All Tiers": shows all tier sections with colored headers (amber/blue/emerald)
- Single tier: shows only that tier section
- Products filtered by role (Universal always included)

**localStorage Persistence:**
- `setups_selectedAircraft`, `setups_selectedTier`, `setups_selectedRole`
- Tier and role reset to "All" when aircraft changes

### CompleteSetup (`src/pages/CompleteSetup.tsx`)

**4-Step Wizard:**
```
1. Add your current gear        (search + chips)
2. Choose your aircraft family   (dropdown, disabled until step 1)
3. Choose your role              (dropdown, disabled until step 1)
4. Select class tier (budget)    (dropdown, disabled until step 1)
   [Generate button]
```

**Step 1 — Gear Search:**
- Real-time product search using `searchProducts()` with progressive prefix matching
- Family filter applied based on selected aircraft
- Role filter applied if role selected (shows matching + Universal)
- Added products shown as removable chips

**Steps 2-4 — Auto-Selection:**
- When first product added:
  - Aircraft: filters to families containing that product, auto-selects if only 1 match
  - Role: auto-selects if product has specific roleType (Pilot/Copilot), not Universal
  - Tier: auto-selects based on product's tier tag, defaults to Business
- Shows "(Auto-selected)" green badge when auto-selected
- All reset when last product removed

**Generate Button:**
- Disabled until aircraft is selected
- Calls `generateSuggestions()` with PRNG engine

**Results:**
- Owned gear shown with "Owned" badge
- Suggestions shown with lock/dice buttons
- Lock: freezes suggestion across shuffles
- Dice: replaces single suggestion with next candidate
- "Shuffle All": replaces all unlocked suggestions
- "Clear Results": resets everything

### AboutUs (`src/pages/AboutUs.tsx`)
- Table of contents with scroll-aware section highlighting
- JSON-LD structured data for SEO
- Sections: Mission, What We Do, Independence, More Sites

### Legal Pages (`src/pages/legal/`)
- **Terms.tsx** — 10 sections (acceptance, not a retailer, content accuracy, affiliate, liability, etc.)
- **PrivacyPolicy.tsx** — 5 sections (data collected, usage, GDPR rights, third parties, contact)
- **CookiePolicy.tsx** — Cookie categories from `compliance.ts` config (necessary, analytics, affiliate)

---

## Key Components

### ProductCard (`src/components/ProductCard.tsx`)
- **Props:** `product: Product`, `context: 'hover' | 'modal' | 'grid'`, `fromCarousel?: boolean`
- Category-colored badges (10 categories with gradient Tailwind classes)
- Hover overlay with affiliate buttons
- Opens `Modal` for details → `Lightbox` for images
- `AffiliateDropdown` per program with region flags

### CustomDropdown (`src/components/CustomDropdown.tsx`)
- **Props:** `id, value, onChange, options, multiSelect?, disabled?, placeholder?`
- Single-select or multi-select modes
- Option groups (via `group` field), dividers, disabled options
- Full keyboard navigation (arrow keys, Enter, Escape, type-to-search)
- Theme-aware via CSS variables (`--dropdown-*`)
- `CategoryIcon` integration for option icons

### Modal (`src/components/Modal.tsx`)
- React Portal to `document.body` (z-50)
- URL-based state (`?modal=slug`)
- Focus trap via `useFocusTrap` hook
- Body scroll lock (calculates scrollbar width)
- ESC/overlay close with focus return
- Affiliate dropdown auto-scroll (250ms delay for animation)

### Lightbox (`src/components/Lightbox.tsx`)
- Portal above modal (z-60)
- Zoom: 1x–5x via buttons, mouse wheel, or keyboard (+/-/0)
- Pan: click-drag when zoomed, arrow keys (50px steps)
- Viewport: 92vw × 92vh

### InfiniteCarousel (`src/components/carousel/InfiniteCarousel.tsx`)
- `useRafMarquee` hook for animation (70px/s autoplay)
- Triple slide array (original + 2 clones) for seamless loop
- Drag/touch support with snap-to-card on release
- Keyboard (←/→) and arrow button navigation (exact 1-item)
- Responsive: 1 (mobile) → 1.25 (sm) → 2 (lg) → 3 (xl) slides visible
- Pauses on hover/blur, IntersectionObserver, Visibility API
- GPU-accelerated `translate3d`, `contain: layout paint size style`

### HeroPlanes (`src/components/HeroPlanes.tsx`)
- 6 planes on semi-oval CSS motion path
- 24s linear loop, staggered 4s apart
- Low opacity (0.35–0.4), small size (22–32px)
- IntersectionObserver pauses when off-screen
- Static fallback for `prefers-reduced-motion`
- Light mode: black planes. Dark mode: white planes.

### HeaderNav (`src/components/HeaderNav.tsx`)
- Global search with autosuggest (progressive prefix matching)
- Keyboard navigation (↑/↓/Enter/Esc) in search dropdown
- Theme toggle (dark/light) with localStorage persistence
- Mobile hamburger menu
- Navigation links: Products, Setups, Complete Setup

### PageBackground (`src/components/PageBackground.tsx`)
- Fixed background image, theme-aware (dark: `background.png`, light: `backgrounLight.png`)
- Dark overlay in dark mode (`bg-dark-900/80`)
- Used by all pages

### Other Components
- **AffiliateDropdown** — Per-program region selector with flag icons
- **AffiliateDisclosure** — Amber banner, dismissible, localStorage ack
- **CookieBanner** — 3-category GDPR consent (necessary/analytics/affiliate)
- **CategoryIcon** — SVG icons for categories, tiers, roles
- **Footer** — 3-column layout, legal links, "Cookie Settings" button
- **LegalPageLayout** — Shared layout with left TOC + right content
- **ProductAvatar** — Product thumbnail fallback component
- **HeroDesk** — Hero section wrapper with HeroPlanes

---

## Hooks

### useRafMarquee (`src/hooks/useRafMarquee.ts`)
Carousel animation engine using requestAnimationFrame.
- **Input:** `speed` (px/s), `autoplay`, `onCycleComplete`, `laneRef`
- **Output:** `offset`, `isPlaying`, `play()`, `pause()`, `setOffset()`, `reset()`, `setCycleWidth()`, `animateToOffset(target, duration)`
- Time-based rAF with delta clamping (max 32ms)
- `Math.fround()` prevents sub-pixel accumulation
- easeOutQuad easing: `t * (2 - t)`
- Respects `prefers-reduced-motion`

### useThemeMode (`src/hooks/useThemeMode.ts`)
- Returns `boolean` (true = light mode)
- MutationObserver on `document.documentElement` class changes

### useClickOutside (`src/hooks/useClickOutside.ts`)
- Detects clicks outside specified element refs
- `getElements()` callback for dynamic refs
- Listens on `mousedown`

### useFocusTrap (`src/hooks/useFocusTrap.ts`)
- Traps Tab/Shift+Tab within container
- Used by Modal component
- Targets: `button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])`

### useReducedMotion (`src/hooks/useReducedMotion.ts`)
- Returns `boolean` (true = prefers reduced motion)
- MediaQuery: `(prefers-reduced-motion: reduce)`

---

## Lib Modules

### products.ts
- `Product` type definition
- Module-level cache (`setProductsCache`)
- `listProducts(params?)` — filter by tier and/or search query
- `searchProducts(products, query)` — progressive prefix matching (3-4 char prefixes), 10-item limit
- `findProductByName(products, query)` — find single product
- `getProductsByIds(ids)` — batch lookup

### aircraft.ts
- `AircraftPreset`, `TierPreset`, `CategoryNeed` types
- Module-level cache (`setAircraftCache`)
- `listAircraft()`, `getAircraftBySlug(slug)`, `getAircraftById(id)`
- `getNeeds(aircraftId, tier)`, `getPreferredProducts(aircraftId, tier)`

### setups.ts
- `SetupData` type
- Module-level cache (`setSetupsCache`)
- `listSetups()`, `getSetupByAircraft(aircraft)`

### suggestions.ts — Suggestion Engine
- **PRNG:** `createSeededRandom(seed)` using mulberry32 algorithm for reproducible results
- **Category equivalences:** `getCategoryEquivalence(category)` from DB `category_equivalences` table
  - HOTAS owned → satisfies Joystick + Throttle + HOTAS needs
  - Pedals ↔ Rudder bidirectional
- **`generateSuggestions(input)`:**
  1. Get tier needs from aircraft preset
  2. Calculate missing categories after subtracting owned gear
  3. For each missing category, filter candidates by: category match (unidirectional), tier match, role match, family match
  4. Prioritize preferred products, shuffle with PRNG
  5. Return suggestions + warnings
- **`replaceSuggestion()`:** Replace single suggestion with next candidate
- **`hasReplacementOptions()`:** Check if alternatives exist (controls lock/dice button visibility)

**Key filtering rules:**
- Unidirectional category matching: HOTAS can only satisfy "HOTAS" needs, NOT separate Joystick/Throttle needs
- But owned HOTAS can satisfy both (bidirectional via `getSatisfiedCategories`)
- Role filtering: exclude products not matching `roleType` (Universal always passes)
- Family filtering: exclude products not matching aircraft family (unless "general")

### setup-filters.ts
- `shouldAutoSelectRole(product)` — returns 'Pilot'/'Copilot'/null based on roleType
- `getFirstOwnedProduct(ownedGear)` — first product in owned list
- `shouldEnableNextSteps(ownedGear)` — true if ≥1 product selected
- `findAircraftFamiliesWithProduct(slug, presets)` — which aircraft families contain a product
- `findTiersWithProduct(aircraftId, slug, presets, products)` — match vs downgrade tiers

### consent.ts
- `ConsentManager` class (singleton) with localStorage persistence
- `getConsent()`, `setConsent()`, `acceptAll()`, `rejectAll()`, `clearConsent()`
- Event-based: `subscribe(listener)` for consent change notifications
- `useConsent()` React hook
- `hasConsentFor('analytics' | 'affiliate')` — check specific category
- `loadAnalytics(measurementId)` — conditionally load Google Analytics
- `hasAcknowledgedAffiliateDisclosure()`, `acknowledgeAffiliateDisclosure()`

### tier-config.ts
Static Tailwind class map for tier styling:
- First → amber-400, "Premium tier"
- Business → blue-400, "Mid-tier"
- Economy → emerald-400, "Entry-level"

### category-config.ts
Static Tailwind gradient map for category badges (10 categories):
HOTAS, Throttle, Joystick, Pedals, Panel, MCDU, Rudder, Base, Accessories, Bundle

### supabaseClient.ts
```typescript
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);
```

---

## Role System

### Database: `role_types` table
| name | sort_order |
|------|-----------|
| Pilot | 0 |
| Copilot | 1 |
| Universal | 2 |

### Core Rule
**Universal products always show**, regardless of role selection.

### Per-Page Behavior

**Products page:** Role dropdown with dynamic counts. No localStorage.
```typescript
const matchesRole = selectedRole === 'All' || p.roleType === selectedRole || p.roleType === 'Universal';
```

**Setups page:** Role dropdown with localStorage persistence. Resets to "All" on aircraft change.
```typescript
const filterProductsByRole = (products: Product[]): Product[] => {
  if (selectedRole === 'All') return products;
  return products.filter(p => p.roleType === selectedRole || p.roleType === 'Universal');
};
```

**CompleteSetup page:** Role as wizard step 3. Auto-selects from first owned product. Filters search results and suggestions.
```typescript
// Search filtering
const roleFiltered = selectedRole
  ? familyFiltered.filter(p => p.roleType === selectedRole || p.roleType === 'Universal')
  : familyFiltered;

// Suggestion engine
if (roleType && product.roleType !== roleType && product.roleType !== 'Universal') return false;
```

---

## Search System

**Implementation:** `searchProducts()` in `src/lib/products.ts` + `HeaderNav.tsx`

**Algorithm:** Progressive prefix matching with prioritized results:
- 2-char query → substring matches only
- 3-char query → 3-char prefix matches first, then substring
- 4+ char query → 4-char prefix matches first, then substring

**Limit:** 10 results max. Real-time suggestions with keyboard nav (↑/↓/Enter/Esc).

---

## Theme System

- **Toggle:** In HeaderNav, persisted to `localStorage`
- **Detection:** `useThemeMode()` hook via MutationObserver on `<html>` class
- **CSS Strategy:** Dark mode is default. Light mode via `.light` class on `<html>`:
  - CSS variables in `index.css` (dropdown colors, backgrounds, text)
  - `.light` class overrides for all dark-mode Tailwind utilities
- **Background:** `PageBackground` component switches image per theme
- **Planes:** Dark = white (brightness invert), Light = black (brightness 0)

---

## Compliance (GDPR + FTC)

### Config: `src/config/compliance.ts`
- Site info, legal name, contact email
- Cookie categories: necessary (required), analytics (optional), affiliate (optional)
- Disclosure text templates

### Components
- **CookieBanner:** Shows on first visit. Accept All / Reject All / Customize (3-category modal)
- **AffiliateDisclosure:** Amber banner at top. Dismissible, ack stored in localStorage
- **Footer:** "Cookie Settings" button re-opens consent preferences

### Legal Pages
- Terms, Privacy Policy, Cookie Policy — all use `LegalPageLayout` with TOC sidebar

---

## Tailwind Config (`tailwind.config.js`)

### Custom Colors
- **`dark`** — slate scale (50–950) for backgrounds/text
- **`accent`** — sky blue scale (50–950) for interactive elements
- **`dropdown`** — CSS variable-based colors for theme-aware dropdowns

### Fonts
- `sans`: Inter, system-ui, sans-serif
- `mono`: JetBrains Mono, monospace

### Font Sizes
xs(12), sm(14), base(16), lg(18), xl(24), 2xl(32), 3xl(40), 4xl(56)

---

## CSS Highlights (`src/index.css`)

- **Glass effects:** `.glass`, `.glass-light` with backdrop-blur
- **Hero plane animations:** 10 upward + 10 inverted arc paths, 10 RTL variants (CSS keyframes)
- **Plane styling:** `.hero-plane` (32px dark, 24px mobile), `.hero-plane-static` (reduced motion fallback)
- **Product pulse:** `.pulse-5s` — 5s scale animation for search highlights
- **Affiliate slides:** `.animate-slide-left/right` — 200ms slide-in for dropdown regions
- **Light mode overrides:** Comprehensive `.light` scoped overrides for text, bg, border, hover, focus, buttons, links
- **Dropdown CSS variables:** `--dropdown-bg`, `--dropdown-text`, `--dropdown-border`, etc. (dark default + light override)
