import React, { useEffect, useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { loadAllReceipts } from '../../lib/data-loader';
import { useAppStore } from '../../store/app-store';
import { ReceiptSlip } from './ReceiptSlip';
import type { Receipt, ReceiptType } from '../../types';

const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppStore();
  return (
    <input 
      type="search" 
      placeholder="Search receipts... (e.g. 'Beatles', 'Snacks')"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      style={{
        width: '100%',
        padding: 'var(--spacing-3) var(--spacing-4)',
        background: 'transparent',
        border: '1px solid var(--faded)',
        color: 'var(--ink)',
        fontFamily: 'var(--font-mono)',
        fontSize: '1rem',
        outline: 'none',
      }}
    />
  );
};

const Filters: React.FC = () => {
  const { selectedTypes, toggleType } = useAppStore();
  const types: ReceiptType[] = ['music', 'purchase', 'income', 'place', 'movie', 'subscription'];
  
  return (
    <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
      {types.map(t => (
        <button 
          key={t}
          onClick={() => toggleType(t)}
          style={{
            padding: 'var(--spacing-2) var(--spacing-4)',
            background: selectedTypes.has(t) ? 'var(--stamp)' : 'transparent',
            color: selectedTypes.has(t) ? 'white' : 'var(--ink)',
            border: `1px solid ${selectedTypes.has(t) ? 'var(--stamp)' : 'var(--faded)'}`,
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            transition: 'all 0.2s ease'
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export const Spool: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { searchQuery, selectedTypes } = useAppStore();
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllReceipts().then(data => {
      setReceipts(data);
      setLoading(false);
    });
  }, []);

  // Filter logic
  const filtered = React.useMemo(() => {
    return receipts.filter(r => {
      if (selectedTypes.size > 0 && !selectedTypes.has(r.type)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!r.title.toLowerCase().includes(q) && !(r.subtitle && r.subtitle.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [receipts, selectedTypes, searchQuery]);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // estimated height of ReceiptSlip
    overscan: 10,
  });

  if (loading) return <div><p className="text-faded">Loading archives...</p></div>;

  return (
    <div className="flex-col gap-4 w-full h-full">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2 className="h1-display" style={{ fontSize: '2rem', margin: 0 }}>The Spool</h2>
        <div className="text-faded" aria-live="polite">
          {filtered.length.toLocaleString('en-IN')} receipts found
        </div>
      </div>

      <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
        <SearchBar />
        <Filters />
      </div>

      <div 
        ref={parentRef} 
        style={{ height: '60vh', overflow: 'auto', paddingRight: 'var(--spacing-4)' }}
      >
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <ReceiptSlip
              key={virtualRow.index}
              receipt={filtered[virtualRow.index]}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: '16px' // spacing between items
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
