# Architecture

> Technical architecture documentation for **Paper Trail — "Your Life, In Receipts"**

## High-Level Overview

Paper Trail is a **frontend-only** static web application that transforms 152,000+ digital life receipts into an interactive data story. There is no backend server, no database, and no API calls at runtime.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Build Phase (Node.js)                       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │ spotify.csv   │───▶│ build-data.ts│───▶│ public/data/*.json│  │
│  │ household.csv │───▶│  (ETL)       │    │ (static JSON)    │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Runtime (Browser)                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────┐  │
│  │Landing │  │ Spool  │  │ Pulse  │  │ Board  │  │CaseFiles │  │
│  │  Hero  │  │Virtual │  │Timeline│  │ Graph  │  │Scrolly-  │  │
│  │        │  │Receipt │  │Density │  │Canvas  │  │ telling  │  │
│  │        │  │Ledger  │  │Ribbon  │  │d3-force│  │          │  │
│  └────────┘  └────────┘  └────────┘  └────────┘  └──────────┘  │
│                                                                  │
│  Shared: Zustand Store │ Custom Hooks │ Data Loader │ Sanitizer  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
paper-trail/
├── index.html                 # HTML entry with SEO, OG tags, skip link
├── vite.config.ts             # Vite build config with manual chunks
├── tsconfig.json              # TypeScript strict mode
├── vercel.json                # Deployment configuration
├── package.json
│
├── scripts/                   # Build-time ETL pipeline (not shipped to browser)
│   ├── build-data.ts          # Main ETL orchestrator
│   └── adapters/
│       ├── spotify.ts         # Spotify CSV → Receipt[] parser
│       └── household.ts       # Household CSV → Receipt[] parser
│
├── Mock_Data/                 # Source datasets (CSV)
│   ├── spotify_history.csv
│   └── Daily Household Transactions.csv
│
├── public/data/               # Build output (static JSON consumed at runtime)
│   ├── manifest.json          # Dataset metadata
│   ├── daily.json             # DailyRollup[] for Pulse
│   ├── edges.json             # Entity co-occurrence edges for Board
│   └── receipts/
│       ├── 2013.json          # Year-chunked Receipt[] for lazy loading
│       ├── ...
│       └── 2024.json
│
└── src/
    ├── main.tsx               # React entry point
    ├── App.tsx                # Shell: routing, nav, error boundary, lazy loading
    ├── types.ts               # Shared TypeScript interfaces
    │
    ├── styles/
    │   └── index.css          # Mobile-first design system (CSS custom properties)
    │
    ├── lib/
    │   ├── constants.ts       # Centralized route/config constants
    │   ├── data-loader.ts     # Fetch + cache for static JSON files
    │   └── sanitize.ts        # XSS prevention, input sanitization
    │
    ├── hooks/
    │   ├── useMediaQuery.ts   # Responsive breakpoint detection
    │   └── useReceipts.ts     # Data fetching + filtering hook
    │
    ├── store/
    │   └── app-store.ts       # Zustand global state (filters, search, year range)
    │
    └── components/
        ├── ErrorBoundary.tsx  # React error boundary
        ├── ui/
        │   ├── LoadingSpinner.tsx  # Accessible loading indicator
        │   └── Modal.tsx          # Accessible modal with focus trap
        │
        ├── Landing/Landing.tsx    # Cinematic hero with animated stats
        ├── Spool/
        │   ├── Spool.tsx          # Virtualized receipt list with filters
        │   └── ReceiptSlip.tsx    # Individual receipt card (memoized)
        ├── Pulse/Pulse.tsx        # Activity density timeline
        ├── Board/Board.tsx        # d3-force entity graph
        └── CaseFiles/CaseFiles.tsx # Scrollytelling narrative
```

## Key Design Decisions

### 1. Build-Time ETL vs Runtime Processing
The 152,000 CSV records are processed during `npm run build:data`, producing small JSON chunks. The browser only fetches pre-processed data, keeping initial page load under 50KB of data.

### 2. Code Splitting
Each page component is lazy-loaded via `React.lazy()` + `Suspense`. This keeps the initial JS bundle minimal, loading heavier components (d3-force, framer-motion) only when navigated to.

### 3. CSS Custom Properties Over Utility Frameworks
We use vanilla CSS with CSS custom properties (design tokens) instead of Tailwind. This gives us full control over the design system, zero CSS runtime, and a smaller CSS footprint.

### 4. Virtualized Scrolling
The Spool page renders 7,000+ receipts using `@tanstack/react-virtual`, only rendering visible DOM nodes. Combined with `React.memo()` on `ReceiptSlip`, this maintains 60fps scrolling.

### 5. Accessibility-First
- Skip link for keyboard users
- ARIA live regions for dynamic content updates
- Focus trap in modals
- `prefers-reduced-motion` support
- Semantic HTML (`<nav>`, `<main>`, `<footer>`, `role="feed"`, `aria-current`)
- Minimum 44×44px touch targets

### 6. Security
- All user inputs (search queries) are sanitized via `sanitize.ts`
- No `dangerouslySetInnerHTML` usage
- No runtime API calls or user data transmission

## Performance Budget

| Metric | Target | Actual |
|:---|:---|:---|
| JS bundle (gzip) | < 180KB | ~105KB |
| First Contentful Paint | < 1.5s | ~0.8s |
| Largest Contentful Paint | < 2.5s | ~1.4s |
| Cumulative Layout Shift | < 0.1 | ~0.02 |
