/**
 * @module Spool
 * @description Virtualized receipt ledger with faceted filtering, full-text search,
 * and receipt detail modal. The primary data exploration surface.
 */
import React, { useRef, useState, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useReceipts } from '../../hooks/useReceipts';
import { useAppStore } from '../../store/app-store';
import { ReceiptSlip } from './ReceiptSlip';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Modal } from '../ui/Modal';
import { sanitizeSearchQuery } from '../../lib/sanitize';
import { VIRTUAL_CONFIG } from '../../lib/constants';
import type { Receipt, ReceiptType } from '../../types';

/** Available filter types */
const FILTER_TYPES: ReceiptType[] = ['music', 'purchase', 'income', 'place', 'movie', 'subscription'];

/** Search bar with icon */
const SearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery } = useAppStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(sanitizeSearchQuery(e.target.value));
    },
    [setSearchQuery],
  );

  return (
    <div className="search-wrapper">
      <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        id="receipt-search"
        type="search"
        className="search-input"
        placeholder="Search receipts… (e.g. 'Beatles', 'Snacks')"
        value={searchQuery}
        onChange={handleChange}
        aria-label="Search receipts by title, artist, or category"
      />
    </div>
  );
};

/** Filter chip row */
const Filters: React.FC = () => {
  const { selectedTypes, toggleType } = useAppStore();

  return (
    <div className="chip-row" role="group" aria-label="Filter by receipt type">
      {FILTER_TYPES.map((t) => (
        <button
          key={t}
          className={`chip${selectedTypes.has(t) ? ' chip--active' : ''}`}
          onClick={() => toggleType(t)}
          aria-pressed={selectedTypes.has(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

/** Receipt detail content for the modal */
const ReceiptDetail: React.FC<{ receipt: Receipt }> = ({ receipt }) => {
  const d = new Date(receipt.ts);

  return (
    <div className="flex-col gap-4">
      {/* Header info */}
      <div className="receipt-slip">
        <div className="flex justify-between items-center" style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--spacing-2)' }}>
          <span className="text-faded">
            {d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ textTransform: 'uppercase', fontWeight: 600, color: receipt.source === 'spotify' ? 'var(--stamp)' : 'var(--mark)' }}>
            {receipt.type}
          </span>
        </div>
        <h4 style={{ fontSize: 'var(--fs-md)', fontWeight: 600, margin: 'var(--spacing-2) 0' }}>
          {receipt.title}
        </h4>
        {receipt.subtitle && <p className="text-faded">{receipt.subtitle}</p>}
        <div style={{ borderTop: '1px dashed var(--faded)', marginTop: 'var(--spacing-3)', paddingTop: 'var(--spacing-3)' }}>
          {receipt.amount != null && (
            <div className="flex justify-between">
              <span>Amount</span>
              <strong>₹{receipt.amount.toLocaleString('en-IN')}</strong>
            </div>
          )}
          {receipt.durationMs != null && (
            <div className="flex justify-between">
              <span>Duration</span>
              <strong>{Math.round(receipt.durationMs / 60000)} min {Math.round((receipt.durationMs % 60000) / 1000)}s</strong>
            </div>
          )}
        </div>
      </div>

      {/* Metadata table */}
      <div>
        <h5 style={{ fontSize: 'var(--fs-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--faded)', marginBottom: 'var(--spacing-2)' }}>
          Metadata
        </h5>
        <div className="table-responsive">
          <table className="evidence-table">
            <tbody>
              {Object.entries(receipt.meta).map(([key, value]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600, width: '40%' }}>{key}</td>
                  <td>{String(value)}</td>
                </tr>
              ))}
              <tr>
                <td style={{ fontWeight: 600 }}>source</td>
                <td>{receipt.source}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>entities</td>
                <td>{receipt.entities.join(', ')}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>receipt_id</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-xs)' }}>#{receipt.id}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/**
 * The Spool — a virtualized, filterable, searchable receipt ledger.
 */
export const Spool: React.FC = () => {
  const { filtered, loading, error } = useReceipts();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => VIRTUAL_CONFIG.RECEIPT_HEIGHT,
    overscan: VIRTUAL_CONFIG.OVERSCAN,
  });

  const handleSelect = useCallback((receipt: Receipt) => {
    setSelectedReceipt(receipt);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedReceipt(null);
  }, []);

  if (loading) return <LoadingSpinner message="Loading archives…" size="lg" />;
  if (error) return <div role="alert" className="text-faded" style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>Error: {error}</div>;

  return (
    <div className="flex-col gap-4 w-full">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <h2 className="h2-display" style={{ margin: 0 }}>The Spool</h2>
          <div className="text-faded" aria-live="polite" aria-atomic="true">
            {filtered.length.toLocaleString('en-IN')} receipts
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex-col gap-3" style={{ marginBottom: 'var(--spacing-4)' }}>
        <SearchBar />
        <Filters />
      </div>

      {/* Virtualized receipt list */}
      <div
        ref={parentRef}
        style={{ height: '62vh', overflow: 'auto', WebkitOverflowScrolling: 'touch' }}
        role="feed"
        aria-label="Receipt list"
        aria-busy={loading}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const receipt = filtered[virtualRow.index];
            return (
              <ReceiptSlip
                key={receipt.id}
                receipt={receipt}
                onSelect={handleSelect}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  paddingBottom: '12px',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={selectedReceipt !== null}
        onClose={handleCloseModal}
        title={selectedReceipt?.title ?? 'Receipt Details'}
      >
        {selectedReceipt && <ReceiptDetail receipt={selectedReceipt} />}
      </Modal>
    </div>
  );
};
