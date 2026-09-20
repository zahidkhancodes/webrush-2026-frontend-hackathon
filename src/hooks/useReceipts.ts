/**
 * @module useReceipts
 * @description Custom hook encapsulating receipt data fetching, caching, and filtering logic.
 * Decouples data access from UI components for cleaner architecture.
 */
import { useState, useEffect, useMemo } from 'react';
import { loadAllReceipts } from '../lib/data-loader';
import { useAppStore } from '../store/app-store';
import { sanitizeSearchQuery } from '../lib/sanitize';
import type { Receipt } from '../types';

interface UseReceiptsResult {
  /** All loaded receipts (unfiltered) */
  receipts: Receipt[];
  /** Receipts after applying active filters and search query */
  filtered: Receipt[];
  /** Whether data is still loading */
  loading: boolean;
  /** Error message, if loading failed */
  error: string | null;
}

/**
 * Loads all receipts and applies store-driven filters (type, search, year range).
 * Memoizes the filtered result for render performance.
 *
 * @example
 * ```tsx
 * const { filtered, loading, error } = useReceipts();
 * if (loading) return <LoadingSpinner />;
 * ```
 */
export function useReceipts(): UseReceiptsResult {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { searchQuery, selectedTypes, yearRange } = useAppStore();

  useEffect(() => {
    let cancelled = false;

    loadAllReceipts()
      .then((data) => {
        if (!cancelled) {
          setReceipts(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const sanitized = sanitizeSearchQuery(searchQuery);

    return receipts.filter((r) => {
      // Type filter
      if (selectedTypes.size > 0 && !selectedTypes.has(r.type)) return false;

      // Year range filter
      const year = parseInt(r.ts.substring(0, 4), 10);
      if (year < yearRange[0] || year > yearRange[1]) return false;

      // Search query filter
      if (sanitized) {
        const q = sanitized.toLowerCase();
        const haystack = `${r.title} ${r.subtitle ?? ''} ${r.entities.join(' ')}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [receipts, selectedTypes, searchQuery, yearRange]);

  return { receipts, filtered, loading, error };
}
