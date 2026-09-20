/**
 * @module Landing
 * @description Cinematic landing page with animated receipt reveal, data insight hero,
 * and responsive layout. Serves as the narrative entry point to the archive.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Props {
  /** Called when user clicks through to enter the archive */
  onEnter: () => void;
}

/** Animated counter that counts up from 0 to target value */
const AnimatedNumber: React.FC<{ target: number; duration?: number; suffix?: string }> = ({
  target,
  duration = 1200,
  suffix = '',
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return <>{current.toLocaleString('en-IN')}{suffix}</>;
};

/**
 * Landing hero component showing the "Skip Storm" narrative hook.
 * Three stages: receipt print animation → insight → truth reveal.
 */
export const Landing: React.FC<Props> = ({ onEnter }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setStage(1), 1800);
    return () => clearTimeout(t);
  }, []);

  const handleReveal = useCallback(() => setStage(2), []);

  /** Deterministic "storm" bars — seeded, not random */
  const bars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const seed = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        const h = (seed - Math.floor(seed)) * 30 + 8;
        return { height: i === 18 ? 100 : h, highlight: i === 18 };
      }),
    [],
  );

  return (
    <div className="landing-hero" role="region" aria-label="Landing introduction">
      {/* Stage 0 — Printing receipt */}
      {stage === 0 && (
        <div className="receipt-slip landing-receipt" style={{ width: '100%', maxWidth: '320px' }}>
          <div className="text-faded" style={{ fontSize: 'var(--fs-sm)' }}>2017-09-06</div>
          <div
            className="h2-display"
            style={{ marginTop: 'var(--spacing-2)', color: 'var(--stamp)' }}
          >
            <AnimatedNumber target={1816} /> plays
          </div>
          <div
            style={{
              marginTop: 'var(--spacing-4)',
              borderTop: '1px dashed var(--faded)',
              paddingTop: 'var(--spacing-2)',
              fontSize: 'var(--fs-sm)',
            }}
          >
            The biggest day.
          </div>
        </div>
      )}

      {/* Stage 1+ — Insight & Chart */}
      {stage >= 1 && (
        <div
          style={{
            maxWidth: '640px',
            width: '100%',
            animation: 'slideUp 0.8s var(--ease-out)',
          }}
        >
          <h1 className="h1-display" style={{ marginBottom: 'var(--spacing-4)' }}>
            The Skip Storm
          </h1>

          {/* Density bars */}
          <div
            className="landing-bars"
            role="img"
            aria-label="Bar chart showing play counts with a major spike on September 6, 2017"
          >
            {bars.map((b, i) => (
              <div
                key={i}
                className="landing-bar"
                style={{
                  height: `${b.height}%`,
                  background: b.highlight ? 'var(--stamp)' : 'var(--paper-2)',
                }}
              />
            ))}
          </div>

          {/* Narrative text */}
          <p style={{ fontSize: 'var(--fs-md)', marginTop: 'var(--spacing-6)', lineHeight: 1.7 }}>
            {stage === 1 ? (
              <>
                On September 6th, 2017, the record shows{' '}
                <strong className="text-stamp">1,816 songs</strong> were played. The biggest
                music day in a decade.
              </>
            ) : (
              <>
                <span className="text-stamp" style={{ fontWeight: 600 }}>
                  Except almost nothing was played.
                </span>
                <br /><br />
                Median play time: <strong>0.9 seconds</strong>.<br />
                1,731 tracks ended via fast-forward.<br />
                Shuffle: <strong>OFF</strong>.
                <br /><br />
                <span className="text-faded" style={{ fontSize: 'var(--fs-base)' }}>
                  They weren't listening. They were scrolling through a library,
                  or the phone was skipping in a pocket. Almost zero music was actually heard
                  on the loudest-looking day in the dataset.
                </span>
              </>
            )}
          </p>

          {/* Stats grid */}
          {stage === 2 && (
            <div
              className="stats-grid"
              style={{
                marginTop: 'var(--spacing-8)',
                animation: 'slideUp 0.6s var(--ease-out)',
              }}
            >
              <div className="stat-card">
                <div className="stat-value text-stamp"><AnimatedNumber target={152321} /></div>
                <div className="stat-label">Total Receipts</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><AnimatedNumber target={12} /></div>
                <div className="stat-label">Years Covered</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><AnimatedNumber target={149860} /></div>
                <div className="stat-label">Spotify Plays</div>
              </div>
              <div className="stat-card">
                <div className="stat-value"><AnimatedNumber target={2461} /></div>
                <div className="stat-label">Transactions</div>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{ marginTop: 'var(--spacing-8)', display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
            {stage === 1 && (
              <button className="btn btn-primary" onClick={handleReveal}>
                Look Closer
              </button>
            )}
            {stage === 2 && (
              <button className="btn btn-secondary" onClick={onEnter}>
                Open The Archive →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
