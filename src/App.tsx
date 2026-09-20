import React, { useState, useEffect } from 'react';
import { Spool } from './components/Spool/Spool';
import { Board } from './components/Board/Board';
import { Pulse } from './components/Pulse/Pulse';
import { Landing } from './components/Landing/Landing';
import { CaseFiles } from './components/CaseFiles/CaseFiles';

function App() {
  const [route, setRoute] = useState(window.location.hash || '#/spool');
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/spool');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <div className="app-shell">
      <header className="container flex justify-between items-center" style={{ borderBottom: '1px solid var(--faded)', paddingBottom: 'var(--spacing-4)' }}>
        <h1 className="h1-display" style={{ margin: 0, fontSize: '2rem' }}>Paper Trail</h1>
        <nav className="no-print gap-4 flex" style={{ fontWeight: 'bold' }}>
          <a href="#/spool" className={route === '#/spool' ? 'text-stamp' : 'text-faded'} style={{ textDecoration: 'none' }}>Spool</a>
          <a href="#/pulse" className={route === '#/pulse' ? 'text-stamp' : 'text-faded'} style={{ textDecoration: 'none' }}>Pulse</a>
          <a href="#/board" className={route === '#/board' ? 'text-stamp' : 'text-faded'} style={{ textDecoration: 'none' }}>Board</a>
          <a href="#/case-files" className={route === '#/case-files' ? 'text-stamp' : 'text-faded'} style={{ textDecoration: 'none' }}>Case Files</a>
        </nav>
      </header>

      <main id="main-content" className="container" tabIndex={-1} style={{ marginTop: 'var(--spacing-8)' }}>
        {route === '#/spool' && <Spool />}
        {route === '#/pulse' && <Pulse />}
        {route === '#/board' && <Board />}
        {route === '#/case-files' && <CaseFiles />}
      </main>

      <footer className="container text-faded" style={{ marginTop: 'var(--spacing-16)', fontSize: '0.875rem' }}>
        <p>Your Life, In Receipts. Runs entirely in your browser.</p>
      </footer>
    </div>
  );
}

export default App;
