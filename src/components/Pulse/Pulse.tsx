/**
 * @module Pulse
 * @description Activity timeline visualization showing 12 years of daily activity density.
 * Features responsive density ribbon, summary stat cards, and interactive year highlighting.
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { DailyRollup } from '../../types';

/**
 * The Pulse — a density ribbon of activity across 12 years.
 * Violet bars indicate days where both music was played AND money was spent.
 */
export const Pulse: React.FC = () => {
  const [data, setData] = useState<DailyRollup[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DailyRollup | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    fetch('/data/daily.json')
      .then((res) => res.json())
      .then((d: DailyRollup[]) => {
        setData(d.sort((a, b) => a.date.localeCompare(b.date)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  /** Compute summary stats from the full dataset */
  const stats = useMemo(() => {
    if (data.length === 0) return null;

    const totalPlays = data.reduce((s, d) => s + d.plays, 0);
    const totalMinutes = data.reduce((s, d) => s + d.minutes, 0);
    const totalSpend = data.reduce((s, d) => s + d.spend, 0);
    const totalIncome = data.reduce((s, d) => s + d.income, 0);
    const peakDay = data.reduce((max, d) => (d.plays > max.plays ? d : max), data[0]);
    const coOccurrenceDays = data.filter(
      (d) => d.plays > 0 && d.spend > 0,
    ).length;

    return { totalPlays, totalMinutes, totalSpend, totalIncome, peakDay, coOccurrenceDays, activeDays: data.length };
  }, [data]);

  /** Available years */
  const years = useMemo(() => {
    const set = new Set(data.map((d) => parseInt(d.date.substring(0, 4), 10)));
    return Array.from(set).sort();
  }, [data]);

  /** Filter data by selected year (null = all) */
  const visibleData = useMemo(() => {
    if (selectedYear === null) return data;
    return data.filter((d) => d.date.startsWith(String(selectedYear)));
  }, [data, selectedYear]);

  /** Max plays for scaling */
  const maxPlays = useMemo(
    () => Math.max(...visibleData.map((d) => d.plays), 1),
    [visibleData],
  );

  const handleBarHover = useCallback((d: DailyRollup | null) => {
    setHoveredDay(d);
  }, []);

  if (loading) return <LoadingSpinner message="Loading Pulse…" size="lg" />;

  return (
    <div className="flex-col gap-4 w-full">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <h2 className="h2-display" style={{ margin: 0 }}>The Pulse</h2>
          <div className="text-faded">{data.length.toLocaleString('en-IN')} active days</div>
        </div>
      </div>

      {/* Summary stat cards */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 'var(--spacing-4)' }}>
          <div className="stat-card">
            <div className="stat-value text-stamp">{stats.totalPlays.toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Plays</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{Math.round(stats.totalMinutes / 60).toLocaleString('en-IN')}h</div>
            <div className="stat-label">Listening Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{Math.round(stats.totalSpend).toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Spend</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.coOccurrenceDays}</div>
            <div className="stat-label">Music + Spend Days</div>
          </div>
        </div>
      )}

      {/* Year selector chips */}
      <div className="chip-row" role="group" aria-label="Filter by year">
        <button
          className={`chip${selectedYear === null ? ' chip--active' : ''}`}
          onClick={() => setSelectedYear(null)}
          aria-pressed={selectedYear === null}
        >
          All Years
        </button>
        {years.map((y) => (
          <button
            key={y}
            className={`chip${selectedYear === y ? ' chip--active' : ''}`}
            onClick={() => setSelectedYear(y)}
            aria-pressed={selectedYear === y}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Hovered day tooltip */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          minHeight: '2rem',
          fontSize: 'var(--fs-sm)',
          color: hoveredDay ? 'var(--ink)' : 'var(--faded)',
          transition: 'opacity 0.15s',
        }}
      >
        {hoveredDay ? (
          <>
            <strong>{hoveredDay.date}</strong> — {hoveredDay.plays} plays
            {hoveredDay.spend > 0 && `, ₹${Math.round(hoveredDay.spend)} spent`}
            {hoveredDay.minutes > 0 && `, ${Math.round(hoveredDay.minutes)}min listened`}
          </>
        ) : (
          'Hover over a bar to see details'
        )}
      </div>

      {/* Density ribbon */}
      <div
        className="density-container"
        role="img"
        aria-label={`Activity density ribbon showing ${visibleData.length} days of data`}
      >
        <div className="density-ribbon" style={{ height: '160px' }}>
          {visibleData.map((d, i) => {
            const h = Math.max(2, (d.plays / maxPlays) * 100);
            const hasPurchase = d.types.includes('purchase');
            return (
              <div
                key={d.date}
                className="density-bar"
                style={{
                  height: `${h}%`,
                  background: hasPurchase ? 'var(--stamp)' : 'var(--faded)',
                  opacity: h < 5 ? 0.3 : 0.7,
                  minWidth: selectedYear ? '4px' : '3px',
                }}
                title={`${d.date}: ${d.plays} plays${hasPurchase ? `, ₹${Math.round(d.spend)} spent` : ''}`}
                onMouseEnter={() => handleBarHover(d)}
                onMouseLeave={() => handleBarHover(null)}
                onFocus={() => handleBarHover(d)}
                onBlur={() => handleBarHover(null)}
                tabIndex={0}
                role="listitem"
                aria-label={`${d.date}: ${d.plays} plays`}
              />
            );
          })}
        </div>
      </div>

      {/* Peak day callout */}
      {stats?.peakDay && (
        <div className="receipt-slip" style={{ maxWidth: '400px', marginTop: 'var(--spacing-4)' }}>
          <div className="text-faded" style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Peak Day</div>
          <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 600, color: 'var(--stamp)' }}>
            {stats.peakDay.plays.toLocaleString('en-IN')} plays
          </div>
          <div className="text-faded">{stats.peakDay.date}</div>
        </div>
      )}
    </div>
  );
};
