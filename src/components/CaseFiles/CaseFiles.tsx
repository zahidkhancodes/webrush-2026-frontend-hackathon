/**
 * @module CaseFiles
 * @description Scrollytelling narrative component presenting 6 life eras as chapters.
 * Each chapter can expand to show actual receipts from that time period.
 * Uses framer-motion for scroll-triggered animations.
 */
import React, { useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { loadYear } from '../../lib/data-loader';
import type { Receipt } from '../../types';

/** Chapter definitions — derived life eras from the dataset */
const CHAPTERS = [
  {
    id: 1,
    title: 'Faint Signal',
    span: '2013–2014',
    years: [2013, 2014],
    desc: 'Barely present. Early experiments with streaming on a web player. Only 2,300 plays across two years — occasional curiosity, not a habit yet.',
    insight: 'Top artist: The Beatles (even then).',
  },
  {
    id: 2,
    title: 'Switching On',
    span: '2015–2016',
    years: [2015, 2016],
    desc: 'Android arrives. The household ledger begins. A focus on Elvis Presley, The Beatles, and Led Zeppelin. The classic rock era.',
    insight: 'First household transaction recorded: Sep 2016.',
  },
  {
    id: 3,
    title: 'The Loud Year',
    span: '2017',
    years: [2017],
    desc: '26,320 plays. Two big trips. The Skip Storm incident. A salary climb. This is where data gets dense and stories emerge.',
    insight: 'Peak day: Sep 6 — 1,816 "plays" (actually 95% skips).',
  },
  {
    id: 4,
    title: 'Settling',
    span: '2018–2019',
    years: [2018, 2019],
    desc: 'The household ledger stops in Sep 2018. Paul McCartney and Bob Dylan dominate the speakers. Life finds a rhythm.',
    insight: 'Spending slows. Music becomes background.',
  },
  {
    id: 5,
    title: 'Indoors',
    span: '2020–2021',
    years: [2020, 2021],
    desc: '47,000 plays across two locked-down years. The Killers finally overtake The Beatles. Music becomes company.',
    insight: 'Average daily plays: 64 (up from 24 in 2016).',
  },
  {
    id: 6,
    title: 'Quieting',
    span: '2022–2024',
    years: [2022, 2023, 2024],
    desc: 'Volume halves. Joaquín Sabina and ABBA appear — new territory. The last play on record is "God Only Knows" by The Beach Boys.',
    insight: 'A fitting finale. The archive closes gently.',
  },
] as const;

/**
 * Individual chapter card with scroll-triggered reveal animation
 * and expandable evidence drawer showing receipts from that era.
 */
const ChapterCard: React.FC<{ chapter: typeof CHAPTERS[number] }> = ({
  chapter,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [evidence, setEvidence] = useState<Receipt[]>([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['0 1', '0.5 0.5'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  const toggleEvidence = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }

    if (evidence.length === 0) {
      setLoadingEvidence(true);
      const results = await Promise.all(chapter.years.map((yr) => loadYear(yr)));
      setEvidence(results.flat().slice(0, 20)); // Show top 20 receipts
      setLoadingEvidence(false);
    }

    setExpanded(true);
  }, [expanded, evidence.length, chapter.years]);

  return (
    <motion.div
      ref={ref}
      className="timeline-node"
      style={{ opacity, y }}
    >
      {/* Timeline dot */}
      <div className="timeline-dot" aria-hidden="true" />

      {/* Chapter content */}
      <div className="receipt-slip" style={{ maxWidth: '680px' }}>
        <div
          className="text-faded"
          style={{
            fontSize: 'var(--fs-xs)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 'var(--spacing-1)',
          }}
        >
          Chapter {chapter.id} · {chapter.span}
        </div>

        <h3 className="h3-display" style={{ marginBottom: 'var(--spacing-3)' }}>
          {chapter.title}
        </h3>

        <p style={{ fontSize: 'var(--fs-base)', lineHeight: 1.7, marginBottom: 'var(--spacing-3)' }}>
          {chapter.desc}
        </p>

        {/* Insight callout */}
        <div
          style={{
            background: 'rgba(91, 46, 140, 0.06)',
            borderLeft: '3px solid var(--stamp)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            fontSize: 'var(--fs-sm)',
            marginBottom: 'var(--spacing-4)',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          }}
        >
          💡 {chapter.insight}
        </div>

        {/* Evidence toggle */}
        <div style={{ borderTop: '1px dotted var(--faded)', paddingTop: 'var(--spacing-3)' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={toggleEvidence}
            aria-expanded={expanded}
            aria-controls={`evidence-${chapter.id}`}
          >
            {loadingEvidence ? 'Loading…' : expanded ? '▾ Hide Evidence' : '▸ View Evidence'}
          </button>
        </div>

        {/* Evidence drawer */}
        {expanded && evidence.length > 0 && (
          <div
            id={`evidence-${chapter.id}`}
            role="region"
            aria-label={`Evidence receipts for ${chapter.title}`}
            style={{
              marginTop: 'var(--spacing-4)',
              animation: 'slideUp 0.3s var(--ease-out)',
            }}
          >
            <div className="table-responsive">
              <table className="evidence-table" aria-label={`Receipts from ${chapter.span}`}>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Title</th>
                    <th scope="col">Type</th>
                    <th scope="col" style={{ textAlign: 'right' }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {evidence.map((r) => (
                    <tr key={r.id}>
                      <td className="text-faded" style={{ whiteSpace: 'nowrap' }}>
                        {r.ts.substring(0, 10)}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{r.title}</span>
                        {r.subtitle && (
                          <span className="text-faded"> · {r.subtitle}</span>
                        )}
                      </td>
                      <td style={{ textTransform: 'uppercase', fontSize: 'var(--fs-xs)' }}>
                        {r.type}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {r.amount ? `₹${r.amount.toLocaleString('en-IN')}` : ''}
                        {r.durationMs ? `${Math.round(r.durationMs / 60000)}m` : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Case Files — scrollytelling narrative presenting the data story as 6 life chapters.
 */
export const CaseFiles: React.FC = () => {
  return (
    <div className="flex-col w-full">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-row">
          <h2 className="h2-display" style={{ margin: 0 }}>Case Files</h2>
          <div className="text-faded">6 derived chapters</div>
        </div>
        <p className="text-faded" style={{ fontSize: 'var(--fs-sm)', maxWidth: '600px' }}>
          The receipts tell a story. We traced the patterns, correlated the timestamps,
          and distilled 12 years of data into six life eras.
        </p>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {CHAPTERS.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} />
        ))}
      </div>

      {/* End marker */}
      <div
        style={{
          textAlign: 'center',
          padding: 'var(--spacing-12) 0 var(--spacing-8)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            padding: 'var(--spacing-3) var(--spacing-6)',
            border: '1px dashed var(--faded)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--faded)',
            fontSize: 'var(--fs-sm)',
          }}
        >
          📎 End of Archive
        </div>
      </div>
    </div>
  );
};
