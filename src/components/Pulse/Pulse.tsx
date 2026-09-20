import React, { useEffect, useState } from 'react';
import type { DailyRollup } from '../../types';

export const Pulse: React.FC = () => {
  const [data, setData] = useState<DailyRollup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/daily.json')
      .then(res => res.json())
      .then((d: DailyRollup[]) => {
        setData(d.sort((a,b) => a.date.localeCompare(b.date)));
        setLoading(false);
      });
  }, []);

  if (loading) return <div><p className="text-faded">Loading Pulse...</p></div>;

  return (
    <div className="flex-col gap-4 w-full">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2 className="h1-display" style={{ fontSize: '2rem', margin: 0 }}>The Pulse</h2>
        <div className="text-faded">
          {data.length} active days
        </div>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 'var(--spacing-4)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: '1px', 
          height: '150px',
          width: 'max-content',
          minWidth: '100%'
        }}>
          {data.map((d, i) => {
            const h = Math.max(2, Math.min(100, (d.plays / 100) * 100)); // rough scaling
            const hasPurchase = d.types.includes('purchase');
            return (
              <div 
                key={i} 
                title={`${d.date}: ${d.plays} plays${hasPurchase ? `, ₹${Math.round(d.spend)} spent` : ''}`}
                style={{ 
                  width: '4px', 
                  height: `${h}%`,
                  background: hasPurchase ? 'var(--stamp)' : 'var(--faded)',
                  opacity: h < 5 ? 0.3 : 1
                }}
              />
            );
          })}
        </div>
      </div>
      
      <p className="text-faded">
        This is the density ribbon of activity over 12 years. Violet markers indicate days where both music was played and money was spent.
      </p>
    </div>
  );
};
