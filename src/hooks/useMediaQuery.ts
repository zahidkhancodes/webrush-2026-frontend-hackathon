/**
 * @module useMediaQuery
 * @description Custom hook for responsive design breakpoint detection.
 * Uses `window.matchMedia` API for performant CSS media query matching.
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Subscribes to a CSS media query and returns whether it currently matches.
 * @param query - A valid CSS media query string (e.g. `'(min-width: 768px)'`)
 * @returns `true` if the media query matches, `false` otherwise
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 * const isDesktop = useMediaQuery('(min-width: 1024px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = useCallback(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
    [query],
  );

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Predefined breakpoint hooks for consistent responsive design */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
