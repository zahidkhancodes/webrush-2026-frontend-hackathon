import React, { useState, useEffect } from 'react';

interface Props {
  onEnter: () => void;
}

export const Landing: React.FC<Props> = ({ onEnter }) => {
  const [stage, setStage] = useState(0); // 0: printing, 1: showing chart, 2: revealing truth

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500); // 1.5s print animation
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="flex-col items-center justify-center h-[100vh]" style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', textAlign: 'center' }}>
      
      {stage === 0 && (
        <div className="receipt-slip" style={{ width: '300px', animation: 'printSlide 1.5s ease-out' }}>
          <style>{`
            @keyframes printSlide {
              0% { transform: translateY(-50px); opacity: 0; clip-path: inset(100% 0 0 0); }
              100% { transform: translateY(0); opacity: 1; clip-path: inset(0 0 0 0); }
            }
          `}</style>
          <div className="text-faded">2017-09-06</div>
          <div className="h1-display" style={{ fontSize: '2rem', marginTop: 'var(--spacing-2)' }}>1,816 plays</div>
          <div style={{ marginTop: 'var(--spacing-4)', borderTop: '1px dashed var(--faded)', paddingTop: 'var(--spacing-2)' }}>
            The biggest day.
          </div>
        </div>
      )}

      {stage >= 1 && (
        <div style={{ maxWidth: '600px', animation: 'fadeIn 1s ease-in' }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
          <h2 className="h1-display" style={{ fontSize: '3rem' }}>The Skip Storm</h2>
          
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '4px', height: '150px', margin: 'var(--spacing-8) 0' }}>
            {Array.from({length: 30}).map((_, i) => (
              <div 
                key={i} 
                style={{ 
                  width: '12px', 
                  background: i === 15 ? 'var(--stamp)' : 'var(--paper-2)', 
                  height: i === 15 ? '100%' : `${Math.random() * 30 + 10}%` 
                }}
              />
            ))}
          </div>

          <p style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-8)' }}>
            {stage === 1 ? (
              <>On September 6th, 2017, the record shows 1,816 songs were played. The biggest music day of a decade.</>
            ) : (
              <>
                <span className="text-stamp">Except almost nothing was played.</span><br/><br/>
                Median play time: 0.9 seconds.<br/>
                1,731 tracks ended via fast-forward.<br/>
                Shuffle: OFF.<br/><br/>
                <span className="text-faded" style={{ fontSize: '1rem' }}>They weren't listening. They were scrolling through a library, or the phone was skipping in a pocket. Almost zero music was actually heard on the loudest-looking day in the dataset.</span>
              </>
            )}
          </p>

          {stage === 1 && (
            <button 
              onClick={() => setStage(2)}
              style={{
                background: 'var(--stamp)', color: 'white', padding: 'var(--spacing-3) var(--spacing-6)', 
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem'
              }}
            >
              Look Closer
            </button>
          )}

          {stage === 2 && (
            <button 
              onClick={onEnter}
              style={{
                background: 'var(--ink)', color: 'var(--paper)', padding: 'var(--spacing-3) var(--spacing-6)', 
                border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '1rem'
              }}
            >
              Open The Archive
            </button>
          )}
        </div>
      )}
    </div>
  );
};
