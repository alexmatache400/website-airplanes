# Flight Sim Setups

Modern affiliate site for flight sim pilots to discover and compare desk setups and components (HOTAS, pedals, panels, mounts) for MSFS 2020/2024 and X-Plane 11/12.

## Tech Stack

- React 18 + TypeScript
- React Router v6
- Tailwind CSS (dark/light theme)
- Static JSON data (no database)
- Create React App (webpack)

## Development

```bash
npm start              # Development server (localhost:3000)
npm test              # Run unit tests
npm run build         # Production build
npx serve -s build    # Serve production build locally
```

## Project Structure

See **Claude.md** for complete documentation including:
- Data model & file structure
- Core features (product system, carousel, aircraft animation)
- Component specifications
- Performance metrics
- Development guidelines
- Complete changelog

## Key Features

✅ **Product System:** 18 products with category badges, modal views, lightbox zoom
✅ **Infinite Carousel:** Auto-scrolling with drag/keyboard controls, 60fps performance
✅ **Aircraft Animation:** 6 planes on CSS motion path, GPU-accelerated
✅ **Theme Toggle:** Dark/light mode with dynamic backgrounds
✅ **Compliance:** GDPR/FTC (cookie banner, affiliate disclosure, legal pages)
✅ **Accessibility:** ARIA labels, keyboard navigation, reduced motion support

## Bundle Size

105.58 KB gzipped (production-ready)

## Browser Support

- Chrome/Edge ✅
- Firefox ✅
- Safari (including iOS) ✅

---

For detailed documentation, see **Claude.md**
