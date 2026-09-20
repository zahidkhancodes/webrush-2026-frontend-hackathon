/**
 * @module App
 * @description Root application shell with hash-based routing, responsive navigation,
 * error boundary wrapper, and code-split page components.
 */
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { Landing } from './components/Landing/Landing';
import { ROUTES, ROUTE_LABELS, APP_META } from './lib/constants';
import { useIsMobile } from './hooks/useMediaQuery';

/* Code-split heavy page components for smaller initial bundle */
const Spool = lazy(() => import('./components/Spool/Spool').then(m => ({ default: m.Spool })));
const Pulse = lazy(() => import('./components/Pulse/Pulse').then(m => ({ default: m.Pulse })));
const Board = lazy(() => import('./components/Board/Board').then(m => ({ default: m.Board })));
const CaseFiles = lazy(() => import('./components/CaseFiles/CaseFiles').then(m => ({ default: m.CaseFiles })));

/** Maps hash routes to their lazy-loaded components */
const ROUTE_MAP: Record<string, React.LazyExoticComponent<React.FC>> = {
  [ROUTES.SPOOL]: Spool,
  [ROUTES.PULSE]: Pulse,
  [ROUTES.BOARD]: Board,
  [ROUTES.CASE_FILES]: CaseFiles,
};

/**
 * Main application component.
 * Renders a landing hero on first visit, then switches to the navigable archive shell.
 */
function App() {
  const [route, setRoute] = useState(window.location.hash || ROUTES.SPOOL);
  const [entered, setEntered] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || ROUTES.SPOOL);
      setNavOpen(false); // Close mobile nav on route change
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Close mobile nav when switching to desktop
  useEffect(() => {
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  const handleEnter = useCallback(() => {
    setEntered(true);
    window.location.hash = ROUTES.SPOOL;
  }, []);

  const toggleNav = useCallback(() => {
    setNavOpen((prev) => !prev);
  }, []);

  /* Landing hero (before entering archive) */
  if (!entered) {
    return (
      <ErrorBoundary>
        <Landing onEnter={handleEnter} />
      </ErrorBoundary>
    );
  }

  /* Resolve current page component */
  const PageComponent = ROUTE_MAP[route] ?? Spool;

  return (
    <ErrorBoundary>
      <div className="app-shell">
        {/* ——— Sticky Header ——— */}
        <header className="app-header" role="banner">
          <div className="container app-header-inner">
            <a href={`${ROUTES.SPOOL}`} className="app-logo" aria-label={APP_META.TITLE}>
              {APP_META.TITLE}
            </a>

            {/* Hamburger (mobile only) */}
            <button
              className="hamburger-btn"
              onClick={toggleNav}
              aria-expanded={navOpen}
              aria-controls="main-nav"
              aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <span className="hamburger-icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </button>

            {/* Navigation */}
            <nav
              id="main-nav"
              className={`nav-links${navOpen ? ' nav-open' : ''}`}
              role="navigation"
              aria-label="Main navigation"
            >
              {Object.entries(ROUTE_LABELS).map(([path, label]) => (
                <a
                  key={path}
                  href={path}
                  className="nav-link"
                  aria-current={route === path ? 'page' : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </header>

        {/* ——— Main Content ——— */}
        <main id="main-content" className="app-main container" tabIndex={-1}>
          <Suspense fallback={<LoadingSpinner message="Loading section…" />}>
            <PageComponent />
          </Suspense>
        </main>

        {/* ——— Footer ——— */}
        <footer className="app-footer" role="contentinfo">
          <div className="container footer-inner">
            <p>{APP_META.SUBTITLE}. Runs entirely in your browser — no backend, no tracking.</p>
            <p>Built for WebRush 2026 Frontend Hackathon</p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}

export default App;
