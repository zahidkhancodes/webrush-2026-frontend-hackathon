import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3-force';
import type { Edge } from '../../types';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: string;
  radius: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  weight: number;
}

export const Board: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewAsList, setViewAsList] = useState(false);

  useEffect(() => {
    fetch('/data/edges.json')
      .then(res => res.json())
      .then((data: Edge[]) => {
        // Build nodes from edges
        const nodeMap = new Map<string, Node>();
        
        data.forEach(edge => {
          if (!nodeMap.has(edge.source)) {
            const [type, label] = edge.source.split(':');
            nodeMap.set(edge.source, { id: edge.source, group: type, radius: 4 });
          }
          if (!nodeMap.has(edge.target)) {
            const [type, label] = edge.target.split(':');
            nodeMap.set(edge.target, { id: edge.target, group: type, radius: 4 });
          }
          // Increment radius based on connections
          nodeMap.get(edge.source)!.radius += edge.weight * 0.1;
          nodeMap.get(edge.target)!.radius += edge.weight * 0.1;
        });

        // Cap radius
        for (const node of nodeMap.values()) {
          node.radius = Math.min(node.radius, 20);
        }

        setNodes(Array.from(nodeMap.values()));
        setLinks(data as any);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || viewAsList || !canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    // Support high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(50).strength((d: any) => d.weight * 0.01))
      .force('charge', d3.forceManyBody().strength(-30))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.radius + 2));

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw links (glowing violet)
      ctx.strokeStyle = 'rgba(91, 46, 140, 0.2)'; // var(--stamp) with opacity
      ctx.lineWidth = 1;
      
      // Bloom effect
      ctx.shadowColor = 'rgba(91, 46, 140, 0.5)';
      ctx.shadowBlur = 4;

      ctx.beginPath();
      links.forEach((link: any) => {
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
      });
      ctx.stroke();

      // Draw nodes
      ctx.shadowBlur = 0;
      nodes.forEach((node: any) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
        ctx.fillStyle = node.group === 'artist' ? '#E9E5DA' : '#E8C547';
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    simulation.on('tick', () => {
      // We rely on requestAnimationFrame instead of d3 tick to decouple rendering from simulation step
    });
    
    render();

    // Removed drag to avoid d3-drag dependency. Can be added as polish later if needed.

    return () => {
      simulation.stop();
      cancelAnimationFrame(frameId);
    };
  }, [nodes, links, loading, viewAsList]);

  if (loading) return <div><p className="text-faded">Loading the Board...</p></div>;

  return (
    <div className="flex-col gap-4 w-full h-full">
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <h2 className="h1-display" style={{ fontSize: '2rem', margin: 0 }}>The Board</h2>
        <button 
          onClick={() => setViewAsList(!viewAsList)}
          style={{
            background: 'transparent',
            border: '1px solid var(--faded)',
            color: 'var(--ink)',
            padding: 'var(--spacing-2) var(--spacing-4)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)'
          }}
        >
          {viewAsList ? 'View as Graph' : 'View as List'}
        </button>
      </div>

      <div style={{ height: '70vh', background: 'var(--night)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
        {viewAsList ? (
          <div style={{ padding: 'var(--spacing-4)', height: '100%', overflow: 'auto', background: 'var(--paper)', color: 'var(--ink)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--faded)' }}>
                  <th style={{ padding: 'var(--spacing-2)' }}>Entity 1</th>
                  <th style={{ padding: 'var(--spacing-2)' }}>Entity 2</th>
                  <th style={{ padding: 'var(--spacing-2)' }}>Co-occurrences</th>
                </tr>
              </thead>
              <tbody>
                {links.sort((a,b) => b.weight - a.weight).slice(0, 100).map((link, i) => (
                  <tr key={i} style={{ borderBottom: '1px dotted var(--faded)' }}>
                    <td style={{ padding: 'var(--spacing-2)' }}>{typeof link.source === 'string' ? link.source : (link.source as Node).id}</td>
                    <td style={{ padding: 'var(--spacing-2)' }}>{typeof link.target === 'string' ? link.target : (link.target as Node).id}</td>
                    <td style={{ padding: 'var(--spacing-2)' }}>{link.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {links.length > 100 && <p className="text-faded" style={{ marginTop: 'var(--spacing-4)' }}>Showing top 100 connections of {links.length}.</p>}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'grab' }}
            aria-label="Force graph showing connections between entities"
            role="img"
          />
        )}
      </div>
    </div>
  );
};
