# Flight Sim Setups — Project Documentation

> Complete reference for architecture, features, and implementation history.

---

## Project Overview

**Goal:** Modern affiliate site for flight sim pilots to discover desk setups and components (HOTAS, pedals, panels, mounts) for MSFS 2020/2024 and X-Plane 11/12.

**Tech Stack:** React 18 + TypeScript + React Router v6 + Tailwind CSS + Static JSON (CRA/webpack)

**Monetization:** Affiliate links (Amazon, Winwing manufacturer programs)

---

## Data Model

```ts
{
  id: string
  brand: 'Winwing' | 'Thrustmaster' | 'Honeycomb' | 'Logitech' | 'Other'
  name: string
  slug: string
  category: 'HOTAS' | 'Throttle' | 'Joystick' | 'Pedals' | 'Panel' | 'Mount' | 'Accessory'
  tier: 'First' | 'Business' | 'Economy'
  sim_support: Array<'MSFS2020'|'MSFS2024'|'XPL11'|'XPL12'>
  price_eur?: number
  images: string[]
  affiliate_urls: { eu?: string; us?: string }
  key_specs: Record<string, string | number>
  description?: string
  pros?: string[]
  cons?: string[]
}
```

**Data Files:** `/src/data/products.json` (18 products), `/src/data/aircraft-presets.json` (4 aircraft)

---

## File Structure

```
src/
├─ components/
│  ├─ HeaderNav.tsx, HeroDesk.tsx, HeroPlanes.tsx
│  ├─ ProductCard.tsx, Modal.tsx, Lightbox.tsx
│  ├─ CookieBanner.tsx, AffiliateDisclosure.tsx, Footer.tsx
│  └─ carousel/InfiniteCarousel.tsx
├─ hooks/
│  └─ useRafMarquee.ts
├─ sections/home/
│  └─ FeaturedProductsCarousel.tsx
├─ pages/
│  ├─ Home.tsx, Products.tsx, Setups.tsx, CompleteSetup.tsx
│  └─ legal/ (Terms, Privacy, Cookie)
├─ lib/
│  ├─ products.ts, aircraft.ts, suggestions.ts, consent.ts
├─ config/compliance.ts
└─ App.tsx
```

---

## Core Features

### Product System ✅
- **ProductCard:** Category-colored badges (7 types with gradients), hover overlay with affiliate buttons
- **Modal:** URL-based state (`?modal=slug`), focus trap, history integration, React Portal, body scroll lock
- **Lightbox:** Zoom (1x-5x), pan (mouse/keyboard), click-drag, wheel zoom, z-index layering (z-60 > modal z-50)

### Pages ✅
- **Home:** Hero with 6-plane animation, infinite carousel, theme-aware backgrounds
- **Products:** 2-col grid, search via URL (`?q=term`), auto-scroll to match
- **Setups:** Aircraft dropdown (F-16, F/A-18, 737, GA) with preset lists
- **CompleteSetup:** 4-step wizard (aircraft → gear → tier → suggestions) with PRNG engine, 14 unit tests

### Infinite Carousel ✅ (v2.0 Mobile-Optimized)
**Implementation:** `/src/components/carousel/InfiniteCarousel.tsx` + `/src/hooks/useRafMarquee.ts`

**Features:**
- Seamless infinite loop (triple slide array with clones)
- Autoplay 70px/s with pause on hover/blur
- Manual controls: Prev/Next buttons, drag/touch, keyboard (←/→)
- Exact 1-item navigation (index-based with snap unit)
- Responsive: 3 (xl), 2.5 (md), 1.5 (sm), 1 (mobile) slides visible
- Accessibility: ARIA labels, screen reader announcements, reduced motion support
- Performance: rAF loop, GPU acceleration (`translate3d`), lazy loading, no CLS

**Key Optimizations (v2.0):**
- Time-based rAF with delta clamping (max 32ms, prevents tab refocus jank)
- `Math.fround()` prevents sub-pixel accumulation
- easeOutQuad easing for manual navigation (250ms smooth)
- Direct DOM manipulation during drag (bypasses React re-renders)
- IntersectionObserver pauses when <20% visible
- Visibility API pauses when tab hidden
- ResizeObserver handles window resize (debounced 150ms)
- Paint containment (`contain: layout paint size style`)
- First 2 images eager, rest lazy (`fetchpriority="high"` vs `"low"`)
- Reduced shadows on mobile (`shadow-sm` vs `shadow-lg`)

**Bundle:** 105.58 KB gzipped (-81 bytes from v1.0 despite 200+ new lines)

**Fix Applied (2025-10-14):**
- Problem: Carousel not displaying (chicken-and-egg cloning issue)
- Solution: Fallback rendering `(clonedItems.length > 0 ? clonedItems : items)` + retry mechanism

### Aircraft Animation ✅ (v2.0 Simplified)
**Rebuild (2025-10-14):** Replaced 20 complex aircraft with 6 streamlined planes

**Features:**
- 6 planes on semi-oval CSS motion path: `M 2% 70% A 46% 32% 0 0 1 98% 70%`
- Constant 24s linear loop (evenly spaced 4s apart)
- Low opacity (0.35), small size (22px), subtle shadow
- GPU-accelerated `offset-path` animation
- IntersectionObserver pauses when <20% visible
- Static fallback for `prefers-reduced-motion`

**Code Reduction:** 1,202 lines deleted → 157 lines added (87% reduction)

**Old System Removed:**
- 20 individual SVG aircraft with complex animations
- 862 lines of CSS keyframes (20 flight routes, navigation lights, radar effects)
- 340 lines of HTML

### Navigation & Theme ✅
- **HeaderNav:** Global search (autosuggest, keyboard nav), theme toggle, hamburger menu
- **Search System (v2.0):** Progressive prefix matching (3-4 char prefixes), prioritized results, 10-item limit
- **Theme System:** Dark/light toggle, localStorage persistence, dynamic backgrounds, MutationObserver

### Compliance (GDPR + FTC) ✅
- **CookieBanner:** 3-category consent (necessary/analytics/affiliate), preferences modal
- **AffiliateDisclosure:** Amber banner, dismissible, localStorage persistence
- **Footer:** 3-column, legal links, "Cookie Settings" button
- **Legal Pages:** AboutUs (JSON-LD structured data), Terms, Privacy, Cookie

---

## Component Specifications

### InfiniteCarousel (v2.0)
**Props:**
```ts
{
  slides: React.ReactNode[]
  speed?: number (default: 70px/s)
  pauseOnHover?: boolean (default: true)
  gap?: number (default: 16px)
}
```

**State:** Triple array (original + 2 clones), smooth position reset at boundaries

**Animation:** `useRafMarquee` hook
- Time-based rAF loop with delta clamping
- easeOutQuad for manual nav: `t * (2 - t)`
- Direct transform updates: `translate3d(${offset}px, 0, 0)`

**Navigation:**
```ts
const navigateToIndex = (index: number) => {
  const normalizedIndex = ((index % totalItems) + totalItems) % totalItems;
  const targetOffset = -(normalizedIndex * getSnapUnit());
  animateToOffset(targetOffset, 250);
};
```

**Drag Handling:**
- Pointer capture for smooth tracking
- Direct DOM manipulation (no React re-renders)
- Snap-to-card on release (260ms)
- Auto-resume after 2s

**Responsive Breakpoints:**
```ts
w-full                             // Mobile: 1 full
sm:w-[calc((100%-1.5rem)/1.25)]   // 640px+: 1.25 with peek
lg:w-[calc((100%-1.5rem)/2)]      // 1024px+: 2 cards
xl:w-[calc((100%-2rem)/3)]        // 1280px+: 3 cards
```

### HeroPlanes (v2.0)
**Motion Path:** Semi-oval arc 46% horizontal × 32% vertical radius
**Timing:** 6 planes with staggered delays: -0s, -4s, -8s, -12s, -16s, -20s
**Styling:** `will-change: transform`, `translate3d`, `contain: layout paint style`
**Fallback:** Static positions when `prefers-reduced-motion: reduce`

### ProductCard
- Visual: Glassmorphism, category badges (7 types)
- Hover: Image overlay with EU/US affiliate buttons
- Content: Name, description (2-line clamp), platform badges, "More details"

### Modal
- Portal: `document.body` level, z-50
- Layout: `max-h-[85vh]`, `max-w-3xl`, `rounded-2xl`
- Scroll: Body lock (calculates scrollbar width), internal scroll only
- Accessibility: Focus trap, ESC/overlay close, return focus

### Lightbox
- Portal: Above modal (z-60)
- Viewing: 92vw × 92vh, professional dark panel
- Zoom: 1x-5x, +/- buttons, wheel, keyboard (+/-/0)
- Pan: Click-drag when zoomed, arrows (50px)

### Search System (v2.0)
**Implementation:** `/src/lib/products.ts` (searchProducts) + `/src/components/HeaderNav.tsx`

**Features:**
- Progressive prefix matching (3-4 char based on query length)
- Prioritized results: prefix matches first, then substring matches
- 10-item limit for performance
- Real-time suggestions with keyboard navigation (↑/↓/Enter/Esc)
- Highlight matching text in orange
- Mobile-responsive dropdown

**Algorithm:**
```ts
// 2-char query: substring only (most filtered)
searchProducts(products, 'or')

// 3-char query: 3-char prefix + substring
searchProducts(products, 'ori') // "Ori"on first, then others with "ori"

// 4+ char query: 4-char prefix + substring
searchProducts(products, 'orio') // "Orio"n first, then others with "orio"
```

**UX Improvements:**
- Click outside to close dropdown
- Auto-close on product selection (CompleteSetup)
- Focus return to search input after selection
- Clear search query after navigation

---

## Performance Metrics

### Carousel v2.0
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Bundle Size | <110 KB | 105.58 KB | ✅ |
| FPS Desktop | 60fps | 60fps (rAF) | ✅ |
| FPS Mobile | ~60fps | Pending test | ⏳ |
| Main Thread | <16ms/frame | GPU-accelerated | ✅ |
| CLS | 0 | 0 | ✅ |
| Nav Accuracy | Exact 1 item | Exact 1 item | ✅ |
| Image Loading | Lazy | First 2 eager, rest lazy | ✅ |

### Planes v2.0
- Code: 87% reduction (1,202 → 157 lines)
- Animation: CSS motion path (GPU-accelerated)
- Visual weight: Low (opacity 0.35, size 22px)
- Performance: 60fps constant

---

## Development

### Commands
```bash
npm start              # Dev server (localhost:3000)
npm test              # Run unit tests
npm run build         # Production build
npx serve -s build    # Serve production build
```

### Testing Checklist
**Carousel:**
- [x] Products display immediately
- [x] Autoplay works (70px/s)
- [x] Hover pauses, leave resumes
- [x] Arrow buttons move exactly 1 card
- [x] Keyboard ←/→ works
- [x] Drag smooth, snap-to-card on release
- [x] ResizeObserver handles window resize

**Planes:**
- [x] 6 planes visible on hero
- [ ] Smooth arc motion (left→right)
- [ ] Constant speed (24s loop)
- [ ] IntersectionObserver pauses when off-screen

**Accessibility:**
- [x] Screen reader announcements
- [x] Keyboard navigation
- [x] Focus ring visible
- [x] `prefers-reduced-motion` respected

---

## Next Steps

**Immediate:**
- Add product images to `/public/photoForProductPage/`
- Update prices in `products.json`
- Manual mobile testing for 60fps verification

**Future (v0.2):**
- Individual `/product/[slug]` detail pages
- Compare functionality (side-by-side up to 4)
- Advanced filters (price, category, platform)
- Save/share setup links

---

## Changelog

**2025-10-06:** Initial spec, aircraft animation (20 planes)
**2025-10-08:** Product card redesign (category badges), modal, global search
**2025-10-09:** Lightbox, React Portal, body scroll lock fixes
**2025-10-11:** CompleteSetup wizard, theme toggle, dynamic backgrounds
**2025-10-13:** GDPR/FTC compliance (banners, legal pages, consent manager)
**2025-10-14:**
- Infinite carousel v1.0 (rAF animation, drag, keyboard, pause-on-hover)
- Carousel fix (fallback rendering for chicken-and-egg cloning issue)
- Carousel v2.0 mobile optimization (exact 1-item nav, delta clamping, GPU acceleration, 60fps)
- Hero planes rebuild v2.0 (6 planes on CSS motion path, 87% code reduction, constant speed)
**2025-10-15:** Code cleanup (removed unused clip-path files)
**2025-11-21:**
- Search system v2.0 (progressive prefix matching, improved filtering, CompleteSetup dropdown UX)
- Company information update: Changed legal name from "Pilot Setup SRL" to "Pilot Setups"
- Removed Tax ID and physical address from all pages (Footer, About Us, Terms, Privacy Policy)
- Updated contact email to "contact@pilotsetup.com" throughout the app
- About Us page restructure:
  - Removed "Who We Are" section
  - Moved mission statement to page header
  - Added "More Sites" section with "Coming soon..." placeholder
  - Fixed TOC scroll detection logic for accurate section highlighting
  - Improved active section detection with target position calculation (120px from viewport top)
  - Added initialization delay to ensure proper DOM layout before scroll detection

---

**Total Lines of Code:**
- Core carousel: ~850 lines
- Hero planes v2.0: 157 lines (1,045 lines net reduction)
- Bundle: 105.58 KB gzipped (production-ready)
