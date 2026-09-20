# 🧾 Paper Trail — "Your Life, In Receipts"

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

An interactive data story transforming **152,000+ digital life receipts** into an archivist's case file. Parses one person's Spotify listening history (149,860 plays) and household transaction ledger (2,461 entries) to discover the stories hidden within 12 years of metadata.

> **🏆 Built for WebRush 2026 Frontend Hackathon**

---

## ✨ Features

- **The Skip Storm** — Cinematic landing with animated data insight: the loudest day was actually silence
- **The Spool** — Virtualized receipt ledger with faceted filtering, full-text search, and detail modal
- **The Pulse** — 12-year activity density ribbon with interactive year selection and summary stats
- **The Board** — Force-directed entity graph (d3-force on HTML5 Canvas) with accessible list fallback
- **Case Files** — Scrollytelling narrative with 6 life chapters and expandable evidence drawers

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|:---|:---|:---|
| Framework | React 18 + TypeScript (strict) | UI components |
| Build | Vite 5 | Bundling, HMR, code splitting |
| Styling | Vanilla CSS (custom properties) | Mobile-first responsive design system |
| State | Zustand | Lightweight global store |
| Virtualisation | @tanstack/react-virtual | 60fps scrolling through 7,000+ items |
| Graphs | d3-force | Force-directed network layout |
| Animation | Framer Motion | Scroll-triggered reveals |
| ETL | Node.js (build-time) | CSV → weighted JSON pipeline |
| Deploy | Vercel | Static hosting |

## 📐 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design documentation.

```
CSV Data → Build-time ETL → Static JSON → React Frontend → Vercel CDN
```

**Key decisions:**
- **No backend** — all data processing happens at build time
- **Code splitting** — each page is lazy-loaded via `React.lazy()`
- **JS budget** — total gzipped bundle ~105KB (well under 180KB limit)
- **Accessibility-first** — ARIA live regions, focus traps, keyboard nav, skip links

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build data pipeline (processes 152K CSV records → JSON)
npm run build:data

# 3. Start development server
npm run dev
```

## 📊 Data Pipeline

The ETL pipeline processes raw CSV files into optimised, pre-bucketed JSON:

1. **Parse** — Read 149,860 Spotify plays and 2,461 household transactions
2. **Enrich** — Compute salience weights (first/last play, loop detection, late-night activity, purchase proximity)
3. **Sample** — Keep all transactions + top 500 weighted Spotify tracks per year (~7,600 total)
4. **Aggregate** — Generate daily rollups and entity co-occurrence edges from the full dataset
5. **Chunk** — Split receipts by year for lazy loading

```bash
npm run build:data
# Output: public/data/{manifest,daily,edges}.json + receipts/{2013..2024}.json
```

## ♿ Accessibility

- **Keyboard navigation** across all surfaces with visible focus rings
- **Skip link** to bypass navigation
- **ARIA live regions** for dynamic content (filter counts, hover details)
- **Focus trap** in modals with Escape key dismissal
- **`prefers-reduced-motion`** honoured globally
- **Semantic HTML** (`<nav>`, `<main>`, `<footer>`, `role="feed"`, `role="dialog"`)
- **Minimum 44×44px** touch targets on all interactive elements
- **Accessible graph fallback** — list view alternative for the force graph

## 🔒 Security

- All user search inputs sanitised via `src/lib/sanitize.ts` (strips HTML, control chars, length caps)
- No `dangerouslySetInnerHTML` usage anywhere
- No runtime API calls or user data transmission
- Content Security Policy-safe (no inline scripts)

## 📱 Responsive Design

- **Mobile-first** CSS with breakpoints at 480px, 768px, 1024px, 1280px
- **Fluid typography** via `clamp()` — scales smoothly from 320px to 1280px
- **Hamburger navigation** on mobile with animated open/close
- **Touch-friendly** filter chips and buttons (44px minimum tap targets)
- **Board** defaults to accessible list view on mobile devices

## 🏗 Performance

| Metric | Budget | Achieved |
|:---|:---|:---|
| JS Bundle (gzip) | < 180KB | **~105KB** |
| First Contentful Paint | < 1.5s | **~0.8s** |
| Cumulative Layout Shift | < 0.1 | **~0.02** |

## 🚢 Deployment

Configured for Vercel with `vercel.json`:

```bash
# Automatic: push to GitHub and connect to Vercel
# Vercel runs: npm run build:data && npm run build
# Output: dist/ (static SPA)
```

## 📝 License

MIT — Built with ❤️ for WebRush 2026
