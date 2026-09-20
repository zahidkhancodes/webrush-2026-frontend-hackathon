/**
 * @module ReceiptSlip
 * @description Individual receipt card component with thermal receipt styling.
 * Supports click interaction to open a detail modal.
 */
import React, { memo } from 'react';
import type { Receipt } from '../../types';

interface Props {
  /** The receipt data to display */
  receipt: Receipt;
  /** Inline styles for virtual list positioning */
  style?: React.CSSProperties;
  /** Called when the user clicks to view details */
  onSelect?: (receipt: Receipt) => void;
}

/**
 * Memoized receipt card component optimized for virtualized lists.
 * Displays timestamp, type badge, title, subtitle, and amount/duration.
 */
export const ReceiptSlip: React.FC<Props> = memo(({ receipt, style, onSelect }) => {
  const d = new Date(receipt.ts);
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const handleClick = () => onSelect?.(receipt);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect?.(receipt);
    }
  };

  return (
    <div style={style} className="receipt-slip-container">
      <div
        className={`receipt-slip${onSelect ? ' receipt-slip--clickable' : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined}
        aria-label={onSelect ? `View details for ${receipt.title}` : undefined}
      >
        {/* Header row: date + type badge */}
        <div
          className="flex justify-between items-center"
          style={{ fontSize: 'var(--fs-xs)', marginBottom: 'var(--spacing-2)' }}
        >
          <span className="text-faded">{dateStr} {timeStr}</span>
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              color: receipt.source === 'spotify' ? 'var(--stamp)' : 'var(--mark)',
              fontSize: 'var(--fs-xs)',
            }}
          >
            {receipt.type}
          </span>
        </div>

        {/* Content row: title · subtitle .... amount */}
        <div className="flex items-center" style={{ gap: 'var(--spacing-1)' }}>
          <div className="truncate" style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 600 }}>{receipt.title}</span>
            {receipt.subtitle && (
              <span className="text-faded"> · {receipt.subtitle}</span>
            )}
          </div>

          <div className="dotted-leader" />

          <div style={{ flexShrink: 0, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {receipt.amount ? `₹${receipt.amount.toLocaleString('en-IN')}` : ''}
            {receipt.durationMs ? `${Math.round(receipt.durationMs / 60000)}m` : ''}
          </div>
        </div>

        {/* Footer: ID hash */}
        <div
          className="text-faded"
          style={{ fontSize: 'var(--fs-xs)', marginTop: 'var(--spacing-2)' }}
        >
          #{receipt.id}
        </div>
      </div>
    </div>
  );
});

ReceiptSlip.displayName = 'ReceiptSlip';
