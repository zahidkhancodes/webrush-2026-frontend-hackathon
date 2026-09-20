import React from 'react';
import type { Receipt } from '../../types';

interface Props {
  receipt: Receipt;
  style?: React.CSSProperties;
}

export const ReceiptSlip: React.FC<Props> = ({ receipt, style }) => {
  const d = new Date(receipt.ts);
  const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={style} className="receipt-slip-container">
      <div className="receipt-slip">
        {/* Header */}
        <div className="flex justify-between items-center text-faded" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-2)' }}>
          <span>{dateStr} {timeStr}</span>
          <span style={{ textTransform: 'uppercase' }}>{receipt.type}</span>
        </div>
        
        {/* Main Content */}
        <div className="flex items-center" style={{ margin: 'var(--spacing-2) 0' }}>
          <div style={{ flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <span style={{ fontWeight: 600 }}>{receipt.title}</span>
            {receipt.subtitle && <span className="text-faded"> · {receipt.subtitle}</span>}
          </div>
          
          <div className="dotted-leader"></div>
          
          <div style={{ flexShrink: 0, fontWeight: 600 }}>
            {receipt.amount ? `₹${receipt.amount.toLocaleString('en-IN')}` : ''}
            {receipt.durationMs ? `${Math.round(receipt.durationMs / 60000)}m` : ''}
          </div>
        </div>

        {/* Footer */}
        <div className="text-faded" style={{ fontSize: '0.75rem', marginTop: 'var(--spacing-2)' }}>
          ID: {receipt.id}
        </div>
      </div>
    </div>
  );
};
