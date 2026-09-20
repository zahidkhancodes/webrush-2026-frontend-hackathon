import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CHAPTERS = [
  { id: 1, title: "Faint signal", span: "2013–2014", desc: "Barely present. Early experiments with streaming on a web player." },
  { id: 2, title: "Switching on", span: "2015–2016", desc: "Android arrives. The household ledger begins. A focus on Elvis, The Beatles, and Led Zeppelin." },
  { id: 3, title: "The loud year", span: "2017", desc: "26,320 plays. Two big trips. The Skip Storm incident. A salary climb." },
  { id: 4, title: "Settling", span: "2018–2019", desc: "The ledger stops in Sept 2018. Paul McCartney and Bob Dylan dominate the speakers." },
  { id: 5, title: "Indoors", span: "2020–2021", desc: "47,000 plays across two locked-down years. The Killers finally overtake The Beatles." },
  { id: 6, title: "Quieting", span: "2022–2024", desc: "Volume halves. Joaquín Sabina and ABBA appear. The last play is 'God Only Knows'." }
];

export const CaseFiles: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="flex-col w-full h-full" ref={containerRef}>
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-8)' }}>
        <h2 className="h1-display" style={{ fontSize: '2rem', margin: 0 }}>Case Files</h2>
        <div className="text-faded">6 derived chapters</div>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Vertical line connecting the timeline */}
        <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '2px', background: 'var(--faded)', opacity: 0.3 }} />
        
        {CHAPTERS.map((chapter, i) => (
          <ChapterCard key={chapter.id} chapter={chapter} index={i} />
        ))}
      </div>
      
      <div style={{ padding: 'var(--spacing-16) 0', textAlign: 'center' }}>
        <p className="text-faded">End of archive.</p>
      </div>
    </div>
  );
};

const ChapterCard: React.FC<{ chapter: any, index: number }> = ({ chapter, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["0 1", "0.5 0.5"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);

  return (
    <motion.div 
      ref={ref}
      style={{ 
        opacity, 
        y, 
        paddingLeft: 'var(--spacing-12)',
        position: 'relative',
        marginBottom: 'var(--spacing-16)'
      }}
    >
      <div style={{ 
        position: 'absolute', left: '16px', top: '24px', width: '10px', height: '10px', 
        borderRadius: '50%', background: 'var(--stamp)', border: '2px solid var(--paper)'
      }} />
      
      <div className="receipt-slip" style={{ maxWidth: '600px' }}>
        <div className="text-faded" style={{ marginBottom: 'var(--spacing-2)' }}>{chapter.span}</div>
        <h3 className="h1-display" style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-4)' }}>
          {chapter.title}
        </h3>
        <p style={{ fontSize: '1.25rem' }}>{chapter.desc}</p>
        
        <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px dotted var(--faded)' }}>
          <button style={{
            background: 'transparent', border: '1px solid var(--ink)', padding: 'var(--spacing-2) var(--spacing-4)',
            fontFamily: 'var(--font-mono)', cursor: 'pointer'
          }}>
            View Evidence
          </button>
        </div>
      </div>
    </motion.div>
  );
};
